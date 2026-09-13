import Link from "next/link";

export default function NotFound() {
  return (
    <main className="foundation-shell">
      <section className="foundation-card">
        <p className="eyebrow">404</p>
        <h1>Página no encontrada</h1>
        <p className="lede">
          La dirección solicitada no existe o fue trasladada.
        </p>
        <p className="motto">
          <Link href="/">Volver al inicio</Link>
        </p>
      </section>
    </main>
  );
}
