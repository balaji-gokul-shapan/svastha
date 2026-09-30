"use client";

/**
 * FORGOTTEN PASSWORD
 * -------------------
 * Three-step recovery wizard shown instead of the login form:
 *
 *   1. INSTRUCTIONS  - what will happen, and a Next button
 *   2. VERIFY        - answer the account's security questions
 *   3. RESET         - choose a new password
 *
 * UI ONLY. There is no verification endpoint yet, so step 2 compares answers
 * against localStorage and step 3 does not persist anything. Replace the two
 * marked blocks with API calls once the backend exists.
 */

import React, { useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Loader2,
  Lock,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthMeter } from "@/app/settings/components/PasswordStrengthMeter";
import {
  MIN_ANSWER_LENGTH,
  REQUIRED_ANSWERS,
  makeAnswerStore,
  normaliseAnswer,
  parseAnswers,
} from "@/lib/security-questions";
import { useAppSelector } from "@/lib/hooks";
import { selectAuthUser } from "@/lib/features/auth-slice";

const STEPS = [
  { key: "intro", label: "Instructions", icon: MailCheck },
  { key: "verify", label: "Verify identity", icon: HelpCircle },
  { key: "reset", label: "New password", icon: Lock },
];

// Mirrors changePasswordSchema so the two password forms cannot drift apart.
const PASSWORD_RULES = [
  { test: (value) => value.length >= 8, message: "At least 8 characters" },
  { test: (value) => /[0-9]/.test(value), message: "At least 1 number" },
  {
    test: (value) => /[^A-Za-z0-9]/.test(value),
    message: "At least 1 special character",
  },
];

