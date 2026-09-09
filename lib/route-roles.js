/**
 * ROUTE ROLE RULES
 * ----------------
 * Shared, dependency-free (no React imports) so BOTH the edge middleware and
 * client components can use it to enforce role-based access per URL — not
 * just hide sidebar links.
 *
 * Semantics mirror the sidebar nav config:
 *   - No matching rule              -> null  (open to every authenticated role)
 *   - Matched rule with roles: []   -> open to every authenticated role
 *   - Matched rule with roles list  -> only those roles
 *
 * Keep this in sync with app/components/layout/sidebar.jsx navItems.
 */

const ROUTE_ROLE_RULES = [
  // Sidebar top-level + children (longest prefix wins, so order is flexible)
  {
    prefix: "/students",
    roles: ["admin", "school_admin", "teacher", "school"],
  },
  {
    prefix: "/health-checks/ent-screening",
    roles: ["admin", "doctor"],
  },
  {
    prefix: "/health-checks/dental-screening",
    roles: ["admin", "doctor"],
  },
  {
    prefix: "/health-checks",
    roles: ["admin", "school_admin", "doctor"],
  },
  {
    prefix: "/insurance-and-claims/settlements",
    roles: ["admin"],
  },
  {
    prefix: "/insurance-and-claims",
    roles: ["admin", "school_admin"],
  },
  {
    prefix: "/report",
    roles: ["admin", "school_admin", "school"],
  },

  // /settingsNew is open to every role; its restricted tabs (team,
  // applications, api, campDetails) are client-side state, not URL-addressable.
];

function pathMatchesPrefix(pathname, prefix) {
  if (pathname === prefix) {
    return true;
  }

  // "/students" also covers "/students/add" and "/students/[id]"
  return pathname.startsWith(`${prefix}/`);
}

/**
 * Get the roles allowed for a pathname.
 *
 * @param {string} pathname - e.g. "/students/add"
 * @returns {string[]|null} Allowed roles, or null when unrestricted.
 */
export function getAllowedRolesForPath(pathname) {
  if (!pathname || typeof pathname !== "string") {
    return null;
  }

  // Strip a trailing slash (but keep the root "/").
  const normalised =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  let bestMatch = null;
  let bestMatchLength = -1;

  for (const rule of ROUTE_ROLE_RULES) {
    if (
      pathMatchesPrefix(normalised, rule.prefix) &&
      rule.prefix.length > bestMatchLength
    ) {
      bestMatch = rule;
      bestMatchLength = rule.prefix.length;
    }
  }

  return bestMatch ? bestMatch.roles : null;
}
