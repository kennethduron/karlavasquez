import { createHash } from "node:crypto";
import { z } from "zod";

import { getServerSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server";

const registrationSchema = z.object({
  fid: z.string().regex(/^[A-Za-z0-9_-]{20,128}$/),
  userAgent: z.string().trim().max(200).optional(),
});

function unauthorized() {
  return Response.json({ error: "No autorizado." }, { status: 401 });
}

function tokenHash(fid: string) {
  return createHash("sha256").update(fid).digest("hex");
}

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const client = createSupabaseAdminClient();
  const { count, error } = await client
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.uid)
    .eq("enabled", true);

  if (error) {
    return Response.json(
      { error: "No fue posible consultar las notificaciones." },
      { status: 503 },
    );
  }

  return Response.json({ enabled: (count ?? 0) > 0, count: count ?? 0 });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const parsed = registrationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Registro no válido." }, { status: 400 });
  }

  const client = createSupabaseAdminClient();
  const hash = tokenHash(parsed.data.fid);
  const { data: existing, error: lookupError } = await client
    .from("push_subscriptions")
    .select("user_id")
    .eq("token_hash", hash)
    .maybeSingle();

  if (lookupError) {
    return Response.json(
      { error: "No fue posible validar la suscripciÃ³n." },
      { status: 503 },
    );
  }

  if (existing && existing.user_id !== session.uid) {
    return Response.json(
      { error: "La suscripciÃ³n pertenece a otra cuenta." },
      { status: 409 },
    );
  }

  const { error } = await client.from("push_subscriptions").upsert(
    {
      user_id: session.uid,
      token: parsed.data.fid,
      token_hash: hash,
      platform: "web",
      user_agent_summary: parsed.data.userAgent || null,
      enabled: true,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "token_hash" },
  );

  if (error) {
    return Response.json(
      { error: "No fue posible activar las notificaciones." },
      { status: 503 },
    );
  }

  return Response.json({ enabled: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const parsed = registrationSchema
    .pick({ fid: true })
    .safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Registro no válido." }, { status: 400 });
  }

  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("push_subscriptions")
    .delete()
    .eq("user_id", session.uid)
    .eq("token_hash", tokenHash(parsed.data.fid));

  if (error) {
    return Response.json(
      { error: "No fue posible desactivar las notificaciones." },
      { status: 503 },
    );
  }

  return Response.json({ enabled: false });
}
