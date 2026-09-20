import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerEnvironment } from "@/lib/env/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");
  const safeNext = next === "/actualizar-contrasena" ? next : "/panel";

  if (code) {
    const response = NextResponse.redirect(new URL(safeNext, request.url));
    const environment = getSupabaseServerEnvironment();
    const client = createServerClient(
      environment.url,
      environment.publishableKey,
      {
        cookieOptions: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        },
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (values) => {
            for (const { name, value, options } of values) {
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
              });
            }
          },
        },
      },
    );
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return response;
  }
  return NextResponse.redirect(
    new URL("/iniciar-sesion?error=enlace-invalido", request.url),
  );
}
