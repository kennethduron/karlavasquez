import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { requireServerSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Seguridad de la cuenta" };

export default async function SecurityPage() {
  const session = await requireServerSession();
  return (
    <main id="contenido-principal" className="crm-page">
      <div className="crm-page-heading">
        <div>
          <p className="eyebrow">Cuenta</p>
          <h1>Seguridad</h1>
          <p>
            La identidad se valida mediante Firebase Authentication y una cookie
            de sesión HttpOnly.
          </p>
        </div>
      </div>
      <section className="security-grid">
        <article className="security-card">
          <span className="security-icon">
            <ShieldCheck size={23} />
          </span>
          <div>
            <p className="eyebrow">Sesión activa</p>
            <h2>Protección server-side</h2>
            <p>
              La sesión vence el{" "}
              {new Intl.DateTimeFormat("es-HN", {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "America/Tegucigalpa",
              }).format(session.expiresAt)}
              . Cada solicitud privada comprueba revocación, cuenta activa y
              permisos vigentes.
            </p>
          </div>
          <span className="security-badge is-on">Activa</span>
        </article>
      </section>
    </main>
  );
}
