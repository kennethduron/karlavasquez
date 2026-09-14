import { ArrowRight } from "lucide-react";
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
              return (
                <article
                  className="practice-detail-card"
                  id={area.slug}
                  key={area.slug}
                >
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
