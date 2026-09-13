import { AppShell } from "@/components/crm/app-shell";
import { requireAuthContext } from "@/lib/auth/session";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await requireAuthContext({ enforceMfa: false });

  return (
    <AppShell
      user={{
        displayName: context.profile.displayName,
        email: context.user.email,
        roleLabel:
          context.roles.map((role) => role.name).join(" · ") || "Equipo legal",
      }}
    >
      {children}
    </AppShell>
  );
}
