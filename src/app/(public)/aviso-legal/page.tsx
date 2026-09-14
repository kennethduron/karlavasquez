import { Breadcrumbs, PageHero } from "@/components/public/sections";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Aviso Legal",
  description:
    "Alcance informativo del sitio web de Karla Norin Vásquez — Bufete Legal.",
  path: "/aviso-legal",
});

export default function LegalNoticePage() {
  return (
    <main id="contenido-principal">
      <Breadcrumbs items={[{ label: "Aviso Legal" }]} />
      <PageHero
        eyebrow="Legal"
        title="Aviso Legal"
        copy="Condiciones generales para interpretar y utilizar el contenido de este sitio."
      />
      <article className="site-container legal-copy">
        <h2>Contenido informativo</h2>
        <p>
          La información publicada es de carácter general y no constituye
          asesoría jurídica individual ni sustituye una consulta profesional.
        </p>
        <h2>Relación profesional</h2>
        <p>
          El uso del sitio o la preparación de un formulario no crea
          automáticamente una relación abogado-cliente. Esa relación deberá
          confirmarse expresamente.
        </p>
        <h2>Solicitudes y citas</h2>
        <p>
          Una solicitud de consulta no equivale a una cita confirmada. La fecha,
          modalidad y disponibilidad deberán confirmarse por un canal oficial.
        </p>
        <h2>Resultados</h2>
        <p>
          El sitio no promete ni garantiza resultados. Cada situación requiere
          una evaluación individual de sus circunstancias.
        </p>
        <h2>Información de terceros</h2>
        <p>
          Los recursos generales pueden cambiar y no deben interpretarse como
          una descripción definitiva de procedimientos o requisitos jurídicos.
        </p>
      </article>
    </main>
  );
}
