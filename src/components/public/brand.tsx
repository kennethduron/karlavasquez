import Image from "next/image";
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
        <Image
          src="/images/knv/navbar-brand-icon.webp"
          alt=""
          width={128}
          height={128}
          sizes="(max-width: 639px) 44px, 52px"
        />
      </span>
      <span>
        <strong>{siteConfig.professionalName}</strong>
        <small>{siteConfig.brandName}</small>
      </span>
    </Link>
  );
}
