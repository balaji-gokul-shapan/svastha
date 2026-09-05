"use client";

import { AlertTriangle } from "lucide-react";

import {
  TOOTH_STATUS_COLOR,
  UPPER_TEETH,
  LOWER_TEETH,
  UPPER_TEETH_POSITION,
  PRIMARY_TEETH_LOWER,
  PRIMARY_TEETH_UPPER,
  UPPER_TEETH_POSITION_PRIMARY,
} from "../datas/dental-screening-data";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import ManOutline24pxIcon from "@iconify-react/healthicons/man-outline-24px";
import Boy0105y24pxIcon from "@iconify-react/healthicons/boy-0105y-24px";
// Tooth silhouette — FontAwesome "tooth" path (two-rooted molar shape).
// Reused at both small (chart) and large (detail panel) sizes.
function ToothShape({ status, className, size = 28 }) {
  const isMissing = status === "missing";

  // The artwork below is drawn in a 448x512 box at offset (96, 64); the old
  // viewBox="0 0 24 24" clipped it down to nothing (invisible teeth).
  return (
    <svg
      width={size}
      height={size}
      viewBox="88 56 464 528"
      fill="none"
      className={className}
      aria-hidden="true"
      opacity={isMissing ? 0.55 : 1}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        fill="currentColor"
        d="M241 69.7L320 96l79-26.3c11.3-3.8 23-5.7 34.9-5.7C494.7 64 544 113.3 544 174.1v68.5c0 29.4-9.5 58.1-27.2 81.6l-1.1 1.5c-12.9 17.2-21.3 37.4-24.3 58.7l-21.7 151.5c-3.3 23-23 40.1-46.2 40.1c-22.8 0-42.3-16.5-46-39l-20.2-121.4c-3-18.2-18.8-31.6-37.3-31.6s-34.2 13.4-37.3 31.6L262.5 537c-3.8 22.5-23.2 39-46 39c-23.2 0-42.9-17.1-46.2-40.1l-21.7-151.4c-3-21.3-11.4-41.5-24.3-58.7l-1.1-1.5C105.5 300.7 96 272.1 96 242.7v-68.5C96 113.3 145.3 64 206.1 64c11.9 0 23.6 1.9 34.9 5.7"
      />
    </svg>
  );
}

