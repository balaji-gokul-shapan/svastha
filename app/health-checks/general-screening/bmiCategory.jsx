"use client";

import { bmiCategory } from "./general-screening-data";

// Gauge maps BMI 10 → 40 across a 180° semicircle (0° = left/low, 180° = right/high).
const BMI_MIN = 10;
const BMI_MAX = 40;

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

// BMI value breakpoints converted to gauge angles, with a small visual gap
// between zones.
const ZONES = [
  { from: BMI_MIN, to: 18.5, strokeClass: "stroke-info" },
  { from: 18.5, to: 25, strokeClass: "stroke-success" },
  { from: 25, to: 30, strokeClass: "stroke-warning" },
  { from: 30, to: BMI_MAX, strokeClass: "stroke-destructive" },
];

// Tailwind needs literal class strings to generate CSS — can't build
// "bg-{tone}/15" dynamically, so every tone gets an explicit entry here.
const BADGE_CLASS = {
  info: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  destructive: "bg-destructive/15 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

const GAP_DEG = 1.5;
const CX = 110;
const CY = 108;
const R = 88;
const STROKE = 16;

export function BmiGauge({ bmi }) {
  const normalizedBmi = Number(bmi);
  const hasValue = Number.isFinite(normalizedBmi);
  const category = bmiCategory(hasValue ? normalizedBmi : null);
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
        {ZONES.map((zone) => {
          const startAngle = bmiToAngle(zone.from) + (zone.from === BMI_MIN ? 0 : GAP_DEG);
          const endAngle = bmiToAngle(zone.to) - (zone.to === BMI_MAX ? 0 : GAP_DEG);
          return (
            <path
              key={zone.strokeClass}
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
        <p className="text-3xl font-semibold text-foreground">{hasValue ? normalizedBmi.toFixed(1) : "—"}</p>
        <p className="text-xs text-muted-foreground">BMI</p>
        <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${BADGE_CLASS[category.tone]}`}>
          {category.label}
        </span>
      </div>
    </div>
  );
}