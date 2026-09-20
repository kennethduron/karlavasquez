"use server";

import { redirect } from "next/navigation";
import { appendAuthAudit } from "@/infrastructure/supabase/audit";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export async function logoutAction() {
  const client = await createSupabaseServerClient();
  const { data } = await client.auth.getUser();
  if (data.user) {
    await appendAuthAudit({
      actorUserId: data.user.id,
      action: "auth.logout",
      outcome: "success",
    }).catch(() => undefined);
  }
  await client.auth.signOut({ scope: "local" });
  redirect("/iniciar-sesion");
}
