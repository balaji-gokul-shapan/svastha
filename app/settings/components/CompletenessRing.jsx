"use client";

const TONE_STROKE = {
  success: "stroke-success",
  warning: "stroke-warning",
  destructive: "stroke-destructive",
  info: "stroke-info",
};
const TONE_FILL = {
  success: "fill-success",
  warning: "fill-warning",
  destructive: "fill-destructive",
  info: "fill-info",
};

export function CompletenessRing({ percent, size = 88, strokeWidth = 7 }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);
  const tone = clamped === 100 ? "success" : clamped >= 50 ? "info" : "warning";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-muted" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className={TONE_STROKE[tone]}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className={`${TONE_FILL[tone]} font-bold`} style={{ fontSize: size * 0.24 }}>
        {clamped}%
      </text>
    </svg>
  );
}
