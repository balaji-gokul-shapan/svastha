"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  CalendarClock,
  ClipboardCheck,
  HeartPulse,
  Hourglass,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

import { useAppDispatch } from "@/lib/hooks";
import { useAuthRole, getRoleLabel } from "@/lib/user-role";
import { getDashboard } from "@/lib/features/dashboardSlice";
import {
  CHART_SERIES,
  SCREENING_COLORS,
  SCREENING_ORDER,
  TONE_CHIP_CLASSES,
  TONE_TILE_CLASSES,
  seriesColorAt,
  toneChipClass,
} from "./datas/dashboard-colors";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

  

// Captured once when the module loads. Calling Date.now() during render is an
// impure call (react-hooks/purity) and would make rows flip between renders.
const PAGE_LOAD_TIME = Date.now();

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : 0;
};


const toRows = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const formatNumber = (value) => toNumber(value).toLocaleString();

const formatPercent = (value, digits = 2) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0%";

  return `${number.toFixed(digits)}%`;
};

const screeningColor = (name, index) =>
  SCREENING_COLORS[name] ?? seriesColorAt(Object.values(SCREENING_COLORS), index);

/** Compact "Gen / Vis / Den" label so the axis stays readable. */
const shortScreeningName = (name) =>
  ({ General: "General", Vision: "Vision", Dental: "Dental", Hearing: "Hearing", ENT: "ENT" })[name] ??
  String(name ?? "").slice(0, 6);

/* -------------------------------------------------------------------------- */
/* Small presentational pieces                                                  */
/* -------------------------------------------------------------------------- */

const toneClass = (tone) => TONE_TILE_CLASSES[tone] ?? TONE_TILE_CLASSES.blue;
const chipClass = (tone) => TONE_CHIP_CLASSES[tone] ?? TONE_CHIP_CLASSES.blue;

