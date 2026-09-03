"use client";

import { cn } from "../../../../lib/utils";
import { memo } from "react";

const TONE_ACTIVE_CLASS = {
  good: "border-success bg-success/10 text-success",
  warn: "border-warning bg-warning/10 text-warning-foreground",
  bad: "border-destructive bg-destructive/10 text-destructive",
  neutral: "border-primary bg-primary/10 text-primary",
};

function ToggleGroupComponent({ label, options, value, onChange, columns = 2, labelClassName }) {
  return (
    <div>
      <p className={cn("mb-1 text-sm font-semibold text-foreground", labelClassName)}>
        {label}
      </p>
      <div className={`grid gap-2 ${columns === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? TONE_ACTIVE_CLASS[option.tone || "neutral"]
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Memoized: avoids re-rendering all toggle buttons on unrelated parent updates.
export const ToggleGroup = memo(ToggleGroupComponent);
