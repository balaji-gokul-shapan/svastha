"use client";

import * as React from "react";
import {
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Baby,
  BookOpen,
  ChartColumn,
  ChevronDown,
  ClipboardCheck,
  Ear,
  Eye,
  HeartPulse,
  ListOrdered,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  Users,
  Venus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import SchoolInsightsCharts from "./SchoolInsightsCharts";

// All styling lives in its own file. In the Next.js App Router you can import
// it here. With the Pages Router, move this import into pages/_app.js.
import "../style/style.css";

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */

const numberValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) => numberValue(value).toLocaleString("en-IN");

// Whole-number percentage, clamped to 100.
const percentOf = (part, whole) =>
  whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;

// Like percentOf, but shows "<1%" instead of a misleading "0%" for small values.
const percentLabel = (part, whole) => {
  if (!whole || !part) return "0%";
  const raw = (part / whole) * 100;
  return raw < 1 ? "<1%" : `${Math.round(raw)}%`;
};

const SCREENING_ICONS = {
  General: HeartPulse,
  Vision: Eye,
  Dental: Smile,
  Hearing: Ear,
  ENT: Stethoscope,
};

// A distinct, accessible accent tone per screening type (mapped in style.css
// via the data-tone attribute → --tone / --tone-soft tokens).
const SCREENING_TONES = {
  General: "violet",
  Vision: "blue",
  Dental: "teal",
  Hearing: "amber",
  ENT: "indigo",
};

const EASE = [0.22, 1, 0.36, 1];

const unwrapSummary = (value) => {
  let summary = value;
  for (let depth = 0; depth < 3; depth += 1) {
    if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
      return null;
    }

    if (
      summary.students ||
      summary.screening_count ||
      summary.screening_data ||
      summary.current_screening_status ||
      summary.referral_count ||
      summary.follow_up_status ||
      summary.women_special
    ) {
      return summary;
    }

    // Also accept a student-only payload, e.g. data.students, when the caller
    // does not have the sibling screening summary fields.
    if (
      summary.total !== undefined &&
      (summary.age_wise || summary.gender_wise || summary.class_wise)
    ) {
      return { students: summary };
    }

    summary = summary.data ?? summary.summary;
  }
  return null;
};

// School order: Pre-KG, LKG, UKG, then 1 to 12. A plain alphabetical sort puts
// "LKG" after "12", which reads wrong to anyone who works in a school.
const classRank = (label) => {
  const text = String(label ?? "")
    .trim()
    .toLowerCase();
  if (/^(nursery|pre[\s-]*kg|pkg|play)/.test(text)) return [0, 0];
  if (/^lkg/.test(text)) return [1, 0];
  if (/^ukg/.test(text)) return [2, 0];
  const digits = parseInt(text.replace(/[^0-9]/g, ""), 10);
  if (Number.isFinite(digits)) return [3, digits];
  return [4, 0];
};

const compareClasses = (left, right) => {
  const [leftGroup, leftNumber] = classRank(left?.class);
  const [rightGroup, rightNumber] = classRank(right?.class);
  return (
    leftGroup - rightGroup ||
    leftNumber - rightNumber ||
    String(left?.class ?? "").localeCompare(
      String(right?.class ?? ""),
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      },
    )
  );
};

const classTitle = (label) =>
  /^\d+$/.test(String(label)) ? `Class ${label}` : String(label);

const ageSortKey = (key) => (key === "unknown" ? 9999 : parseInt(key, 10) || 0);

// Spreads `total` dots across categories so the counts always add up exactly
// (largest-remainder method). Used for the 10 x 10 gender grid.
const allocateDots = (values, total = 100) => {
  const sum = values.reduce((a, b) => a + b, 0);
  if (!sum) return values.map(() => 0);
  const raw = values.map((value) => (value / sum) * total);
  const floors = raw.map(Math.floor);
  let remaining = total - floors.reduce((a, b) => a + b, 0);
  const byRemainder = raw
    .map((value, index) => ({ index, remainder: value - floors[index] }))
    .sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; remaining > 0 && i < byRemainder.length; i += 1) {
    floors[byRemainder[i].index] += 1;
    remaining -= 1;
  }
  return floors;
};

// Returns a function that builds a transition. Honours "reduce motion".
function useMotionTiming() {
  const reduce = useReducedMotion();
  return React.useCallback(
    (delay = 0, duration = 0.7) =>
      reduce ? { duration: 0 } : { duration, delay, ease: EASE },
    [reduce],
  );
}

