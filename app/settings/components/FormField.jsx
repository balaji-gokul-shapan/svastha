import { Input } from "@/components/ui/input";

/**
 * Reusable labelled input.
 * Supports BOTH controlled fields (value + onChange) and
 * uncontrolled fields (defaultValue).
 */
export function FormField({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  defaultValue = "",
  className = "",
}) {
  const inputProps = { id, name: id, type, placeholder };

  if (value !== undefined && onChange) {
    inputProps.value = value;
    inputProps.onChange = (event) => onChange(event.target.value);
  } else {
    inputProps.defaultValue = defaultValue;
  }

  if (className) inputProps.className = className;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input {...inputProps} />
    </div>
  );
}

export default FormField;
