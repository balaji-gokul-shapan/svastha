import { NextResponse } from "next/server";

import { getAllowedRolesForPath } from "./lib/route-roles";

/**
 * AUTH MIDDLEWARE
 * ---------------
 * - /login and /register are PUBLIC (accessible without login).
 * - Every other page requires an authenticated session.
 * - The "svastha-auth" cookie stores the user's effective role (kept in sync
 *   with Redux auth state by lib/store.js — sessionStorage alone cannot be
 *   read by middleware because it runs on the server).
 * - Restricted routes (lib/route-roles.js) are additionally blocked per role,
 *   so manually typing a URL doesn't bypass the sidebar's role-based menu.
 */

const AUTH_COOKIE_NAME = "svastha-auth";

// Public pages: reachable without login. Add new ones here (e.g. "/about").
const PUBLIC_PATHS = new Set(["/login", "/register"]);

// Auth pages a signed-in user gets bounced off of (back to /dashboard).
// NOTE: deliberately narrower than PUBLIC_PATHS so internal links like the
// sidebar's "/register" keep working while a user is logged in.
const AUTH_PAGES = new Set(["/login"]);

const LOGIN_PATH = "/login";
const AUTHENTICATED_HOME_PATH = "/";

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const rawCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(rawCookie);
  const role = rawCookie ? decodeURIComponent(rawCookie) : "";

  // Already logged in? Keep users away from the auth pages.
  if (isAuthenticated && AUTH_PAGES.has(pathname)) {
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

  // Logged in but the route is restricted to other roles -> bounce home.
  const allowedRoles = getAllowedRolesForPath(pathname);

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = AUTHENTICATED_HOME_PATH;
    url.search = "";
    url.searchParams.set("denied", "1");
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