"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="foundation-shell">
      <section className="foundation-card" role="alert">
        <p className="eyebrow">Error</p>
        <h1>No pudimos completar la solicitud</h1>
        <p className="lede">
          Inténtelo nuevamente. No se ha mostrado información técnica sensible.
        </p>
        <Button type="button" onClick={reset}>
          Intentar de nuevo
        </Button>
      </section>
    </main>
  );
}
