import {
  ArrowRight,
  HeartHandshake,
  LockKeyhole,
  MessageCircleQuestion,
} from "lucide-react";
import Link from "next/link";

import {
  Breadcrumbs,
  CtaBand,
  CheckList,
  FaqList,
  PageHero,
  SectionHeading,
} from "@/components/public/sections";
import { familyFaqs } from "@/content/faqs";
import { practiceAreas } from "@/content/practice-areas";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Derecho de Familia",
  description:
    "Orientación en matrimonio, divorcio, alimentos, patria potestad y otros asuntos familiares.",
  path: "/areas-de-practica/derecho-de-familia",
});

const family = practiceAreas[0];

export default function FamilyLawPage() {
  return (
    <main id="contenido-principal">
      <Breadcrumbs
        items={[
          { label: "Áreas de Práctica", href: "/areas-de-practica" },
          { label: "Derecho de Familia" },
        ]}
      />
      <PageHero
        eyebrow="Derecho de Familia"
        title="Orientación sensible para decisiones importantes"
        copy="Los asuntos familiares requieren escucha, prudencia y una atención jurídica que respete tanto los hechos como a las personas involucradas."
      >
        <Link className="button button--gold" href="/solicitar-consulta">
          Solicitar orientación <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </PageHero>
      <section className="public-section">
        <div className="site-container narrow-copy">
          <SectionHeading
            eyebrow="Acompañamiento"
            title="Claridad en asuntos de carácter familiar"
          />
          <p className="body-copy">
            El primer paso es comprender su situación particular. A partir de
            esa conversación se identifican las preguntas relevantes y la
            información que podría ser necesaria para una evaluación
            responsable.
          </p>
        </div>
      </section>
      <section className="public-section public-section--cream">
        <div className="site-container split-section split-section--top">
          <div>
            <SectionHeading
              eyebrow="Servicios"
              title="Asuntos en los que puede solicitar orientación"
            />
            <CheckList items={family.services} />
          </div>
          <aside className="information-card">
            <MessageCircleQuestion aria-hidden="true" />
            <h2>Información general</h2>
            <p>
              Cada situación familiar es diferente. Los pasos, tiempos y
              documentos deben confirmarse en una consulta individual.
            </p>
            <Link href="/servicios/divorcio">
              Información general sobre divorcio{" "}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>
      <section className="public-section">
        <div className="site-container">
          <SectionHeading
            eyebrow="Proceso"
            title="Una atención ordenada y confidencial"
            align="center"
          />
          <div className="commitment-grid">
            <article>
              <HeartHandshake aria-hidden="true" />
              <h3>Escucha inicial</h3>
              <p>Comprensión del contexto y de sus principales inquietudes.</p>
            </article>
            <article>
              <MessageCircleQuestion aria-hidden="true" />
              <h3>Orientación</h3>
              <p>
                Explicación general de las alternativas que podrían evaluarse.
              </p>
            </article>
            <article>
              <LockKeyhole aria-hidden="true" />
              <h3>Confidencialidad</h3>
              <p>Manejo respetuoso de información personal y familiar.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="public-section public-section--cream">
        <div className="site-container faq-layout">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Antes de solicitar una consulta"
          />
          <FaqList items={familyFaqs} />
        </div>
      </section>
      <CtaBand title="Su situación merece una evaluación individual" />
    </main>
  );
}
