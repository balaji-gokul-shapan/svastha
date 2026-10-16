"use client";

import { motion } from "framer-motion";
import { UserRound, Mail, Phone, Building2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_VARIANTS = {
  active: "success",
  inactive: "outline",
  pending: "warning",
};

const STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
};

const AVATAR_STYLES = [
  "bg-primary/10 text-primary border border-primary/20",
  "bg-emerald-50/10 text-emerald-700 border border-emerald-200",
  "bg-amber-50/10 text-amber-700 border border-amber-200",
  "bg-rose-50/10 text-rose-700 border border-rose-200",
  "bg-indigo-50/10 text-indigo-700 border border-indigo-200",
];

function accountInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
}

function hashIndex(value) {
  let hash = 0;
  const str = String(value ?? "");
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % AVATAR_STYLES.length;
}

/**
 * Reusable connected account card.
 *
 * @param {object} account - account record (id, name, designation, status, branch_name, school_name, role...)
 * @param {string} className - extra tailwind classes
 * @param {function} onView - optional view handler
 */
export function AccountCard({ account, className, onView }) {
  if (!account) return null;

  const id = account.id ?? account.apiId ?? account.user_id ?? "";
  const name = account.name || account.full_name || "Unnamed user";
  const designation = account.designation || account.role || "Staff";
  const status = String(account.status ?? "active").toLowerCase();
  const branch = account.branch_name || account.branch?.name || "—";
  const school = account.school_name || account.school?.name || "—";
  const avatar = AVATAR_STYLES[hashIndex(id)];

  return (
    <motion.div
      className={cn(
        "my-details-account-card group relative overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-lg hover:-translate-y-1",
        className,
      )}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3">
        {/* header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`shrink-0 rounded-xl p-2 flex items-center justify-center ${avatar}`}>
              <UserRound className="size-5 shrink-0" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold leading-tight">{name}</p>
              <p className="text-xs text-muted-foreground">{designation}</p>
            </div>
          </div>
          <Badge variant={STATUS_VARIANTS[status] ?? "outline"} className="shrink-0">
            {STATUS_LABELS[status] ?? status}
          </Badge>
        </div>

        {/* branch & school pills */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
            <Building2 className="size-3 shrink-0 mr-1" aria-hidden="true" />
            {branch}
          </span>
          <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
            {school}
          </span>
        </div>

        {/* contact meta */}
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{account.email || "—"}</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{account.phone || "—"}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between pt-3 border-t border-border/60">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Account ID
          </p>
          <button
            onClick={onView}
            disabled={!onView}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-foreground transition-colors"
            aria-label={`View ${name} profile`}
          >
            View details <ChevronRight className="size-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
