
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getEnvVar } from "../../misc/utils";
import { routing } from "../../i18n/routing";
import { Locale } from "../../i18n/type";
import { getPathname } from "../../i18n/navigation";

export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const supabaseUrl = getEnvVar(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  );
  const supabaseAnonKey = getEnvVar(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
  );

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getClaims()

  const {
    data,
  } = await supabase.auth.getClaims();

  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
  const potentialLocale = localeMatch?.[1];

  // Runtime check AND type guard
  const isValidLocale = (val: unknown): val is Locale =>
    typeof val === "string" && routing.locales.includes(val as Locale);

  const locale: Locale = isValidLocale(potentialLocale)
    ? potentialLocale
    : routing.defaultLocale;

  // Localized routes
  const paths = {
    login: getPathname({ href: "/login", locale }),
    otpSuccess: getPathname({ href: "/login/otp-success", locale }),
    authCallback: getPathname({ href: "/auth/callback", locale }),
    authConfirm: getPathname({ href: "/auth/confirm", locale }),
  };

  const loginUrl = new URL(paths.login, request.nextUrl.origin).toString();

  // Redirect unauthenticated users trying to access protected pages
  const publicPaths = [
    paths.login,
    paths.otpSuccess,
    paths.authCallback,
    paths.authConfirm,
  ];

  if (!data?.claims && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(loginUrl);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return response;
}
