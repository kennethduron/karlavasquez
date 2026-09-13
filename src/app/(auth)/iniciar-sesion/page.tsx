import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default function LoginFoundationPage() {
  return (
    <main className="foundation-shell">
      <Card className="w-full max-w-md p-6 sm:p-9">
        <p className="eyebrow">Panel administrativo KNV</p>
        <h1 className="text-4xl">Iniciar sesión</h1>
        <p className="lede text-left text-base">
          Acceso exclusivo para personal autorizado. La autenticación se
          activará al conectar el proyecto Supabase.
        </p>
        <form className="mt-6 space-y-4" aria-label="Inicio de sesión">
          <label className="block text-sm font-semibold" htmlFor="email">
            Correo electrónico
          </label>
          <Input id="email" type="email" autoComplete="username" disabled />
          <label className="block text-sm font-semibold" htmlFor="password">
            Contraseña
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled
          />
          <Button className="mt-2 w-full" disabled>
            Configuración pendiente
          </Button>
        </form>
      </Card>
    </main>
  );
}
