"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Phone, ChevronRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const BRANCH_GRADIENTS = [
  "from-primary to-primary/70",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-indigo-500 to-indigo-600",
];

const AVATAR_STYLES = [
  "bg-primary/10 text-primary border border-primary/20",
  "bg-emerald-50/10 text-emerald-700 border border-emerald-200",
  "bg-amber-50/10 text-amber-700 border border-amber-200",
  "bg-rose-50/10 text-rose-700 border border-rose-200",
  "bg-indigo-50/10 text-indigo-700 border border-indigo-200",
];

function branchInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SB";
}

function hashIndex(value) {
  let hash = 0;
  const str = String(value ?? "");
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % BRANCH_GRADIENTS.length;
}

/**
 * Reusable school branch card.
 *
 * @param {object} branch - branch record (id, name, school_name, address, phone, student_count, status...)
 * @param {string} className - extra tailwind classes
 * @param {"active"|"inactive"} status - override status badge
 */
export function SchoolBranchCard({ branch, className, status = "active" }) {
  if (!branch) return null;

  const id = branch.id ?? branch.branch_id ?? branch.apiId ?? "";
  const name = branch.name || branch.branch_name || "Unnamed branch";
  const school = branch.school_name || branch.school?.name || "School";
  const idx = hashIndex(id);
  const gradient = BRANCH_GRADIENTS[idx];
  const avatar = AVATAR_STYLES[idx];

  return (
    <motion.div
      className={cn(
        "my-details-branch-card group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-all hover:shadow-xl hover:-translate-y-1",
        className,
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      {/* entrance accent gradient */}
      <div className="h-1 w-full rounded-t-xl bg-gradient-to-r" style={{ backgroundImage: gradient }} />
      {/* subtle hover glow */}
      <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 grid grid-cols-2 gap-4">
        <div className="col-span-2 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className={`shrink-0 rounded-xl p-3 flex items-center justify-center ${avatar}`}>
            <Building2 className="size-5 shrink-0" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-grow">
            <p className="font-semibold leading-tight">{name}</p>
            <p className="text-xs text-muted-foreground">{school}</p>
          </div>
          <Badge
            variant={status === "active" ? "success" : "outline"}
            className="shrink-0"
          >
            {status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="col-span-1 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{branch.address || branch.city || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{branch.phone || "—"}</span>
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Students
          </p>
          <p className="text-xl font-bold">
            {branch.student_count ?? branch.students ?? "—"}
          </p>
        </div>

        <div className="col-span-2 pt-3 border-t border-border/60">
          <button
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/50 hover:text-primary-foreground transition-colors"
            aria-label={`View ${name} details`}
          >
            View branch <ChevronRight className="size-3.5 shrink-0" />
          </button>
        </div>
      </div>

      <span
        className="absolute top-3 right-3 h-6 w-6 rounded-full border border-white/60 bg-white/60 backdrop-blur-sm flex items-center justify-center"
        aria-hidden="true"
      >
        <ShieldCheck className="size-3 text-primary" />
      </span>
    </motion.div>
  );
}
