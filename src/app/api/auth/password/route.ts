import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/infrastructure/supabase/server";

const schema = z.object({
  password: z
    .string()
    .min(12)
    .max(128)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

export async function PATCH(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json(
      { error: "Solicitud no permitida." },
      { status: 403 },
    );
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Contraseña no válida." },
      { status: 400 },
    );
  }

  const client = await createSupabaseServerClient();
  const { data: currentUser } = await client.auth.getUser();
  if (!currentUser.user) {
    return NextResponse.json({ error: "Enlace no válido." }, { status: 401 });
  }
  const { error } = await client.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return NextResponse.json({ error: "Enlace no válido." }, { status: 401 });
  }
  const { error: activationError } = await createSupabaseAdminClient()
    .from("profiles")
    .update({ status: "active" })
    .eq("id", currentUser.user.id)
    .eq("status", "invited");
  if (activationError) {
    return NextResponse.json(
      { error: "No fue posible activar la cuenta." },
      { status: 500 },
    );
  }
  await client.auth.signOut({ scope: "global" });
  return NextResponse.json({ ok: true });
}
