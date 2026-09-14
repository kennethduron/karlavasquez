import { BookOpenCheck, Compass, FileQuestion } from "lucide-react";

import {
  Breadcrumbs,
  CtaBand,
  FaqList,
  PageHero,
  SectionHeading,
} from "@/components/public/sections";
import { ResourceBrowser } from "@/components/public/resource-browser";
import { generalFaqs } from "@/content/faqs";
import { resources } from "@/content/resources";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Recursos Jurídicos",
  description:
    "Recursos generales para prepararse antes de solicitar orientación jurídica.",
  path: "/recursos",
});

export default function ResourcesPage() {
  const featured = resources.find((resource) => resource.featured)!;
  return (
    <main id="contenido-principal">
      <Breadcrumbs items={[{ label: "Recursos" }]} />
      <PageHero
        eyebrow="Recursos jurídicos"
        title="Información clara para orientarse mejor"
        copy="Contenido general y prudente para ayudarle a preparar preguntas antes de una consulta profesional."
      />
      <section className="public-section public-section--cream">
        <div className="site-container featured-resource">
          <div>
            <span>Lectura destacada · {featured.readTime}</span>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <small>Contenido editorial en preparación</small>
          </div>
          <BookOpenCheck aria-hidden="true" />
        </div>
      </section>
      <section className="public-section">
        <div className="site-container">
          <SectionHeading
            eyebrow="Biblioteca"
            title="Explore por tema"
            copy="Use la búsqueda y los filtros para encontrar material introductorio."
          />
          <ResourceBrowser />
        </div>
      </section>
      <section className="public-section public-section--navy">
        <div className="site-container commitment-grid resource-guides">
          <article>
            <Compass aria-hidden="true" />
            <h3>Guías prácticas</h3>
            <p>
              Listas y preguntas para organizar información antes de una
              conversación jurídica.
            </p>
          </article>
          <article>
            <FileQuestion aria-hidden="true" />
            <h3>Temas frecuentes</h3>
            <p>
              Explicaciones generales en lenguaje accesible, sin sustituir
              asesoría individual.
            </p>
          </article>
          <article>
            <BookOpenCheck aria-hidden="true" />
            <h3>Lectura responsable</h3>
            <p>
              Contenido sin promesas, resultados garantizados ni afirmaciones
              sobre casos particulares.
            </p>
          </article>
        </div>
      </section>
      <section className="public-section public-section--cream">
        <div className="site-container faq-layout">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Cómo utilizar estos recursos"
          />
          <FaqList items={generalFaqs} />
        </div>
      </section>
      <section className="site-container resource-disclaimer">
        <strong>Disclaimer:</strong> Contenido informativo general. No
        constituye asesoría legal individual.
      </section>
      <CtaBand />
    </main>
  );
}
