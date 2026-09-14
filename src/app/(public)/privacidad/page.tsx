import { AlertCircle } from "lucide-react";

import { Breadcrumbs, PageHero } from "@/components/public/sections";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Política de Privacidad",
  description:
    "Información general sobre el tratamiento previsto de datos suministrados voluntariamente.",
  path: "/privacidad",
});

export default function PrivacyPage() {
  return (
    <main id="contenido-principal">
      <Breadcrumbs items={[{ label: "Política de Privacidad" }]} />
      <PageHero
        eyebrow="Legal"
        title="Política de Privacidad"
        copy="Principios generales para el manejo de información proporcionada voluntariamente mediante este sitio."
      />
      <article className="site-container legal-copy">
        <div className="legal-review">
          <AlertCircle aria-hidden="true" />
          <p>
            <strong>Pendiente de aprobación legal final.</strong> Este texto es
            una base informativa y deberá revisarse antes del lanzamiento bajo
            el dominio definitivo.
          </p>
        </div>
        <h2>Información proporcionada voluntariamente</h2>
        <p>
          Cuando los formularios sean activados, podrán solicitar datos básicos
          de identificación y contacto, así como una descripción general del
          motivo de la comunicación.
        </p>
        <h2>Finalidad prevista</h2>
        <p>
          La información se utilizará para revisar solicitudes, coordinar
          comunicaciones y realizar gestiones administrativas relacionadas con
          el contacto solicitado.
        </p>
        <h2>Confidencialidad y minimización</h2>
        <p>
          Se solicitará únicamente la información necesaria para una primera
          comunicación. No deben enviarse documentos confidenciales hasta
          recibir instrucciones por un canal confirmado.
        </p>
        <h2>Estado actual de los formularios</h2>
        <p>
          Durante Phase 2 los formularios validan campos en el navegador, pero
          no transmiten ni almacenan información en Firestore, correo u otro
          servicio.
        </p>
        <h2>Contacto futuro</h2>
        <p>
          El canal oficial para consultas de privacidad se publicará cuando el
          correo profesional sea confirmado.
        </p>
      </article>
    </main>
  );
}
