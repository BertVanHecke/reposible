import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";
import { getLocale } from "next-intl/server";

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export async function localeRedirect(href: string): Promise<never> {
  const locale = await getLocale();
  throw redirect({ href, locale });
}
