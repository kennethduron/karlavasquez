import "server-only";

import { redirect } from "next/navigation";
import type { ServerSession } from "@/domain/auth";
import { resolveSupabaseSession } from "@/infrastructure/supabase/authorization";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export async function getServerSession(): Promise<ServerSession | null> {
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    return resolveSupabaseSession(client, data.user);
  } catch {
    return null;
  }
}

export async function requireServerSession(): Promise<ServerSession> {
  const session = await getServerSession();
  if (!session) redirect("/iniciar-sesion");
  return session;
}
