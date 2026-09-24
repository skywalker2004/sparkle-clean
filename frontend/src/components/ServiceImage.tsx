import React from "react";
import { SERVICE_IMAGE_MAP } from "./images/serviceImageMap";

const FALLBACK_LOCAL_IMAGE = SERVICE_IMAGE_MAP["standard-house-clean"];

export type ServiceItemMinimal = { name?: string; localImageKey?: string };

function ServiceImage({ service }: { service: ServiceItemMinimal }) {
  const imageSrc = (service && service.localImageKey && SERVICE_IMAGE_MAP[service.localImageKey]) || FALLBACK_LOCAL_IMAGE;

  return (
    <div className="relative h-56 shrink-0 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
      <img
        src={imageSrc}
        alt={service?.name || "service image"}
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LOCAL_IMAGE; }}
        className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  );
}

export default React.memo(ServiceImage);
