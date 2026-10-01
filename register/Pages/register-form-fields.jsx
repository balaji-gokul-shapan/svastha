import * as React from "react";
import { cn } from "@/lib/utils";
import { TextField, TextareaField } from "@/components/ui/text-field";
import ReusableSelect from "@/components/ui/reusable-select";

export function FormTextField({ error, ...props }) {
  return <TextField error={error || undefined} {...props} />;
}

export function FormTextareaField({ error, ...props }) {
  return (
    <div>
      <TextareaField {...props} />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export function FormSelect({
  label,
  required,
  error,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  className,
}) {
  const normalized = options.map((opt) =>
    Array.isArray(opt) ? { value: opt[0], label: opt[1] } : opt,
  );
  return (
    <div className={cn(className)}>
      <ReusableSelect
        label={
          label ? (
            <span className="field-label">
              {label}
              {required ? <span className="field-required">*</span> : null}
            </span>
          ) : undefined
        }
        value={value ?? ""}
        onChange={onChange}
        options={normalized}
        placeholder={placeholder}
      />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export function FormSectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
