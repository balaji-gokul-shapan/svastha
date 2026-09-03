"use client";

import { memo } from "react";
import BloodDropOutlineIcon from "@iconify-react/healthicons/blood-drop-outline";
const TONE_ACTIVE_CLASS = {
  good: "border-success bg-success/10 text-success",
  warn: "border-warning bg-warning/10 text-warning-foreground",
  bad: "border-destructive bg-destructive/10 text-destructive",
  neutral: "border-primary bg-primary/10 text-primary",
  muted: "border-muted-foreground/40 bg-muted text-muted-foreground",
};

// Shared button chrome for BOTH components — tweak once, both follow.
const SEGMENT_BASE_CLASS =
  "min-h-10 rounded-md border px-2.5 py-2 text-xs font-medium leading-tight transition-colors sm:px-3 sm:text-sm";
const SEGMENT_INACTIVE_CLASS =
  "border-border bg-background text-muted-foreground hover:bg-muted";

// Options may arrive as plain strings ("Normal") or as schema objects
// ({ value, label, tone }). Normalizing here lets ToggleGroup and
// SegmentedControl consume exactly the same data — including tones —
// without callers maintaining two option shapes.
function normalizeOption(option) {
  if (typeof option === "string") {
    return { value: option, label: option };
  }
  return {
    value: option?.value,
    label: option?.label ?? option?.value,
    tone: option?.tone,
  };
}

const COLUMN_CLASS = {
  2: "grid-cols-1 sm:grid-cols-2",
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
  icon,
  iconBg,
  // textColor="text-foreground",
  headingClass="text-foreground",
  textClass,
}) {
  // Dynamic icon: when an `icon` component is passed it renders that one
  // (e.g. Syringe for Immunization); otherwise it falls back to the default
  // blood-drop. Both styles are accepted — a component reference like
  // icon={Syringe} — not an element.
  const Icon = icon || BloodDropOutlineIcon;

  return (
    <div>
      <div className="flex flex-row items-center gap-2 mb-2">
        {icon && (
          <div className={`flex size-8 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`size-4 ${textClass}`} height="4rem" />
        </div>
        )}
        {/* <HematologyLaboratoryIcon className="size-6 text-success rounded-xl " height="5rem" /> */}
        <p className={`mb-2 text-sm font-semibold ${headingClass}`}>{label}</p>
      </div>
      <div
        className={`grid gap-2 sm:gap-2.5 ${COLUMN_CLASS[columns] || COLUMN_CLASS[3]}`}
      >
        {options.map((rawOption) => {
          const { value: optionValue, label: optionLabel, tone } =
            normalizeOption(rawOption);
          const isActive = value === optionValue;
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(optionValue)}
              aria-pressed={isActive}
              className={`${SEGMENT_BASE_CLASS} w-full ${
                isActive
                  ? TONE_ACTIVE_CLASS[tone || "neutral"]
                  : SEGMENT_INACTIVE_CLASS
              }`}
            >
              {formatBloodGroup(optionLabel)}
            </button>
          );
        })}
      </div>
    </div>
  );
}



// Memoized: avoids re-rendering all toggle buttons on unrelated parent updates.
export const ToggleGroup = memo(ToggleGroupComponent);


