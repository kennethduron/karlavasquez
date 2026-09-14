import type { Metadata } from "next";

import { siteConfig } from "@/content/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.canonicalUrl),
  title: {
    default: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
    template: `%s | ${siteConfig.professionalName}`,
  },
  description: siteConfig.slogan,
  applicationName: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
  authors: [{ name: siteConfig.professionalName }],
  creator: siteConfig.professionalName,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_HN",
    siteName: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
    title: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
    description: siteConfig.slogan,
    url: siteConfig.canonicalUrl,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-HN"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
