"use client";

import { cn } from "../../../lib/utils";

const TONE_ACTIVE_CLASS = {
  good: "border-success bg-success/10 text-success",
  warn: "border-warning bg-warning/10 text-warning-foreground",
  bad: "border-destructive bg-destructive/10 text-destructive",
};

export function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? TONE_ACTIVE_CLASS[option.tone]
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}