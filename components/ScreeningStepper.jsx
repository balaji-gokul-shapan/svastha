"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

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

  return (
    <div className="w-full">
      <div
        className="
    relative
    mb-6
    overflow-x-auto
    rounded-xl
    border
    border-border
    bg-card
    shadow-[inset_12px_0_14px_-14px_rgba(0,0,0,0.35),inset_-12px_0_14px_-14px_rgba(0,0,0,0.35)]
    [scrollbar-width:none]
    [&::-webkit-scrollbar]:hidden
  "
      >
        {" "}
        <div className="flex h-auto w-max min-w-full items-center justify-center gap-0 rounded-xl border bg-card p-2  shadow-[inset_12px_0_14px_-14px_rgba(0,0,0,0.35),inset_-12px_0_14px_-14px_rgba(0,0,0,0.35)]">
          {visibleSteps.map((step, index) => {
            const completed = index < currentIndex;
            const active = index === currentIndex;

            return (
              <React.Fragment key={step.value}>
                <button
                  type="button"
                  ref={(element) => {
                    stepButtonRefs.current[step.value] = element;
                  }}
                  onClick={() => setActiveStep(step.value)}
                  className={`
                    relative flex items-center  min-w-auto flex-1
                    gap-2 rounded-lg px-4 py-3
                    transition-colors
                    ${active ? "bg-primary text-primary-foreground justify-center" : "hover:bg-muted"}
                  `}
                >
                  <span
                    className={`
                      flex size-7 shrink-0 items-center justify-center
                      rounded-full border text-xs font-semibold aspect-square
                      ${
                        completed
                          ? "border-primary bg-primary text-primary-foreground"
                          : active
                            ? "border-primary-foreground bg-primary-foreground/20"
                            : "border-muted-foreground/30"
                      }
                    `}
                  >
                    {completed ? <Check className="size-4" /> : index + 1}
                  </span>

                  <span className="hidden text-sm md:block">{step.label}</span>

                  <span className="text-xs md:hidden">{step.shortLabel}</span>
                </button>

                {index < visibleSteps.length - 1 && (
                  <div
                    className={`
                      mt-1 h-px w-3 shrink-0 sm:w-5 md:w-8 lg:flex-1
                      ${index < currentIndex ? "bg-primary" : "bg-border"}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="min-h-[400px]">{childArray[currentIndex]}</div>

      {/* FOOTER */}
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isFirst}
          onClick={goPrevious}
        >
          <ChevronLeft className="mr-2 size-4" />
          Previous
        </Button>

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
