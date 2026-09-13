"use client";

import { Button } from "@/components/ui/button";

export default function PanelError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="contenido-principal" className="crm-page">
      <div className="crm-state-card" role="alert">
        <p className="eyebrow">Error seguro</p>
        <h1>No fue posible cargar esta sección</h1>
        <p>No se mostró información parcial. Intente nuevamente.</p>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </main>
  );
}
