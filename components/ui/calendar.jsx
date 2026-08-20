"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "../../lib/util"; "@/lib/utils";

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function setMonth(date, monthIndex) {
  return new Date(date.getFullYear(), monthIndex, 1);
}

function setYear(date, year) {
  return new Date(year, date.getMonth(), 1);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function Calendar({ mode, selected, onSelect, defaultMonth, maxDate }) {
  const [currentMonth, setCurrentMonth] = React.useState(
    startOfMonth(defaultMonth ?? selected ?? new Date())
  );

  const maxDateOnly = maxDate ? toDateOnly(maxDate) : null;
  const minDateOnly = null;
  const maxYear = maxDateOnly ? maxDateOnly.getFullYear() : new Date().getFullYear();
  const minYear = maxYear - 120;

  const monthStart = startOfMonth(currentMonth);
  const firstWeekday = monthStart.getDay();
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - firstWeekday);

  const days = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });

  const canGoNext = !maxDateOnly || addMonths(currentMonth, 1) <= startOfMonth(maxDateOnly);

  const weekDayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index);

  return (
    <div className="w-70 p-3">
      <div className="mb-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Select
            value={String(currentMonth.getMonth())}
            onValueChange={(value) => {
              const nextMonth = Number(value);
              let nextValue = setMonth(currentMonth, nextMonth);

              if (maxDateOnly && nextValue > startOfMonth(maxDateOnly)) {
                nextValue = startOfMonth(maxDateOnly);
              }

              setCurrentMonth(nextValue);
            }}
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {monthLabels.map((label, index) => (
                <SelectItem key={label} value={String(index)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(currentMonth.getFullYear())}
            onValueChange={(value) => {
              const nextYear = Number(value);
              let nextValue = setYear(currentMonth, nextYear);

              if (maxDateOnly && nextValue > startOfMonth(maxDateOnly)) {
                nextValue = startOfMonth(maxDateOnly);
              }

              setCurrentMonth(nextValue);
            }}
          >
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!canGoNext}
          onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDayLabels.map((label) => (
          <div key={label} className="py-1 text-center text-xs text-muted-foreground">
            {label}
          </div>
        ))}

        {days.map((day) => {
          const outside = day.getMonth() !== currentMonth.getMonth();
          const selectedDay = selected ? isSameDay(day, selected) : false;
          const dayOnly = toDateOnly(day);
          const disabled =
            (maxDateOnly && dayOnly > maxDateOnly) ||
            (minDateOnly && dayOnly < minDateOnly);

          return (
            <button
              key={toIsoDate(day)}
              type="button"
              disabled={Boolean(disabled)}
              onClick={() => onSelect?.(new Date(dayOnly))}
              className={cn(
                "h-9 rounded-md text-sm transition-colors",
                selectedDay
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground",
                outside && !selectedDay && "text-muted-foreground",
                disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <input type="hidden" value={mode ?? "single"} readOnly />
    </div>
  );
}
