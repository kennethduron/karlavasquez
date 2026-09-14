import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page" id="contenido-principal">
      <section>
        <p className="public-eyebrow">Error 404</p>
        <h1>Esta página no está disponible</h1>
        <p>La dirección solicitada no existe o fue trasladada.</p>
        <Link className="button button--gold" href="/">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
