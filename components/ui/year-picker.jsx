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
    ...props
  },
  ref,
) {
  const selectedDate = value ? new Date(value, 0, 1) : null;

  // When allowFutureYears is false, prevent selecting years beyond the current year
  const maxDate = !allowFutureYears
    ? new Date(new Date().getFullYear(), 11, 31)
    : undefined;

  return (
    <div className={cn("relative text-indent-[40px]", className)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn(
            "block text-sm font-medium text-foreground mb-1",
            labelClassName,
          )}
        >
          {label}
        </label>
      ) : null}
      <CalendarDays className="absolute left-3 top-2/3 size-4 -translate-y-1/2 text-muted-foreground z-10" />
      <DatePicker
        ref={ref}
        id={id}
        name={name}
        selected={selectedDate}
        onChange={(date) =>
          onValueChange?.(date ? date.getFullYear().toString() : "")
        }
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
          "block h-10 w-full rounded-md [text-indent:1.5rem] border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          inputClassName,
        )}
        wrapperClassName="w-full block"
        renderCustomHeader={({
          value,
          changeYear,https://svastha-api.sms24hrs.org/api/v1/refresh
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
  );
});

export { YearPicker };
