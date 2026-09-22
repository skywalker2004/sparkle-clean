import React from "react";

const FALLBACK_IMAGES = {
  residential: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=85&auto=format&fit=crop",
  deep: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=85&auto=format&fit=crop",
  upholstery: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=85&auto=format&fit=crop",
  commercial: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=85&auto=format&fit=crop",
  event: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=85&auto=format&fit=crop",
  general: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85&auto=format&fit=crop",
} as const;

function getFallbackImageForCategory(category: string) {
  const normalized = (category || "").toLowerCase();

  if (/residential|house|apartment|kitchen|bathroom|bedroom|living room|seasonal|move|deep/.test(normalized)) {
    return FALLBACK_IMAGES.residential;
  }
  if (/carpet|upholstery|sofa|couch|mattress|rug/.test(normalized)) {
    return FALLBACK_IMAGES.upholstery;
  }
  if (/construction|commercial|office|retail|warehouse/.test(normalized)) {
    return FALLBACK_IMAGES.commercial;
  }
  if (/party|event/.test(normalized)) {
    return FALLBACK_IMAGES.event;
  }
  return FALLBACK_IMAGES.general;
}

export type ServiceImageProps = {
  keyword: string;
  alt?: string;
  category?: string;
};

function ServiceImageInner({ keyword, alt, category }: ServiceImageProps) {
  const [resolved, setResolved] = React.useState<{ imageUrl: string; photographerName?: string | null; photographerLink?: string | null } | null>(null);
  const [loadingImage, setLoadingImage] = React.useState(true);
  const fallbackImage = React.useMemo(() => getFallbackImageForCategory(category || ""), [category]);

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    console.log(`ServiceImage fetch for keyword: ${keyword}`);
    let didSet = false;

    const fetchImage = async () => {
      setLoadingImage(true);
      try {
        const res = await fetch(`http://localhost:5000/api/images/service-image?keyword=${encodeURIComponent(keyword)}`, { signal });
        if (!res.ok) throw new Error(`image fetch failed with status ${res.status}`);
        const data = await res.json();
        if (!signal.aborted) {
          setResolved({ imageUrl: data.imageUrl || fallbackImage, photographerName: data.photographerName, photographerLink: data.photographerLink });
          didSet = true;
        }
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        console.error(`Image fetch failed for keyword "${keyword}":`, e);
        if (!signal.aborted) setResolved({ imageUrl: fallbackImage, photographerName: null, photographerLink: null });
      } finally {
        if (!signal.aborted) setLoadingImage(false);
      }
    };

    fetchImage();
    return () => {
      controller.abort();
    };
  }, [keyword, fallbackImage]);

  return (
    <div className="relative h-56 shrink-0 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
      {loadingImage ? (
        <div className="h-full w-full bg-slate-800 animate-pulse" />
      ) : (
        <>
          <img
            src={resolved?.imageUrl || fallbackImage}
            alt={alt || keyword}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-110"
          />
          {resolved?.photographerName && (
            <div className="absolute left-3 bottom-3 text-xs text-white/60 bg-black/30 px-2 py-1 rounded">
              Photo: <a href={resolved.photographerLink || '#'} className="underline" target="_blank" rel="noreferrer noopener">{resolved.photographerName}</a> / Unsplash
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </>
      )}
    </div>
  );
}

export const ServiceImage = React.memo(ServiceImageInner);

export default ServiceImage;
