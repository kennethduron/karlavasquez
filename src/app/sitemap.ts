import type { MetadataRoute } from "next";

import { publicRoutes, siteConfig } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: new URL(route, siteConfig.canonicalUrl).toString(),
    changeFrequency: route === "/recursos" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/solicitar-consulta" ? 0.9 : 0.8,
  }));
}
