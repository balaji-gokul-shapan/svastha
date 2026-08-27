
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@base-ui/react/menu";
import { ChevronRight, Circle } from "lucide-react";
import { cn } from "../../lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Menu.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Menu.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Menu.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Menu.Portal;

const DropdownMenuContent = React.forwardRef(function DropdownMenuContent(
  { className, sideOffset = 4, ...props },
  ref
) {
  return (
        <DropdownMenuPrimitive.Menu.Portal>
      <DropdownMenuPrimitive.Menu.Positioner
        sideOffset={sideOffset}
        className="z-50"
      >
        <DropdownMenuPrimitive.Menu.Popup
          ref={ref}
          className={cn(
            "min-w-40 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none",
            "data-starting-style:animate-in data-ending-style:animate-out data-starting-style:zoom-in-95 data-ending-style:zoom-out-95 data-starting-style:fade-in-0 data-ending-style:fade-out-0",
            className
          )}
          {...props}
        />
      </DropdownMenuPrimitive.Menu.Positioner>
    </DropdownMenuPrimitive.Menu.Portal>
  );
});

const DropdownMenuItem = React.forwardRef(function DropdownMenuItem(
  { className, children, inset, ...props },
  ref
) {
  return (
    <DropdownMenuPrimitive.Menu.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:size-4 [&_>svg]:shrink-0",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Menu.Item>
  );
});

const DropdownMenuRadioItem = React.forwardRef(function DropdownMenuRadioItem(
  { className, children, ...props },
  ref
) {
  return (
    <DropdownMenuPrimitive.Menu.RadioItem
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.Menu.RadioItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.Menu.RadioItemIndicator>
      </span>
      {children}
        </DropdownMenuPrimitive.Menu.RadioItem>
  );
});

const DropdownMenuLabel = React.forwardRef(function DropdownMenuLabel(
  { className, inset, ...props },
  ref
) {
  return (
    <DropdownMenuPrimitive.Menu.GroupLabel
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
});

const DropdownMenuSeparator = React.forwardRef(function DropdownMenuSeparator(
  { className, ...props },
  ref
) {
  return (
        <DropdownMenuPrimitive.Menu.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
});

const DropdownMenuSub = DropdownMenuPrimitive.Menu.SubmenuRoot;

const DropdownMenuSubTrigger = React.forwardRef(function DropdownMenuSubTrigger(
  { className, children, ...props },
  ref
) {
  return (
    <DropdownMenuPrimitive.Menu.SubmenuTrigger
      ref={ref}
      className={cn(
        "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-4" />
    </DropdownMenuPrimitive.Menu.SubmenuTrigger>
  );
});

const DropdownMenuSubContent = React.forwardRef(function DropdownMenuSubContent(
  { className, sideOffset = 4, ...props },
  ref
) {
  return (
    <DropdownMenuPrimitive.Menu.Portal>
      <DropdownMenuPrimitive.Menu.Positioner
        sideOffset={sideOffset}
        className="z-50"
      >
        <DropdownMenuPrimitive.Menu.Popup
          ref={ref}
          className={cn(
            "min-w-40 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
            "data-starting-style:animate-in data-ending-style:animate-out data-starting-style:fade-in-0 data-ending-style:fade-out-0 data-starting-style:zoom-in-95 data-ending-style:zoom-out-95",
            className
          )}
          {...props}
        />
            </DropdownMenuPrimitive.Menu.Positioner>
    </DropdownMenuPrimitive.Menu.Portal>
  );
});

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
    DropdownMenuItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
};
