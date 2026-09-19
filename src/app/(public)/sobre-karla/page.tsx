import {
  ArrowRight,
  HeartHandshake,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { KarlaPortrait } from "@/components/public/karla-portrait";
import {
  Breadcrumbs,
  CtaBand,
  PageHero,
  SectionHeading,
} from "@/components/public/sections";
import { practiceAreas } from "@/content/practice-areas";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sobre Karla y el bufete",
  description:
    "Conozca el enfoque, los valores y las áreas de práctica de Karla Norin Vásquez — Bufete Legal.",
  path: "/sobre-karla",
});

const values = [
  "Honestidad",
  "Confiabilidad",
  "Precisión",
  "Solución",
  "Ética profesional",
  "Confidencialidad",
  "Responsabilidad",
  "Respeto",
  "Compromiso",
];

export default function AboutPage() {
  return (
    <main id="contenido-principal">
      <Breadcrumbs items={[{ label: "Sobre Karla" }]} />
      <PageHero
        eyebrow="Sobre el bufete"
        title="Conozca a Karla Norin Vásquez"
        copy="Una práctica jurídica construida sobre la escucha, la claridad y el respeto por cada persona."
        image={{
          src: "/images/knv/about-professional-approach.webp",
          alt: "",
          position: "center",
        }}
        aside={<KarlaPortrait className="about-hero-portrait" />}
      >
        <Link className="button button--gold" href="/solicitar-consulta">
          Solicitar consulta <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </PageHero>
      <section className="public-section">
        <div className="site-container about-philosophy-grid">
          <div>
            <SectionHeading
              eyebrow="Filosofía"
              title="Asesoría que empieza por comprender"
            />
            <p className="body-copy">
              Cada asunto jurídico merece atención individual, comunicación
              prudente y una explicación que permita tomar decisiones
              informadas. El propósito del bufete es ofrecer esa base con
              seriedad y sensibilidad.
            </p>
          </div>
          <blockquote className="brand-quote brand-quote--feature">
            “La claridad también es una forma de acompañar.”
          </blockquote>
        </div>
      </section>
      <section className="public-section public-section--cream">
        <div className="site-container">
          <SectionHeading
            eyebrow="Valores"
            title="Principios presentes en cada conversación"
            align="center"
          />
          <ul className="value-cloud">
            {values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
          <div className="commitment-grid">
            <article>
              <ShieldCheck aria-hidden="true" />
              <h3>Ética profesional</h3>
              <p>
                Orientación prudente, sin promesas de resultados ni afirmaciones
                que sustituyan un análisis individual.
              </p>
            </article>
            <article>
              <LockKeyhole aria-hidden="true" />
              <h3>Confidencialidad</h3>
              <p>
                Cuidado de la información compartida y respeto por la privacidad
                de cada persona.
              </p>
            </article>
            <article>
              <HeartHandshake aria-hidden="true" />
              <h3>Compromiso</h3>
              <p>
                Atención responsable y comunicación clara durante cada etapa del
                acompañamiento.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="public-section">
        <div className="site-container">
          <SectionHeading
            eyebrow="Perfil profesional"
            title="Áreas de atención jurídica"
            copy="La atención se concentra en áreas jurídicas que requieren análisis cuidadoso, comunicación clara y una orientación responsable."
          />
          <div className="inline-area-list">
            {practiceAreas.map((area) => (
              <span key={area.slug}>
                <Scale size={16} aria-hidden="true" />
                {area.name}
              </span>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Una conversación puede aportar claridad" />
    </main>
  );
}
