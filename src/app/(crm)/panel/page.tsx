import { Card } from "@/components/ui/card";

export default function PanelFoundationPage() {
  return (
    <main
      id="contenido-principal"
      className="mx-auto max-w-[var(--knv-content-max)] p-4 sm:p-6 lg:p-8"
    >
      <p className="eyebrow">Área privada</p>
      <h1 className="text-4xl sm:text-5xl">Shell administrativo protegido</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          "Autenticación server-side",
          "Permisos granulares",
          "RLS en PostgreSQL",
          "Documentos privados",
        ].map((item) => (
          <Card key={item}>
            <h2 className="font-serif text-xl">{item}</h2>
            <p className="mt-2 text-sm text-[#4b5563]">
              Base preparada; módulo funcional pendiente de autorización.
            </p>
          </Card>
        ))}
      </div>
    </main>
  );
}
