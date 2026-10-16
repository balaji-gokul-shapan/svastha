"use client";

import * as React from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseIsoDay(value) {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatShort(date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DateRangePicker({
  id,
  label: fieldLabel,
  value,
  onValueChange,
  placeholder = "Select date range",
  maxDate,
  className,
  disabled = false,
}) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef(null);

  const skipFocusOpenRef = React.useRef(false);

  const mouseDownRef = React.useRef(false);

  const from = parseIsoDay(value?.from);
  const to = parseIsoDay(value?.to);
  const hasValue = Boolean(from || to);
  const label =
    from && to
      ? `${formatShort(from)} – ${formatShort(to)}`
      : from
        ? `${formatShort(from)} – …`
        : to
          ? `… – ${formatShort(to)}`
          : "";

  const handleSelect = (next) => {
    const nextFrom = next?.from ?? null;
    const nextTo = next?.to ?? null;

    if (!nextFrom && !nextTo) {
      onValueChange?.(null);
      return;
    }

    onValueChange?.({
      from: nextFrom ? toIsoDate(nextFrom) : "",
      to: nextTo ? toIsoDate(nextTo) : "",
    });

    if (nextFrom && nextTo) {
      // Focus returns to the trigger input when the popup closes; that
      // refocus must not reopen it.
      skipFocusOpenRef.current = true;
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onValueChange?.(null);
    setOpen(false);
  };

  const handleFocus = () => {
    if (disabled || mouseDownRef.current) return;
    if (skipFocusOpenRef.current) {
      skipFocusOpenRef.current = false;
      return;
    }
    setOpen(true);
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    skipFocusOpenRef.current = false;
    setOpen((prev) => !prev);
  };

  return (
    <Popover open={disabled ? false : open} onOpenChange={setOpen}>
      {/* The trigger is a field wrapper (label + input + clear button), not a
          native <button> — nested interactive elements would be invalid HTML,
          so tell Base UI to skip the native-button requirement. Keyboard users
          reach the calendar by focusing the input (handleFocus). */}
      <PopoverTrigger asChild nativeButton={false}>
        <div
          className={cn("min-w-0", className)}
          onMouseDown={() => {
            mouseDownRef.current = true;
            window.setTimeout(() => {
              mouseDownRef.current = false;
            }, 0);
          }}
          onClick={handleTriggerClick}
        >
          {fieldLabel ? (
            <label
              htmlFor={id}
              className="mb-1.5 block text-xs text-muted-foreground"
            >
              {fieldLabel}
            </label>
          ) : null}
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              id={id}
              type="text"
              readOnly
              disabled={disabled}
              value={label}
              placeholder={placeholder}
              aria-label={fieldLabel ?? "Filter by date range"}
              onFocus={handleFocus}
              className="h-10 w-full cursor-pointer rounded-md border border-input bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {hasValue ? (
              <button
                type="button"
                aria-label="Clear date range"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClear}
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : (
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={handleSelect}
          defaultMonth={from ?? to ?? undefined}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  );
}
