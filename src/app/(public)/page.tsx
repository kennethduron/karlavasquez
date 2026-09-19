import {
  ArrowRight,
  Eye,
  Handshake,
  HeartHandshake,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  CtaBand,
  EditorialImage,
  SectionHeading,
} from "@/components/public/sections";
import { KarlaPortrait } from "@/components/public/karla-portrait";
import { practiceAreas } from "@/content/practice-areas";
import { siteConfig } from "@/content/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Asesoría legal con profesionalismo y precisión",
  description:
    "Orientación legal en Honduras con honestidad, confidencialidad y atención responsable.",
  path: "/",
});

const principles = [
  {
    name: "Honestidad",
    copy: "Comunicación directa y transparente desde la primera conversación.",
    icon: Eye,
  },
  {
    name: "Confiabilidad",
    copy: "Atención diligente y manejo responsable de cada asunto.",
    icon: Handshake,
  },
  {
    name: "Precisión",
    copy: "Análisis cuidadoso para orientar cada decisión con claridad.",
    icon: Scale,
  },
  {
    name: "Confidencialidad",
    copy: "Respeto absoluto por la información y circunstancias compartidas.",
    icon: LockKeyhole,
  },
] as const;

export default function HomePage() {
  return (
    <main id="contenido-principal">
      <section className="home-hero">
        <div className="home-hero-background" aria-hidden="true">
          <Image
            src="/images/knv/home-hero-legal.webp"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
          />
        </div>
        <div className="site-container home-hero-grid">
          <div className="home-hero-copy">
            <p className="public-eyebrow">Karla Norin Vásquez · Bufete Legal</p>
            <h1>
              Asesoría Legal con <em>profesionalismo</em>, honestidad y
              precisión
            </h1>
            <p>
              Orientación jurídica cercana y responsable para comprender su
              situación y avanzar con mayor claridad.
            </p>
            <div className="button-row">
              <Link className="button button--gold" href="/solicitar-consulta">
                Solicitar consulta <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="button button--light" href="/areas-de-practica">
                Conocer áreas de práctica
              </Link>
            </div>
            <ul className="hero-assurances" aria-label="Principios de atención">
              <li>
                <ShieldCheck aria-hidden="true" /> Confidencialidad
              </li>
              <li>
                <HeartHandshake aria-hidden="true" /> Atención personalizada
              </li>
            </ul>
            <blockquote className="home-hero-quote">
              “{siteConfig.slogan}”
            </blockquote>
          </div>
          <KarlaPortrait className="home-hero-portrait" />
        </div>
      </section>

      <section className="public-section public-section--cream">
        <div className="site-container">
          <SectionHeading
            eyebrow="Áreas de práctica"
            title="Orientación jurídica para momentos que importan"
            copy="Cada asunto comienza con escucha, análisis y una ruta de atención clara."
            align="center"
          />
          <div className="area-grid">
            {practiceAreas.map((area) => {
              const Icon = area.icon;
              return (
                <article className="area-card" key={area.slug}>
                  <span className="card-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{area.name}</h3>
                  <p>{area.summary}</p>
                  <Link href={area.href}>
                    Conocer más <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="site-container split-section">
          <EditorialImage
            src="/images/knv/about-professional-approach.webp"
            alt="Espacio profesional preparado para una consulta jurídica privada"
            className="editorial-media--arched"
          />
          <div>
            <SectionHeading
              eyebrow="Sobre Karla"
              title="Un enfoque profesional centrado en las personas"
              copy="El bufete ofrece orientación jurídica con atención cuidadosa, lenguaje claro y respeto por la realidad particular de cada persona."
            />
            <p className="body-copy">
              La práctica se sostiene en principios que no dependen de promesas:
              ética profesional, responsabilidad, confidencialidad y compromiso
              con una comunicación precisa.
            </p>
            <Link className="text-link" href="/sobre-karla">
              Conocer el enfoque del bufete{" "}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="public-section public-section--navy">
        <div className="site-container">
          <SectionHeading
            eyebrow="Nuestros principios"
            title="Confianza construida con acciones"
            align="center"
          />
          <div className="principle-grid">
            {principles.map(({ name, copy, icon: Icon }) => (
              <article key={name}>
                <Icon aria-hidden="true" />
                <h3>{name}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="site-container">
          <SectionHeading
            eyebrow="El proceso"
            title="Tres pasos para comenzar con claridad"
            align="center"
          />
          <ol className="process-grid">
            <li>
              <span>01</span>
              <h3>Comparta su situación</h3>
              <p>
                Prepare una descripción general y el método por el que prefiere
                ser contactado.
              </p>
            </li>
            <li>
              <span>02</span>
              <h3>Evaluación inicial</h3>
              <p>
                El bufete revisará la información para determinar la forma
                adecuada de continuar.
              </p>
            </li>
            <li>
              <span>03</span>
              <h3>Confirmación expresa</h3>
              <p>
                Una solicitud no equivale a cita ni crea por sí sola una
                relación profesional.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
