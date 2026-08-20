// Helpers for rendering the Dental Assessment Report — mapping raw string/
// numeric field values from the API onto the app's success/info/warning/
// destructive tone tokens.

const POSITIVE_VALUES = ["none", "normal", "healthy", "good"];
const CAUTION_VALUES = ["mild"];
const CONCERN_VALUES = ["moderate"];
// "severe", "poor", "present" (and anything not otherwise matched with
// those substrings) read as the most serious tier.

export function findingTone(value) {
  const v = (value ?? "").toLowerCase().trim();
  if (POSITIVE_VALUES.includes(v)) return "success";
  if (CAUTION_VALUES.includes(v)) return "info";
  if (CONCERN_VALUES.includes(v)) return "warning";
  if (["severe", "poor", "present"].some((n) => v.includes(n))) return "destructive";
  return "muted";
}

export function referralGradeTone(grade) {
  const g = (grade ?? "").toUpperCase().trim();
  if (g === "A") return "success";
  if (g === "B") return "info";
  if (g === "C") return "warning";
  return "destructive"; // D, F, or anything else
}

// risk_score / severity_score are assumed 0–5 (adjust MAX_SCORE if your
// actual scale differs).
export const MAX_SCORE = 5;

export function scoreTone(score) {
  if (score <= 1) return "success";
  if (score <= 3) return "warning";
  return "destructive";
}

export const TONE_BADGE_CLASS = {
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
  warning: "bg-warning/20 text-warning-foreground",
  destructive: "bg-destructive/15 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

export const TONE_BAR_CLASS = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}