function ToothButton({ tooth, toothNumber, isSelected, onSelect }) {
  const safeTooth = tooth || {
    number: toothNumber,
    status: "healthy",
  };
  const colorClass = TOOTH_STATUS_COLOR[safeTooth.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(safeTooth.number)}
      aria-pressed={isSelected}
      aria-label={`Tooth ${safeTooth.number}, ${safeTooth.status}`}
      className={cn(
        "flex size-4 md:size-7 lg:size-6 xl:size-6 2xl:size-9 shrink-0 items-center justify-center rounded-md transition-colors",
        isSelected ? "bg-accent/15 ring-2 ring-accent" : "hover:bg-muted",
      )}
    >
      {safeTooth.status === "other" ? (
        <AlertTriangle
          className={cn("size-4", colorClass)}
          strokeWidth={2.25}
        />
      ) : (
        <ToothShape status={safeTooth.status} className={colorClass} />
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
  // Vertical-flip each tooth glyph (crown toward the occlusal divider) — used
  // by the upper arch. Flip per tooth instead of rotating the whole row: a row
  // rotate-180 would also mirror left/right order (breaking NumberRow
  // alignment) and invert the arc direction.
  flip = false,
  className,
}) {
  const midpoint = (teeth.length - 1) / 2;

  return (
    <div
      className={cn(
        "mx-auto my-2 md:my-1 flex items-center justify-center gap-1.5 px-1",
        className,
      )}
    >
      {teeth.map((number, index) => {
        const distance = Math.abs(index - midpoint);
        const normalized = midpoint === 0 ? 0 : distance / midpoint;
        const curveAmount = Math.round((1 - normalized * normalized) * 20);
        const translateY = arc === "up" ? -curveAmount : curveAmount;

        return (
          <div
            key={number}
            style={{
              transform: `translateY(${translateY}px)${flip ? " scaleY(-1)" : ""}`,
            }}
          >
            <ToothButton
              tooth={chartByNumber[number]}
              toothNumber={number}
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
    <div className="flex items-center justify-center gap-1.5 sm:gap-1.5 md:gap-2 lg:gap-2 p-2 my-4">
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
  activeToothTab,
  onToothTabChange,
  onPrimaryToothSelect,
  onAdultToothSelect,
}) {
  const chartByNumber = Object.fromEntries(chart.map((t) => [t.number, t]));
  const findings = {
    caries: Number(quickFindings?.caries ?? 0),
    other: Number(quickFindings?.other ?? 0),
    healthy: Number(quickFindings?.healthy ?? 0),
    missing: Number(quickFindings?.missing ?? 0),
  };

  // Use parent-managed selection states
  const selectedPrimaryTooth =
    activeToothTab === "primary" ? selectedTooth : null;
  const selectedAdultTooth = activeToothTab === "adult" ? selectedTooth : null;

  const handlePrimarySelect = (number) => {
    onPrimaryToothSelect(number);
  };

  const handleAdultSelect = (number) => {
    onAdultToothSelect(number);
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
      <Tabs
        value={activeToothTab}
        onValueChange={onToothTabChange}
        className="tooth-tabs w-full"
      >
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.value} className="flex items-center gap-1.5">
                <span className={cn("size-2.5 rounded-full", item.dotClass)} />
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <TabsList className="shrink-0 w-full sm:w-auto">
            <TabsTrigger value="primary" className="flex items-center gap-1.5 px-2 py-1.5 text-xs sm:px-3 sm:text-sm">
              <Boy0105y24pxIcon className="size-8 shrink-0" />
              <span className="hidden sm:inline">Primary</span>
            </TabsTrigger>

            <TabsTrigger value="adult" className="flex items-center gap-1.5 px-2 py-1.5 text-xs sm:px-3 sm:text-sm">
              <ManOutline24pxIcon className="size-8 shrink-0" />
              <span className="hidden sm:inline">Adult</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="primary">
          {/* Upper arch — numbers above, teeth below, scrolls horizontally on narrow screens */}
          <div className="overflow-x-auto pb-2">
            <p className="py-2 text-center text-xs font-medium text-muted-foreground">
              Upper (Maxillary)
            </p>

            <NumberRow teeth={PRIMARY_TEETH_UPPER} />
            <ToothRow
              teeth={PRIMARY_TEETH_UPPER}
              chartByNumber={chartByNumber}
              selectedTooth={selectedPrimaryTooth}
              onSelect={handlePrimarySelect}
              arc="up"
              flip
            />
            <NumberRow teeth={UPPER_TEETH_POSITION_PRIMARY} />
          </div>

          {/* Occlusal divider — centered, narrower than the card */}
          <div className="mx-auto w-2/4 my-3 border-t border-dashed border-border" />
          <div className="relative">
            <div className="absolute left-1/2 top-1/2 my-3 w-72 border-t border-dashed border-border -translate-x-1/2 -translate-y-[-50%] rotate-90" />
          </div>
          {/* Lower arch — teeth above, numbers below */}
          <div className="overflow-x-auto pt-2">
            <NumberRow teeth={UPPER_TEETH_POSITION_PRIMARY} />

            <ToothRow
              teeth={PRIMARY_TEETH_LOWER}
              chartByNumber={chartByNumber}
              selectedTooth={selectedPrimaryTooth}
              onSelect={handlePrimarySelect}
              arc="down"
            />
            <NumberRow teeth={PRIMARY_TEETH_LOWER} />
          </div>
          <p className="pb-2 text-center text-xs font-medium text-muted-foreground">
            Lower (Mandibular)
          </p>
        </TabsContent>
        <TabsContent value="adult">
          {/* Upper arch — numbers above, teeth below, scrolls horizontally on narrow screens */}
          <div className="overflow-x-auto pb-2">
            <p className="py-2 text-center text-xs font-medium text-muted-foreground">
              Upper (Maxillary)
            </p>

            <NumberRow teeth={UPPER_TEETH} />
            <ToothRow
              teeth={UPPER_TEETH}
              chartByNumber={chartByNumber}
              selectedTooth={selectedAdultTooth}
              onSelect={handleAdultSelect}
              arc="up"
              flip
            />
            <NumberRow teeth={UPPER_TEETH_POSITION} />
          </div>

          {/* Occlusal divider — centered, narrower than the card */}
          <div className="mx-auto w-2/3 my-3 border-t border-dashed border-border" />
          <div className="relative">
            <div className="absolute left-1/2 top-1/2 my-3 w-72 border-t border-dashed border-border -translate-x-1/2 -translate-y-[-50%] rotate-90" />
          </div>
          {/* Lower arch — teeth above, numbers below */}
          <div className="overflow-x-auto pt-2">
            <NumberRow teeth={UPPER_TEETH_POSITION} />

            <ToothRow
              teeth={LOWER_TEETH}
              chartByNumber={chartByNumber}
              selectedTooth={selectedAdultTooth}
              onSelect={handleAdultSelect}
              arc="down"
            />
            <NumberRow teeth={LOWER_TEETH} />
          </div>
          <p className="pb-2 text-center text-xs font-medium text-muted-foreground">
            Lower (Mandibular)
          </p>
        </TabsContent>
      </Tabs>
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
