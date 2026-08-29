"use client";

import { Eye, Glasses, Activity } from "lucide-react";
import { classifyAcuity } from "./vision-screening-data";

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
     <svg xmlns="http://www.w3.org/2000/svg" width="2.09em" height="2em" viewBox="0 0 25 24">
	<path d="M0 0h25v24H0z" fill="none" />
	<g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
		<path d="M12.023 7.625a4.375 4.375 0 1 0 0 8.75a4.375 4.375 0 0 0 0-8.75M9.148 12a2.875 2.875 0 1 1 5.75 0a2.875 2.875 0 0 1-5.75 0" />
		<path d="M12.023 4.5c-4.312 0-8.025 2.556-9.722 6.235a3.02 3.02 0 0 0 0 2.53c1.697 3.679 5.41 6.235 9.722 6.235s8.026-2.556 9.723-6.235c.37-.802.37-1.728 0-2.53c-1.697-3.679-5.41-6.235-9.723-6.235m-8.36 6.863C5.125 8.194 8.32 6 12.023 6c3.704 0 6.899 2.194 8.36 5.363c.187.404.187.87 0 1.274C18.923 15.806 15.728 18 12.024 18s-6.898-2.194-8.36-5.363a1.52 1.52 0 0 1 0-1.274" />
	</g>
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
  withValue,
  withoutValue,
}) {
  // Best-corrected reading drives the status/scale; falls back to uncorrected
  // when no "with" reading was recorded.
  const primaryValue = withValue || withoutValue;
  const corrected = Boolean(withValue);
  const status = classifyAcuity(primaryValue);
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

            {/* Distance without correction */}
            <div className="mt-2 flex items-baseline justify-end gap-2">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Without
              </span>
              <span className="text-lg font-semibold text-foreground">
                {withoutValue || "6/6"}
              </span>
            </div>

            {/* Distance with correction */}
            <div className="mt-1 flex items-baseline justify-end gap-2">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                With
              </span>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {withValue || "6/6"}
              </span>
            </div>

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
          acuityValue={primaryValue}
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

// Both distance readings are shown per eye: "Without" (uncorrected) and
// "With" (best corrected). The status/scale use the best-corrected value
// when available, falling back to the uncorrected reading.
export function VisionSnapshot({
  odDistanceWith,
  odDistanceWithout,
  osDistanceWith,
  osDistanceWithout,
}) {

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
          withValue={odDistanceWith}
          withoutValue={odDistanceWithout}
        />

        <EyeBadge
          label="Left Eye"
          shortLabel="OS"
          withValue={osDistanceWith}
          withoutValue={osDistanceWithout}
        />

      </div>
    </div>
  );
}