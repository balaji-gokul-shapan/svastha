/* -------------------------------------------------------------------------
   SchoolInsightsCharts — graphical twin of <SchoolDashboardInsights />.

   A self-contained Recharts dashboard that visualises the SAME derived data
   the numerical view already computes. It takes plain values as props (no
   imports from SchoolDashboardInsights) so the existing code stays untouched:
   the parent only switches which view is rendered.

   Colour contract (matches style.css): green = screened / good,
   indigo = waiting, amber = needs follow-up, red = referral,
   blue / pink / teal = male / female / other, violet = age,
   slate = unknown. All fills reference the --si-* tokens so light and dark
   mode keep working without hardcoded colour values.
   ------------------------------------------------------------------------- */

"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Baby,
  BookOpen,
  ClipboardCheck,
  HeartPulse,
  ShieldCheck,
  Users,
  Venus,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

/* Tiny local helpers so this file never imports the numerical view. */
const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (value) => num(value).toLocaleString("en-IN");

const pctOf = (part, whole) =>
  whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;

/* Design-token fills (same pattern as CHART_SERIES in dashboard-colors.js). */
const SI = {
  green: "var(--si-green)",
  indigo: "var(--si-indigo)",
  amber: "var(--si-amber)",
  red: "var(--si-red)",
  blue: "var(--si-blue)",
  pink: "var(--si-pink)",
  teal: "var(--si-teal)",
  slate: "var(--si-slate)",
  violet: "var(--si-violet)",
};

/* Tooltip dot: series colour when solid, neutral when a gradient url. */
const tipDotColor = (entry) => {
  const direct = entry?.color ?? entry?.payload?.color ?? entry?.payload?.fill;
  if (typeof direct === "string" && direct && !direct.startsWith("url(")) {
    return direct;
  }
  return SI.slate;
};

/* Shared card chrome with a staggered entrance (parent MotionConfig honours
   reduced-motion automatically). */
function ChartCard({
  icon: Icon,
  tone,
  title,
  subtitle,
  index = 0,
  wide,
  children,
}) {
  return (
    <motion.section
      className={cn(
        "school-insights__panel school-insights__chart col-span-2",
        wide && "school-insights__chart--wide",
      )}
      data-tone={tone}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.36) }}
    >
      <div className="school-insights__heading">
        <span className="school-insights__icon" data-tone={tone}>
          <Icon aria-hidden="true" />
        </span>
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

