export default function Home() {
  return (
    <main className="foundation-shell">
      <section className="foundation-card" aria-labelledby="phase-title">
        <div className="brand-mark" aria-hidden="true">
          KNV
        </div>
        <p className="eyebrow">Karla Norin Vásquez · Bufete Legal</p>
        <h1 id="phase-title">Fundación técnica preparada</h1>
        <p className="lede">
          La arquitectura, seguridad, modelo de datos y sistema visual de la
          Fase 0 están listos para revisión. Las páginas públicas y módulos del
          CRM se implementarán únicamente después de su aprobación.
        </p>
        <div
          className="foundation-grid"
          role="list"
          aria-label="Capas preparadas"
        >
          {[
            "Next.js + TypeScript",
            "Supabase + RLS",
            "Roles y permisos",
            "Responsive desde origen",
          ].map((item) => (
            <div className="foundation-pill" role="listitem" key={item}>
              <span aria-hidden="true" />
              {item}
            </div>
          ))}
        </div>
        <p className="motto">
          Asesoría Legal, honestidad, confiabilidad, precisión. Solución.
        </p>
      </section>
    </main>
  );
}
