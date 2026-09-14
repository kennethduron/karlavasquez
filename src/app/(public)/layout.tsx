import type { ReactNode } from "react";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { siteConfig } from "@/content/site";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: `${siteConfig.professionalName} — ${siteConfig.brandName}`,
  description: siteConfig.slogan,
  url: siteConfig.canonicalUrl,
  areaServed: { "@type": "Country", name: siteConfig.country },
  serviceType: [
    "Derecho de Familia",
    "Derecho Civil",
    "Derecho Penal",
    "Derecho Mercantil",
    "Derecho Notarial",
  ],
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </>
  );
}
