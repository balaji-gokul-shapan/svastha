"use client";

import {
  ArrowRight,
  ClipboardCheck,
  FileBarChart,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  LogIn,
  School,
  Syringe,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * REGISTRATION SUCCESS
 * --------------------
 * Replaces the old blind `router.push("/login")` that fired 600ms after a
 * successful registration.
 *
 * Bouncing the user straight to the login screen threw away the one moment
 * where they most need orientation: a brand new school admin has just created
 * the account and has no idea what to do next. This dialog confirms the
 * registration, explains the next step, and previews what the program does.
 */

/** What the user does next, in order. */
const NEXT_STEPS = [
  {
    icon: LogIn,
    title: "Sign in with your credentials",
    detail: "Use the email and password you just created to sign in.",
  },
  {
    icon: Users,
    title: "Invite your teaching staff",
    detail:
      "Settings -> Team lets you add sub-accounts and scope each one to a branch, class or section.",
  },
  {
    icon: School,
    title: "Add your students",
    detail: "Import the student roster under Students, then start screening.",
  },
];

/**
 * What the program does once they are inside. These mirror the real nav
 * entries in app/components/layout/nav-items.js so the tour cannot drift out
 * of sync with the product.
 */
const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    detail: "Live counts of students, screenings and referrals across branches.",
  },
  {
    icon: HeartPulse,
    title: "Health checks",
    detail:
      "General, vision, hearing, ENT, dental and immunization screening in one place.",
  },
  {
    icon: Syringe,
    title: "Referrals",
    detail: "Flag a finding for referral and track it through to follow-up.",
  },
  {
    icon: FileBarChart,
    title: "Reports",
    detail: "Export screening and health summaries for any branch or class.",
  },
];

export function RegistrationSuccess({
  open,
  onOpenChange,
  schoolName,
  branchCount = 0,
  onGoToLogin,
}) {
  const handleOpenChange = (next) => {
    // Dismissing via backdrop or Escape still lands on login - the user has no
    // reason to stay on a freshly-reset, empty registration form.
    if (!next) onGoToLogin?.();
    onOpenChange?.(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-[95%] sm:max-w-[92%] md:max-w-[80%] lg:max-w-[42%]">
        <AlertDialogHeader>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success">
            <ClipboardCheck className="size-6" aria-hidden="true" />
          </span>

          <AlertDialogTitle className="text-lg">
            {schoolName
              ? `${schoolName} is registered`
              : "Registration successful"}
          </AlertDialogTitle>

          <AlertDialogDescription>
            Your school has been created successfully
            {branchCount > 0
              ? ` with ${branchCount} branch${branchCount === 1 ? "" : "es"}`
              : ""}
            . Here is what to do next.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <section className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Next steps
          </p>

          <ol className="mt-2 space-y-2">
            {NEXT_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3"
              >
                {/* Numbered badge sits on the icon, so one marker does both jobs. */}
                <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-4" aria-hidden="true" />
                  <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What you can do in Svastha
          </p>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-2.5"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <feature.icon className="size-3.5" aria-hidden="true" />
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                    {feature.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <AlertDialogFooter className="mt-5 sm:flex-col sm:items-stretch">
          {/* A plain button, not AlertDialogAction: that one is styled as a
              destructive action (red) and closes the dialog before we can
              navigate, which would leave the user on the reset form. */}
          <button
            type="button"
            onClick={onGoToLogin}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <GraduationCap className="size-4" aria-hidden="true" />
            Continue to sign in
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

