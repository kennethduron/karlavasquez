import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { appendAuthAudit } from "@/infrastructure/supabase/audit";
import { resolveSupabaseSession } from "@/infrastructure/supabase/authorization";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(12).max(256),
});

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const originUrl = new URL(origin);
    return (
      originUrl.host === host &&
      (process.env.NODE_ENV !== "production" || originUrl.protocol === "https:")
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json(
      { error: "Solicitud no permitida." },
      { status: 403 },
    );
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 4096) {
    return NextResponse.json(
      { error: "Solicitud no permitida." },
      { status: 413 },
    );
  }

  const parsed = credentialsSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }

  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }

  const session = await resolveSupabaseSession(client, data.user);
  if (!session) {
    await client.auth.signOut({ scope: "local" });
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  await appendAuthAudit({
    actorUserId: data.user.id,
    action: "auth.login",
    outcome: "success",
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json(
      { error: "Solicitud no permitida." },
      { status: 403 },
    );
  }

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
  return NextResponse.json({ ok: true });
}
