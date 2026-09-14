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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
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
        url: new URL(
          "/images/knv/opengraph-1200x630.jpg",
          siteConfig.deploymentUrl,
        ).toString(),
        width: 1200,
        height: 630,
        alt: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
    description: siteConfig.slogan,
    images: [
      new URL(
        "/images/knv/opengraph-1200x630.jpg",
        siteConfig.deploymentUrl,
      ).toString(),
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
