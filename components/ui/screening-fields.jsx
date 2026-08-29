"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export function FieldLabel({ htmlFor, children, className }) {
  return (
    <label htmlFor={htmlFor} className={cn("field-label", className)}>
      {children}
    </label>
  );
}

/** Bare Yes/No-style picker. Styling: .segmented / .segmented__btn
 *
 * Options may be plain strings ("Normal") or objects
 * ({ value, label, tone }) — mirrors ToggleGroup so per-option colors
 * (good/warn/bad) work the same way. Tone paints via a [data-tone]
 * attribute selector that out-specifies the default active rule. */
export function SegmentedControl({ options = [], value, onChange, className }) {
  return (
    <div className={cn("segmented", className)} role="group">
      {options.map((option) => {
        const { value: optionValue, label, tone } =
          typeof option === "string"
            ? { value: option, label: option, tone: undefined }
            : {
                value: option?.value ?? option,
                label: option?.label ?? option?.value ?? option,
                tone: option?.tone,
              };

        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={value === optionValue}
            data-tone={value === optionValue ? tone : undefined}
            onClick={() => onChange?.(optionValue)}
            className="segmented__btn"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Labelled single-line input (.input-field). onChange(value) → string. */
export function ScreeningInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  id,
  ...rest
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className={className}>
      {label ? <FieldLabel htmlFor={fieldId}>{label}</FieldLabel> : null}
      <input
        id={fieldId}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="input-field"
        {...rest}
      />
    </div>
  );
}

/** Labelled multi-line field (.textarea-field). `rows` defaults to 3. */
export function ScreeningTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  id,
  ...rest
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className={className}>
      {label ? <FieldLabel htmlFor={fieldId}>{label}</FieldLabel> : null}
      <textarea
        id={fieldId}
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="textarea-field"
        {...rest}
      />
    </div>
  );
}

/** Label + SegmentedControl composite — the dominant pattern in the cards. */
export function SegmentedField({
  label,
  options,
  value,
  onChange,
  className,
}) {
  return (
    <div className={className}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <SegmentedControl options={options} value={value} onChange={onChange} />
    </div>
  );
}