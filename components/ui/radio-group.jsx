import * as React from "react";
import { Circle } from "lucide-react";

import { cn } from "../../lib/util"; "@/lib/utils";

function RadioGroup({ className, ...props }) {
  return <div className={cn("grid gap-2", className)} role="radiogroup" {...props} />;
}

const RadioGroupItem = React.forwardRef(function RadioGroupItem(
  { className, id, name, value, checked, onChange, children, ...props },
  ref
) {
  return (
    <label
      htmlFor={id}
      className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground"
    >
      <span className="relative inline-flex size-4 items-center justify-center">
        <input
          ref={ref}
          id={id}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          className={cn(
            "peer size-4 appearance-none rounded-full border border-input bg-background outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <Circle className="pointer-events-none absolute size-2 scale-0 fill-primary text-primary transition-transform peer-checked:scale-100" />
      </span>
      {children}
    </label>
  );
});

export { RadioGroup, RadioGroupItem };
