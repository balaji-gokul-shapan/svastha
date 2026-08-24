"use client";

import { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * GLOBAL LOADER
 * -------------
 * Mounted once in app/providers.jsx — shows a slim animated progress bar
 * at the top of the viewport whenever ANY React Query fetch or mutation
 * is in flight anywhere in the app. No per-page wiring needed.
 */
export function GlobalLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isActive = isFetching > 0 || isMutating > 0;

  // Small delay before hiding so quick requests don't flicker the bar.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      return;
    }

    const timeoutId = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(timeoutId);
  }, [isActive]);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-transparent"
    >
      <div className="h-full w-1/5 animate-[global-loader-slide_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-brand-blue via-primary to-brand-green" />
    </div>
  );
}

/**
 * Full-screen blocking loader — use for route-level or critical operations:
 *
 *   {isSaving ? <FullScreenLoader label="Saving..." /> : null}
 */
export function FullScreenLoader({ label = "Loading...", className }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-[90] flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Loader2 className="size-7 animate-spin" />
      </span>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}