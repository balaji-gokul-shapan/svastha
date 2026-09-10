"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

export function NumberStepperField({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  disabled = false,
  error,
}) {
  const numericValue = Number(value) || 0;
  const hasError = Boolean(error);
  const clamp = (next) => {
    let result = next;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  };

  // Emits the same `{ target: { name, value } }` shape a native input event
  // has, so shared handlers like `handleChange` (which read
  // `e.target.name` / `e.target.value`) work for BOTH typing and the
  // stepper buttons. Previously `onChange(number)` was passed, which broke
  // event-style parents on every click.
  const emitChange = (next) =>
    onChange?.({ target: { name, value: String(next) } });

  const handleStep = (direction) =>
    emitChange(clamp(numericValue + direction * step));

  const atMax = max !== undefined && numericValue >= max;
  const atMin = min !== undefined && numericValue <= min;

  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}

      <div className="relative flex h-10 w-full items-center rounded-md border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
        <input
          type="number"
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(event) => {
            const raw = event.target.value;
            // Keep an empty field empty instead of forcing "0".
            emitChange(raw === "" ? "" : clamp(Number(raw)));
          }}
          className={`h-full w-full rounded-md bg-transparent px-3 text-sm text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
            unit ? "pr-16" : "pr-9"
          } [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        />
        {unit ? (
          <span className="pointer-events-none absolute right-9 text-xs text-muted-foreground">
            {unit}
          </span>
        ) : null}

        {/* Custom stepper — two real, independently stylable buttons,
            replacing the native (Chrome/Safari-only, single-widget)
            spin button entirely. */}
        <div className="absolute right-1 flex h-8 w-6 flex-col overflow-hidden rounded border border-border/70">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increase value"
            disabled={disabled || atMax}
            onClick={() => handleStep(1)}
            className="flex flex-1 items-center justify-center border-b border-border/70 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronUp className="size-3" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrease value"
            disabled={disabled || atMin}
            onClick={() => handleStep(-1)}
            className="flex flex-1 items-center justify-center bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronDown className="size-3" />
          </button>
        </div>
      </div>

      {/* Error message below the field box — matches the TextField layout. */}
      {hasError ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