function StatCard({ icon: Icon, tone = "blue", label, value, hint }) {
  return (
    <Card className="relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-40 ${toneClass(tone)}`}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
            {hint ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </div>
          <div className={`shrink-0 rounded-xl p-2.5 ${toneClass(tone)}`}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-semibold leading-tight">{title}</h3>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function EmptyHint({ message = "No data available yet" }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* Derivation from the API payload                                              */
/* -------------------------------------------------------------------------- */

/**
 * Turns the /dashboard response into flat chart-ready arrays.
 *
 * `screening.by_type` arrives keyed by type name (General/Vision/...), so it is
 * reordered into SCREENING_ORDER for a stable, predictable colour + axis
 * mapping regardless of what the backend serialises first.
 */
function useDashboardModel(data) {
  return React.useMemo(() => {
    console.log(data,"overview2222");
    const overview = data?.data?.overview ?? {};
    const screening = data?.data?.screening ?? {};
    const byType = screening?.by_type ?? {};
    console.log(screening,"screeningssss2222");
    

    const screeningRows = SCREENING_ORDER.filter((name) => byType[name]).map(
      (name) => {
        const row = byType[name] ?? {};

        return {
          name,
          shortName: shortScreeningName(name),
          participated: toNumber(row.participated),
          missing: toNumber(row.missing),
          percent: Number(row.participation_percent) || 0,
        };
      },
    );

    // Participation % is far too small to read on a shared axis with raw
    // counts, so the radar plots the rate and the bar chart plots the counts.
    const participationRows = screeningRows.map((row) => ({
      name: row.shortName,
      percent: row.percent,
      fullName: row.name,
    }));

    // Branches differ by their locality suffix ("- Madipakkam" vs "- Trichy").
    // Stripping the prefix collapses them into identical axis labels, so label
    // each branch by its distinguishing tail and fall back to the full name.
    const branchRows = (data?.data?.branches ?? []).map((branch) => {
      const fullName = String(branch?.branch_name ?? "Unnamed branch");
      const segments = fullName.split(/\s*-\s*/);
      const tail = segments.length > 1 ? segments[segments.length - 1].trim() : "";

      return {
        branchId: branch?.branch_id,
        name: fullName,
        shortName: tail || fullName.slice(0, 20),
        city: branch?.city ?? "—",
        students: toNumber(branch?.students),
        screened: toNumber(branch?.screened),
        missing: toNumber(branch?.missing),
      };
    });

    // Guard against two branches still colliding (e.g. the same locality twice).
    const seenLabels = new Map();

    for (const branch of branchRows) {
      const count = (seenLabels.get(branch.shortName) ?? 0) + 1;

      seenLabels.set(branch.shortName, count);

      if (count > 1) {
        branch.shortName = `${branch.shortName} (${count})`;
      }
    }

    const eventRequests = data?.data?.event_requests ?? data?.data?.events?.requests ?? {};
    const doctorApproval =
      data?.data?.doctor_approvals ?? data?.data?.events?.doctor_approval ?? {};

    const statusRows = (eventRequests?.by_status ?? []).map((row) => ({
      name: String(row?.status ?? "Unknown"),
      total: toNumber(row?.total),
    }));

    const referralRows = (
      data?.data?.referrals?.by_screening_type ??
      data?.data?.referrals?.by_type ??
      []
    ).map((row) => ({
      name: String(row?.screening_type ?? "Other"),
      total: toNumber(row?.total),
    }));

    const referralList = toRows(data?.data?.referrals?.list);
    const followUp = data?.follow_ups ?? {};
    const followUpList = toRows(followUp?.list);

    const participated = toNumber(screening?.participated);
    const eligible = toNumber(screening?.eligible);
    const missing = toNumber(screening?.missing);


    const branchScreenedTotal = branchRows.reduce(
      (sum, branch) => sum + branch.screened,
      0,
    );
    const branchMissingTotal = branchRows.reduce(
      (sum, branch) => sum + branch.missing,
      0,
    );

    const branchScreeningReliable =
      participated > 0
        ? branchScreenedTotal > 0 && branchScreenedTotal <= participated
        : branchScreenedTotal === 0 && branchMissingTotal === 0;

    return {
      meta: {
        role: data?.meta?.role ?? data?.scope?.role ?? "",
        generatedAt: data?.meta?.generated_at ?? "",
        schoolId: data?.scope?.school_id,
        branchIds: data?.scope?.branch_ids ?? [],
      },
      overview: {
        branches: toNumber(overview?.branches),
        students: toNumber(overview?.students),
        requests: toNumber(
          overview?.event_requests ?? eventRequests?.total ?? overview?.requests,
        ),
      },
      screening: {
        eligible,
        participated,
        missing,
        rate: eligible > 0 ? (participated / eligible) * 100 : 0,
        rows: screeningRows,
        participationRows,
      },
      branches: branchRows,
      branchScreeningReliable,
      events: {
        statusRows,
        doctorApproval: {
          total: toNumber(doctorApproval?.total_events),
          withDoctor: toNumber(doctorApproval?.with_primary_doctor),
          withoutDoctor: toNumber(doctorApproval?.without_primary_doctor),
        },
      },
      referrals: {
        total: toNumber(data?.referrals?.total),
        rows: referralRows,
        list: referralList,
      },
      followUps: {
        total: toNumber(followUp?.total),
        pending: toNumber(followUp?.pending),
        due: toNumber(followUp?.due),
        overdue: toNumber(followUp?.overdue),
        completed: toNumber(followUp?.completed),
        missed: toNumber(followUp?.missed),
        cancelled: toNumber(followUp?.cancelled),
        list: followUpList,
      },
    };
  }, [data]);
}

/* -------------------------------------------------------------------------- */
/* Tooltip                                                                     */
/* -------------------------------------------------------------------------- */

const tooltipStyle = {
  borderRadius: "0.75rem",
  border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: "0.75rem",
  boxShadow: "0 10px 30px -10px rgb(0 0 0 / 0.25)",
};

function ChartTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !Array.isArray(payload) || !payload.length) return null;

  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey ?? entry.name}
          className="flex items-center gap-2 tabular-nums"
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color ?? entry.fill }}
          />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="ml-auto font-semibold">
            {valueFormatter ? valueFormatter(entry.value, entry) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

export default function SchoolDashboardOverview() {
  const dispatch = useAppDispatch();
  const role = useAuthRole();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard", role],
    queryFn: () => dispatch(getDashboard()).unwrap(),
    enabled: Boolean(role),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
console.log(data,"eeeeeeeedata");

  const model = useDashboardModel(data);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse border-border/60">
            <CardContent className="space-y-3 p-5">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-8 w-16 rounded bg-muted" />
              <div className="h-3 w-32 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-destructive">
          <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
          <span>
            {error?.message ?? "Unable to load the school dashboard right now."}
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const {
    meta,
    overview,
    screening,
    branches,
    branchScreeningReliable,
    events,
    referrals,
    followUps,
  } = model;

  console.log(model, "model");

  const followUpTone =
    followUps.overdue > 0
      ? "red"
      : followUps.pending > 0
        ? "orange"
        : "green";

  return (
    <div className="space-y-5">
      {/* --------------------------- Header / scope bar --------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            School Dashboard
          </h2>
          <p className="text-xs text-muted-foreground">
            {meta.branchIds.length
              ? `${formatNumber(overview.branches)} branches in scope`
              : "All branches"}
            {meta.generatedAt
              ? ` · Updated ${new Date(meta.generatedAt).toLocaleString()}`
              : ""}
          </p>
        </div>

        {meta.role ? (
          <Badge className={toneChipClass("purple")}>
            {getRoleLabel(meta.role) || meta.role}
          </Badge>
        ) : null}
      </div>

      {/* ------------------------------ KPI row ------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Building2}
          tone="purple"
          label="Branches"
          value={formatNumber(overview.branches)}
          hint="Under this school"
        />
        <StatCard
          icon={Users}
          tone="blue"
          label="Students"
          value={formatNumber(overview.students)}
          hint={`${formatNumber(screening.eligible)} eligible for screening`}
        />
        <StatCard
          icon={ClipboardCheck}
          tone="green"
          label="Screened"
          value={formatNumber(screening.participated)}
          hint={`${formatPercent(screening.rate)} participation rate`}
        />
        <StatCard
          icon={CalendarClock}
          tone={followUpTone}
          label="Pending Requests"
          value={formatNumber(overview.requests)}
          hint={`${formatNumber(followUps.total)} follow-up${followUps.total === 1 ? "" : "s"}`}
        />
      </div>

      {/* -------------------- Screening participation + gaps -------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <SectionHeading
              icon={Activity}
              title="Screening Coverage"
              subtitle="Participated vs pending, by screening type"
            />
          </CardHeader>
          <CardContent>
            {screening.rows.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={screening.rows}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="shortName"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        valueFormatter={(value) => formatNumber(value)}
                      />
                    }
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Bar
                    name="Participated"
                    dataKey="participated"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  >
                    {screening.rows.map((row) => (
                      <Cell key={row.name} fill={screeningColor(row.name)} />
                    ))}
                  </Bar>
                  <Bar
                    name="Missing"
                    dataKey="missing"
                    fill="hsl(var(--muted-foreground) / 0.22)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyHint message="No screening types reported yet" />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <SectionHeading
              icon={TrendingUp}
              title="Participation Rate"
              subtitle="Percentage screened per type"
            />
          </CardHeader>
          <CardContent>
            {screening.participationRows.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  data={screening.participationRows}
                  outerRadius="72%"
                >
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={
                      <ChartTooltip
                        valueFormatter={(value, entry) =>
                          formatPercent(entry?.payload?.percent ?? value)
                        }
                      />
                    }
                  />
                  <Radar
                    name="Participation %"
                    dataKey="percent"
                    stroke={CHART_SERIES.blue}
                    fill={CHART_SERIES.blue}
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyHint />
            )}
          </CardContent>
        </Card>
      </div>

      {/* --------------------------- Branch comparison --------------------------- */}
      <Card className="border-border/60">
        <CardHeader>
          <SectionHeading
            icon={Building2}
            title="Branch Comparison"
            subtitle="Students and screening progress per branch"
          />
        </CardHeader>
        <CardContent>
          {!branchScreeningReliable ? (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Per-branch screening counts are not being reported by the API
                (every branch returns 0 screened, while the school total shows{" "}
                {formatNumber(screening.participated)} screened). Only branch
                student totals are charted here until that is fixed.
              </span>
            </div>
          ) : null}

          {branches.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={branches}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortName"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={54}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      valueFormatter={(value) => formatNumber(value)}
                    />
                  }
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar
                  name="Students"
                  dataKey="students"
                  fill={CHART_SERIES.blue}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={34}
                />
                {branchScreeningReliable ? (
                  <>
                    <Bar
                      name="Screened"
                      dataKey="screened"
                      fill={CHART_SERIES.green}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={34}
                    />
                    <Bar
                      name="Missing"
                      dataKey="missing"
                      fill={CHART_SERIES.red}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={34}
                    />
                  </>
                ) : null}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyHint message="No branches to compare" />
          )}
        </CardContent>
      </Card>

      {/* -------------------- Events pipeline + doctor approval -------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <SectionHeading
              icon={Hourglass}
              title="Request Status"
              subtitle="Event requests by pipeline stage"
            />
          </CardHeader>
          <CardContent>
            {events.statusRows.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={events.statusRows}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    width={92}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        valueFormatter={(value) => formatNumber(value)}
                      />
                    }
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  />
                  <Bar
                    name="Requests"
                    dataKey="total"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={22}
                  >
                    {events.statusRows.map((row, index) => (
                      <Cell
                        key={row.name}
                        fill={seriesColorAt(
                          [
                            CHART_SERIES.orange,
                            CHART_SERIES.blue,
                            CHART_SERIES.purple,
                            CHART_SERIES.green,
                            CHART_SERIES.red,
                          ],
                          index,
                        )}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyHint message="No event requests yet" />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <SectionHeading
              icon={Stethoscope}
              title="Doctor Assignment"
              subtitle="Events with and without a primary doctor"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                <p className="text-xl font-bold tabular-nums">
                  {formatNumber(events.doctorApproval.total)}
                </p>
                <p className="text-[11px] text-muted-foreground">Total events</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatNumber(events.doctorApproval.withDoctor)}
                </p>
                <p className="text-[11px] text-muted-foreground">Assigned</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                <p className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {formatNumber(events.doctorApproval.withoutDoctor)}
                </p>
                <p className="text-[11px] text-muted-foreground">Unassigned</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "With primary doctor",
                      value: events.doctorApproval.withDoctor,
                    },
                    {
                      name: "Without primary doctor",
                      value: events.doctorApproval.withoutDoctor,
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="86%"
                  paddingAngle={3}
                  stroke="none"
                >
                  <Cell fill={CHART_SERIES.green} />
                  <Cell fill={CHART_SERIES.orange} />
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltip
                      valueFormatter={(value) => `${formatNumber(value)} events`}
                    />
                  }
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------- Referrals + follow-ups ------------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader>
            <SectionHeading
              icon={HeartPulse}
              title="Referrals by Type"
              subtitle={`${formatNumber(referrals.total)} total referrals`}
            />
          </CardHeader>
          <CardContent>
            {referrals.rows.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={referrals.rows}
                    dataKey="total"
                    nameKey="name"
                    innerRadius="52%"
                    outerRadius="82%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {referrals.rows.map((row, index) => (
                      <Cell
                        key={row.name}
                        fill={seriesColorAt(
                          [
                            CHART_SERIES.blue,
                            CHART_SERIES.orange,
                            CHART_SERIES.green,
                            CHART_SERIES.purple,
                            CHART_SERIES.red,
                            CHART_SERIES.cyan,
                          ],
                          index,
                        )}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <ChartTooltip
                        valueFormatter={(value) => formatNumber(value)}
                      />
                    }
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyHint message="No referrals raised" />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <SectionHeading
              icon={UserCheck}
              title="Follow-up Queue"
              subtitle="Scheduled and pending student follow-ups"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Pending", value: followUps.pending, tone: "blue" },
                { label: "Due", value: followUps.due, tone: "orange" },
                { label: "Overdue", value: followUps.overdue, tone: "red" },
                { label: "Completed", value: followUps.completed, tone: "green" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border p-3 ${toneClass(item.tone)}`}
                >
                  <p className="text-lg font-bold tabular-nums">
                    {formatNumber(item.value)}
                  </p>
                  <p className="text-[11px] opacity-80">{item.label}</p>
                </div>
              ))}
            </div>

            {followUps.list.length ? (
              <ul className="divide-y divide-border/60">
                {followUps.list.map((row) => {
                  const overdue =
                    row?.follow_up_date &&
                    new Date(row.follow_up_date).getTime() < PAGE_LOAD_TIME;

                  return (
                    <li
                      key={row?.referral_id}
                      className="flex flex-wrap items-center gap-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {row?.student_name ?? "Unknown student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row?.screening_type ?? "—"}
                          {row?.class ? ` Â· ${row.class}` : ""}
                          {row?.section ? ` ${row.section}` : ""}
                        </p>
                      </div>

                      {row?.referral_priority ? (
                        <Badge
                          className={chipClass(
                            String(row.referral_priority).toLowerCase() === "high"
                              ? "red"
                              : "blue",
                          )}
                        >
                          {row.referral_priority}
                        </Badge>
                      ) : null}

                      <span
                        className={`text-xs font-medium tabular-nums ${
                          overdue ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {row?.follow_up_date ?? "No date"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyHint message="Nothing in the follow-up queue" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------------------------- Recent referrals ---------------------------- */}
      {referrals.list.length ? (
        <Card className="border-border/60">
          <CardHeader>
            <SectionHeading
              icon={AlertTriangle}
              title="Recent Referrals"
              subtitle={`Latest ${referrals.list.length} of ${formatNumber(referrals.total)} referrals`}
            />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Class</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Grade</th>
                  <th className="py-2 pr-4 font-medium">Risk</th>
                  <th className="py-2 font-medium">Referred To</th>
                </tr>
              </thead>
              <tbody>
                {referrals.list.map((row) => (
                  <tr
                    key={row?.referral_id}
                    className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="py-2.5 pr-4 font-medium">
                      {row?.student_name ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {row?.class ?? "—"}
                      {row?.section ? ` ${row.section}` : ""}
                    </td>
                    <td className="py-2.5 pr-4">{row?.screening_type ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {row?.referral_grade ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums">
                      {row?.risk_score ?? "—"}
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {row?.referral_to ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
