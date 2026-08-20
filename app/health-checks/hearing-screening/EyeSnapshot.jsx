"use client";

import { Eye, Glasses, Activity } from "lucide-react";
import { classifyAcuity } from "./hearing-screening-data";

const TONE_CLASS = {
  success: {
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    dot: "bg-success",
  },
  info: {
    text: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
    dot: "bg-info",
  },
  warning: {
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    dot: "bg-warning",
  },
  destructive: {
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    dot: "bg-destructive",
  },
  muted: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    dot: "bg-muted-foreground",
  },
};

function EyeIllustration({ tone = "info" }) {
  const colors = TONE_CLASS[tone] || TONE_CLASS.info;

  return (
    <div
      className={`relative flex size-20 items-center justify-center rounded-2xl ${colors.bg}`}
    >
      {/* Outer glow */}
      <div
        className={`absolute inset-2 rounded-full border ${colors.border}`}
      />

      {/* Eye SVG */}
      <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 36 36">
	<path d="M0 0h36v36H0z" fill="none" />
	<path fill="#e1e8ed" d="M35.059 18c0 3.304-7.642 11-17.067 11S.925 22.249.925 18c0-3.314 34.134-3.314 34.134 0" />
	<path fill="#292f33" d="M35.059 18H.925c0-3.313 7.642-11 17.067-11s17.067 7.686 17.067 11" />
	<path fill="#f5f8fa" d="M33.817 18c0 2.904-7.087 9.667-15.826 9.667S2.166 21.732 2.166 18c0-2.912 7.085-9.666 15.825-9.666C26.73 8.333 33.817 15.088 33.817 18" />
	<circle cx="18" cy="18" r="8.458" fill="#8b5e3c" />
	<circle cx="18" cy="18" r="4.708" fill="#292f33" />
	<circle cx="14.983" cy="15" r="2" fill="#f5f8fa" />
</svg>


      {/* Status dot */}
      <span
        className={`absolute -right-1 -top-1 size-4 rounded-full border-4 border-card ${colors.dot}`}
      />
    </div>
  );
}

function VisionScale({ acuityValue, tone }) {
  if (!acuityValue) {
    return null;
  }

  /*
   * Approximate visual scale.
   * Adjust this according to your actual clinical classification.
   */
  const value = String(acuityValue);

  const parts = value.split("/");

  let percentage = 50;

  if (parts.length === 2) {
    const numerator = Number(parts[0]);
    const denominator = Number(parts[1]);

    if (numerator && denominator) {
      percentage = Math.min(
        Math.max((numerator / denominator) * 100,
        10),
        100
      );
    }
  }

  const colors = TONE_CLASS[tone] || TONE_CLASS.info;

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Reduced</span>
        <span>Normal</span>
      </div>

      <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${colors.dot}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EyeBadge({
  label,
  shortLabel,
  acuityValue,
  corrected,
}) {
  const status = classifyAcuity(acuityValue);
  const toneClass =
    TONE_CLASS[status.tone] || TONE_CLASS.muted;

  return (
    <div
      className={`group relative flex-1 overflow-hidden rounded-2xl border ${toneClass.border} bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
    >
      {/* Decorative background */}
      <div
        className={`absolute -right-12 -top-12 size-32 rounded-full ${toneClass.bg} opacity-60`}
      />

      <div className="relative p-5">

        {/* Header */}
        <div className="flex items-start justify-between">

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {shortLabel}
              </span>

              {corrected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  <Glasses className="size-3" />
                  Corrected
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-semibold text-foreground">
              {label}
            </p>
          </div>

          <div className="text-muted-foreground">
            <Activity className="size-4" />
          </div>
        </div>

        {/* Eye illustration */}
        <div className="mt-5 flex items-center justify-between">

          <EyeIllustration tone={status.tone} />

          <div className="text-right">

            <p className="text-[11px] font-medium text-muted-foreground">
              Visual Acuity
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {acuityValue || "—"}
            </p>

            <div className="mt-2 flex items-center justify-end gap-1.5">

              <span
                className={`size-1.5 rounded-full ${toneClass.dot}`}
              />

              <span
                className={`text-xs font-medium ${toneClass.text}`}
              >
                {status.label}
              </span>

            </div>

          </div>
        </div>

        {/* Scale */}
        <VisionScale
          acuityValue={acuityValue}
          tone={status.tone}
        />

        {/* Bottom information */}
        <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3">

          <span className="text-[11px] text-muted-foreground">
            Distance vision
          </span>

          <span className="text-[11px] font-medium text-foreground">
            {corrected ? "Best corrected" : "Uncorrected"}
          </span>

        </div>
      </div>
    </div>
  );
}

// Best-corrected acuity is preferred.
// Falls back to uncorrected when correction wasn't recorded.
export function VisionSnapshot({
  odDistanceWith,
  odDistanceWithout,
  osDistanceWith,
  osDistanceWithout,
}) {
  const rightValue =
    odDistanceWith || odDistanceWithout;

  const leftValue =
    osDistanceWith || osDistanceWithout;

  return (
    <div className="space-y-4">

      {/* Section header */}
      <div className="flex items-center justify-between">

        <div>
          <div className="flex items-center gap-2">

            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Eye className="size-4" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Vision Snapshot
              </h3>

              <p className="text-xs text-muted-foreground">
                Distance visual acuity
              </p>
            </div>

          </div>
        </div>

        <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
          OD / OS
        </span>

      </div>

      {/* Eye cards */}
      <div className="grid gap-3 sm:grid-cols-2">

        <EyeBadge
          label="Right Eye"
          shortLabel="OD"
          acuityValue={rightValue}
          corrected={Boolean(odDistanceWith)}
        />

        <EyeBadge
          label="Left Eye"
          shortLabel="OS"
          acuityValue={leftValue}
          corrected={Boolean(osDistanceWith)}
        />

      </div>
    </div>
  );
}