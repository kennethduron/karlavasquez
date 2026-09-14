import {
  AlertCircle,
  ArrowRight,
  FileText,
  HeartHandshake,
  LockKeyhole,
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
import { divorceFaqs } from "@/content/faqs";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Orientación sobre Divorcio",
  description:
    "Información general y orientación confidencial sobre divorcio y asuntos familiares relacionados.",
  path: "/servicios/divorcio",
});

const related = [
  "Situación familiar y comunicación",
  "Bienes y asuntos patrimoniales",
  "Alimentos y responsabilidades",
  "Régimen de comunicación",
  "Documentación disponible",
];

export default function DivorcePage() {
  return (
    <main id="contenido-principal">
      <Breadcrumbs
        items={[
          { label: "Servicios", href: "/areas-de-practica" },
          { label: "Divorcio" },
        ]}
      />
      <PageHero
        eyebrow="Servicio · Derecho de Familia"
        title="Orientación clara y confidencial sobre divorcio"
        copy="Comprender su situación es el punto de partida para identificar las preguntas y decisiones que requieren atención profesional."
      >
        <Link className="button button--gold" href="/solicitar-consulta">
          Preparar mi solicitud <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </PageHero>
      <section className="public-section">
        <div className="site-container split-section split-section--top">
          <div>
            <SectionHeading
              eyebrow="Orientación"
              title="Un espacio para comprender antes de decidir"
            />
            <p className="body-copy">
              El bufete puede ayudarle a organizar la información, reconocer
              asuntos relacionados y preparar una ruta de conversación jurídica
              adaptada a su realidad.
            </p>
          </div>
          <aside className="information-card">
            <HeartHandshake aria-hidden="true" />
            <h2>Cómo puede ayudar el bufete</h2>
            <p>
              Escuchando su contexto, explicando conceptos generales y señalando
              qué aspectos necesitan una evaluación individual.
            </p>
          </aside>
        </div>
      </section>
      <section className="public-section public-section--cream">
        <div className="site-container">
          <SectionHeading
            eyebrow="Situaciones generales"
            title="Aspectos que pueden formar parte de la conversación"
            align="center"
          />
          <div className="two-column-list">
            <CheckList items={related} />
            <div className="document-note">
              <FileText aria-hidden="true" />
              <h3>Documentación orientativa</h3>
              <p>
                Los documentos necesarios pueden variar según cada situación. No
                envíe información sensible hasta recibir instrucciones por un
                canal confirmado.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="public-section">
        <div className="site-container">
          <SectionHeading
            eyebrow="Proceso"
            title="Preparación, conversación y confirmación"
            align="center"
          />
          <ol className="process-grid">
            <li>
              <span>01</span>
              <h3>Prepare información general</h3>
              <p>
                Ordene fechas, preguntas y documentos que ya tenga disponibles.
              </p>
            </li>
            <li>
              <span>02</span>
              <h3>Solicite orientación</h3>
              <p>
                Comparta únicamente los datos necesarios para coordinar una
                conversación.
              </p>
            </li>
            <li>
              <span>03</span>
              <h3>Confirme próximos pasos</h3>
              <p>
                La cita y cualquier relación profesional deben confirmarse
                expresamente.
              </p>
            </li>
          </ol>
        </div>
      </section>
      <section className="public-section public-section--navy">
        <div className="site-container confidentiality-row">
          <LockKeyhole aria-hidden="true" />
          <div>
            <h2>Confidencialidad como principio</h2>
            <p>
              Su información merece un manejo prudente. El formulario de esta
              etapa no transmite datos ni admite documentos.
            </p>
          </div>
        </div>
      </section>
      <section className="public-section public-section--cream">
        <div className="site-container faq-layout">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Información útil antes de consultar"
          />
          <FaqList items={divorceFaqs} />
        </div>
      </section>
      <section className="public-section">
        <div className="site-container disclaimer-card">
          <AlertCircle aria-hidden="true" />
          <div>
            <h2>Aviso importante</h2>
            <p>
              Esta página contiene información general. No constituye asesoría
              legal individual, no define requisitos definitivos y no garantiza
              resultados.
            </p>
          </div>
        </div>
      </section>
      <CtaBand
        title="Prepare una solicitud de consulta"
        copy="El formulario le ayudará a ordenar la información; durante Phase 2 no enviará ni guardará datos."
      />
    </main>
  );
}
