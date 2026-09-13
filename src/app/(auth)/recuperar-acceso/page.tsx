import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { RecoveryForm } from "@/features/auth/recovery-form";

export const metadata: Metadata = {
  title: "Recuperar acceso",
  robots: { index: false, follow: false },
};

export default function RecoveryPage() {
  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-labelledby="brand-title">
        <div className="auth-monogram" aria-hidden="true">
          KNV
        </div>
        <div>
          <p className="eyebrow auth-eyebrow">Acceso protegido</p>
          <h1 id="brand-title" className="auth-brand-title">
            Recupere su cuenta
          </h1>
          <p className="auth-brand-copy">
            El enlace de recuperación es temporal y solo se envía a cuentas
            autorizadas.
          </p>
        </div>
        <p className="auth-motto">Confidencialidad desde el primer acceso.</p>
      </section>
      <section className="auth-form-panel" aria-labelledby="recovery-title">
        <div className="auth-form-wrap">
          <div className="auth-security-mark" aria-hidden="true">
            <KeyRound size={20} />
          </div>
          <p className="eyebrow">Recuperación</p>
          <h2 id="recovery-title" className="auth-form-title">
            Restablecer acceso
          </h2>
          <p className="auth-form-copy">
            Ingrese el correo asociado a su cuenta institucional.
          </p>
          <RecoveryForm />
          <p className="auth-help">
            <Link className="auth-link" href="/iniciar-sesion">
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
