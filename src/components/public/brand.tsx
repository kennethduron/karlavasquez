import { Scale } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/content/site";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      className={`public-brand${inverse ? " public-brand--inverse" : ""}`}
      href="/"
      aria-label={`${siteConfig.professionalName}, inicio`}
    >
      <span className="public-brand-mark" aria-hidden="true">
        <Scale size={22} strokeWidth={1.6} />
      </span>
      <span>
        <strong>{siteConfig.professionalName}</strong>
        <small>{siteConfig.brandName}</small>
      </span>
    </Link>
  );
}
