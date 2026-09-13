import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PasswordUpdateForm } from "@/features/auth/password-update-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Actualizar contraseña",
  robots: { index: false, follow: false },
};

export default async function PasswordUpdatePage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/iniciar-sesion");
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/iniciar-sesion");

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-labelledby="brand-title">
        <div className="auth-monogram" aria-hidden="true">
          KNV
        </div>
        <div>
          <p className="eyebrow auth-eyebrow">Enlace verificado</p>
          <h1 id="brand-title" className="auth-brand-title">
            Proteja su cuenta
          </h1>
          <p className="auth-brand-copy">
            Cree una contraseña exclusiva para este sistema.
          </p>
        </div>
        <p className="auth-motto">Seguridad práctica, información protegida.</p>
      </section>
      <section className="auth-form-panel" aria-labelledby="password-title">
        <div className="auth-form-wrap">
          <div className="auth-security-mark" aria-hidden="true">
            <ShieldCheck size={20} />
          </div>
          <p className="eyebrow">Credenciales</p>
          <h2 id="password-title" className="auth-form-title">
            Nueva contraseña
          </h2>
          <PasswordUpdateForm />
        </div>
      </section>
    </main>
  );
}