/* -------------------------------------------------------------------------
   Small building blocks
   ------------------------------------------------------------------------- */

function AnimatedNumber({ value, suffix = "", className = "" }) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const text = useTransform(
    motionValue,
    (latest) => `${formatNumber(Math.round(latest))}${suffix}`,
  );

  React.useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return undefined;
    }
    const controls = animate(motionValue, value, { duration: 0.9, ease: EASE });
    return () => controls.stop();
  }, [value, reduce, motionValue]);

  return <motion.span className={cn(className)}>{text}</motion.span>;
}

function PanelHeading({ icon: Icon, tone, title, subtitle }) {
  return (
    <div className="school-insights__heading">
      <span className="school-insights__icon" data-tone={tone}>
        <Icon aria-hidden="true" />
      </span>
      <div>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
  );
}

function Legend({ parts, total, hideZero = false }) {
  const rows = hideZero ? parts.filter((part) => part.value > 0) : parts;
  return (
    <ul className="school-insights__legend py-2">
      {rows.map((part) => (
        <li key={part.label} data-tone={part.tone}>
          <span className="school-insights__swatch" aria-hidden="true" />
          <span className="school-insights__legend-label">{part.label}</span>
          <strong>{formatNumber(part.value)}</strong>
          <span className="school-insights__legend-pct">
            {percentLabel(part.value, total)}
          </span>
        </li>
      ))}
    </ul>
  );
}

// One bar split into segments, with a legend that shows the exact numbers.
function SplitBar({ parts, emptyText = "Nothing recorded yet." }) {
  const timing = useMotionTiming();
  const total = parts.reduce((sum, part) => sum + part.value, 0);

  if (!total) return <p className="school-insights__empty">{emptyText}</p>;

  return (
    <div className="school-insights__split">
      <div
        className="school-insights__split-bar"
        role="img"
        aria-label={parts
          .map((part) => `${part.label} ${formatNumber(part.value)}`)
          .join(", ")}
      >
        {parts
          .filter((part) => part.value > 0)
          .map((part, index) => (
            <motion.span
              key={part.label}
              data-tone={part.tone}
              className="school-insights__split-seg"
              initial={{ width: 0 }}
              animate={{ width: `${(part.value / total) * 100}%` }}
              transition={timing(index * 0.08)}
            />
          ))}
      </div>
      <Legend parts={parts} total={total} />
    </div>
  );
}

