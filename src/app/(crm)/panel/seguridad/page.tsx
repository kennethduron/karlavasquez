import { KeyRound, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { MfaEnrollment } from "@/features/auth/mfa-enrollment";
import { removeMfaFactorAction } from "@/features/auth/mfa-actions";
import { requireAuthContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Seguridad de la cuenta" };

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [context, params] = await Promise.all([
    requireAuthContext({ enforceMfa: false }),
    searchParams,
  ]);
  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((item) => item.status === "verified");

  return (
    <main id="contenido-principal" className="crm-page">
      <div className="crm-page-heading">
        <div>
          <p className="eyebrow">Cuenta</p>
          <h1>Seguridad</h1>
          <p>
            Administre el segundo factor de autenticación de su cuenta
            institucional.
          </p>
        </div>
      </div>
      {params.configurada ? (
        <p className="form-success mb-5" role="status">
          El segundo factor quedó activado.
        </p>
      ) : null}
      {params.configurar ? (
        <p className="form-message mb-5" role="alert">
          Configure el segundo factor para continuar al panel. Esta cuenta exige
          MFA.
        </p>
      ) : null}
      {params.eliminada ? (
        <p className="form-success mb-5" role="status">
          El segundo factor fue eliminado.
        </p>
      ) : null}
      {params.error ? (
        <p className="form-message mb-5" role="alert">
          No fue posible completar el cambio. Si MFA es obligatorio, contacte a
          una persona administradora.
        </p>
      ) : null}
      <section className="security-grid">
        <article className="security-card">
          <span className="security-icon">
            <ShieldCheck size={23} />
          </span>
          <div>
            <p className="eyebrow">Estado actual</p>
            <h2>Autenticación en dos pasos</h2>
            <p>
              {factor
                ? "Activa mediante una aplicación autenticadora."
                : "Todavía no está configurada para esta cuenta."}
            </p>
          </div>
          <span className={factor ? "security-badge is-on" : "security-badge"}>
            {factor ? "Activa" : "Pendiente"}
          </span>
        </article>
        <article className="security-card security-card-wide">
          <span className="security-icon">
            <KeyRound size={23} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Aplicación autenticadora</p>
            <h2>
              {factor ? "Factor registrado" : "Configure su segundo factor"}
            </h2>
            <p className="mb-5">
              Use 1Password, Google Authenticator, Microsoft Authenticator u
              otra aplicación compatible con TOTP.
            </p>
            {factor ? (
              <form action={removeMfaFactorAction}>
                <input type="hidden" name="factorId" value={factor.id} />
                <button
                  className="security-remove"
                  type="submit"
                  disabled={context.profile.mfaRequired}
                >
                  {context.profile.mfaRequired
                    ? "MFA obligatorio para esta cuenta"
                    : "Eliminar factor registrado"}
                </button>
              </form>
            ) : (
              <MfaEnrollment />
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
