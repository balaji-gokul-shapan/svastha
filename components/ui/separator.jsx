"use client";

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "../../lib/util"; "@/lib/utils";

function Separator({ className, orientation = "horizontal", ...props }) {
  return (
    <SeparatorPrimitive
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
