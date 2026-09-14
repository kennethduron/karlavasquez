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
        <h2>Información proporcionada voluntariamente</h2>
        <p>
          Los formularios pueden solicitar datos básicos de identificación y
          contacto, así como una descripción general del motivo de la
          comunicación.
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
        <h2>Envío de formularios</h2>
        <p>
          La revisión del formulario en pantalla no confirma recepción por parte
          del bufete. Una comunicación solo se considera recibida cuando exista
          confirmación expresa por un canal oficial.
        </p>
        <h2>Consultas de privacidad</h2>
        <p>
          Toda consulta sobre privacidad deberá dirigirse mediante los canales
          oficiales publicados por el bufete.
        </p>
      </article>
    </main>
  );
}
