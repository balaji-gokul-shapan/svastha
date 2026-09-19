// Route-role rule checks (user_type_id based).
//
// lib/route-roles.js is dependency-free ESM, but package.json has no
// "type": "module" — so this harness loads its SOURCE through a data: URL
// instead of importing the .js file directly (which Node would treat as CJS).
//
// Run with:  node tests/route-roles.check.mjs

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../lib/route-roles.js", import.meta.url),
  "utf8",
);

const mod = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

const {
  resolveUserTypeId,
  getAllowedUserTypeIdsForPath,
  getAllowedRolesForPath,
  isRoleAllowedForPath,
} = mod;

const ADMIN = { roleName: "admin", userTypeId: 1 };
const SCHOOL = { roleName: "school", userTypeId: 2 };
const TEACHER = { roleName: "teacher", userTypeId: 3 };
const DOCTOR = { roleName: "doctor", userTypeId: 5 };
const SCHOOL_ADMIN = { roleName: "school_admin" };
const SUB_ACCOUNT = { roleName: "school_sub_account" };
const STAFF = { roleName: "staff" };

const allowed = (path, user) => isRoleAllowedForPath(path, user);

// ---- unrestricted paths ---------------------------------------------------
assert.equal(allowed("/", ADMIN), true);
assert.equal(allowed("/settings", SUB_ACCOUNT), true);
assert.equal(allowed("/settings", STAFF), true);
assert.equal(allowed("/students-archive", DOCTOR), true, "prefix must be exact");
assert.equal(allowed("/api/students/filter", STAFF), true, "api is not a page");
assert.equal(getAllowedUserTypeIdsForPath("/settings"), null);
assert.equal(getAllowedRolesForPath("/settings"), null);

// ---- /students ------------------------------------------------------------
for (const user of [ADMIN, SCHOOL, TEACHER, SCHOOL_ADMIN, SUB_ACCOUNT]) {
  assert.equal(allowed("/students", user), true, `/students -> ${user.roleName}`);
  assert.equal(allowed("/students/add", user), true);
  assert.equal(allowed("/students/42/", user), true, "trailing slash");
}
for (const user of [DOCTOR, STAFF, { roleName: "accountant" }]) {
  assert.equal(allowed("/students", user), false, `/students -> ${user.roleName}`);
}
assert.equal(allowed("/students", { roleName: "School_Sub_Account" }), true, "case-insensitive");
assert.equal(allowed("/students", { roleName: "2" }), true, "numeric cookie id");
assert.equal(allowed("/students", { userTypeId: 2 }), true, "user_type_id wins");
assert.equal(allowed("/students", { userTypeId: 4 }), false, "unknown id 4");

// ---- health checks --------------------------------------------------------
assert.equal(allowed("/health-checks", ADMIN), true);
assert.equal(allowed("/health-checks", DOCTOR), true);
assert.equal(allowed("/health-checks", SCHOOL_ADMIN), true);
assert.equal(allowed("/health-checks", SCHOOL), false, "school is NOT allowed");
assert.equal(allowed("/health-checks", SUB_ACCOUNT), false, "sub-account is NOT allowed");
assert.equal(allowed("/health-checks", TEACHER), false);

assert.equal(allowed("/health-checks/ent-screening", ADMIN), true);
assert.equal(allowed("/health-checks/ent-screening", DOCTOR), true);
assert.equal(allowed("/health-checks/ent-screening", SCHOOL_ADMIN), false);
assert.equal(allowed("/health-checks/dental-screening", DOCTOR), true);
assert.equal(allowed("/health-checks/dental-screening", SCHOOL), false);

// ---- insurance & claims ---------------------------------------------------
assert.equal(allowed("/insurance-and-claims", ADMIN), true);
assert.equal(allowed("/insurance-and-claims", SCHOOL_ADMIN), true);
assert.equal(allowed("/insurance-and-claims", SCHOOL), false);
assert.equal(allowed("/insurance-and-claims", SUB_ACCOUNT), false);
assert.equal(allowed("/insurance-and-claims/settlements", ADMIN), true);
assert.equal(allowed("/insurance-and-claims/settlements", SCHOOL_ADMIN), false);

// ---- reports --------------------------------------------------------------
for (const user of [ADMIN, SCHOOL, TEACHER, DOCTOR, SCHOOL_ADMIN, SUB_ACCOUNT]) {
  assert.equal(allowed("/report", user), true, `/report -> ${user.roleName}`);
}
assert.equal(allowed("/report", STAFF), false);

// ---- id <-> name helpers --------------------------------------------------
assert.equal(resolveUserTypeId("school"), 2);
assert.equal(resolveUserTypeId("SCHOOL"), 2);
assert.equal(resolveUserTypeId("2"), 2);
assert.equal(resolveUserTypeId(5), 5);
assert.equal(resolveUserTypeId("staff"), null);
assert.equal(resolveUserTypeId("school_sub_account"), null);
assert.equal(resolveUserTypeId("unknown"), null);
assert.equal(resolveUserTypeId("4"), null);
assert.equal(resolveUserTypeId(""), null);
assert.equal(resolveUserTypeId(null), null);
assert.equal(resolveUserTypeId(undefined), null);

assert.deepEqual(getAllowedUserTypeIdsForPath("/students"), [1, 2, 3]);
assert.deepEqual(getAllowedUserTypeIdsForPath("/report"), [1, 2, 3, 5]);
assert.deepEqual(getAllowedUserTypeIdsForPath("/insurance-and-claims/settlements"), [1]);
assert.deepEqual(getAllowedRolesForPath("/students"), [
  "admin",
  "school",
  "teacher",
  "school_admin",
  "school_sub_account",
]);

console.log("route-roles checks passed");