function MeterBar({ label, value, max, tone }) {
  const timing = useMotionTiming();
  const percent = percentOf(value, max);
  return (
    <div className="school-insights__meter" data-tone={tone}>
      <div className="school-insights__meter-top">
        <span>{label}</span>
        <strong>{percent}%</strong>
      </div>
      <div
        className="school-insights__meter-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${formatNumber(value)} of ${formatNumber(max)}`}
      >
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={timing()}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   1. Coverage hero: segmented ring + key figures that highlight each other
   ------------------------------------------------------------------------- */

const RING = { center: 100, radius: 80, stroke: 18, gap: 0.012 };

function CoverageHero({
  totalStudents,
  screened,
  pending,
  unknown,
  followUps,
  insight,
}) {
  const timing = useMotionTiming();
  const [active, setActive] = React.useState(null);

  const percent = percentOf(screened, totalStudents);
  const base = Math.max(totalStudents, screened + pending + unknown);

  const segments = [
    { key: "screened", value: screened, tone: "green" },
    { key: "pending", value: pending, tone: "indigo" },
    { key: "unknown", value: unknown, tone: "slate" },
  ];
  let cursor = 0;
  const arcs = segments.map((segment) => {
    const share = base ? segment.value / base : 0;
    const arc = { ...segment, share, start: cursor };
    cursor += share;
    return arc;
  });

  const figures = [
    {
      label: "Total students",
      value: totalStudents,
      detail: "Enrolled across this school",
      tone: "blue",
    },
    {
      label: "Screened",
      value: screened,
      detail: `${percent}% of enrolled students`,
      tone: "green",
      link: "screened",
    },
    {
      label: "Waiting for screening",
      value: pending,
      detail: "Students still to be checked",
      tone: "indigo",
      link: "pending",
    },
    {
      label: "Need follow-up",
      value: followUps,
      detail: "Latest result needs attention",
      tone: "amber",
    },
  ];
  if (unknown > 0) {
    figures.push({
      label: "Status unknown",
      value: unknown,
      detail: "Records with no status",
      tone: "slate",
      link: "unknown",
    });
  }

  return (
    <section
      className="school-insights__panel school-insights__hero"
      aria-label="Screening coverage"
    >
      <div className="school-insights__ring">
        <svg
          viewBox="0 0 200 200"
          role="img"
          aria-label={`${percent}% of students screened: ${formatNumber(screened)} of ${formatNumber(totalStudents)}`}
        >
          <circle
            className="school-insights__ring-track"
            cx={RING.center}
            cy={RING.center}
            r={RING.radius}
            fill="none"
            strokeWidth={RING.stroke}
          />
          <g transform={`rotate(-90 ${RING.center} ${RING.center})`}>
            {arcs
              .filter((arc) => arc.share > 0)
              .map((arc, index) => {
                const length = Math.max(arc.share - RING.gap, 0.004);
                const offset = arc.start + RING.gap / 2;
                return (
                  <motion.circle
                    key={arc.key}
                    className="school-insights__ring-arc"
                    data-tone={arc.tone}
                    cx={RING.center}
                    cy={RING.center}
                    r={RING.radius}
                    fill="none"
                    strokeWidth={RING.stroke}
                    initial={{ pathLength: 0, pathOffset: offset, opacity: 1 }}
                    animate={{
                      pathLength: length,
                      pathOffset: offset,
                      opacity: active && active !== arc.key ? 0.22 : 1,
                    }}
                    transition={{
                      pathLength: timing(index * 0.15, 0.9),
                      opacity: { duration: 0.2 },
                    }}
                  />
                );
              })}
          </g>
        </svg>
        <div className="school-insights__ring-center">
          <strong>
            <AnimatedNumber className="text-xl!" value={percent} suffix="%" />
          </strong>
          <span>screened</span>
        </div>
      </div>

      <div className="school-insights__hero-body">
        <dl className="school-insights__figures">
          {figures.map((figure) => {
            const linked = Boolean(figure.link);
            return (
              <div
                key={figure.label}
                className="school-insights__figure"
                data-tone={figure.tone}
                data-linked={linked ? "true" : undefined}
                tabIndex={linked ? 0 : undefined}
                onMouseEnter={linked ? () => setActive(figure.link) : undefined}
                onMouseLeave={linked ? () => setActive(null) : undefined}
                onFocus={linked ? () => setActive(figure.link) : undefined}
                onBlur={linked ? () => setActive(null) : undefined}
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <dt className="text-sm font-medium break-words">
                      {figure.label}
                    </dt>
                    <dd className="text-sm text-muted-foreground">
                      <span>{figure.detail}</span>
                    </dd>
                  </div>

                  <strong className="shrink-0 text-right">
                    <AnimatedNumber
                      className="text-xl font-semibold tabular-nums"
                      value={figure.value}
                    />
                  </strong>
                </div>
              </div>
            );
          })}
        </dl>
        <p className="school-insights__insight">
          <Sparkles aria-hidden="true" />
          <span>{insight}</span>
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   2. Class pyramid: boys on the left, girls on the right, tap to see sections
   ------------------------------------------------------------------------- */

function ClassPyramid({ rows }) {
  const timing = useMotionTiming();
  const [openKey, setOpenKey] = React.useState(null);
  const [hoverKey, setHoverKey] = React.useState(null);

  const items = React.useMemo(
    () =>
      rows.map((row) => {
        const sections = Array.isArray(row?.sections)
          ? row.sections.map((section) => ({
              name: section?.section || "—",
              male: numberValue(section?.male),
              female: numberValue(section?.female),
            }))
          : [];
        const sectionMale = sections.reduce((sum, s) => sum + s.male, 0);
        const sectionFemale = sections.reduce((sum, s) => sum + s.female, 0);
        const fromSections = sectionMale + sectionFemale > 0;
        const male = fromSections ? sectionMale : numberValue(row?.male);
        const female = fromSections ? sectionFemale : numberValue(row?.female);
        return {
          key: String(row?.class ?? "—"),
          label: String(row?.class || "—"),
          male,
          female,
          total: male + female,
          sections,
        };
      }),
    [rows],
  );

  const maxSide = Math.max(
    1,
    ...items.map((item) => Math.max(item.male, item.female)),
  );
  const totals = items.reduce(
    (sum, item) => ({
      male: sum.male + item.male,
      female: sum.female + item.female,
    }),
    { male: 0, female: 0 },
  );
  const focus = items.find((item) => item.key === hoverKey);
 const readout = focus
  ? {
      title: classTitle(focus.label),
      male: focus.male,
      female: focus.female,
      total: focus.total,
    }
  : {
      title: "All classes",
      male: totals.male,
      female: totals.female,
      total: totals.male + totals.female,
    };
  return (
    <section className="school-insights__panel" data-tone="blue">
      <PanelHeading
        icon={BookOpen}
        tone="blue"
        title="Students by class"
        subtitle="Boys on the left, girls on the right. Select a class to see its sections."
      />

      {items.length ? (
        <>
          <div className="school-insights__readout" aria-live="polite">
            <div className="space-y-3 w-full">
              <h3 className="text-sm font-semibold text-foreground">
                {readout.title}
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-center dark:bg-blue-950/30">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Boys
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-blue-700 dark:text-blue-300">
                    {formatNumber(readout.male)}
                  </p>
                </div>

                <div className="rounded-xl bg-pink-50 p-3 text-center dark:bg-pink-950/30">
                  <p className="text-xs font-medium text-pink-600 dark:text-pink-400">
                    Girls
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-pink-700 dark:text-pink-300">
                    {formatNumber(readout.female)}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950/30">
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Total Students
                  </p>
                  <p className="text-2xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                    {formatNumber(readout.total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="school-insights__pyramid-key" aria-hidden="true">
            <span data-tone="blue">
              <i className="school-insights__swatch" /> Boys
            </span>
            <span data-tone="pink">
              Girls <i className="school-insights__swatch" />
            </span>
          </div>
          <ul
            className="school-insights__pyramid"
            onMouseLeave={() => setHoverKey(null)}
          >
            {items.map((item, index) => {
              const isOpen = openKey === item.key;
              const malePct = (item.male / maxSide) * 100;
              const femalePct = (item.female / maxSide) * 100;
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    className="school-insights__class-row"
                    aria-expanded={item.sections.length ? isOpen : undefined}
                    aria-label={`${classTitle(item.label)}: ${formatNumber(item.male)} boys, ${formatNumber(item.female)} girls`}
                    onClick={() => setOpenKey(isOpen ? null : item.key)}
                    onMouseEnter={() => setHoverKey(item.key)}
                    onFocus={() => setHoverKey(item.key)}
                    onBlur={() => setHoverKey(null)}
                  >
                    <span className="school-insights__num school-insights__num--male">
                      {formatNumber(item.male)}
                    </span>
                    <span className="school-insights__pyr-track school-insights__pyr-track--male">
                      <motion.i
                        data-tone="blue"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${item.male ? Math.max(malePct, 2) : 0}%`,
                        }}
                        transition={timing(index * 0.03)}
                      />
                    </span>
                    <span className="school-insights__class-name">
                      {item.label}
                    </span>
                    <span className="school-insights__pyr-track school-insights__pyr-track--female">
                      <motion.i
                        data-tone="pink"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${item.female ? Math.max(femalePct, 2) : 0}%`,
                        }}
                        transition={timing(index * 0.03)}
                      />
                    </span>
                    <span className="school-insights__num">
                      {formatNumber(item.female)}
                    </span>
                    <span className="school-insights__class-total">
                      {formatNumber(item.total)}
                    </span>
                    <ChevronDown
                      className="school-insights__chevron"
                      data-hidden={item.sections.length ? undefined : "true"}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && item.sections.length ? (
                    <div className="school-insights__sections">
                      {item.sections.map((section) => (
                        <span
                          className="school-insights__section-chip"
                          key={`${item.key}-${section.name}`}
                        >
                          <b>Section {section.name}</b>
                          <span data-tone="blue">
                            {formatNumber(section.male)} boys
                          </span>
                          <span data-tone="pink">
                            {formatNumber(section.female)} girls
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="school-insights__empty">
          No class or section totals are available.
        </p>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------
   3. Gender waffle (1 dot = 1%) and age columns
   ------------------------------------------------------------------------- */

function GenderPanel({ gender }) {
  const parts = [
    { label: "Male", value: numberValue(gender?.male), tone: "blue" },
    { label: "Female", value: numberValue(gender?.female), tone: "pink" },
    { label: "Other", value: numberValue(gender?.other), tone: "teal" },
    { label: "Unknown", value: numberValue(gender?.unknown), tone: "slate" },
  ];
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  const dots = allocateDots(parts.map((part) => part.value));
  const cells = parts.flatMap((part, index) =>
    Array.from({ length: dots[index] }, () => part.tone),
  );

  return (
    <section className="school-insights__panel" data-tone="blue">
      <PanelHeading
        icon={Users}
        tone="blue"
        title="Gender mix"
        subtitle={
          total ? `${formatNumber(total)} students. Each dot is 1%.` : undefined
        }
      />
      {total ? (
        <div className="school-insights__gender">
          <div
            className="school-insights__waffle"
            role="img"
            aria-label={parts
              .filter((part) => part.value > 0)
              .map((part) => `${part.label} ${percentLabel(part.value, total)}`)
              .join(", ")}
          >
            {cells.map((tone, index) => (
              <span key={index} data-tone={tone} style={{ "--i": index }} />
            ))}
          </div>
          <Legend parts={parts} total={total} hideZero />
        </div>
      ) : (
        <p className="school-insights__empty">No gender data recorded yet.</p>
      )}
    </section>
  );
}

function AgePanel({ ageGroups }) {
  const timing = useMotionTiming();
  const rows = Object.entries(ageGroups ?? {})
    .map(([key, value]) => ({
      key,
      label: key === "unknown" ? "Unknown" : key,
      value: numberValue(value),
    }))
    .sort((a, b) => ageSortKey(a.key) - ageSortKey(b.key));
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <section className="school-insights__panel" data-tone="violet">
      <PanelHeading
        icon={Baby}
        tone="violet"
        title="Age groups"
        subtitle={
          total
            ? `${formatNumber(total)} students, grouped by age in years`
            : undefined
        }
      />
      {total ? (
        <div className="school-insights__age">
          {rows.map((row, index) => (
            <div
              className="school-insights__age-col"
              key={row.key}
              title={`${row.label}${row.key === "unknown" ? "" : " years"}: ${formatNumber(row.value)} students`}
            >
              <div className="school-insights__age-plot">
                <span className="school-insights__age-value">
                  {formatNumber(row.value)}
                </span>
                <motion.span
                  className="school-insights__age-bar"
                  initial={{ height: 0 }}
                  animate={{
                    height: `${Math.round((row.value / max) * 100)}px`,
                  }}
                  transition={timing(index * 0.05)}
                />
              </div>
              <span className="school-insights__age-label">{row.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="school-insights__empty">No age data recorded yet.</p>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------
   4. Health-area explorer: pick an area on the left, read its detail on the right
   ------------------------------------------------------------------------- */

function HealthAreas({ areas, totalStudents }) {
  const timing = useMotionTiming();
  const [selectedName, setSelectedName] = React.useState(null);

  const recordTotal = areas.reduce((sum, area) => sum + area.count, 0);
  const activeCount = areas.filter((area) => area.count > 0).length;
  const fallback = areas.find((area) => area.count > 0) ?? areas[0];
  const current = areas.find((area) => area.name === selectedName) ?? fallback;

  if (!current) {
    return (
      <section className="school-insights__panel" data-tone="green">
        <PanelHeading
          icon={ClipboardCheck}
          tone="green"
          title="Screening by health area"
        />
        <p className="school-insights__empty">
          No screening type totals are available.
        </p>
      </section>
    );
  }

  const CurrentIcon = SCREENING_ICONS[current.name] ?? Activity;

  return (
    <section className="school-insights__panel" data-tone="green">
      <PanelHeading
        icon={ClipboardCheck}
        tone="green"
        title="Screening by health area"
        subtitle={`${activeCount} of ${areas.length} areas active, ${formatNumber(recordTotal)} screening records. Select an area for details.`}
      />
      <div className="school-insights__areas-body">
        <ul className="school-insights__area-list" aria-label="Health areas">
          {areas.map((area, index) => {
            const AreaIcon = SCREENING_ICONS[area.name] ?? Activity;
            const percent = percentOf(area.count, totalStudents);
            return (
              <li key={area.name}>
                <button
                  type="button"
                  className="school-insights__area"
                  aria-pressed={area.name === current.name}
                  data-empty={area.count ? undefined : "true"}
                  data-tone={SCREENING_TONES[area.name] ?? "green"}
                  onClick={() => setSelectedName(area.name)}
                >
                  <span className="school-insights__area-icon">
                    <AreaIcon aria-hidden="true" />
                  </span>
                  <span className="school-insights__area-main">
                    <span className="school-insights__area-name">
                      {area.name}
                    </span>
                    <span className="school-insights__area-track">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={timing(index * 0.05)}
                      />
                    </span>
                  </span>
                  <span className="school-insights__area-count">
                    <strong>{formatNumber(area.count)}</strong>
                    <small>
                      {area.count ? `${percent}% of students` : "Not started"}
                    </small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div
          className="school-insights__area-detail"
          aria-live="polite"
          data-tone={SCREENING_TONES[current.name] ?? "green"}
        >
          <div className="school-insights__area-detail-head">
            <span className="school-insights__area-icon school-insights__area-icon--lg">
              <CurrentIcon aria-hidden="true" />
            </span>
            <div>
              <h4>{current.name} screening</h4>
              <p>
                {formatNumber(current.count)} of {formatNumber(totalStudents)}{" "}
                students
              </p>
            </div>
          </div>

          <MeterBar
            label="Students screened"
            value={current.count}
            max={totalStudents}
            tone="green"
          />

          <div>
            <p className="school-insights__subhead">Results</p>
            <SplitBar
              parts={[
                { label: "Good", value: current.good, tone: "green" },
                {
                  label: "Needs follow-up",
                  value: current.followUp,
                  tone: "amber",
                },
              ]}
              emptyText="No results recorded for this area yet."
            />
          </div>

          <div>
            <p className="school-insights__subhead">Referrals</p>
            <div className="school-insights__referrals" data-tone="red">
              <div className="school-insights__referral-total">
                <span
                  className="school-insights__referral-badge"
                  aria-hidden="true"
                >
                  <ArrowUpRight />
                </span>
                <span className="school-insights__referral-figure">
                  <strong>{formatNumber(current.referrals)}</strong>
                  <small>referred for further care</small>
                </span>
              </div>
              <ul className="school-insights__referral-split">
                {[
                  {
                    key: "male",
                    label: "Male",
                    value: current.referralMale,
                    tone: "blue",
                  },
                  {
                    key: "female",
                    label: "Female",
                    value: current.referralFemale,
                    tone: "pink",
                  },
                  {
                    key: "other",
                    label: "Other",
                    value: current.referralOther,
                    tone: "teal",
                  },
                ].map((part) => (
                  <li key={part.key} data-tone={part.tone}>
                    <span
                      className="school-insights__referral-dot"
                      aria-hidden="true"
                    />
                    <span className="school-insights__referral-label">
                      {part.label}
                    </span>
                    <strong>{formatNumber(part.value)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <dl className="school-insights__facts">
            <div>
              <dt>Need follow-up</dt>
              <dd>{formatNumber(current.followUp)}</dd>
            </div>
            <div>
              <dt>Share of all screening records</dt>
              <dd>{percentLabel(current.count, recordTotal)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   5. Care outcomes, referrals, women's health
   ------------------------------------------------------------------------- */

function CarePanel({ currentStatus, followUpStatus }) {
  return (
    <section className="school-insights__panel" data-tone="green">
      <PanelHeading
        icon={ShieldCheck}
        tone="green"
        title="Care outcomes"
        subtitle="Latest screening results and follow-ups"
      />
      <div className="school-insights__block">
        <p className="school-insights__subhead">Latest result</p>
        <SplitBar
          parts={[
            {
              label: "Good",
              value: numberValue(currentStatus?.Good),
              tone: "green",
            },
            {
              label: "Needs follow-up",
              value: numberValue(currentStatus?.["Need Follow up"]),
              tone: "amber",
            },
          ]}
          emptyText="No screening results yet."
        />
      </div>
      <div className="school-insights__block">
        <p className="school-insights__subhead">Follow-up progress</p>
        <SplitBar
          parts={[
            {
              label: "Completed",
              value: numberValue(followUpStatus?.completed),
              tone: "green",
            },
            {
              label: "Pending",
              value: numberValue(followUpStatus?.pending),
              tone: "amber",
            },
          ]}
          emptyText="No follow-ups have been raised."
        />
      </div>
    </section>
  );
}

function ScreeningCountPanel({ screeningDataCount }) {
  const total = numberValue(screeningDataCount?.total);
  return (
    <section className="school-insights__panel" data-tone="red">
      <PanelHeading
        icon={ArrowUpRight}
        tone="red"
        title="Screening Breakdown"
        subtitle="Students screened for various conditions"
      />
      <p className="school-insights__big" data-tone="red">
        <strong>
          <AnimatedNumber className="text-xl" value={total} />
        </strong>
        <span>students screened</span>
      </p>
      <SplitBar
        parts={[
          {
            label: "Completed",
            value: numberValue(screeningDataCount?.completed),
            tone: "blue",
          },
          {
            label: "Pending",
            value: numberValue(screeningDataCount?.pending),
            tone: "pink",
          },
          {
            label: "Unknown",
            value: numberValue(screeningDataCount?.unknown),
            tone: "teal",
          },
        ]}
        emptyText="No screenings have been recorded."
      />
    </section>
  );
}
function ReferralPanel({ referralCount }) {
  const total = numberValue(referralCount?.total);
  return (
    <section className="school-insights__panel" data-tone="red">
      <PanelHeading
        icon={ArrowUpRight}
        tone="red"
        title="Referrals"
        subtitle="Students referred for further care"
      />
      <p className="school-insights__big" data-tone="red">
        <strong>
          <AnimatedNumber className="text-xl" value={total} />
        </strong>
        <span>students referred</span>
      </p>
      <SplitBar
        parts={[
          {
            label: "Male",
            value: numberValue(referralCount?.male),
            tone: "blue",
          },
          {
            label: "Female",
            value: numberValue(referralCount?.female),
            tone: "pink",
          },
          {
            label: "Other",
            value: numberValue(referralCount?.other),
            tone: "teal",
          },
        ]}
        emptyText="No referrals have been recorded."
      />
    </section>
  );
}

function WomenPanel({ womenSpecial }) {
  const timing = useMotionTiming();
  const screened = numberValue(womenSpecial?.screened?.total);
  const withFinding = numberValue(womenSpecial?.screened?.with_finding);
  const findings = Object.values(womenSpecial?.findings ?? {})
    .map((finding) => ({
      label: finding?.label ?? "Finding",
      total: numberValue(finding?.total),
    }))
    .filter((finding) => finding.total > 0)
    .sort((a, b) => b.total - a.total);
  const shown = findings.slice(0, 4);
  const maxFinding = Math.max(1, ...shown.map((finding) => finding.total));

  return (
    <section className="school-insights__panel" data-tone="pink">
      <PanelHeading
        icon={Venus}
        tone="pink"
        title="Women's health"
        subtitle="Special screening activity"
      />
      {screened ? (
        <>
          <p className="school-insights__big" data-tone="pink">
            <strong>
              <AnimatedNumber className="text-xl" value={screened} />
            </strong>
            <span>screened</span>
          </p>
          <SplitBar
            parts={[
              { label: "With findings", value: withFinding, tone: "amber" },
              {
                label: "No findings",
                value: Math.max(screened - withFinding, 0),
                tone: "green",
              },
            ]}
          />
          {shown.length ? (
            <ul className="school-insights__findings">
              {shown.map((finding, index) => (
                <li key={finding.label}>
                  <span>{finding.label}</span>
                  <strong>{formatNumber(finding.total)}</strong>
                  <span className="school-insights__finding-track">
                    <motion.i
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(finding.total / maxFinding) * 100}%`,
                      }}
                      transition={timing(index * 0.06)}
                    />
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {findings.length > shown.length ? (
            <p className="school-insights__more">
              +{findings.length - shown.length} more finding types
            </p>
          ) : null}
        </>
      ) : (
        <p className="school-insights__empty">
          No women&apos;s health screening records yet.
        </p>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------------- */

export default function SchoolDashboardInsights({
  data,
  isLoading = false,
  error = null,
}) {
  const summary = React.useMemo(() => unwrapSummary(data), [data]);

  if (isLoading) {
    return (
      <section
        className="school-insights"
        aria-label="Loading school health insights"
        aria-busy="true"
      >
        <div className="school-insights__skeleton">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="school-insights school-insights__message"
        role="alert"
      >
        <Activity aria-hidden="true" />
        <div>
          <h2>School health insights are unavailable</h2>
          <p>{error.message || String(error)}</p>
        </div>
      </section>
    );
  }

  if (!summary) {
    return (
      <section className="school-insights school-insights__message">
        <ClipboardCheck aria-hidden="true" />
        <div>
          <h2>No health insights yet</h2>
          <p>
            Enrolment and screening figures will appear here once this school
            has student health data.
          </p>
        </div>
      </section>
    );
  }

  const studentSummary = summary?.students ?? {};
  const students = studentSummary?.students ?? studentSummary;
  const screeningCount =
    summary?.screening_count ?? studentSummary?.screening_count ?? {};
  const screeningData =
    summary?.screening_data ?? studentSummary?.screening_data ?? {};
  const byType = screeningData?.by_type ?? {};

  const classRows = Array.isArray(students?.class_wise)
    ? [...students.class_wise].sort(compareClasses)
    : [];

  const totalStudents = numberValue(students?.total);
  const screened = numberValue(
    screeningCount?.completed ?? screeningData?.total?.screened,
  );
  const pending = numberValue(screeningCount?.pending);
  const unknownScreening = numberValue(screeningCount?.unknown);
  const followUps = numberValue(
    summary?.follow_up_status?.pending ??
      summary?.current_screening_status?.["Need Follow up"],
  );

  const currentStatus =
    summary?.current_screening_status ??
    studentSummary?.current_screening_status ??
    {};
  const followUpStatus =
    summary?.follow_up_status ?? studentSummary?.follow_up_status ?? {};
  const referralCount =
    summary?.referral_count ?? studentSummary?.referral_count ?? {};
  const womenSpecial =
    summary?.women_special ??
    studentSummary?.women_special ??
    students?.women_special ??
    {};
  const screeningDataCount =
    summary?.screening_count ?? studentSummary?.screening_count ?? {};

  const areas = Object.entries(byType).map(([name, item]) => ({
    name,
    count: numberValue(item?.students ?? item?.count),
    referrals: numberValue(item?.referral?.total),
    referralMale: numberValue(item?.referral?.male),
    referralFemale: numberValue(item?.referral?.female),
    referralOther: numberValue(item?.referral?.other),
    good: numberValue(item?.status?.Good),
    followUp: numberValue(item?.status?.["Need Follow up"]),
  }));

  let insight = "Every student is up to date with screening.";
  if (pending && unknownScreening) {
    insight = `${formatNumber(pending)} students are waiting for screening; ${formatNumber(unknownScreening)} records have an unknown status.`;
  } else if (pending) {
    insight = `${formatNumber(pending)} students are still waiting for a screening.`;
  } else if (unknownScreening) {
    insight = `${formatNumber(unknownScreening)} records have an unknown screening status.`;
  }

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="school-insights"
        aria-labelledby="school-insights-title"
      >
        <header className="school-insights__header">
          <span className="school-insights__mark" aria-hidden="true">
            <HeartPulse />
          </span>
          <div>
            <h2 id="school-insights-title">Student wellness at a glance</h2>
            <p>Enrolment, screening coverage, and follow-up activity.</p>
          </div>
        </header>

        <Tabs
          defaultValue="numbers"
          className="school-insights__view-switch"
        >
          <TabsList
            aria-label="Dashboard view"
            className="school-insights__view-tabs"
          >
            <TabsTrigger
              value="numbers"
              id="school-insights-numbers-tab"
              aria-controls="school-insights-numbers"
              className="school-insights__view-tab"
            >
              <ListOrdered aria-hidden="true" />
              Numerical
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              id="school-insights-charts-tab"
              aria-controls="school-insights-charts"
              className="school-insights__view-tab"
            >
              <ChartColumn aria-hidden="true" />
              Graphical
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="numbers"
            id="school-insights-numbers"
            aria-labelledby="school-insights-numbers-tab"
            tabIndex={0}
            className="school-insights__tab-content"
          >
            <CoverageHero
              totalStudents={totalStudents}
              screened={screened}
              pending={pending}
              unknown={unknownScreening}
              followUps={followUps}
              insight={insight}
            />

            <div className="school-insights__grid school-insights__grid--people">
              <ClassPyramid rows={classRows} />
              <div className="school-insights__stack">
                <GenderPanel gender={students?.gender_wise} />
                <AgePanel ageGroups={students?.age_wise} />
              </div>
            </div>

            <HealthAreas areas={areas} totalStudents={totalStudents} />

            <div className="school-insights__grid school-insights__grid--care">
              <CarePanel
                currentStatus={currentStatus}
                followUpStatus={followUpStatus}
              />
              <ReferralPanel referralCount={referralCount} />
              <WomenPanel womenSpecial={womenSpecial} />
              <ScreeningCountPanel screeningDataCount={screeningDataCount} />
            </div>
          </TabsContent>

          <TabsContent
            value="charts"
            id="school-insights-charts"
            aria-labelledby="school-insights-charts-tab"
            tabIndex={0}
            className="school-insights__tab-content"
          >
            <SchoolInsightsCharts
              totalStudents={totalStudents}
              screened={screened}
              pending={pending}
              unknown={unknownScreening}
              followUps={followUps}
              classRows={classRows}
              gender={students?.gender_wise}
              ageGroups={students?.age_wise}
              areas={areas}
              currentStatus={currentStatus}
              followUpStatus={followUpStatus}
              referralCount={referralCount}
              womenSpecial={womenSpecial}
              screeningDataCount={screeningDataCount}
            />
          </TabsContent>
        </Tabs>
      </section>
    </MotionConfig>
  );
}
