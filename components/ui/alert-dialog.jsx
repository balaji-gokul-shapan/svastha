"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@base-ui/react/alert-dialog";

import { cn } from "../../lib/utils";

const AlertDialog = AlertDialogPrimitive.AlertDialog.Root;
const AlertDialogTrigger = AlertDialogPrimitive.AlertDialog.Trigger;

const AlertDialogContent = React.forwardRef(function AlertDialogContent(
  { className, children, ...props },
  ref
) {
  return (
    <AlertDialogPrimitive.AlertDialog.Portal>
      <AlertDialogPrimitive.AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <AlertDialogPrimitive.AlertDialog.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
        <AlertDialogPrimitive.AlertDialog.Popup
          ref={ref}
          className={cn(
            "relative w-full max-w-[90%] sm:max-w-[85%] md:max-w-[50%] lg:max-w-[35%] rounded-lg border border-border bg-card p-5 shadow-lg outline-none",
            "transition-all duration-200",
            "data-starting-style:scale-95 data-ending-style:scale-95 data-starting-style:opacity-0 data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </AlertDialogPrimitive.AlertDialog.Popup>
      </AlertDialogPrimitive.AlertDialog.Viewport>
    </AlertDialogPrimitive.AlertDialog.Portal>
  );
});

function AlertDialogHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

const AlertDialogTitle = React.forwardRef(function AlertDialogTitle(
  { className, ...props },
  ref
) {
  return (
    <AlertDialogPrimitive.AlertDialog.Title
      ref={ref}
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
});

const AlertDialogDescription = React.forwardRef(function AlertDialogDescription(
  { className, ...props },
  ref
) {
  return (
    <AlertDialogPrimitive.AlertDialog.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});

const AlertDialogCancel = React.forwardRef(function AlertDialogCancel(
  { className, ...props },
  ref
) {
  return (
    <AlertDialogPrimitive.AlertDialog.Close
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

const AlertDialogAction = React.forwardRef(function AlertDialogAction(
  { className, onClick, ...props },
  ref
) {
  return (
    <AlertDialogPrimitive.AlertDialog.Close
      ref={ref}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-white shadow-sm transition-colors outline-none hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-destructive/50 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
};
