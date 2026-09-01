"use client";

import { AlertTriangle } from "lucide-react";

import {
  TOOTH_STATUS_COLOR,
  UPPER_TEETH,
  LOWER_TEETH,
  UPPER_TEETH_POSITION,
} from "./dental-screening-data";
import { cn } from "@/lib/utils";

// A single simplified tooth silhouette: a domed crown tapering to one root.
// Reused at both small (chart) and large (detail panel) sizes.
function ToothShape({ status, className, size = 28 }) {
  const isMissing = status === "missing";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      opacity={isMissing ? 0.55 : 1}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        fill="currentColor"
        d="M7 2C4 2 2 5 2 8c0 2.11 1 5 2 6s2 8 4 8c4.54 0 2-7 4-7s-.54 7 4 7c2 0 3-7 4-8s2-3.89 2-6c0-3-2-6-5-6s-3 1-5 1s-2-1-5-1m0 2c2 0 3 1 5 1s3-1 5-1c1.67 0 3 2 3 4c0 1.75-.86 4.11-1.81 5.06c-.86.86-2.13 6.88-2.69 6.88c-.21 0-.5-1.06-.5-2.35c0-2.04-.57-4.59-3-4.59s-3 2.55-3 4.59c0 1.29-.29 2.35-.5 2.35c-.56 0-1.83-6.02-2.69-6.88C4.86 12.11 4 9.75 4 8c0-2 1.33-4 3-4"
      />
    </svg>
  );
}

function ToothButton({ tooth, isSelected, onSelect }) {
  const colorClass = TOOTH_STATUS_COLOR[tooth.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(tooth.number)}
      aria-pressed={isSelected}
      aria-label={`Tooth ${tooth.number}, ${tooth.status}`}
      className={cn(
        "flex size-4 md:size-7 lg:size-6 xl:size-6 2xl:size-9 shrink-0 items-center justify-center rounded-md transition-colors",
        isSelected ? "bg-accent/15 ring-2 ring-accent" : "hover:bg-muted",
      )}
    >
      {tooth.status === "other" ? (
        <AlertTriangle
          className={cn("size-4", colorClass)}
          strokeWidth={2.25}
        />
      ) : (
        <ToothShape status={tooth.status} className={colorClass} />
      )}
    </button>
  );
}

function ToothRow({
  teeth,
  chartByNumber,
  selectedTooth,
  onSelect,
  arc = "up",
}) {
  const midpoint = (teeth.length - 1) / 2;

  return (
    <div className="mx-auto my-2 md:my-1 flex items-center justify-center gap-1.5 px-1">
      {teeth.map((number, index) => {
        const distance = Math.abs(index - midpoint);
        const normalized = midpoint === 0 ? 0 : distance / midpoint;
        const curveAmount = Math.round((1 - normalized * normalized) * 20);
        const translateY = arc === "up" ? -curveAmount : curveAmount;

        return (
          <div
            key={number}
            style={{
              transform: `translateY(${translateY}px)`,
            }}
          >
            <ToothButton
              tooth={chartByNumber[number]}
              isSelected={selectedTooth === number}
              onSelect={onSelect}
            />
          </div>
        );
      })}
    </div>
  );
}

function NumberRow({ teeth }) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-1.5 md:gap-2 lg:gap-2 px-1 my-4">
      {/* Values can repeat (e.g. position rows render 8..1,1..8), so suffix the
          index to keep keys unique; lists here are static, so keys stay stable. */}
      {teeth.map((number, index) => (
        <span
          key={`${number}-${index}`}
          className="flex shrink-0 items-center justify-center text-[10px] font-medium text-muted-foreground size-4 md:size-7 lg:size-6 xl:size-6 2xl:size-9  sm:text-[11px]"
        >
          {number}
        </span>
      ))}
    </div>
  );
}

export function ToothChartSvg({
  chart,
  selectedTooth,
  onSelectTooth,
  quickFindings,
}) {
  const chartByNumber = Object.fromEntries(chart.map((t) => [t.number, t]));
  const findings = {
    caries: Number(quickFindings?.caries ?? 0),
    other: Number(quickFindings?.other ?? 0),
    healthy: Number(quickFindings?.healthy ?? 0),
    missing: Number(quickFindings?.missing ?? 0),
  };

  return (
    <div className="space-y-1">
      {/* <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <FindingPill label="Caries" value={findings.caries} tone="destructive" />
        <FindingPill label="Other" value={findings.other} tone="warning" />
        <FindingPill label="Healthy" value={findings.healthy} tone="success" />
        <FindingPill label="Missing" value={findings.missing} tone="info" />
      </div> */}

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-full", item.dotClass)} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Upper arch — numbers above, teeth below, scrolls horizontally on narrow screens */}
      <div className="overflow-x-auto pb-2">
        <p className="py-2 text-center text-xs font-medium text-muted-foreground">
          Upper (Maxillary)
        </p>

        <NumberRow teeth={UPPER_TEETH} />
        <ToothRow
          teeth={UPPER_TEETH}
          chartByNumber={chartByNumber}
          selectedTooth={selectedTooth}
          onSelect={onSelectTooth}
          arc="up"
        />
        <NumberRow teeth={UPPER_TEETH_POSITION} />
      </div>

      <div className="my-3 border-t border-dashed border-border" />
      <div className="relative">
        <div className="absolute left-1/2 top-1/2 my-3 w-72 border-t border-dashed border-border -translate-x-1/2 -translate-y-[-50%] rotate-90" />
      </div>
      {/* Lower arch — teeth above, numbers below */}
      <div className="overflow-x-auto pt-2">
        <NumberRow teeth={UPPER_TEETH_POSITION} />

        <ToothRow
          teeth={LOWER_TEETH}
          chartByNumber={chartByNumber}
          selectedTooth={selectedTooth}
          onSelect={onSelectTooth}
          arc="down"
        />
        <NumberRow teeth={LOWER_TEETH} />
      </div>
      <p className="pb-2 text-center text-xs font-medium text-muted-foreground">
        Lower (Mandibular)
      </p>
    </div>
  );
}

function FindingPill({ label, value, tone }) {
  const toneClass =
    tone === "destructive"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : tone === "warning"
        ? "border-warning/30 bg-warning/10 text-warning"
        : tone === "success"
          ? "border-success/30 bg-success/10 text-success"
          : "border-info/30 bg-info/10 text-info";

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border px-2.5 py-1.5",
        toneClass,
      )}
    >
      <span className="text-[11px] font-medium">{label}</span>
      <span className="text-xs font-semibold">
        {Number.isFinite(value) ? value : 0}
      </span>
    </div>
  );
}

export function ToothDetailGraphic({ status }) {
  const colorClass = TOOTH_STATUS_COLOR[status];

  return (
    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted/60">
      {status === "other" ? (
        <AlertTriangle
          className={cn("size-8", colorClass)}
          strokeWidth={1.75}
        />
      ) : (
        <ToothShape status={status} className={colorClass} size={44} />
      )}
    </div>
  );
}

const LEGEND_ITEMS = [
  { value: "healthy", label: "Healthy", dotClass: "bg-success" },
  { value: "caries", label: "Caries", dotClass: "bg-destructive" },
  { value: "filled", label: "Filled", dotClass: "bg-info" },
  { value: "missing", label: "Missing", dotClass: "bg-muted-foreground/50" },
  { value: "sealant", label: "Sealant", dotClass: "bg-purple-500" },
  { value: "other", label: "Other", dotClass: "bg-warning" },
];
