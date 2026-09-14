import { Clock3, LockKeyhole, MessageSquareText } from "lucide-react";

import {
  Breadcrumbs,
  PageHero,
  SectionHeading,
} from "@/components/public/sections";
import { ConsultationForm } from "@/components/public/consultation-form";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Solicitar Consulta",
  description:
    "Prepare una solicitud de orientación legal en tres pasos claros y accesibles.",
  path: "/solicitar-consulta",
});

export default function ConsultationPage() {
  return (
    <main id="contenido-principal">
      <Breadcrumbs items={[{ label: "Solicitar Consulta" }]} />
      <PageHero
        eyebrow="Solicitud de consulta"
        title="Comencemos con la información esencial"
        copy="Complete tres pasos para organizar la información esencial de su solicitud antes de establecer contacto."
        image={{
          src: "/images/knv/legal-consultation.webp",
          alt: "Consulta jurídica organizada con documentos y equipo de trabajo",
        }}
      />
      <section className="public-section">
        <div className="site-container consultation-layout">
          <div>
            <SectionHeading
              eyebrow="Formulario"
              title="Prepare su solicitud"
              copy="Organice sus datos de contacto, el asunto general y sus preferencias de comunicación."
            />
            <ConsultationForm />
          </div>
          <aside className="consultation-aside" aria-label="Qué puede esperar">
            <h2>Antes de continuar</h2>
            <div>
              <MessageSquareText aria-hidden="true" />
              <p>
                <strong>Información general</strong>
                <span>
                  No incluya contraseñas, datos bancarios ni documentos
                  confidenciales.
                </span>
              </p>
            </div>
            <div>
              <LockKeyhole aria-hidden="true" />
              <p>
                <strong>Revisión antes del contacto</strong>
                <span>
                  Al finalizar podrá confirmar que la información esencial está
                  completa antes de utilizar un canal oficial.
                </span>
              </p>
            </div>
            <div>
              <Clock3 aria-hidden="true" />
              <p>
                <strong>Sin cita automática</strong>
                <span>
                  Completar el formulario no equivale a una cita confirmada.
                </span>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
