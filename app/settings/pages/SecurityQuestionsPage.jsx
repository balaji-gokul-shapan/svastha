"use client";

/**
 * SECURITY QUESTIONS
 * ------------------
 * Set-up screen for the account recovery questions.
 *
 * PERSISTENCE IS A PLACEHOLDER. There is no security-questions endpoint in the
 * app yet, so answers are written to `localStorage` to make the UI usable
 * while the backend is built. Two consequences you must handle before this
 * ships:
 *
 *   1. localStorage is plaintext. A real implementation must hash answers
 *      server-side, exactly like a password.
 *   2. Storing answers under a single shared key leaks one user's answers to
 *      another on the same browser, so the key is namespaced per employee id.
 *
 * When the API lands, replace `loadAnswers` / `saveAnswers` with a
 * `useQuery` + dispatch and delete the localStorage helpers — nothing else in
 * this file needs to change.
 */

import React, { useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReusableSelect from "@/components/ui/reusable-select";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/hooks";
import { selectAuthUser } from "@/lib/features/auth-slice";
import {
  MIN_ANSWER_LENGTH,
  QUESTION_BANK,
  REQUIRED_ANSWERS,
  clearAnswers,
  makeAnswerStore,
  normaliseAnswer,
  parseAnswers,
  writeAnswers,
} from "@/lib/security-questions";

/** Answers must be distinct — two identical answers halve the second factor. */

export default function SecurityQuestionsPage() {
  const user = useAppSelector(selectAuthUser);
  const userId = user?.emp_id ?? user?.user_name ?? user?.username ?? "";

  // The store is rebuilt only when the employee changes, so the hook does not
  // re-subscribe on every render.
  const store = useMemo(() => makeAnswerStore(userId), [userId]);
  const rawAnswers = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const saved = useMemo(() => parseAnswers(rawAnswers), [rawAnswers]);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const questionOptions = useMemo(
    () =>
      QUESTION_BANK.map((question, index) => ({
        value: String(index),
        label: question,
      })),
    [],
  );

  const isConfigured = saved.length >= REQUIRED_ANSWERS;
  const progress = Math.min(
    100,
    Math.round((saved.length / REQUIRED_ANSWERS) * 100),
  );

  const startSetup = () => {
    setDraft(
      Array.from({ length: REQUIRED_ANSWERS }, () => ({
        question: "",
        answer: "",
      })),
    );
    setShowAnswers(false);
    setIsEditing(true);
  };

  const updateDraft = (index, patch) => {
    setDraft((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  /**
   * Validation runs before the save so the user gets every problem at once
   * rather than one toast per attempt.
   */
  const validate = () => {
    const chosen = draft.map((row) => normaliseAnswer(row.question));
    const answers = draft.map((row) => normaliseAnswer(row.answer));

    if (chosen.some((value) => !value)) {
      return "Choose a question for each row.";
    }

    if (new Set(chosen).size !== chosen.length) {
      return "Pick two different questions.";
    }

    if (answers.some((value) => value.length < MIN_ANSWER_LENGTH)) {
      return `Each answer must be at least ${MIN_ANSWER_LENGTH} characters.`;
    }

    if (new Set(answers).size !== answers.length) {
      return "Use two different answers — identical ones weaken the check.";
    }

    return "";
  };

  const handleSave = () => {
    const error = validate();

    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);

    const entries = draft.map((row) => ({
      question: QUESTION_BANK[Number(row.question)] ?? row.question,
      answer: row.answer.trim(),
    }));

    // The shared store returns false when storage is blocked (private mode),
    // so the failure is surfaced instead of silently losing the answers.
    if (!writeAnswers(userId, entries)) {
      toast.error("Could not save. Your browser is blocking local storage.");
      setIsSaving(false);
      return;
    }

    setDraft([]);
    setIsEditing(false);
    setIsSaving(false);
    toast.success("Security questions saved.");
  };

  const handleRemove = () => {
    clearAnswers(userId);
    setDraft([]);
    setIsEditing(false);
    setShowAnswers(false);
    toast.success("Security questions removed.");
  };

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Security questions
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              These questions are used to verify your identity if you ever
              forget your password. Pick {REQUIRED_ANSWERS} questions and answer
              both.
            </p>
          </div>
        </div>
      </header>


      {/* ---------------- Setup form ---------------- */}
      {isEditing ? (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <HelpCircle className="size-4 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground">
              Answer {REQUIRED_ANSWERS} questions
            </h3>
          </div>

          <div className="space-y-4">
            {draft.map((row, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-muted/20 p-4"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Question {index + 1}
                </p>

                <ReusableSelect
                  label="Security question"
                  options={questionOptions}
                  value={row.question}
                  onChange={(value) =>
                    updateDraft(index, { question: String(value ?? "") })
                  }
                  placeholder="Select a question"
                  searchPlaceholder="Search questions..."
                />

                <div className="mt-3 space-y-1.5">
                  <label
                    htmlFor={`security-answer-${index}`}
                    className="text-sm font-medium text-foreground"
                  >
                    Your answer
                  </label>

                  <Input
                    id={`security-answer-${index}`}
                    name={`security_answer_${index}`}
                    value={row.answer}
                    onChange={(event) =>
                      updateDraft(index, { answer: event.target.value })
                    }
                    placeholder="Enter your answer"
                    autoComplete="off"
                    disabled={isSaving}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Guidance, not decoration: these are the two mistakes that make
              recovery questions useless in practice. */}
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-warning-foreground"
              aria-hidden="true"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Use answers only you would know, and do not reuse your login
              password. Avoid facts that are public on social media.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setDraft([]);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save answers"}
            </Button>
          </div>
        </div>
      ) : null}


      {/* ---------------- Configured state ---------------- */}
      {!isEditing && isConfigured ? (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-foreground">
                Questions configured
              </h3>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAnswers((prev) => !prev)}
              aria-pressed={showAnswers}
            >
              {showAnswers ? (
                <>
                  <EyeOff className="size-3.5" aria-hidden="true" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="size-3.5" aria-hidden="true" />
                  Show
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {saved.map((entry, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-muted/20 p-3"
              >
                <p className="text-xs font-semibold text-foreground">
                  {entry.question}
                </p>
                {/* Answers stay masked by default — a shoulder-surfer should
                    not be able to read the recovery factor off the screen. */}
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  {showAnswers ? entry.answer : "••••••••"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={startSetup}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit answers
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleRemove}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Remove
            </Button>
          </div>
        </div>
      ) : null}


      {/* ---------------- Empty / partial state ---------------- */}
      {!isEditing && !isConfigured ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>

          <p className="mt-4 text-sm font-semibold text-foreground">
            {saved.length > 0
              ? `${saved.length} of ${REQUIRED_ANSWERS} questions answered`
              : "No security questions set"}
          </p>

          <p className="mx-auto mt-1 max-w-2/3 text-xs leading-5 text-muted-foreground">
            {saved.length > 0
              ? "Finish setting up to make password recovery work."
              : "Set up your security questions so we can verify your identity if you forget your password."}
          </p>

          {/* Progress bar doubles as the "how much is left" indicator. */}
          <div className="mx-auto mt-4 max-w-xs">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button type="button" className="mt-5" onClick={startSetup}>
            <ShieldCheck className="size-4" aria-hidden="true" />
            {saved.length > 0 ? "Finish setup" : "Set up now"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