export default function ForgotPasswordFlow({ onCancel }) {
  const user = useAppSelector(selectAuthUser);
  const userId = user?.emp_id ?? user?.user_name ?? user?.username ?? "";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [verifyError, setVerifyError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetError, setResetError] = useState("");

  // Reads the questions the user configured in Settings.
  const store = useMemo(() => makeAnswerStore(userId), [userId]);
  const rawAnswers = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const savedQuestions = useMemo(() => parseAnswers(rawAnswers), [rawAnswers]);

  const hasQuestions = savedQuestions.length >= REQUIRED_ANSWERS;
  const ActiveStepIcon = STEPS[step].icon;

  const passwordIssues = PASSWORD_RULES.filter(
    (rule) => !rule.test(newPassword),
  ).length;

  const goNext = () => {
    setVerifyError("");
    setResetError("");
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setVerifyError("");
    setResetError("");
    setStep((prev) => Math.max(prev - 1, 0));
  };

  /**
   * STEP 2 — verify.
   *
   * PLACEHOLDER: compares against localStorage. Replace with a call to your
   * verify endpoint, which should hash the answers server-side and return a
   * short-lived reset token instead of a boolean.
   */
  const handleVerify = (event) => {
    event.preventDefault();
    setVerifyError("");

    const trimmed = answers.map((value) => normaliseAnswer(value));
    if (trimmed.some((value) => value.length < MIN_ANSWER_LENGTH)) {
      setVerifyError("Please answer every question.");
      return;
    }

    setIsChecking(true);

    // Simulated round-trip so the pending state is visible.
    window.setTimeout(() => {
      const matches = savedQuestions.every((entry, index) =>
        normaliseAnswer(entry.answer) === trimmed[index],
      );

      setIsChecking(false);

      if (!matches) {
        setVerifyError(
          "One or more answers do not match. Please try again.",
        );
        return;
      }

      goNext();
    }, 600);
  };

  /** STEP 3 — reset. PLACEHOLDER: no persistence until the API exists. */
  const handleReset = (event) => {
    event.preventDefault();
    setResetError("");

    if (passwordIssues > 0) {
      setResetError("Your new password does not meet all the requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    // TODO: dispatch the reset thunk here.
    onCancel?.();
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-5"
    >
      {/* ---------------- Stepper ---------------- */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Password recovery
        </p>

        {/* Grid (not flex) so every step gets an identical column regardless of
            how long its label is — flex-1 with text inside sizes to content.
            The connector is absolutely positioned from this step's centre to the
            next step's centre, so the lines align perfectly. */}
        <ol className="mt-4 grid grid-cols-3">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            const isDone = index < step;
            const isActive = index === step;
            const isLast = index === STEPS.length - 1;

            return (
              <li
                key={item.key}
                className="relative flex flex-col items-center gap-2 px-2"
                aria-current={isActive ? "step" : undefined}
              >
                {/* Connector: starts at this circle's centre (half of size-8)
                    and runs a full column width to the next circle's centre. */}
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className={`absolute left-1/2 top-4 h-0.5 w-full rounded-full ${
                      isDone ? "bg-success/50" : "bg-border"
                    }`}
                  />
                ) : null}

                <span
                  className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  ) : (
                    <Icon className="size-4" aria-hidden="true" />
                  )}
                </span>

                <span
                  className={`px-1 text-center text-[11px] font-medium leading-tight sm:text-xs ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ---------------- Step 1: instructions ---------------- */}
      {step === 0 ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <h1 className="font-sf text-2xl font-semibold tracking-tight">
                Reset your password
              </h1>

              <p className="mt-1 text-[0.85rem] leading-relaxed text-muted-foreground">
                You can recover access using the security questions you set up
                in Settings.
              </p>
            </div>
          </div>

          <ol className="space-y-2">
            {[
              {
                icon: HelpCircle,
                title: "Answer your security questions",
                detail: `We will show the ${REQUIRED_ANSWERS} questions saved on your account.`,
              },
              {
                icon: ShieldCheck,
                title: "We verify your answers",
                detail: "Both answers must match before you can continue.",
              },
              {
                icon: KeyRound,
                title: "Choose a new password",
                detail:
                  "At least 8 characters, including a number and a special character.",
              },
            ].map((item, index) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3"
              >
                <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-4" aria-hidden="true" />
                  <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>


          {/* No questions configured — this is a dead end, so say so plainly
              rather than showing an empty form the user cannot pass. */}
          {!hasQuestions ? (
            <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3">
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-warning-foreground"
                aria-hidden="true"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                This account has no security questions set up. Ask your school
                administrator for help resetting your password.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl bg-background/60"
              onClick={onCancel}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to sign in
            </Button>

            <Button
              type="button"
              className="h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-brand-blue shadow-lg shadow-primary/25"
              onClick={goNext}
              disabled={!hasQuestions}
            >
              Next
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}


      {/* ---------------- Step 2: verify ---------------- */}
      {step === 1 ? (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HelpCircle className="size-5" aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <h1 className="font-sf text-2xl font-semibold tracking-tight">
                Verify your identity
              </h1>

              <p className="mt-1 text-[0.85rem] leading-relaxed text-muted-foreground">
                Answer both questions to confirm you own this account.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {savedQuestions.map((entry, index) => (
              <div key={index} className="space-y-1.5">
                <label
                  htmlFor={`recovery-answer-${index}`}
                  className="block text-sm font-medium leading-none text-foreground"
                >
                  {entry.question}
                </label>

                <Input
                  id={`recovery-answer-${index}`}
                  name={`recovery_answer_${index}`}
                  value={answers[index] ?? ""}
                  onChange={(event) =>
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[index] = event.target.value;
                      return next;
                    })
                  }
                  placeholder="Enter your answer"
                  autoComplete="off"
                  disabled={isChecking}
                  className="h-11 rounded-xl bg-background/70"
                />
              </div>
            ))}
          </div>

          {verifyError ? (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              {verifyError}
            </motion.p>
          ) : null}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl bg-background/60"
              onClick={goBack}
              disabled={isChecking}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Button>

            <Button
              type="submit"
              className="h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-brand-blue shadow-lg shadow-primary/25"
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Checking...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </form>
      ) : null}


      {/* ---------------- Step 3: new password ---------------- */}
      {step === 2 ? (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <h1 className="font-sf text-2xl font-semibold tracking-tight">
                Choose a new password
              </h1>

              <p className="mt-1 text-[0.85rem] leading-relaxed text-muted-foreground">
                Pick something you have not used before.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="recovery-new-password"
              className="block text-sm font-medium leading-none text-foreground"
            >
              New password
            </label>

            <div className="relative">
              <Input
                id="recovery-new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                className="h-11 rounded-xl bg-background/70 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            <PasswordStrengthMeter password={newPassword} />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="recovery-confirm-password"
              className="block text-sm font-medium leading-none text-foreground"
            >
              Confirm new password
            </label>

            <div className="relative">
              <Input
                id="recovery-confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                className="h-11 rounded-xl bg-background/70 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {confirmPassword && newPassword !== confirmPassword ? (
              <p className="text-xs text-destructive">Passwords do not match.</p>
            ) : null}
          </div>

          {/* Requirement checklist, so the rules are visible before submitting. */}
          <ul className="space-y-1">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(newPassword);

              return (
                <li
                  key={rule.message}
                  className={`flex items-center gap-2 text-xs ${
                    met ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {met ? (
                    <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <span
                      className="size-3.5 shrink-0 rounded-full border border-current"
                      aria-hidden="true"
                    />
                  )}
                  {rule.message}
                </li>
              );
            })}
          </ul>

          {resetError ? (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              {resetError}
            </motion.p>
          ) : null}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl bg-background/60"
              onClick={goBack}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Button>

            <Button
              type="submit"
              className="h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-brand-blue shadow-lg shadow-primary/25"
              disabled={passwordIssues > 0}
            >
              <KeyRound className="size-4" aria-hidden="true" />
              Set new password
            </Button>
          </div>
        </form>
      ) : null}
    </motion.div>
  );
}

