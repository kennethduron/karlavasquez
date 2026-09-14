import { LockKeyhole, MessageSquareText, ShieldCheck } from "lucide-react";

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
    "Prepare un mensaje general para Karla Norin Vásquez — Bufete Legal.",
  path: "/contacto",
});

export default function ContactPage() {
  return (
    <main id="contenido-principal">
      <Breadcrumbs items={[{ label: "Contacto" }]} />
      <PageHero
        eyebrow="Contacto"
        title="Estamos aquí para escucharle"
        copy="Prepare un mensaje general o utilice la solicitud guiada para organizar la información esencial de su consulta."
        image={{
          src: "/images/knv/legal-office-contact.webp",
          alt: "Recepción sobria y profesional para atención jurídica",
        }}
      />
      <section className="public-section">
        <div className="site-container contact-layout">
          <div className="contact-information">
            <SectionHeading
              eyebrow="Información"
              title="Una primera comunicación prudente"
              copy="Comparta únicamente la información general necesaria para explicar el motivo de su contacto."
            />
            <div className="contact-status-card">
              <ShieldCheck aria-hidden="true" />
              <div>
                <h3>Información esencial</h3>
                <p>
                  Describa brevemente su consulta sin adjuntar documentos ni
                  incluir información personal innecesaria.
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
                <h3>Confirmación</h3>
                <p>
                  Una solicitud no equivale a una cita ni crea por sí sola una
                  relación profesional.
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
