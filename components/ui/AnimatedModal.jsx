"use client";

import * as React from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "./button";
import { cn } from "../../lib/utils";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

function AnimatedModal({
  open,
  onClose,
  children,
  className,
  overlayClassName,
  maxWidth = "max-w-4xl",
  showCloseButton = true,
  closeOnOverlayClick = true,
  ariaLabel = "Dialog",
}) {
  React.useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="animated-modal-overlay"
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-[2px]",
            overlayClassName
          )}
          role="dialog"
          aria-modal="true"
            aria-label={ariaLabel}
            variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={() => {
            if (closeOnOverlayClick) {
              onClose?.();
            }
          }}
          onMouseDown={(event) => {
            if (
              closeOnOverlayClick &&
              event.target === event.currentTarget
            ) {
              onClose?.();
            }
          }}
        >
          <motion.div
            className={cn(
              "relative flex max-h-[90vh] w-[95vw] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl",
              maxWidth,
              className
            )}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onClose?.()}
                className="absolute right-3 top-3 z-10"
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            ) : null}

            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export { AnimatedModal };
export default AnimatedModal;