/* Themed tooltip driven by --si-* tokens. */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="school-insights__chart-tip">
      {label != null && label !== "" ? (
        <p className="school-insights__chart-tip-title">{label}</p>
      ) : null}
      <ul>
        {payload.map((entry, i) => (
          <li key={entry?.dataKey ?? entry?.name ?? i}>
            <span
              className="school-insights__chart-tip-dot"
              style={{ background: tipDotColor(entry) }}
            />
            <span>{entry?.name}</span>
            <strong>
              {fmt(entry?.value)}
              {entry?.payload?.share != null ? ` · ${entry.payload.share}` : ""}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Legend reusing the numerical view's legend/swatch classes. */
function ChartLegend({ items, total }) {
  return (
    <ul className="school-insights__legend school-insights__chart-legend">
      {items.map((item) => (
        <li key={item.label}>
          <span
            className="school-insights__swatch"
            style={{ background: item.color }}
          />
          <span className="school-insights__legend-label">{item.label}</span>
          <strong>{fmt(item.value)}</strong>
          <span className="school-insights__legend-pct">
            {total ? `${pctOf(item.value, total)}%` : "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}

const withShare = (rows, total) =>
  rows.map((row) => ({
    ...row,
    share: total ? `${pctOf(row.value, total)}%` : "0%",
  }));

/* Donut with a centred total (same geometry as GenderChart's donut). */
function Donut({ rows, centerTop, centerBottom }) {
  return (
    <div className="school-insights__chart-plot school-insights__chart-plot--donut">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="64%"
            outerRadius="88%"
            paddingAngle={4}
            startAngle={90}
            endAngle={-270}
            cornerRadius={8}
            stroke="none"
          >
            {rows.map((row) => (
              <Cell key={row.label} fill={row.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="school-insights__chart-center" aria-hidden="true">
        <strong>{centerTop}</strong>
        <span>{centerBottom}</span>
      </div>
    </div>
  );
}

export default function SchoolInsightsCharts({
  totalStudents = 0,
  screened = 0,
  pending = 0,
  unknown = 0,
  followUps = 0,
  classRows = [],
  gender = {},
  ageGroups = {},
  areas = [],
  currentStatus = {},
  followUpStatus = {},
  referralCount = {},
  womenSpecial = {},
  screeningDataCount = {},
}) {
  const motionOK = !useReducedMotion();

  /* Coverage donut: screened / waiting / unknown of enrolled. */
  const coverageTotal = num(totalStudents);
  const coverageRows = withShare(
    [
      { label: "Screened", value: num(screened), color: SI.green },
      { label: "Waiting", value: num(pending), color: SI.indigo },
      { label: "Unknown", value: num(unknown), color: SI.slate },
    ].filter((row) => row.value > 0),
    coverageTotal,
  );

  /* Health areas: stacked good vs follow-up per type. */
  const areaRows = areas.map((area) => ({
    name: area?.name ?? "—",
    Screened: num(area?.count),
    Good: num(area?.good),
    FollowUp: num(area?.followUp),
    Referrals: num(area?.referrals),
  }));
  const areaTotal = areaRows.reduce((s, r) => s + r.Screened, 0);
  const areaGood = areaRows.reduce((s, r) => s + r.Good, 0);
  const areaFup = areaRows.reduce((s, r) => s + r.FollowUp, 0);
  const areaRefs = areaRows.reduce((s, r) => s + r.Referrals, 0);

  const goodOverall = num(currentStatus?.Good);
  const fupOverall = num(currentStatus?.["Need Follow up"]);
  const completedOverall = num(
    followUpStatus?.completed ?? screeningDataCount?.completed,
  );

  /* Gender donut (mirrors GenderPanel's four parts). */
  const genderTotal = ["male", "female", "other", "unknown"].reduce(
    (s, k) => s + num(gender?.[k]),
    0,
  );
  const genderRows = withShare(
    [
      { label: "Male", value: num(gender?.male), color: SI.blue },
      { label: "Female", value: num(gender?.female), color: SI.pink },
      { label: "Other", value: num(gender?.other), color: SI.teal },
      { label: "Unknown", value: num(gender?.unknown), color: SI.slate },
    ].filter((row) => row.value > 0),
    genderTotal,
  );

  const classData = [...(classRows ?? [])]
    .map((row) => {
      const sections = Array.isArray(row?.sections) ? row.sections : [];
      const sectionMale = sections.reduce(
        (sum, section) => sum + num(section?.male),
        0,
      );
      const sectionFemale = sections.reduce(
        (sum, section) => sum + num(section?.female),
        0,
      );
      const hasSectionCounts = sectionMale + sectionFemale > 0;
      const male = hasSectionCounts ? sectionMale : num(row?.male);
      const female = hasSectionCounts ? sectionFemale : num(row?.female);
      return {
        name: String(row?.class ?? "—"),
        Male: male,
        Female: female,
        total: male + female,
      };
    })
    .filter((row) => row.total > 0);

  /* Referrals donut (same three parts as ReferralPanel). */
  const referralTotal = num(referralCount?.total);
  const referralRows = withShare(
    [
      { label: "Male", value: num(referralCount?.male), color: SI.blue },
      { label: "Female", value: num(referralCount?.female), color: SI.pink },
      { label: "Other", value: num(referralCount?.other), color: SI.teal },
    ].filter((row) => row.value > 0),
    referralTotal,
  );

  /* Women's findings bars (same top findings as WomenPanel). */
  const womenScreened = num(womenSpecial?.screened?.total);
  const findingRows = Object.values(womenSpecial?.findings ?? {})
    .map((f) => ({ name: f?.label ?? "Finding", value: num(f?.total) }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  /* Ages (same rows as AgePanel). */
  const ageData = Object.entries(ageGroups ?? {})
    .map(([key, value]) => ({
      name: key === "unknown" ? "Unknown" : String(key),
      Students: num(value),
    }))
    .filter((row) => row.Students > 0)
    .sort((a, b) =>
      a.name === "Unknown"
        ? 1
        : b.name === "Unknown"
          ? -1
          : a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
  const ageTotal = ageData.reduce((s, r) => s + r.Students, 0);

  return (
    <div className="school-insights__charts-grid">
      {/* 1 — Coverage mix: the hero ring as a gradient donut */}
      <ChartCard
        icon={HeartPulse}
        tone="green"
        title="Coverage mix"
        subtitle={
          coverageTotal
            ? `${fmt(screened)} of ${fmt(coverageTotal)} screened`
            : undefined
        }
        index={0}
      >
        {coverageTotal && coverageRows.length ? (
          <>
            <Donut
              rows={coverageRows}
              centerTop={`${pctOf(screened, coverageTotal)}%`}
              centerBottom="screened"
            />
            <ChartLegend items={coverageRows} total={coverageTotal} />
            <p className="school-insights__chart-note">
              {fmt(followUps)} need follow-up · {fmt(goodOverall)} good ·{" "}
              {fmt(completedOverall)} follow-ups completed
            </p>
          </>
        ) : (
          <p className="school-insights__empty">
            No coverage data to chart yet.
          </p>
        )}
      </ChartCard>

      {/* 2 — Results by health area: stacked Good vs Follow-up */}
      <ChartCard
        icon={ClipboardCheck}
        tone="green"
        title="Results by health area"
        subtitle={areaTotal ? `${fmt(areaTotal)} screening records` : undefined}
        index={1}
        wide
      >
        {areaTotal ? (
          <>
            <div className="school-insights__chart-plot school-insights__chart-plot--tall">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={areaRows}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                  barCategoryGap="28%"
                >
                  <defs>
                    <linearGradient
                      id="si-area-good"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={SI.green}
                        stopOpacity={0.95}
                      />
                      <stop
                        offset="100%"
                        stopColor={SI.green}
                        stopOpacity={0.55}
                      />
                    </linearGradient>
                    <linearGradient
                      id="si-area-fup"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={SI.amber}
                        stopOpacity={0.95}
                      />
                      <stop
                        offset="100%"
                        stopColor={SI.amber}
                        stopOpacity={0.55}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    content={<ChartTip />}
                    cursor={{ fill: "rgba(148, 163, 184, 0.18)" }}
                  />
                  <Bar
                    dataKey="Good"
                    stackId="results"
                    fill="url(#si-area-good)"
                    isAnimationActive={motionOK}
                  />
                  <Bar
                    dataKey="FollowUp"
                    name="Needs follow-up"
                    stackId="results"
                    fill="url(#si-area-fup)"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={motionOK}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ChartLegend
              items={[
                { label: "Good", value: areaGood, color: SI.green },
                { label: "Needs follow-up", value: areaFup, color: SI.amber },
                { label: "Referrals", value: areaRefs, color: SI.red },
              ]}
              total={areaTotal}
            />
          </>
        ) : (
          <p className="school-insights__empty">
            No screening type totals to chart yet.
          </p>
        )}
      </ChartCard>

      {/* 3 — Gender mix donut */}
      <ChartCard
        icon={Users}
        tone="blue"
        title="Gender mix"
        subtitle={genderTotal ? `${fmt(genderTotal)} students` : undefined}
        index={2}
      >
        {genderTotal && genderRows.length ? (
          <>
            <Donut
              rows={genderRows}
              centerTop={fmt(genderTotal)}
              centerBottom="students"
            />
            <ChartLegend items={genderRows} total={genderTotal} />
          </>
        ) : (
          <p className="school-insights__empty">No gender data to chart yet.</p>
        )}
      </ChartCard>

      {/* 6 — Age groups bars */}
      <ChartCard
        icon={Baby}
        tone="violet"
        title="Age groups"
        subtitle={ageTotal ? `${fmt(ageTotal)} students` : undefined}
        index={5}
      >
        {ageTotal ? (
          <div className="school-insights__chart-plot">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                barCategoryGap="30%"
              >
                <defs>
                  <linearGradient id="si-age" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={SI.violet}
                      stopOpacity={0.95}
                    />
                    <stop
                      offset="100%"
                      stopColor={SI.violet}
                      stopOpacity={0.45}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />
                <Tooltip
                  content={<ChartTip />}
                  cursor={{ fill: "rgba(148, 163, 184, 0.18)" }}
                />
                <Bar
                  dataKey="Students"
                  fill="url(#si-age)"
                  radius={[8, 8, 2, 2]}
                  isAnimationActive={motionOK}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="school-insights__empty">No age data to chart yet.</p>
        )}
      </ChartCard>

      {/* 4 — All classes: stacked Boys + Girls bars in school order */}
      <ChartCard
        icon={BookOpen}
        tone="blue"
        title="Every class at a glance"
        subtitle={
          classData.length
            ? `${classData.length} classes, ${fmt(classData.reduce((s, r) => s + r.total, 0))} students`
            : undefined
        }
        index={3}
        wide
      >
        {classData.length ? (
          <>
            <div className="school-insights__chart-plot school-insights__chart-plot--tall">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classData}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <defs>
                    <linearGradient
                      id="si-cls-stack-b"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={SI.blue}
                        stopOpacity={0.95}
                      />
                      <stop
                        offset="100%"
                        stopColor={SI.blue}
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                    <linearGradient
                      id="si-cls-stack-g"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={SI.pink}
                        stopOpacity={0.95}
                      />
                      <stop
                        offset="100%"
                        stopColor={SI.pink}
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    content={<ChartTip />}
                    cursor={{ fill: "rgba(148, 163, 184, 0.18)" }}
                  />
                  <Bar
                    dataKey="Male"
                    name="Boys"
                    stackId="cls"
                    fill="url(#si-cls-stack-b)"
                    isAnimationActive={motionOK}
                  />
                  <Bar
                    dataKey="Female"
                    name="Girls"
                    stackId="cls"
                    fill="url(#si-cls-stack-g)"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={motionOK}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ChartLegend
              items={[
                {
                  label: "Boys",
                  value: classData.reduce((s, r) => s + r.Male, 0),
                  color: SI.blue,
                },
                {
                  label: "Girls",
                  value: classData.reduce((s, r) => s + r.Female, 0),
                  color: SI.pink,
                },
              ]}
              total={classData.reduce((s, r) => s + r.total, 0)}
            />
          </>
        ) : (
          <p className="school-insights__empty">
            No class totals to chart yet.
          </p>
        )}
      </ChartCard>

      {/* 5 — Referrals donut */}
      <ChartCard
        icon={ArrowUpRight}
        tone="red"
        title="Referrals"
        subtitle={
          referralTotal ? `${fmt(referralTotal)} students referred` : undefined
        }
        index={4}
      >
        {referralTotal && referralRows.length ? (
          <>
            <Donut
              rows={referralRows}
              centerTop={fmt(referralTotal)}
              centerBottom="referred"
            />
            <ChartLegend items={referralRows} total={referralTotal} />
          </>
        ) : (
          <p className="school-insights__empty">No referrals to chart yet.</p>
        )}
      </ChartCard>

      {/* 8 — Care outcomes: single plain-look bar with per-bar tones */}
      <ChartCard
        icon={ShieldCheck}
        tone="green"
        title="Care outcomes"
        subtitle="Latest results and follow-up completion"
        index={7}
      >
        {goodOverall + fupOverall + num(followUpStatus?.completed) > 0 ? (
          <>
            <div className="school-insights__chart-plot">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { label: "Good", Cases: goodOverall },
                    { label: "Needs follow-up", Cases: fupOverall },
                    {
                      label: "Follow-ups done",
                      Cases: num(followUpStatus?.completed),
                    },
                  ].filter((row) => row.Cases > 0)}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                  barCategoryGap="32%"
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    content={<ChartTip />}
                    cursor={{ fill: "rgba(148, 163, 184, 0.18)" }}
                  />
                  <Bar
                    dataKey="Cases"
                    radius={[8, 8, 2, 2]}
                    isAnimationActive={motionOK}
                  >
                    {[
                      { label: "Good", Cases: goodOverall, color: SI.green },
                      {
                        label: "Needs follow-up",
                        Cases: fupOverall,
                        color: SI.amber,
                      },
                      {
                        label: "Follow-ups done",
                        Cases: num(followUpStatus?.completed),
                        color: SI.teal,
                      },
                    ]
                      .filter((row) => row.Cases > 0)
                      .map((row) => (
                        <Cell key={row.label} fill={row.color} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="school-insights__chart-note">
              Good {pctOf(goodOverall, goodOverall + fupOverall)}% of latest
              results
            </p>
          </>
        ) : (
          <p className="school-insights__empty">
            No care outcomes to chart yet.
          </p>
        )}
      </ChartCard>

      {/* 7 — Women's findings bars */}
      <ChartCard
        icon={Venus}
        tone="pink"
        title="Women's findings"
        subtitle={womenScreened ? `${fmt(womenScreened)} screened` : undefined}
        index={6}
        wide
      >
        {womenScreened && findingRows.length ? (
          <div className="school-insights__chart-plot school-insights__chart-plot--tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={findingRows}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                barCategoryGap="28%"
              >
                <defs>
                  <linearGradient id="si-women" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={SI.pink} stopOpacity={0.5} />
                    <stop
                      offset="100%"
                      stopColor={SI.pink}
                      stopOpacity={0.95}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  content={<ChartTip />}
                  cursor={{ fill: "rgba(148, 163, 184, 0.18)" }}
                />
                <Bar
                  dataKey="value"
                  name="Cases"
                  fill="url(#si-women)"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={motionOK}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="school-insights__empty">
            No women&apos;s health findings to chart yet.
          </p>
        )}
      </ChartCard>
    </div>
  );
}
