"use client";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function LoadingText({ label = "Loading...", className }) {
  return (
    <p className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Loader2 className="size-4 animate-spin" />
      <span>{label}</span>
    </p>
  );
}

export function LoadingOverlay({ label = "Updating...", className }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-start justify-center rounded-xl bg-background/40 pt-3 backdrop-blur-[1px]",
        className
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
        <Loader2 className="size-3.5 animate-spin" />
        {label}
      </span>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6, className }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="border-b border-border px-3 py-3">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </div>

      <div className="space-y-2 p-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((__, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
