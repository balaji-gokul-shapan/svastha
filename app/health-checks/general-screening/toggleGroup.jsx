"use client";

import { memo } from "react";

const TONE_ACTIVE_CLASS = {
  good: "border-success bg-success/10 text-success",
  warn: "border-warning bg-warning/10 text-warning-foreground",
  bad: "border-destructive bg-destructive/10 text-destructive",
  neutral: "border-primary bg-primary/10 text-primary",
};

const COLUMN_CLASS = {
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  8: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-auto",
};

function ToggleGroupComponent({ label, options, value, onChange, columns = 3 }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      <div className={`grid gap-2 sm:gap-2.5 ${COLUMN_CLASS[columns] || COLUMN_CLASS[3]}`}>
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={`min-h-10 w-full rounded-md border px-2.5 py-2 text-xs font-medium leading-tight transition-colors sm:px-3 sm:text-sm ${
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
