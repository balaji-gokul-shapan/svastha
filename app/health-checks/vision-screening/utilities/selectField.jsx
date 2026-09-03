"use client";

import ReusableSelect from "@/components/ui/reusable-select";
import { FieldLabel } from "@/components/ui/screening-fields";
import { useMemo } from "react";

export function SelectField({
  label,
  options,
  value,
  onChange,
  icon: Icon,
  error,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  disabled = false,
  className = "",
}) {
  const safeOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];

    return options.map((opt) => {
      if (typeof opt === "string") {
        return { label: opt, value: String(opt) };
      }

      return {
        label: String(opt?.label ?? opt?.value ?? ""),
        value: String(opt?.value ?? opt?.label ?? ""),
      };
    });
  }, [options]);

  const selectedValue = value ?? "";

  return (
    <div className={className}>
      {label ? <FieldLabel className="mb-1.5 block text-xs text-muted-foreground">{label}</FieldLabel> : null}

      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        ) : null}

        <ReusableSelect
          options={safeOptions}
          value={selectedValue}
          onChange={(nextValue) => onChange?.(nextValue)}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          disabled={disabled}
          className={error ? "border-destructive focus-within:ring-destructive/30" : ""}
        />
      </div>

      {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}