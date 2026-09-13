export default function PanelLoading() {
  return (
    <main className="crm-page" aria-busy="true" aria-label="Cargando contenido">
      <div className="crm-loading-line is-wide" />
      <div className="crm-loading-line" />
      <div className="crm-loading-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="crm-loading-card" key={index} />
        ))}
      </div>
    </main>
  );
}
