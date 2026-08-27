"use client";

import { memo } from "react";
import BloodDropOutlineIcon from "@iconify-react/healthicons/blood-drop-outline";
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

 const formatBloodGroup = (bloodGroup) => {
  if (!bloodGroup) return "--";

  return bloodGroup
    .replace(/\s*Positive/i, "+")
    .replace(/\s*Negative/i, "-");
};

function ToggleGroupComponent({
  label,
  options,
  value,
  onChange,
  columns = 3,
}) {
  return (
    <div>
      <div className="flex flex-row items-center gap-2 mb-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
          <BloodDropOutlineIcon
            className="size-4 text-destructive"
            height="4rem"
          />
        </div>
        {/* <HematologyLaboratoryIcon className="size-6 text-success rounded-xl " height="5rem" /> */}
        <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      </div>
      <div
        className={`grid gap-2 sm:gap-2.5 ${COLUMN_CLASS[columns] || COLUMN_CLASS[3]}`}
      >
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
              {formatBloodGroup(option.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Memoized: avoids re-rendering all toggle buttons on unrelated parent updates.
export const ToggleGroup = memo(ToggleGroupComponent);
