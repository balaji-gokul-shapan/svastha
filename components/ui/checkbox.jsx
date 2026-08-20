"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "../../lib/util"; "@/lib/utils";

const Checkbox = React.forwardRef(function Checkbox(
  { className, checked, indeterminate = false, ...props },
  ref
) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      indeterminate={indeterminate}
      className={cn(
        "peer flex size-4 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-primary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex data-unchecked:hidden">
        {indeterminate ? <Minus className="size-3" /> : <Check className="size-3" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

export { Checkbox };
