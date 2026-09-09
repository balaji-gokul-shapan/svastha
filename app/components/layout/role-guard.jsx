"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/hooks";
import { getAllowedRolesForPath } from "@/lib/route-roles";

// Pages the guard never applies to (also unreachable when logged out —
// middleware.js handles authentication redirects).
const PUBLIC_PATHS = new Set(["/login", "/register"]);

function AccessDeniedPanel({ role }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" />
        </span>

        <h1 className="text-lg font-semibold text-foreground">Access denied</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Your account{role ? ` (${role})` : ""} doesn&apos;t have permission to
          view this page.
        </p>

        <Link href="/" className="mt-6 inline-block">
          <Button type="button">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * CLIENT-SIDE ROUTE GUARD
 * -----------------------
 * Second layer of role enforcement — middleware.js is the first (server-side).
 * Blocks rendering of any page whose route is restricted to roles the signed-in
 * user doesn't have, even when the URL is typed manually.
 */
export function RoleGuard({ children }) {
  const pathname = usePathname();
  const { isAuthenticated, role, account_type } = useAppSelector(
    (state) => state.auth,
  );

  if (!pathname || PUBLIC_PATHS.has(pathname)) {
    return children;
  }

  // Same effective role the sidebar uses.
  const effectiveRole = account_type ?? role;
  const allowedRoles = getAllowedRolesForPath(pathname);

  // Restricted route and the user clearly lacks the role.
  if (
    isAuthenticated &&
    effectiveRole &&
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(effectiveRole)
  ) {
    return <AccessDeniedPanel role={effectiveRole} />;
  }

  return children;
}

export default RoleGuard;
