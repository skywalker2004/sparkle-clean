import { Request, Response } from 'express';
import ImageCache from '../models/ImageCache.model';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85&auto=format&fit=crop';

const UNSPLASH_BASE = 'https://api.unsplash.com';
const RESULTS_PER_QUERY = 5;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function now() { return new Date(); }

export async function getServiceImage(req: Request, res: Response) {
  try {
    const keywordRaw = String(req.query.keyword || '').trim();
    if (!keywordRaw) return res.status(400).json({ message: 'keyword required' });
    const keyword = keywordRaw.toLowerCase();

    // Check DB cache
    const cached = await ImageCache.findOne({ keyword });
    if (cached) {
      const age = Date.now() - (cached.createdAt?.getTime() ?? 0);
      if (age < CACHE_TTL_MS) {
        return res.json({ imageUrl: cached.imageUrl, photographerName: cached.photographerName || null, photographerLink: cached.photographerLink || null, source: 'cache' });
      }
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      // No access key — return fallback
      return res.json({ imageUrl: FALLBACK_IMAGE, photographerName: null, photographerLink: null, source: 'fallback' });
    }

    const searchUrl = `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(keyword)}&per_page=${RESULTS_PER_QUERY}&orientation=landscape`;

    const resp = await (globalThis as any).fetch(searchUrl, { headers: { Authorization: `Client-ID ${accessKey}` } });
    if (!resp.ok) {
      console.error('Unsplash search failed', await resp.text());
      return res.json({ imageUrl: FALLBACK_IMAGE, photographerName: null, photographerLink: null, source: 'fallback' });
    }

    const data = await resp.json();
    const results = data.results || [];
    if (!results.length) {
      return res.json({ imageUrl: FALLBACK_IMAGE, photographerName: null, photographerLink: null, source: 'fallback' });
    }

    // Try to pick a result that isn't already used by another keyword
    let chosen: any = null;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const candidateUrl = (r && r.urls && (r.urls.raw || r.urls.regular)) ? `${r.urls.raw}&w=800&q=85&auto=format&fit=crop` : null;
      if (!candidateUrl) continue;
      const existing = await ImageCache.findOne({ imageUrl: candidateUrl });
      if (existing && existing.keyword !== keyword) {
        // duplicate image assigned to another keyword -> skip
        continue;
      }
      chosen = r;
      break;
    }

    // If still not chosen, fallback to first result (allow reuse)
    if (!chosen) chosen = results[0];

    const imageUrl = chosen && chosen.urls ? `${chosen.urls.raw}&w=800&q=85&auto=format&fit=crop` : FALLBACK_IMAGE;
    const photographerName = chosen && chosen.user ? chosen.user.name : null;
    const photographerLink = chosen && chosen.user && chosen.user.links ? chosen.user.links.html : null;

    // Upsert cache
    await ImageCache.findOneAndUpdate(
      { keyword },
      { keyword, imageUrl, photographerName, photographerLink, createdAt: now() },
      { upsert: true, new: true }
    );

    return res.json({ imageUrl, photographerName, photographerLink, source: 'unsplash' });
  } catch (error) {
    console.error('getServiceImage error', error);
    return res.json({ imageUrl: FALLBACK_IMAGE, photographerName: null, photographerLink: null, source: 'fallback' });
  }
}
