"use client";

import * as React from "react";
import DatePicker from "react-datepicker";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "../../lib/utils";

const YearPicker = React.forwardRef(function YearPicker(
  {
    className,
    id,
    name,
    value,
    onValueChange,
    placeholder = "Select year",
    label,
    labelClassName,
    minYear = 1900,
    inputClassName,
    allowFutureYears = true,
    withPortal = false,
    required,
    error,
    portalId = "sd-yearpicker-portal",
    ...props
  },
  ref,
) {
  const selectedDate = value ? new Date(value, 0, 1) : null;

  const hasError = Boolean(error);

  // When allowFutureYears is false, prevent selecting years beyond the current year
  const maxDate = !allowFutureYears
    ? new Date(new Date().getFullYear(), 11, 31)
    : undefined;

  return (
    <div className={cn("relative", className)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn("field-label", labelClassName)}
        >
          {label}
          {required ? <span className="field-required">*</span> : null}
        </label>
      ) : null}

      {/* The icon must be positioned against the INPUT, not this wrapper —
          the wrapper also contains the label, so `top-2/3` resolved below the
          field and the icon rendered underneath it. */}
      <div className="relative">
        <CalendarDays
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <DatePicker
          ref={ref}
          id={id}
          name={name}
          selected={selectedDate}
          onChange={(date) =>
            onValueChange?.(date ? date.getFullYear().toString() : "")
          }
          required={required}
          onKeyDown={(event) => {
            event.preventDefault();
          }}
          showYearPicker
          calendarStartYear={1900}
          calendarEndYear={new Date().getFullYear()}
          maxDate={maxDate}
          dateFormat="yyyy"
          placeholderText={placeholder}
          className={cn(
            "block h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            hasError && "border-destructive",
            inputClassName,
          )}
          wrapperClassName="w-full block"
          aria-invalid={hasError || undefined}
          withPortal={withPortal}
          portalId={portalId}
          renderCustomHeader={({
            value,
            changeYear,
            decreaseYear,
            increaseYear,
          }) => (
            <div className="flex items-center justify-between px-2 py-2 border-b border-border">
              <button
                type="button"
                onClick={decreaseYear}
                className="px-2 py-1 text-lg font-medium text-muted-foreground hover:text-foreground focus:outline-none  pointer-events-auto z-1 relative"
              >
                <ChevronLeft />
              </button>
              <select
                value={value ? value.getFullYear() : new Date().getFullYear()}
                onChange={({ target: { value: year } }) => changeYear(+year)}
                className="appearance-none border-none bg-transparent text-center text-sm font-medium text-foreground focus:outline-none  pointer-events-auto z-1 relative"
              >
                {Array.from(
                  {
                    length:
                      (!allowFutureYears
                        ? new Date().getFullYear()
                        : new Date().getFullYear()) -
                      minYear +
                      1,
                  },
                  (_, i) => minYear + i,
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={increaseYear}
                className="px-2 py-1 text-lg font-medium text-muted-foreground hover:text-foreground focus:outline-none pointer-events-auto z-1 relative"
              >
                <ChevronRight />
              </button>
            </div>
          )}
          {...props}
        />
      </div>

      {hasError ? <p className="field-error">{error}</p> : null}
    </div>
  );
});

export { YearPicker };
