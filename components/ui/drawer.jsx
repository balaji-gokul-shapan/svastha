"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { X } from "lucide-react";

import { cn } from "../../lib/util"; "@/lib/utils";

function Drawer(props) {
  return <DrawerPrimitive.Root {...props} />;
}

function DrawerTrigger({ asChild = false, children, ...props }) {
  if (asChild && React.isValidElement(children)) {
    return <DrawerPrimitive.Trigger render={children} {...props} />;
  }

  return <DrawerPrimitive.Trigger {...props}>{children}</DrawerPrimitive.Trigger>;
}

function DrawerPortal(props) {
  return <DrawerPrimitive.Portal {...props} />;
}

function DrawerClose({ asChild = false, children, ...props }) {
  if (asChild && React.isValidElement(children)) {
    return <DrawerPrimitive.Close render={children} {...props} />;
  }

  return <DrawerPrimitive.Close {...props}>{children}</DrawerPrimitive.Close>;
}

function DrawerOverlay({ className, ...props }) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        "transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({ className, children, side = "bottom", ...props }) {
  const isRight = side === "right";

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport>
        <DrawerPrimitive.Popup
          className={cn(
            isRight
              ? "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[75%] lg:max-w-[30%] flex-col border-l border-border bg-background shadow-lg"
              : "fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[85vh] flex-col rounded-t-2xl border border-border bg-background shadow-lg",
            isRight
              ? "transition-[transform,opacity] duration-200 data-ending-style:translate-x-2 data-ending-style:opacity-0 data-starting-style:translate-x-2 data-starting-style:opacity-0"
              : "transition-[transform,opacity] duration-200 data-ending-style:translate-y-2 data-ending-style:opacity-0 data-starting-style:translate-y-2 data-starting-style:opacity-0",
            className,
          )}
          {...props}
        >
          <DrawerPrimitive.Close
            aria-label="Close drawer"
            className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <X className="size-4" />
          </DrawerPrimitive.Close>

          {!isRight ? <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted" /> : null}
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 border-b border-border px-4 py-3", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }) {
  return (
    <div className={cn("mt-auto flex items-center gap-2 p-4", className)} {...props} />
  );
}

function DrawerTitle({ className, ...props }) {
  return (
    <DrawerPrimitive.Title
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
