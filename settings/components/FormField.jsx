"use client";

// Shared controlled text field for the settingsNew pages.
//
// IMPORTANT: this component must stay defined at MODULE SCOPE — never inside
// another component's render body. A function declared inside a component gets
// a brand-new type identity on every keystroke, which makes React unmount +
// remount the <input>, losing focus after each character typed.
//
// Contract: `onChange` receives the STRING value directly (not the event),
// matching the setState setters passed down from page.jsx.

export default function FormField({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  rightIcon,
  inputClassName,
}) {
  // Use literal class tokens so Tailwind's scanner can detect them.
  const rightPadding = rightIcon ? "pr-10" : "";
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(event) => onChange?.(event.target.value)}
          className={`h-10 w-full rounded-md border border-input bg-background px-3 ${rightPadding} text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30${inputClassName ? ` ${inputClassName}` : ""}`}
        />

        {rightIcon ? (
          <span className="absolute inset-y-0 right-0 flex items-center px-2.5">
            {rightIcon}
          </span>
        ) : null}
      </div>
    </div>
  );
}
