"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Check, ChevronLeft, ChevronRight, CornerDownLeft } from "lucide-react";

const STEPS = [
  {
    value: "growth",
    label: "Growth & Vitals",
    shortLabel: "Growth",
  },
  {
    value: "clinical",
    label: "Clinical Signs",
    shortLabel: "Clinical",
  },
  {
    value: "physical",
    label: "Physical Examination",
    shortLabel: "Physical",
  },
  {
    value: "female",
    label: "Female Screening",
    shortLabel: "Female",
  },
  {
    value: "health",
    label: "Health History",
    shortLabel: "History",
  },
  {
    value: "review",
    label: "Review",
    shortLabel: "Review",
  },
];

export default function ScreeningStepper({
  activeStep,
  setActiveStep,
  isFemale,
  steps = STEPS,
  filterFemale = true,
  children,
  onSave,
}) {
  const stepButtonRefs = useRef({});

  const visibleSteps =
    filterFemale && steps === STEPS && !isFemale
      ? steps.filter((step) => step.value !== "female")
      : steps;

  const currentIndex = visibleSteps.findIndex(
    (step) => step.value === activeStep,
  );

  useEffect(() => {
    if (activeStep) {
      stepButtonRefs.current[activeStep]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeStep]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === visibleSteps.length - 1;

  const goNext = () => {
    if (!isLast) {
      setActiveStep(visibleSteps[currentIndex + 1].value);
    }
  };

  const goPrevious = () => {
    if (!isFirst) {
      setActiveStep(visibleSteps[currentIndex - 1].value);
    }
  };

  // Convert children to array for indexed access
  const childArray = React.Children.toArray(children);

  /* Progress: how much of the flow is behind the user. */
  const stepNumber = currentIndex + 1;
  const totalSteps = visibleSteps.length;
  const progress = Math.round((stepNumber / totalSteps) * 100);

  /* Arrow-key navigation between steps. Pure navigation — it calls the same
     `setActiveStep` the buttons already use, so no new state is introduced. */
  const handleRailKeyDown = (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    // Only when the rail itself holds focus, never while typing in a field.
    if (event.target !== event.currentTarget) return;

    event.preventDefault();

    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = Math.min(
      Math.max(currentIndex + offset, 0),
      visibleSteps.length - 1,
    );

    setActiveStep(visibleSteps[nextIndex].value);
  };

  return (
    <div className="w-full">
      {/* ---------------- Progress header ---------------- */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 pt-3.5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Step {stepNumber} of {totalSteps}
            </p>

            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
              {visibleSteps[currentIndex]?.label}
            </p>
          </div>

          <p className="text-sm font-semibold text-primary tabular-nums">
            {progress}%
          </p>
        </div>

        {/* Slim determinate bar — instant sense of "how far left". */}
        <div
          className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Screening progress"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          />
        </div>

        {/* ---------------- Step pills ----------------
            Pills share the row equally via `flex-1 basis-0 min-w-0`, so the rail
            adapts to ANY container width with no magic numbers. `min-w-0` is what
            lets them shrink; the labels truncate rather than forcing overflow.
            The connector lines sit outside the flex basis, so they keep a fixed
            size and the pills still divide the remaining space evenly. */}
        <div
          role="tablist"
          aria-label="Screening sections"
          tabIndex={0}
          onKeyDown={handleRailKeyDown}
          className="mt-3 flex items-stretch gap-1 border-t border-border/70 bg-muted/30 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visibleSteps.map((step, index) => {
            const completed = index < currentIndex;
            const active = index === currentIndex;

            return (
              <React.Fragment key={step.value}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-current={active ? "step" : undefined}
                  ref={(element) => {
                    stepButtonRefs.current[step.value] = element;
                  }}
                  onClick={() => setActiveStep(step.value)}
                  title={step.label}
                  className={`
                    group relative flex min-w-0 flex-1 basis-0 items-center gap-2
                    rounded-xl px-2 py-2.5 text-left transition-all sm:px-3
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${
                      active
                        ? "bg-primary/15 text-foreground ring-1 ring-primary/40"
                        : completed
                          ? "bg-primary/10 text-foreground hover:bg-primary/15"
                          : "text-muted-foreground hover:bg-muted"
                    }
                  `}
                >
                  <span
                    className={`
                      flex size-6 shrink-0 items-center justify-center
                      rounded-full border text-[11px] font-semibold tabular-nums
                      transition-colors
                      ${
                        completed
                          ? "border-primary bg-primary text-primary-foreground"
                          : active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground"
                      }
                    `}
                  >
                    {completed ? <Check className="size-3.5" /> : index + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`hidden truncate text-center text-sm md:block ${
                        active ? "font-semibold text-primary" : "font-medium"
                      }`}
                    >
                      {step.label}
                    </span>

                    <span
                      className={`block truncate text-xs md:hidden ${
                        active ? "font-semibold text-primary" : "font-medium"
                      }`}
                    >
                      {step.shortLabel}
                    </span>
                  </span>
                </button>

                {index < visibleSteps.length - 1 && (
                  <div
                    className={`my-auto h-px w-2 shrink-0 sm:w-3 ${
                      index < currentIndex ? "bg-primary/50" : "bg-border"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ---------------- CONTENT ---------------- */}
      {/* `key` remounts on step change so the entrance animation replays. */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="min-h-[400px]"
        role="tabpanel"
      >
        {childArray[currentIndex]}
      </motion.div>

      {/* ---------------- FOOTER ---------------- */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isFirst}
          onClick={goPrevious}
        >
          <ChevronLeft className="mr-2 size-4" />
          Previous
        </Button>

        {/* Keyboard affordance — desktop only, noise on touch layouts. */}
        <p className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
          <CornerDownLeft className="size-3.5" aria-hidden="true" />
          Use
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px]">
            ←
          </kbd>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px]">
            →
          </kbd>
          to change step
        </p>

        {isLast ? (
          <Button type="button" onClick={onSave}>
            <Check className="mr-2 size-4" />
            Save Screening
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            Next
            <ChevronRight className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
