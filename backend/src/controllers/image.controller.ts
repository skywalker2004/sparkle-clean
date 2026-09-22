import { Request, Response } from 'express';
import ImageCache from '../models/ImageCache.model';

const FALLBACK_IMAGES = {
  residential: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=85&auto=format&fit=crop',
  deep: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=85&auto=format&fit=crop',
  upholstery: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=85&auto=format&fit=crop',
  commercial: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=85&auto=format&fit=crop',
  event: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=85&auto=format&fit=crop',
  general: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85&auto=format&fit=crop',
} as const;

const UNSPLASH_BASE = 'https://api.unsplash.com';
const RESULTS_PER_QUERY = 5;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function now() { return new Date(); }

function getFallbackImageForKeyword(keyword: string) {
  const normalized = keyword.toLowerCase();

  if (/move[- ]?in|move[- ]?out|house|apartment|kitchen|bathroom|bedroom|living room|spring|seasonal|cleaning|deep/.test(normalized)) {
    return FALLBACK_IMAGES.residential;
  }

  if (/carpet|sofa|couch|mattress|rug|upholstery|fabric/.test(normalized)) {
    return FALLBACK_IMAGES.upholstery;
  }

  if (/construction|renovation|dust|debris|site|commercial|office|warehouse|retail/.test(normalized)) {
    return FALLBACK_IMAGES.commercial;
  }

  if (/party|event|after[- ]party|celebration/.test(normalized)) {
    return FALLBACK_IMAGES.event;
  }

  return FALLBACK_IMAGES.general;
}

export async function getServiceImage(req: Request, res: Response) {
  try {
    const keywordRaw = String(req.query.keyword || '').trim();
    if (!keywordRaw) return res.status(400).json({ message: 'keyword required' });
    const keyword = keywordRaw.toLowerCase();
    const fallbackImage = getFallbackImageForKeyword(keyword);

    let cached: any = null;
    try {
      cached = await ImageCache.findOne({ keyword });
    } catch (cacheError) {
      console.warn('Image cache lookup skipped because MongoDB is unavailable:', cacheError);
    }

    if (cached) {
      const age = Date.now() - (cached.createdAt?.getTime() ?? 0);
      if (age < CACHE_TTL_MS) {
        return res.json({ imageUrl: cached.imageUrl, photographerName: cached.photographerName || null, photographerLink: cached.photographerLink || null, source: 'cache' });
      }
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
    if (!accessKey) {
      console.warn(`Unsplash access key missing for keyword: "${keyword}". Returning category fallback image.`);
      return res.json({ imageUrl: fallbackImage, photographerName: null, photographerLink: null, source: 'fallback' });
    }

    const searchUrl = `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(keyword)}&per_page=${RESULTS_PER_QUERY}&orientation=landscape`;

    const resp = await (globalThis as any).fetch(searchUrl, { headers: { Authorization: `Client-ID ${accessKey}` } });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('Unsplash search failed for keyword', keyword, text);
      return res.json({ imageUrl: fallbackImage, photographerName: null, photographerLink: null, source: 'fallback' });
    }

    const data = await resp.json();
    const results = data.results || [];
    if (!results.length) {
      return res.json({ imageUrl: fallbackImage, photographerName: null, photographerLink: null, source: 'fallback' });
    }

    let chosen: any = null;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const candidateUrl = (r && r.urls && (r.urls.raw || r.urls.regular)) ? `${r.urls.raw}&w=800&q=85&auto=format&fit=crop` : null;
      if (!candidateUrl) continue;

      let existing: any = null;
      try {
        existing = await ImageCache.findOne({ imageUrl: candidateUrl });
      } catch {
        existing = null;
      }

      if (existing && existing.keyword !== keyword) {
        continue;
      }
      chosen = r;
      break;
    }

    if (!chosen) chosen = results[0];

    const imageUrl = chosen && chosen.urls ? `${chosen.urls.raw}&w=800&q=85&auto=format&fit=crop` : fallbackImage;
    const photographerName = chosen && chosen.user ? chosen.user.name : null;
    const photographerLink = chosen && chosen.user && chosen.user.links ? chosen.user.links.html : null;

    try {
      await ImageCache.findOneAndUpdate(
        { keyword },
        { keyword, imageUrl, photographerName, photographerLink, createdAt: now() },
        { upsert: true, new: true }
      );
    } catch (cacheSaveError) {
      console.warn('Image cache save skipped; MongoDB is unavailable.', cacheSaveError);
    }

    return res.json({ imageUrl, photographerName, photographerLink, source: 'unsplash' });
  } catch (error) {
    console.error('getServiceImage error', error);
    const keyword = String(req.query.keyword || '').trim().toLowerCase();
    return res.json({ imageUrl: getFallbackImageForKeyword(keyword || 'general'), photographerName: null, photographerLink: null, source: 'fallback' });
  }
}
