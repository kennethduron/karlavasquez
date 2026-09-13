import { AppShell } from "@/components/crm/app-shell";
import { requireServerSession } from "@/lib/auth/session";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireServerSession();
  const roleNames: Record<string, string> = {
    administrator: "Administradora",
    lawyer: "Abogado",
    assistant: "Asistente",
    reception: "Recepción",
  };

  return (
    <AppShell
      user={{
        displayName: session.displayName,
        email: session.email,
        roleLabel:
          session.roleKeys.map((role) => roleNames[role] ?? role).join(" · ") ||
          "Equipo legal",
      }}
    >
      {children}
    </AppShell>
  );
}
