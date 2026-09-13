import { LockKeyhole } from "lucide-react";
import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/login-form";
import { safeInternalPath } from "@/lib/validation/auth";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    error?: string;
    actualizada?: string;
  }>;
}) {
  const { next, error, actualizada } = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-labelledby="brand-title">
        <div className="auth-monogram" aria-hidden="true">
          KNV
        </div>
        <div>
          <p className="eyebrow auth-eyebrow">Bufete Legal</p>
          <h1 id="brand-title" className="auth-brand-title">
            Karla Norin Vásquez
          </h1>
          <p className="auth-brand-copy">
            Un espacio privado para administrar consultas, clientes y
            expedientes con confidencialidad y precisión.
          </p>
        </div>
        <p className="auth-motto">
          Asesoría Legal, honestidad, confiabilidad, precisión. Solución.
        </p>
      </section>

      <section className="auth-form-panel" aria-labelledby="login-title">
        <div className="auth-form-wrap">
          <div className="auth-security-mark" aria-hidden="true">
            <LockKeyhole size={20} strokeWidth={1.8} />
          </div>
          <p className="eyebrow">Acceso privado</p>
          <h2 id="login-title" className="auth-form-title">
            Bienvenida
          </h2>
          <p className="auth-form-copy">
            Ingrese con su cuenta institucional. No existe registro público.
          </p>
          {actualizada ? (
            <p className="form-success mt-5" role="status">
              La contraseña fue actualizada. Inicie sesión nuevamente.
            </p>
          ) : null}
          {error ? (
            <p className="form-message mt-5" role="alert">
              {error === "enlace-invalido"
                ? "El enlace no es válido o ya expiró. Solicite uno nuevo."
                : "No fue posible abrir el panel con esta sesión. Ingrese nuevamente o contacte a administración."}
            </p>
          ) : null}
          <LoginForm nextPath={safeInternalPath(next)} />
          <p className="auth-help">
            Acceso exclusivo para personal autorizado. La actividad sensible
            queda sujeta a auditoría.
          </p>
        </div>
      </section>
    </main>
  );
}
