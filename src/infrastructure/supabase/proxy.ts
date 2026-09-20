import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function copyPendingCookies(response: NextResponse, cookies: PendingCookie[]) {
  for (const { name, value, options } of cookies) {
    response.cookies.set(name, value, { ...options, ...secureCookieOptions });
  }
  return response;
}

export async function refreshSupabaseSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    if (request.nextUrl.pathname.startsWith("/panel")) {
      return NextResponse.redirect(new URL("/iniciar-sesion", request.url));
    }
    return NextResponse.next({ request });
  }

  const pendingCookies: PendingCookie[] = [];
  const client = createServerClient(url, publishableKey, {
    cookieOptions: secureCookieOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        pendingCookies.push(...values);
        for (const { name, value } of values) request.cookies.set(name, value);
      },
    },
  });
  const { data } = await client.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/panel") && !data.user) {
    const loginUrl = new URL("/iniciar-sesion", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return copyPendingCookies(NextResponse.redirect(loginUrl), pendingCookies);
  }

  return copyPendingCookies(NextResponse.next({ request }), pendingCookies);
}
