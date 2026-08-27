"use client";

import * as React from "react";
import * as DialogPrimitive from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";

const Dialog = DialogPrimitive.Dialog.Root;
const DialogTrigger = DialogPrimitive.Dialog.Trigger;
const DialogClose = DialogPrimitive.Dialog.Close;

const DialogContent = React.forwardRef(function DialogContent(
  { className, children, ...props },
  ref
) {
  return (
    <DialogPrimitive.Dialog.Portal>
      <DialogPrimitive.Dialog.Backdrop
        className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
      />
      <DialogPrimitive.Dialog.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
        <DialogPrimitive.Dialog.Popup
          ref={ref}
          className={cn(
            "relative w-full max-w-90% rounded-lg border border-border bg-card p-5 shadow-lg outline-none",
            "transition-all duration-200",
            "data-starting-style:scale-95 data-ending-style:scale-95 data-starting-style:opacity-0 data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Dialog.Close
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <X className="size-4" />
          </DialogPrimitive.Dialog.Close>
        </DialogPrimitive.Dialog.Popup>
      </DialogPrimitive.Dialog.Viewport>
    </DialogPrimitive.Dialog.Portal>
  );
});

const DialogHeader = function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-1 pr-8 text-left", className)}
      {...props}
    />
  );
};

const DialogFooter = function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
};

const DialogTitle = React.forwardRef(function DialogTitle(
  { className, ...props },
  ref
) {
  return (
    <DialogPrimitive.Dialog.Title
      ref={ref}
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
});

const DialogDescription = React.forwardRef(function DialogDescription(
  { className, ...props },
  ref
) {
  return (
    <DialogPrimitive.Dialog.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
