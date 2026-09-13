export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-[#f8f8f6]">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3"
      >
        Saltar al contenido
      </a>
      <header className="border-b border-[#d5dae1] bg-[#031b36] px-4 py-4 text-white">
        <div className="mx-auto flex max-w-[var(--knv-content-max)] items-center justify-between">
          <span className="font-serif text-xl">KNV · Panel administrativo</span>
          <span className="text-sm text-[#f7ead0]">Fundación Fase 0</span>
        </div>
      </header>
      {children}
    </div>
  );
}
