import { describe, expect, it } from "vitest";

import { publicRoutes, siteConfig } from "@/content/site";

import { createPageMetadata } from "./seo";

describe("public SEO architecture", () => {
  it("uses the approved future canonical domain", () => {
    const metadata = createPageMetadata({
      title: "Contacto",
      description: "Descripción",
      path: "/contacto",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://bufetekarlavasquez.com/contacto",
    );
    expect(siteConfig.deploymentUrl).toBe(
      "https://bufetekarlavasquez.vercel.app",
    );
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: "https://bufetekarlavasquez.vercel.app/images/knv/opengraph-1200x630.jpg",
        width: 1200,
        height: 630,
      }),
    ]);
  });

  it("keeps unknown public contact data hidden at the content source", () => {
    expect(siteConfig.phone).toBeNull();
    expect(siteConfig.email).toBeNull();
    expect(siteConfig.address).toBeNull();
    expect(siteConfig.hours).toBeNull();
  });

  it("declares every required public route", () => {
    expect(publicRoutes).toHaveLength(10);
    expect(publicRoutes).toContain("/servicios/divorcio");
  });
});
