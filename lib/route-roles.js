/**
 * ROUTE ROLE RULES — keyed by user_type_id
 * ----------------------------------------
 * Shared, dependency-free (no React imports) so BOTH the edge proxy (proxy.js)
 * and client components can use it to enforce role-based access per URL — not
 * just hide sidebar links.
 *
 * Rules are expressed with the numeric `user_type_id` the backend sends:
 *   1 = admin, 2 = school, 3 = teacher, 5 = doctor
 * (mirrors lib/user-role.js USER_ROLES — keep the two in sync).
 *
 * Some accounts only carry a role NAME (no numeric id): the Settings → Team
 * sub-accounts ("school_sub_account") and the school-level admin
 * ("school_admin"). Those are listed per rule in `roleNames`, so access is:
 *
 *   allowed  ⇔  user_type_id ∈ userTypeIds   OR   role name ∈ roleNames
 *
 * Semantics (unchanged from the name-based version):
 *   - No matching rule             -> unrestricted (every authenticated role)
 *   - Matched rule with no entries -> unrestricted
 *   - Matched rule with entries    -> only those ids/names
 *
 * Keep this in sync with app/components/layout/sidebar.jsx navItems.
 */

// Canonical user_type_id values (see lib/user-role.js `USER_ROLES`).
export const USER_TYPE_IDS = {
  ADMIN: 1,
  SCHOOL: 2,
  TEACHER: 3,
  DOCTOR: 5,
};

const { ADMIN, SCHOOL, TEACHER, DOCTOR } = USER_TYPE_IDS;

// user_type_id -> canonical role name (used by getAllowedRolesForPath).
export const USER_TYPE_ID_TO_ROLE_NAME = {
  [ADMIN]: "admin",
  [SCHOOL]: "school",
  [TEACHER]: "teacher",
  [DOCTOR]: "doctor",
};

// role name -> user_type_id. Deliberately limited to the roles the backend
// assigns a numeric id to; name-only roles (school_admin, school_sub_account,
// "staff") have NO id and are matched through a rule's `roleNames`.
export const ROLE_NAME_TO_USER_TYPE_ID = {
  admin: ADMIN,
  school: SCHOOL,
  teacher: TEACHER,
  doctor: DOCTOR,
};

const ROUTE_ROLE_RULES = [
  // Sidebar top-level + children (longest prefix wins, so order is flexible)
  {
    prefix: "/students",
    // admin, school, teacher + the school's team sub-accounts
    userTypeIds: [ADMIN, SCHOOL, TEACHER],
    roleNames: ["school_admin", "school_sub_account"],
  },
  {
    prefix: "/health-checks/ent-screening",
    userTypeIds: [ADMIN, DOCTOR],
  },
  {
    prefix: "/health-checks/dental-screening",
    userTypeIds: [ADMIN, DOCTOR],
  },
  {
    prefix: "/health-checks",
    userTypeIds: [ADMIN, DOCTOR],
    roleNames: ["school_admin"],
  },
  {
    prefix: "/insurance-and-claims/settlements",
    userTypeIds: [ADMIN],
  },
  {
    prefix: "/insurance-and-claims",
    userTypeIds: [ADMIN],
    roleNames: ["school_admin"],
  },
  {
    prefix: "/report",
    userTypeIds: [ADMIN, SCHOOL, TEACHER, DOCTOR],
    roleNames: ["school_admin", "school_sub_account"],
  },

  // /settings is open to every authenticated role; its restricted tabs (team,
  // screening, school details) are client-side state, not URL-addressable.
];

function pathMatchesPrefix(pathname, prefix) {
  if (pathname === prefix) {
    return true;
  }

  // "/students" also covers "/students/add" and "/students/[id]"
  return pathname.startsWith(`${prefix}/`);
}

// Normalises the many shapes a role can arrive in (cookie value, Redux
// account_type, a `user_type` name) to a lowercase string.
export function normalizeRoleName(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Resolves a role value to its numeric user_type_id.
 *
 * Accepts a number (2), a numeric string ("2" — how a cookie stores it), or a
 * role name ("school"). Returns null when the value carries no id (e.g.
 * "school_sub_account", "staff", an unknown id like 4).
 *
 * @param {string|number|null|undefined} value
 * @returns {number|null}
 */
export function resolveUserTypeId(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  const name = raw.toLowerCase();

  // Numeric id, possibly arriving as a string from the auth cookie.
  if (/^\d+$/.test(name)) {
    const numeric = Number(name);
    return USER_TYPE_ID_TO_ROLE_NAME[numeric] ? numeric : null;
  }

  return ROLE_NAME_TO_USER_TYPE_ID[name] ?? null;
}

function findRouteRule(pathname) {
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

  return bestMatch;
}

/**
 * The access rule for a pathname, or null when unrestricted.
 *
 * @param {string} pathname - e.g. "/students/add"
 * @returns {{userTypeIds: number[], roleNames: string[]}|null}
 */
export function getRouteRuleForPath(pathname) {
  const rule = findRouteRule(pathname);
  if (!rule) return null;

  return {
    userTypeIds: Array.isArray(rule.userTypeIds) ? rule.userTypeIds : [],
    roleNames: (rule.roleNames ?? []).map(normalizeRoleName),
  };
}

/**
 * The user_type_ids allowed for a pathname.
 *
 * @param {string} pathname
 * @returns {number[]|null} null when unrestricted.
 */
export function getAllowedUserTypeIdsForPath(pathname) {
  const rule = getRouteRuleForPath(pathname);
  return rule ? rule.userTypeIds : null;
}

/**
 * Is the current user allowed on this pathname?
 *
 * Unrestricted paths (no rule, or a rule with no ids/names) always return
 * `true`, so callers can block purely on `false`.
 *
 * @param {string} pathname
 * @param {{userTypeId?: string|number|null, roleName?: string|null}} user
 * @returns {boolean}
 */
export function isRoleAllowedForPath(
  pathname,
  { userTypeId = null, roleName = "" } = {},
) {
  const rule = getRouteRuleForPath(pathname);
  if (!rule) return true;

  const { userTypeIds, roleNames } = rule;

  // Matched rule with no restrictions -> open to every authenticated role.
  if (userTypeIds.length === 0 && roleNames.length === 0) {
    return true;
  }

  // 1) Numeric id, taken from the account when available and otherwise
  //    resolved from the role name ("school" -> 2). A numeric string role
  //    (from the auth cookie) is handled by resolveUserTypeId too.
  const numericId = resolveUserTypeId(userTypeId) ?? resolveUserTypeId(roleName);

  if (numericId !== null && userTypeIds.includes(numericId)) {
    return true;
  }

  // 2) Name-only roles (school_admin, school_sub_account, …).
  const name = normalizeRoleName(roleName);
  return Boolean(name) && roleNames.includes(name);
}

/**
 * Back-compat helper: the allowed roles for a pathname as ROLE NAMES.
 *
 * @param {string} pathname - e.g. "/students/add"
 * @returns {string[]|null} Allowed role names, or null when unrestricted.
 */
export function getAllowedRolesForPath(pathname) {
  const rule = getRouteRuleForPath(pathname);
  if (!rule) return null;

  const fromIds = rule.userTypeIds
    .map((id) => USER_TYPE_ID_TO_ROLE_NAME[id])
    .filter(Boolean);

  return [...new Set([...fromIds, ...rule.roleNames])];
}