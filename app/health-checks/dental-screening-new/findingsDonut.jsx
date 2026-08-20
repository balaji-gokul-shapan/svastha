"use client";

const R = 62;
const CIRC = 2 * Math.PI * R;
const STROKE = 20;

const SEGMENTS = [
  { key: "healthy_count", label: "Healthy", strokeClass: "stroke-success" },
  { key: "caries_count", label: "Caries", strokeClass: "stroke-destructive" },
  { key: "other_issues_count", label: "Other Issues", strokeClass: "stroke-warning" },
  { key: "missing_count", label: "Missing", strokeClass: "stroke-muted-foreground/50" },
];

export function FindingsDonut({ report }) {
  const total = SEGMENTS.reduce((sum, seg) => sum + (Number(report[seg.key]) || 0), 0);

  let cumulative = 0;
  const segments = SEGMENTS.map((seg) => {
    const value = Number(report[seg.key]) || 0;
    const fraction = total > 0 ? value / total : 0;
    const length = fraction * CIRC;
    const offset = cumulative;
    cumulative += length;
    return { ...seg, value, length, offset };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={R} fill="none" className="stroke-muted" strokeWidth={STROKE} />
          {segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <circle
                key={s.key}
                cx="80"
                cy="80"
                r={R}
                fill="none"
                className={s.strokeClass}
                strokeWidth={STROKE}
                strokeDasharray={`${s.length} ${CIRC - s.length}`}
                strokeDashoffset={-s.offset}
                transform="rotate(-90 80 80)"
                strokeLinecap="butt"
              />
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold text-foreground">{total}</p>
          <p className="text-[11px] text-muted-foreground">Teeth Assessed</p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-2.5">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className={`size-2.5 shrink-0 rounded-full ${s.strokeClass.replace("stroke-", "bg-")}`} />
            <span className="text-sm text-foreground">{s.label}</span>
            <span className="ml-auto text-sm font-semibold text-foreground">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}