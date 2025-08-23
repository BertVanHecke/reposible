
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
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
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
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    invited: getPathname({ href: "/invite", locale }),
    onboardingTeam: getPathname({ href: "/onboarding/team", locale }),
    onboardingInvite: getPathname({ href: "/onboarding/invite", locale }),
  };

  const loginUrl = new URL(paths.login, request.nextUrl.origin).toString();

  // Redirect unauthenticated users trying to access protected pages
  const publicPaths = [
    paths.login,
    paths.otpSuccess,
    paths.authCallback,
    paths.authConfirm,
    paths.invited,
  ];

  if (!user && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(loginUrl);
  }

  // Post-auth checks
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("onboarded, last_selected_team_id")
      .eq("id", user.id)
      .single()
      .throwOnError();

    const { onboarded, last_selected_team_id } = userData;

    // Redirect onboarded users with selected team away from team creation page
    if (
      onboarded &&
      last_selected_team_id &&
      pathname === paths.onboardingTeam
    ) {
      const inviteUrl = new URL(paths.onboardingInvite, request.nextUrl.origin);
      inviteUrl.searchParams.set("team_id", last_selected_team_id);
      return NextResponse.redirect(inviteUrl.toString());
    }

    // Let invited users access the invited callback without redirect
    if (!onboarded && pathname === paths.invited) {
      return response;
    }

    // Redirect non-onboarded users to onboarding page
    const onboardingRequired =
      !onboarded &&
      pathname !== paths.onboardingTeam &&
      pathname !== paths.invited;

    if (onboardingRequired) {
      const onboardingUrl = new URL(
        paths.onboardingTeam,
        request.nextUrl.origin
      ).toString();
      return NextResponse.redirect(onboardingUrl);
    }
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
