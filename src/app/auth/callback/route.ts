import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/validation/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeInternalPath(request.nextUrl.searchParams.get("next"));
  const destination = new URL(next, request.url);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(destination);
    } catch {
      // Fall through to the generic failure response.
    }
  }

  const loginUrl = new URL("/iniciar-sesion", request.url);
  loginUrl.searchParams.set("error", "enlace-invalido");
  return NextResponse.redirect(loginUrl);
}
