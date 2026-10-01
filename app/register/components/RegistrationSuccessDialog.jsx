"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  HeartPulse,
  Hourglass,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserPlus,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** What the school admin does next, in order. */
const NEXT_STEPS = [
  {
    title: "Wait for approval",
    description:
      "Your registration is under review. You will be notified once it is approved.",
    icon: Hourglass,
  },
  {
    title: "Add your branch details",
    description: "Branches carry the class, section and student rosters.",
    icon: Building2,
  },
  {
    title: "Invite teaching staff",
    description: "Create sub-accounts so teachers can be assigned to classes.",
    icon: UserPlus,
  },
  {
    title: "Plan your first health camp",
    description: "Register a camp to schedule student health screenings.",
    icon: Stethoscope,
  },
];

const FEATURES = [
  { label: "Health screening records", icon: HeartPulse },
  { label: "Live dashboards", icon: LayoutDashboard },
  { label: "Referral tracking", icon: ClipboardList },
  { label: "Role-based access", icon: ShieldCheck },
];

export function RegistrationSuccessDialog({
  open,
  onOpenChange,
  schoolName = "",
  onGoToLogin,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2/3">
        <DialogHeader className="text-center">
          {/* Uses the semantic `success` token so it re-themes with light/dark. */}
          <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-success/10 ring-4 ring-success/20">
            <Sparkles className="size-7 text-success" />
          </div>

          <DialogTitle className="text-xl sm:text-2xl">
            School registered successfully
          </DialogTitle>

          <DialogDescription>
            {schoolName ? (
              <>
                <span className="font-medium text-foreground">
                  {schoolName}
                </span>{" "}
                is now live on Svastha. Here&apos;s what to do next.
              </>
            ) : (
              "Your school is now live on Svastha. Here's what to do next."
            )}
          </DialogDescription>
        </DialogHeader>

        <NextSteps />
        <FeatureGrid />

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {onGoToLogin ? (
            <Button
              type="button"
              className="w-full gap-2 sm:w-auto"
              onClick={onGoToLogin}
            >
              Go to sign in
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button asChild className="w-full gap-2 sm:w-auto">
              <Link href="/login" className="text-secondary inline-flex items-center gap-2">
                Go to sign in
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange?.(false)}
          >
            Stay here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Ordered "what to do next" list. */
function NextSteps() {
  return (
    <section aria-label="Next steps">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Next steps</h3>

      <ol className="space-y-2">
        {NEXT_STEPS.map((step, index) => {
          const Icon = step.icon;

          return (
            <li
              key={step.title}
              className="flex gap-3 rounded-xl border bg-card p-3 text-left"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-muted-foreground">
                  Step {index + 1}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-foreground">
                  {step.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {step.description}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Grid of headline platform capabilities. */
function FeatureGrid() {
  return (
    <section aria-label="Svastha features" className="my-6">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        What you can do with Svastha
      </h3>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;

          return (
            <li
              key={feature.label}
              className="flex items-center gap-2 rounded-lg border bg-card px-3 py-3 text-xs font-medium text-foreground"
            >
              <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">{feature.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default RegistrationSuccessDialog;