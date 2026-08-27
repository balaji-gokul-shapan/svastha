"use client";

import * as React from "react";
import * as SwitchPrimitive from "@base-ui/react/switch";

import { cn } from "../../lib/utils";

const Switch = React.forwardRef(function Switch(
  { className, ...props },
  ref
) {
  return (
              <SwitchPrimitive.Switch.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-sm transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:bg-primary data-unchecked:bg-input",
        className
      )}
      {...props}
    >
            <SwitchPrimitive.Switch.Thumb
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow transition-transform",
          "data-checked:translate-x-4 data-unchecked:translate-x-0.5"
        )}
      />
    </SwitchPrimitive.Switch.Root>
  );
});

export { Switch };