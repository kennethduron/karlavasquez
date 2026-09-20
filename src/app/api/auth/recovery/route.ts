import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { getSiteUrl } from "@/lib/env/server";

const schema = z.object({ email: z.email().max(254) });
const genericResponse = { ok: true };

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json(
      { error: "Solicitud no permitida." },
      { status: 403 },
    );
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(genericResponse);

  const client = await createSupabaseServerClient();
  await client.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/actualizar-contrasena`,
  });
  return NextResponse.json(genericResponse);
}
