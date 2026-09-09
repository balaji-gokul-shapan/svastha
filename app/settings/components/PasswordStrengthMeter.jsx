"use client";

const LEVELS = [
  { label: "Very Weak", tone: "destructive" },
  { label: "Weak", tone: "destructive" },
  { label: "Fair", tone: "warning" },
  { label: "Good", tone: "info" },
  { label: "Strong", tone: "success" },
];

const TONE_BAR = {
  destructive: "bg-destructive",
  warning: "bg-warning",
  info: "bg-info",
  success: "bg-success",
};
const TONE_TEXT = {
  destructive: "text-destructive",
  warning: "text-warning-foreground",
  info: "text-info",
  success: "text-success",
};

export function scorePassword(pw) {
  if (!pw) return { score: 0, ...LEVELS[0] };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return { score, ...LEVELS[score] };
}

export function PasswordStrengthMeter({ password }) {
  const { score, label, tone } = scorePassword(password);

  return (
    <div>
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? TONE_BAR[tone] : "bg-muted"}`} />
        ))}
      </div>
      <p className={`mt-1.5 text-xs font-medium ${password ? TONE_TEXT[tone] : "text-muted-foreground"}`}>
        {password ? label : "Enter a password to see its strength"}
      </p>
    </div>
  );
}
