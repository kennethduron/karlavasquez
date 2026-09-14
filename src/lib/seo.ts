import type { Metadata } from "next";

import { siteConfig } from "@/content/site";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
};

export function createPageMetadata({
  title,
  description,
  path,
}: PageMetadata): Metadata {
  const canonical = new URL(path, siteConfig.canonicalUrl).toString();
  const socialImage = {
    url: new URL("/opengraph-image", siteConfig.canonicalUrl).toString(),
    width: 1200,
    height: 630,
    alt: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
  };

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_HN",
      siteName: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
      title,
      description,
      url: canonical,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  };
}
