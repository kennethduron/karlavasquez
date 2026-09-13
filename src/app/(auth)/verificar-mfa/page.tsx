import { ScanLine } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MfaChallengeForm } from "@/features/auth/mfa-challenge-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Verificación en dos pasos",
  robots: { index: false, follow: false },
};

export default async function MfaChallengePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/iniciar-sesion");

  const [{ data: factors }, { data: assurance }] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (assurance?.currentLevel === "aal2") redirect("/panel");
  const factor = factors?.totp.find((item) => item.status === "verified");
  if (!factor) redirect("/panel/seguridad?configurar=1");

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-labelledby="brand-title">
        <div className="auth-monogram" aria-hidden="true">
          KNV
        </div>
        <div>
          <p className="eyebrow auth-eyebrow">Segundo factor</p>
          <h1 id="brand-title" className="auth-brand-title">
            Una capa adicional
          </h1>
          <p className="auth-brand-copy">
            Abra su aplicación autenticadora e ingrese el código vigente.
          </p>
        </div>
        <p className="auth-motto">
          Los expedientes merecen una protección rigurosa.
        </p>
      </section>
      <section className="auth-form-panel" aria-labelledby="mfa-title">
        <div className="auth-form-wrap">
          <div className="auth-security-mark" aria-hidden="true">
            <ScanLine size={20} />
          </div>
          <p className="eyebrow">Verificación</p>
          <h2 id="mfa-title" className="auth-form-title">
            Código de seis dígitos
          </h2>
          <p className="auth-form-copy">El código cambia cada 30 segundos.</p>
          <MfaChallengeForm factorId={factor.id} />
        </div>
      </section>
    </main>
  );
}
