import {
  ArrowUpRight,
  CalendarClock,
  FolderKanban,
  MessageSquareText,
  Users,
} from "lucide-react";
import Link from "next/link";

import { requireServerSession } from "@/lib/auth/session";

export default async function PanelFoundationPage() {
  const session = await requireServerSession();
  const firstName = session.displayName.split(/\s+/)[0];

  return (
    <main id="contenido-principal" className="crm-page">
      <div className="crm-page-heading">
        <div>
          <p className="eyebrow">Vista general</p>
          <h1>Buenos días, {firstName}</h1>
          <p>
            Su espacio seguro de trabajo está listo para recibir los módulos
            operativos.
          </p>
        </div>
        <span className="crm-status">
          <span /> Entorno protegido
        </span>
      </div>
      <section className="crm-metrics" aria-label="Resumen de módulos">
        {[
          { label: "Consultas", icon: MessageSquareText },
          { label: "Clientes", icon: Users },
          { label: "Expedientes", icon: FolderKanban },
          { label: "Próximas fechas", icon: CalendarClock },
        ].map(({ label, icon: Icon }) => (
          <article className="crm-metric" key={label}>
            <span className="crm-metric-icon">
              <Icon size={20} />
            </span>
            <p>{label}</p>
            <strong>—</strong>
            <small>Disponible en su fase correspondiente</small>
          </article>
        ))}
      </section>
      <section className="crm-welcome-card">
        <div>
          <p className="eyebrow">Infraestructura segura</p>
          <h2>Identidad y acceso configurados</h2>
          <p>
            El panel valida con Supabase Auth la sesión, el perfil activo, los
            roles y los permisos antes de entregar información privada.
          </p>
        </div>
        <Link href="/panel/seguridad">
          Revisar seguridad <ArrowUpRight size={17} />
        </Link>
      </section>
    </main>
  );
}
