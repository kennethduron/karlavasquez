import { LockKeyhole, MapPinOff, MessageSquareText } from "lucide-react";

import {
  Breadcrumbs,
  CtaBand,
  FaqList,
  PageHero,
  SectionHeading,
} from "@/components/public/sections";
import { ContactForm } from "@/components/public/contact-form";
import { generalFaqs } from "@/content/faqs";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contacto",
  description:
    "Prepare un mensaje para Karla Norin Vásquez — Bufete Legal. Datos de contacto oficiales pendientes de confirmación.",
  path: "/contacto",
});

export default function ContactPage() {
  return (
    <main id="contenido-principal">
      <Breadcrumbs items={[{ label: "Contacto" }]} />
      <PageHero
        eyebrow="Contacto"
        title="Estamos aquí para escucharle"
        copy="Prepare un mensaje general o utilice la solicitud guiada de consulta. Los canales oficiales se publicarán cuando sean confirmados."
      />
      <section className="public-section">
        <div className="site-container contact-layout">
          <div className="contact-information">
            <SectionHeading
              eyebrow="Información"
              title="Canales oficiales pendientes"
              copy="No mostramos teléfonos, correos, horarios ni direcciones sin confirmación expresa."
            />
            <div className="contact-status-card">
              <MapPinOff aria-hidden="true" />
              <div>
                <h3>Ubicación y horario</h3>
                <p>
                  Pendientes de confirmación. No se presenta un mapa ni una
                  dirección provisional.
                </p>
              </div>
            </div>
            <div className="contact-status-card">
              <LockKeyhole aria-hidden="true" />
              <div>
                <h3>Privacidad</h3>
                <p>
                  No incluya documentos o información altamente sensible en un
                  primer mensaje.
                </p>
              </div>
            </div>
            <div className="contact-status-card">
              <MessageSquareText aria-hidden="true" />
              <div>
                <h3>Phase 2</h3>
                <p>
                  El formulario es una demostración validada; todavía no
                  transmite información.
                </p>
              </div>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Mensaje"
              title="Cuéntenos de forma general"
            />
            <ContactForm />
          </div>
        </div>
      </section>
      <section className="public-section public-section--cream">
        <div className="site-container faq-layout">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Antes de escribir"
          />
          <FaqList items={generalFaqs} />
        </div>
      </section>
      <CtaBand
        title="¿Prefiere una solicitud guiada?"
        copy="Organice la información esencial mediante el formulario de consulta de tres pasos."
      />
    </main>
  );
}
