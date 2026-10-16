"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  Building2,
  Clock,
  KeyRound,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const STAT_COLORS = {
  primary: "bg-primary/10 border-primary/20 text-primary",
  emerald: "bg-emerald-50/10 border-emerald-200 text-emerald-700",
  amber: "bg-amber-50/10 border-amber-200 text-amber-700",
  rose: "bg-rose-50/10 border-rose-200 text-rose-700",
  indigo: "bg-indigo-50/10 border-indigo-200 text-indigo-700",
};

const LUCIDE_ICONS = {
  building: Building2,
  users: UserRound,
  shield: ShieldCheck,
  clock: Clock,
  activity: Activity,
  key: KeyRound,
};

/**
 * Reusable stat overview card.
 * Renders a small icon, a big value and a muted label.
 *
 * @param {string} label - small muted label (uppercased automatically)
 * @param {string|number} value - main big value
 * @param {keyof typeof LUCIDE_ICONS} icon - lucide icon name
 * @param {keyof typeof STAT_COLORS} color - color theme
 * @param {string} className - extra tailwind classes
 */
export function StatOverviewCard({ label, value, icon = "users", color = "primary", className }) {
  const Icon = LUCIDE_ICONS[icon] ?? UserRound;
  const theme = STAT_COLORS[color] ?? STAT_COLORS.primary;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative z-10 flex items-center gap-3">
        <div className={`shrink-0 rounded-lg p-2 ${theme}`}>
          <Icon className="size-4 shrink-0" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-lg font-bold leading-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
