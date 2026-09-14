import type { MetadataRoute } from "next";

import { siteConfig } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
    short_name: "Bufete Karla Vásquez",
    description: siteConfig.slogan,
    start_url: "/",
    display: "browser",
    background_color: "#fdfaf4",
    theme_color: "#031b36",
    icons: [
      {
        src: "/images/knv/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/knv/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
