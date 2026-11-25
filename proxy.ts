import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionCookies: Parameters<SetAllCookies>[0] = [];
  const sessionHeaders = new Headers();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          sessionCookies.push(...cookiesToSet);
          for (const [name, value] of Object.entries(headers)) {
            sessionHeaders.set(name, value);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;
  const path = request.nextUrl.pathname;

  const url = request.nextUrl.clone();
  if (!signedIn && path.startsWith("/dashboard")) {
    url.pathname = "/login";
  } else if (signedIn && (path === "/login" || path === "/signup")) {
    url.pathname = "/dashboard";
  }

  const response = url.pathname === path
    ? NextResponse.next({ request })
    : NextResponse.redirect(url);
  sessionHeaders.forEach((value, name) => response.headers.set(name, value));
  for (const { name, value, options } of sessionCookies) {
    response.cookies.set(name, value, options);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
