import { NextResponse } from "next/server";

/**
 * AUTH MIDDLEWARE
 * ---------------
 * - /login and /register are PUBLIC (accessible without login).
 * - Every other page requires an authenticated session.
 * - The session flag lives in the "svastha-auth" cookie, which is kept in
 *   sync with the Redux auth state by lib/store.js (sessionStorage alone
 *   cannot be read by middleware because it runs on the server).
 */

const AUTH_COOKIE_NAME = "svastha-auth";

// Add any other public routes here (e.g. "/", "/about").
const PUBLIC_PATHS = new Set(["/login", "/register"]);

const LOGIN_PATH = "/login";
const AUTHENTICATED_HOME_PATH = "/dashboard";

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  // Already logged in? Keep users away from the auth pages.
  if (isAuthenticated && PUBLIC_PATHS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = AUTHENTICATED_HOME_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Not logged in? Only the public pages are reachable.
  if (!isAuthenticated && !PUBLIC_PATHS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    // Preserve where the user was heading so login can send them back.
    if (pathname !== LOGIN_PATH) {
      url.searchParams.set("next", `${pathname}${search}`);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next.js internals and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|css|js)$).*)",
  ],
};