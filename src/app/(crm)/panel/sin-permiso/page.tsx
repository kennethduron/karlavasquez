import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <main id="contenido-principal" className="crm-page">
      <div className="crm-state-card">
        <ShieldX size={34} aria-hidden="true" />
        <p className="eyebrow">Acceso restringido</p>
        <h1>No tiene permiso para ver esta sección</h1>
        <p>
          La solicitud fue bloqueada. Si considera que necesita acceso, contacte
          a una persona administradora.
        </p>
      </div>
    </main>
  );
}
