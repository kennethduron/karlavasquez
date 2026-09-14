import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Breadcrumbs,
  CtaBand,
  CheckList,
  PageHero,
  SectionHeading,
} from "@/components/public/sections";
import { practiceAreas } from "@/content/practice-areas";
import { createPageMetadata } from "@/lib/seo";

const practiceVisuals: Record<
  string,
  { src: string; alt: string; position?: string }
> = {
  "derecho-de-familia": {
    src: "/images/knv/family-law-guidance.webp",
    alt: "Conversación jurídica respetuosa en un ambiente confidencial",
  },
  "derecho-civil": {
    src: "/images/knv/notarial-civil-services.webp",
    alt: "Documentación civil organizada con pluma y carpeta profesional",
  },
  "derecho-penal": {
    src: "/images/knv/practice-areas-legal.webp",
    alt: "Libros y documentos para análisis jurídico profesional",
  },
  "derecho-mercantil": {
    src: "/images/knv/commercial-law.webp",
    alt: "Reunión de trabajo para revisión de asuntos mercantiles",
  },
  "derecho-notarial": {
    src: "/images/knv/notarial-civil-services.webp",
    alt: "Documentos notariales genéricos preparados para revisión",
  },
};

export const metadata = createPageMetadata({
  title: "Áreas de Práctica",
  description:
    "Derecho de Familia, Civil, Penal, Mercantil y Notarial con orientación clara y responsable.",
  path: "/areas-de-practica",
});

export default function PracticeAreasPage() {
  return (
    <main id="contenido-principal">
      <Breadcrumbs items={[{ label: "Áreas de Práctica" }]} />
      <PageHero
        eyebrow="Áreas de práctica"
        title="Orientación jurídica con enfoque humano"
        copy="Conozca las áreas y servicios confirmados del bufete, presentados con claridad y sin promesas de resultado."
        image={{
          src: "/images/knv/practice-areas-legal.webp",
          alt: "Libros y documentos jurídicos organizados sobre un escritorio profesional",
        }}
      />
      <section className="public-section">
        <div className="site-container">
          <SectionHeading
            eyebrow="Servicios confirmados"
            title="Atención para distintas necesidades jurídicas"
            align="center"
          />
          <div className="practice-detail-grid">
            {practiceAreas.map((area) => {
              const Icon = area.icon;
              const visual = practiceVisuals[area.slug];
              return (
                <article
                  className="practice-detail-card"
                  id={area.slug}
                  key={area.slug}
                >
                  <div className="practice-card-media">
                    <Image
                      src={visual.src}
                      alt={visual.alt}
                      fill
                      sizes="(max-width: 767px) calc(100vw - 4rem), (max-width: 1279px) 42vw, 560px"
                      style={{ objectPosition: visual.position ?? "center" }}
                    />
                  </div>
                  <div className="practice-detail-heading">
                    <span className="card-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <h2>{area.name}</h2>
                      <p>{area.summary}</p>
                    </div>
                  </div>
                  <CheckList items={area.services} />
                  <Link className="text-link" href={area.href}>
                    {area.slug === "derecho-de-familia"
                      ? "Explorar el área"
                      : "Solicitar orientación"}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <CtaBand title="Encuentre una orientación adecuada para su situación" />
    </main>
  );
}
