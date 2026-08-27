"use client";

import { memo, useMemo } from "react";

import UnderweightIcon from "@iconify-react/healthicons/underweight";
import ManIcon from "@iconify-react/healthicons/man";
import Overweight24pxIcon from "@iconify-react/healthicons/overweight-24px";
import OverweightIcon from "@iconify-react/healthicons/overweight";

// Gauge maps BMI 10 → 40 across a 180° semicircle (0° = left/low, 180° = right/high).
const BMI_MIN = 10;
const BMI_MAX = 40;

// Fallback used until master data loads — mirrors the API's bmi-categories.
const FALLBACK_CATEGORIES = [
  { id: 1, name: "Underweight", min_value: "0.00", max_value: "18.49" },
  { id: 2, name: "Normal", min_value: "18.50", max_value: "24.90" },
  { id: 3, name: "Overweight", min_value: "25.00", max_value: "29.90" },
  { id: 4, name: "Obese", min_value: "30.00", max_value: "34.90" },
  { id: 5, name: "Severely Obese", min_value: "35.00", max_value: "999.00" },
];

// Resolve a tone keyword from the category name coming from master data
// ("Underweight" → info, "Normal" → success, "Overweight" → warning,
// "Obese"/"Severely Obese" → destructive).
function resolveTone(name) {
  const normalized = String(name ?? "").toLowerCase();
  // "sever" must be checked first so "Severely Obese" doesn't match
  // earlier keywords.
  if (normalized.includes("sever")) return "destructive";
  if (normalized.includes("under")) return "info";
  if (normalized.includes("normal")) return "success";
  if (normalized.includes("over")) return "warning";
  if (normalized.includes("obese")) return "destructive";
  return "muted";
}

// Tailwind needs literal class strings to generate CSS — can't build
// "bg-{tone}/15" dynamically, so every tone gets an explicit entry here.
const BADGE_CLASS = {
  info: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  destructive: "bg-destructive/15 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

const STROKE_CLASS = {
  info: "stroke-info",
  success: "stroke-success",
  warning: "stroke-warning",
  destructive: "stroke-destructive",
  muted: "stroke-muted",
};

const ICON_CLASS = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning-foreground",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};

const TONE_ICON = {
  info: UnderweightIcon,
  success: ManIcon,
  warning: OverweightIcon ,
  destructive: Overweight24pxIcon,
  muted: ManIcon,
};

// Build gauge zones from master-data categories, clamped to the visible
// BMI range and skipping any band that lies fully outside it.
function buildZones(categories) {
  return categories
    .map((item) => ({
      key: String(item.id ?? item.name),
      from: Number(item.min_value),
      to: Number(item.max_value),
      strokeClass: STROKE_CLASS[resolveTone(item.name)],
    }))
    .map((zone) => ({
      ...zone,
      from: Math.max(zone.from, BMI_MIN),
      to: Math.min(zone.to, BMI_MAX),
    }))
    .filter((zone) => zone.to > zone.from);
}

// Find the category whose [min_value, max_value] band contains the BMI.
function findCategory(categories, bmi) {
  return (
    categories.find(
      (item) =>
        Number(bmi) >= Number(item.min_value) &&
        Number(bmi) <= Number(item.max_value),
    ) ?? null
  );
}

const GAP_DEG = 1.5;
const CX = 110;
const CY = 108;
const R = 88;
const STROKE = 16;

function bmiToAngle(bmi) {
  const clamped = Math.min(Math.max(bmi, BMI_MIN), BMI_MAX);
  return ((clamped - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 180;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

function BmiGaugeComponent({ bmi, categories }) {
  const list =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : FALLBACK_CATEGORIES;

  const zones = useMemo(() => buildZones(list), [list]);

  const normalizedBmi = Number(bmi);
  const hasValue = Number.isFinite(normalizedBmi);

  const activeCategory = hasValue ? findCategory(list, normalizedBmi) : null;
  const label = activeCategory?.name ?? "—";
  const tone = activeCategory ? resolveTone(activeCategory.name) : "muted";
  const CategoryIcon = TONE_ICON[tone];

  const needleAngle = hasValue ? bmiToAngle(normalizedBmi) : 0;
  const needleTip = polarToCartesian(CX, CY, R - STROKE / 2 - 4, needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="130" viewBox="0 0 220 130">
        {/* track */}
        <path
          d={describeArc(CX, CY, R, 0, 180)}
          fill="none"
          className="stroke-muted"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* colored zones */}
        {zones.map((zone) => {
          const startAngle =
            bmiToAngle(zone.from) + (zone.from <= BMI_MIN ? 0 : GAP_DEG);
          const endAngle =
            bmiToAngle(zone.to) - (zone.to >= BMI_MAX ? 0 : GAP_DEG);
          return (
            <path
              key={zone.key}
              d={describeArc(CX, CY, R, startAngle, endAngle)}
              fill="none"
              className={zone.strokeClass}
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
          );
        })}

        {/* needle */}
        {hasValue && (
          <>
            <line
              x1={CX}
              y1={CY}
              x2={needleTip.x}
              y2={needleTip.y}
              className="stroke-foreground"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={CX} cy={CY} r={6} className="fill-foreground" />
          </>
        )}
      </svg>

      <div className="-mt-4 flex flex-col items-center">
        <p className="text-3xl font-semibold text-foreground">
          {hasValue ? normalizedBmi.toFixed(1) : "—"}
        </p>
        <p className="text-xs text-muted-foreground">BMI</p>
        <span
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${BADGE_CLASS[tone]}`}
        >
          {label}
        </span>
        <CategoryIcon className={`h-10 w-10 ${ICON_CLASS[tone]}`} />
      </div>
    </div>
  );
}

// Memoized: only re-renders when the bmi value changes, not on every
// keystroke elsewhere in the screening form.
export const BmiGauge = memo(BmiGaugeComponent);
