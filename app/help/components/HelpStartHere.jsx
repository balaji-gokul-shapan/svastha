"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Clock, Rocket } from "lucide-react";
import { toast } from "sonner";

import { HELP_ONBOARDING } from "../datas/help-data";

/* ==========================================================================
   START HERE
   ==========================================================================
   The first question a new school has is "what do I do first?", and the answer
   is a checklist, not a paragraph. Progress is a ring rather than a bar because
   six steps is a small, glanceable number, and the same ring doubles as the
   "you are done" celebration.

   Demo behaviour: the first three steps start ticked and ticking the last one
   fires a toast. Nothing is persisted yet — that is the follow-up when this
   page gets a backend.
   ========================================================================== */

const RING_RADIUS = 26;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

export function HelpStartHere() {
  const [done, setDone] = useState(
    () =>
      new Set(
        HELP_ONBOARDING.filter((step) => step.done).map((step) => step.id),
      ),
  );

  const doneCount = HELP_ONBOARDING.filter((step) => done.has(step.id)).length;
  const progress = doneCount / HELP_ONBOARDING.length;
  const minutesLeft = HELP_ONBOARDING.filter(
    (step) => !done.has(step.id),
  ).reduce((total, step) => total + step.minutes, 0);
  const isComplete = doneCount === HELP_ONBOARDING.length;

  /* The next set is built outside the state updater: an updater must stay pure
     (StrictMode calls it twice) and a toast fired from inside it would double
     up. */
  function toggle(id) {
    const next = new Set(done);
    const isNowDone = !next.has(id);

    if (isNowDone) {
      next.add(id);
    } else {
      next.delete(id);
    }

    setDone(next);

    if (isNowDone && next.size === HELP_ONBOARDING.length) {
      toast.success("Setup complete", {
        description:
          "Your school is ready for its first screening round — the next camp can go out whenever you are.",
      });
    }
  }

  return (
    <section
      aria-labelledby="help-start-title"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="help-start-title"
            className="text-base font-bold text-foreground"
          >
            Set up in six steps
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isComplete
              ? "Everything is in place."
              : `${doneCount} of ${HELP_ONBOARDING.length} done · about ${minutesLeft} min left`}
          </p>
        </div>

        <div className="relative flex size-14 shrink-0 items-center justify-center">
          <svg
            viewBox="0 0 64 64"
            aria-hidden="true"
            className="size-14 -rotate-90"
          >
            <circle
              cx="32"
              cy="32"
              r={RING_RADIUS}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="6"
            />
            <circle
              cx="32"
              cy="32"
              r={RING_RADIUS}
              fill="none"
              stroke={isComplete ? "var(--color-success)" : "var(--color-primary)"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - progress)}
              className="transition-[stroke-dashoffset,stroke] duration-500 motion-reduce:transition-none"
            />
          </svg>
          <span
            aria-live="polite"
            className="absolute text-xs font-bold tabular-nums text-foreground"
          >
            {Math.round(progress * 100)}%
          </span>
        </div>
      </header>

      <ol className="space-y-1.5">
        {HELP_ONBOARDING.map((step, index) => {
          const isDone = done.has(step.id);

          return (
            <li key={step.id}>
              <div
                className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                  isDone
                    ? "border-success/30 bg-success/[0.06]"
                    : "border-border bg-background/60 hover:border-primary/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(step.id)}
                  aria-pressed={isDone}
                  aria-label={`${isDone ? "Mark incomplete" : "Mark complete"}: ${step.title}`}
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    isDone
                      ? "border-success bg-success text-white"
                      : "border-border bg-background text-transparent hover:border-primary"
                  }`}
                >
                  <Check className="size-3.5" />
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      isDone
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    <span className="mr-1.5 text-xs font-bold tabular-nums text-muted-foreground/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {step.detail}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                    <Clock className="size-3" />
                    {step.minutes} min
                  </span>
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    Open
                    <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {isComplete ? (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs font-medium text-success">
          <Rocket className="size-4" />
          Nicely done — most schools finish setup in a single sitting.
        </p>
      ) : null}
    </section>
  );
}
