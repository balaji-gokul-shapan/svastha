"use client";

import { useMemo } from "react";
import {
  BadgeCheck,
  Building2,
  GraduationCap,
  IdCard,
  ShieldCheck,
  Stethoscope,
  UserCog,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import {
  selectAuthAccount,
  selectAuthLoginAt,
  selectAuthUser,
  selectIsPrimaryDoctor,
} from "@/lib/features/auth-slice";
import { getRoleLabel, useAuthRole } from "@/lib/user-role";

/**
 * ACCOUNT & ACCESS
 * ----------------
 * Shows the identity and entitlement fields that actually differ per role.
 */

/** Reads a value the backend may spell in several ways. */
const pick = (...values) => {
  for (const value of values) {
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return "";
};

/** A privilege part may be a plain string or an object with name/id/value. */
const readPart = (value) => {
  if (value == null) return "";
  if (typeof value === "object") return pick(value.name, value.id, value.value);
  return String(value).trim();
};

/**
 * Class/section privileges arrive as an array, a JSON string, or a
 * `{ "3": ["A", "B"] }` map depending on the endpoint, so all three shapes are
 * normalised into readable labels.
 */
function readPrivilegeLabels(account) {
  const raw = account?.previleges ?? account?.privileges;
  if (raw == null || raw === "") return [];

  const toLabel = (entry) => {
    if (entry && typeof entry === "object") {
      const cls = readPart(
        entry.class ??
          entry.Class ??
          entry.grade ??
          entry.grade_id ??
          entry.class_id,
      );
      const sec = readPart(entry.section ?? entry.Section ?? entry.section_id);
      if (cls && sec) return `Class ${cls} - Section ${sec}`;
      if (cls) return `Class ${cls}`;
      return sec ? `Section ${sec}` : "";
    }
    return String(entry).trim();
  };

  let parsed = raw;
  if (typeof raw === "string") {
    // It may be a JSON string rather than an array; fall back to the raw text.
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [raw.trim()].filter(Boolean);
    }
  }

  if (Array.isArray(parsed)) return parsed.map(toLabel).filter(Boolean);

  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed).flatMap(([cls, sections]) => {
      const list = Array.isArray(sections) ? sections : [sections];
      return list
        .map((sec) => {
          const clsLabel = readPart(cls);
          const secLabel = readPart(sec);
          if (clsLabel && secLabel) {
            return `Class ${clsLabel} - Section ${secLabel}`;
          }
          return clsLabel ? `Class ${clsLabel}` : `Section ${secLabel}`;
        })
        .filter(Boolean);
    });
  }

  return [];
}

function formatSignedInAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Roles that are scoped to a single school branch. */
const BRANCH_SCOPED_ROLES = new Set([
  "school",
  "school_admin",
  "school_sub_account",
]);


function buildRows({ user, account, role, isPrimaryDoctor }) {
  const displayName = pick(user?.emp_name, user?.user_name, user?.username);
  const employeeId = pick(user?.emp_id, user?.emp_code, user?.employee_id);
  const username = pick(user?.user_name, user?.username);

  // Everyone gets identity + role. The rest is role-specific.
  const rows = [
    { key: "name", icon: IdCard, label: "Full name", value: displayName },
    { key: "username", icon: UserCog, label: "Username", value: username },
    {
      key: "role",
      icon: ShieldCheck,
      label: "Access level",
      value: getRoleLabel(role),
    },
  ];

  if (employeeId) {
    rows.push({
      key: "empid",
      icon: BadgeCheck,
      label: "Employee ID",
      value: employeeId,
    });
  }

  // Branch scope - meaningless for an admin, meaningful for school roles.
  if (BRANCH_SCOPED_ROLES.has(role)) {
    const branch = pick(
      account?.branch_name,
      account?.name,
      account?.school_name,
      user?.branch_name,
      user?.school_name,
    );
    const branchId = pick(
      account?.branch_id,
      account?.branchId,
      user?.branch_id,
      user?.branchId,
    );

    if (branch) {
      rows.push({
        key: "branch",
        icon: Building2,
        label: "Branch",
        value: branch,
      });
    }
    if (branchId) {
      rows.push({
        key: "branchid",
        icon: Building2,
        label: "Branch ID",
        value: branchId,
      });
    }

    // Class/section scope only applies to a sub-account (teacher/staff).
    if (role === "school_sub_account") {
      const className = pick(account?.class, user?.class);
      const section = pick(account?.section, user?.section);

      if (className || section) {
        rows.push({
          key: "class",
          icon: GraduationCap,
          label: "Teaching scope",
          // Only the part that exists, so it never reads "Class 3 | Section -".
          value: [
            className ? `Class ${className}` : "",
            section ? `Section ${section}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        });
      }

      const privileges = readPrivilegeLabels(account);
      if (privileges.length) {
        rows.push({
          key: "privileges",
          icon: GraduationCap,
          label: "Class privileges",
          value: privileges.join(", "),
        });
      }
    }
  }

  // Doctor-only entitlement.
  if (role === "doctor") {
    rows.push({
      key: "primary",
      icon: Stethoscope,
      label: "Primary doctor",
      value: isPrimaryDoctor
        ? "Yes - assigned as primary"
        : "No - assisting doctor",
    });
  }

  // Drop rows the backend did not populate rather than showing a blank.
  return rows.filter((row) => row.value);
}


export function AccountAccess() {
  const user = useAppSelector(selectAuthUser);
  const account = useAppSelector(selectAuthAccount);
  const loginAt = useAppSelector(selectAuthLoginAt);
  const isPrimaryDoctor = useAppSelector(selectIsPrimaryDoctor);
  const role = useAuthRole();

  const rows = useMemo(
    () => buildRows({ user, account, role, isPrimaryDoctor }),
    [account, isPrimaryDoctor, role, user],
  );

  const signedInAt = formatSignedInAt(loginAt);

  return (
    <div className="my-details-panel__body my-details-access">
      <dl className="my-details-access__grid">
        {rows.map(({ key, icon: Icon, label, value }) => (
          <div key={key} className="my-details-access__item">
            <span className="my-details-access__icon" aria-hidden="true">
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0">
              <dt className="my-details-access__label">{label}</dt>
              <dd className="my-details-access__value" title={value}>
                {value}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      {signedInAt ? (
        <p className="my-details-access__footer">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
          Signed in since {signedInAt}
        </p>
      ) : null}
    </div>
  );
}

