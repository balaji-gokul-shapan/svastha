"use client";

import * as React from "react";

import {
  AlertTriangle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  Copy,
  Hash,
  MapPin,
  School,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileBarChart,
  FileText,
  HeartPulse,
  Hospital,
  Info,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Users,
  XCircle,
} from "lucide-react";

import {
  Area,
  AreaChart,
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HealthWorkerFormOutlineIcon from "@iconify-react/healthicons/health-worker-form-outline";
import {
  ALERT_TONE_CLASSES,
  FOLLOW_UP_STATUS_CLASSES,
  REFERRAL_SERIES,
  SCREENING_SERIES,
  TONE_CHIP_CLASSES,
  TONE_TILE_CLASSES,
  TREND_STROKE,
  seriesColorAt,
  toneChipClass,
  toneTileClass,
} from "../datas/dashboard-colors";
import {
  alerts,
  followUps,
  gradeData,
  healthIssues,
  insuranceData,
  quickLinks,
  referralData,
  referralTrend,
  stats,
  schoolFoudationalStats,
} from "../datas/statisticsData";
import { buildDoctorStats, normalizeEvents } from "@/lib/dashboard-stats";
import { getCampId } from "@/lib/camp-utils";
import ReusableSelect from "@/components/ui/reusable-select";
import Link from "next/link";

/**
 * Alert icons, hoisted out of the render loop so they aren't rebuilt per row.
 * Keys match the `type` field of each entry in `alerts`
 * (see components/dashboard/datas/statisticsData.js).
 */
const ALERT_ICONS = {
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function BranchDetailsPanel({ branch, summary }) {
  const displayData = branch ?? summary;
  const status = String(displayData?.status ?? "Not available").trim();
  const isActive = status.toLowerCase() === "active";
  const buildingArea = displayData?.total_building_area_sqft;
  const landArea = displayData?.total_land_area_sqft;
  const formatArea = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0
      ? `${number.toLocaleString()} sq.ft`
      : "Not provided";
  };

  return (
    <section className="rounded-2xl border border-border/80 bg-gradient-to-r from-slate-50 via-white to-blue-50/60 p-4 shadow-sm sm:p-5 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950/30">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {summary?.status === "All branches"
                ? "All branches"
                : "Branch overview"}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary?.status === "All branches"
                ? `Aggregated across ${summary?.branchCount ?? 0} branches`
                : "Property and operational details"}
            </p>
          </div>
        </div>

        {displayData ? (
          <div className="grid w-full flex-1 gap-3 sm:grid-cols-3">
            <div className="min-w-0 rounded-xl border bg-card px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`}
                />
                <p className="text-sm font-semibold text-foreground">
                  {status}
                </p>
              </div>
            </div>
            <div className="rounded-xl border bg-card px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Building area
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {formatArea(buildingArea)}
              </p>
            </div>
            <div className="rounded-xl border bg-card px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Land area
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {formatArea(landArea)}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            Select a branch to view its status and property details.
          </div>
        )}
      </div>
    </section>
  );
}

export function SchoolDetailsCard({ school }) {
  const [copiedField, setCopiedField] = React.useState("");
  const details = school?.school ?? school?.branch_data ?? school?.branch ?? {};
  const value = (topLevel, nested, fallback = "Not provided") => {
    const result =
      school?.[topLevel] ??
      school?.school?.[nested] ??
      school?.branch_data?.[nested] ??
      school?.branch?.[nested] ??
      details?.[nested] ??
      fallback;
    return String(result ?? fallback).trim() || fallback;
  };

  const addressParts = [
    value("address_line_1", "address_line_1", ""),
    value("address_line_2", "address_line_2", ""),
    value("area", "area", ""),
    value("city", "city", ""),
    value("state", "state", ""),
    value("pincode", "pincode", ""),
  ].filter(Boolean);
  const address = addressParts.join(", ") || "Not provided";
  const location = [value("country", "country", ""), address]
    .filter(Boolean)
    .join(" · ");
  const contactName = value("contact_person_name", "contact_person_name");
  const contactDesignation = value(
    "contact_person_designation",
    "contact_person_designation",
  );
  const contactPhone = value("contact_person_phone", "contact_person_phone");
  const contactEmail = value("contact_person_email", "contact_person_email");
  const hasContactPhone =
    contactPhone !== "Not provided" && Boolean(contactPhone.replace(/\D/g, ""));
  const hasContactEmail =
    contactEmail !== "Not provided" && contactEmail.includes("@");
  const mapSearch = encodeURIComponent(
    location === "Not provided" ? address : location,
  );
  const mapUrl =
    address === "Not provided"
      ? null
      : `https://www.google.com/maps/search/?api=1&query=${mapSearch}`;
  const phoneUrl = hasContactPhone
    ? `tel:${contactPhone.replace(/[^\d+]/g, "")}`
    : null;
  const emailUrl = hasContactEmail ? `mailto:${contactEmail}` : null;
  /* A row from getAllSchoolBranch is a BRANCH, so it often carries only
     `branch_name` / `school_name` and no `name`. Without these fallbacks the
     card title rendered "Not provided" while the real name sat unread in the
     subtitle directly below it. */
  const schoolName =
    value("name", "name", "") ||
    value("school_name", "school_name", "") ||
    value("branch_name", "branch_name", "") ||
    "Not provided";
  const branchName = value("branch_name", "branch_name");
  const status = value("status", "status");
  const classLevels = value("class", "class");
  const sections = value("section", "section");
  const registrationNumber = value(
    "registration_number",
    "registration_number",
  );
  const establishmentYear = value(
    "year_of_establishment",
    "year_of_establishment",
  );
  const ceebCode = value("ceeb_code", "ceeb_code");
  const updatedAt = value("updated_at", "updated_at", "");
  const updatedAtLabel = (() => {
    if (!updatedAt) return "Not provided";

    const parsedDate = new Date(updatedAt);
    if (Number.isNaN(parsedDate.getTime())) return updatedAt;

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  })();

  const copyValue = async (field, fieldValue) => {
    if (!navigator.clipboard || fieldValue === "Not provided") return;
    await navigator.clipboard.writeText(fieldValue);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(""), 1600);
  };

  const detailsList = [
    { label: "Address", value: address, icon: MapPin },
    { label: "Location", value: location, icon: MapPin },
    { label: "Status", value: status, icon: CheckCircle2 },
    { label: "Classes", value: classLevels, icon: BookOpen },
    { label: "Sections", value: sections, icon: Users },
    { label: "Established", value: establishmentYear, icon: CalendarCheck },
    { label: "Contact person", value: contactName, icon: Users },
    { label: "Designation", value: contactDesignation, icon: Award },
    { label: "Phone", value: contactPhone, icon: Stethoscope },
    { label: "Email", value: contactEmail, icon: Info },
  ];
  const copyDetails = [
    {
      field: "registration",
      label: "Registration number",
      value: registrationNumber,
      icon: Award,
    },
    { field: "ceeb", label: "CEEB code", value: ceebCode, icon: Hash },
  ];

  return (
    <Card className="overflow-hidden border-blue-500/20 shadow-xl shadow-blue-500/5">
      <CardHeader className="school-profile-gradient px-5 py-5 text-white sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
              <School className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-50/80">
                School profile
              </p>
              <CardTitle className="mt-1 truncate text-xl text-white">
                {schoolName}
              </CardTitle>
              <p className="truncate text-sm text-blue-50/80">{branchName}</p>
            </div>
          </div>
          <Badge className="w-fit border border-emerald-200/30 bg-emerald-400/15 text-emerald-50">
            <span className="mr-2 size-2 rounded-full bg-emerald-300" />
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-950 dark:bg-blue-950/20">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="size-4 text-blue-600" />
              <p className="text-sm font-semibold">School address</p>
              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
                >
                  Open map <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
            <p className="text-sm leading-6">
              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
                  title="Open school location in Google Maps"
                >
                  {address}
                </a>
              ) : (
                address
              )}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-1 rounded-md hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-blue-300"
                >
                  {location}
                  <ExternalLink className="mt-0.5 size-3 shrink-0" />
                </a>
              ) : (
                location
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 dark:border-cyan-950 dark:bg-cyan-950/20">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="size-4 text-cyan-600" />
              <p className="text-sm font-semibold">Academic profile</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Classes", classLevels],
                ["Sections", sections],
                ["Established", establishmentYear],
              ].map(([label, detail]) => (
                <div
                  key={label}
                  className="rounded-xl border bg-white/70 p-2 dark:bg-slate-900/60"
                >
                  <p className="text-[10px] uppercase text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-cyan-700 dark:text-cyan-300">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs school-profile-updated">
              <CalendarDays className="size-3.5 shrink-0" />
              <span>Last updated</span>
              <time
                dateTime={updatedAt || undefined}
                className="ml-auto font-semibold"
              >
                {updatedAtLabel}
              </time>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="size-4 text-violet-600" />
              <p className="text-sm font-semibold">Primary contact</p>
            </div>
            <p className="text-sm font-semibold">{contactName}</p>
            <p className="text-xs text-muted-foreground">
              {contactDesignation}
            </p>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <Stethoscope className="size-3.5 shrink-0 text-violet-500" />
                {phoneUrl ? (
                  <a
                    href={phoneUrl}
                    className="rounded-md font-medium text-foreground underline-offset-4 hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    title={`Call ${contactPhone}`}
                  >
                    {contactPhone}
                  </a>
                ) : (
                  contactPhone
                )}
              </p>
              <p className="flex items-center gap-2">
                <Info className="size-3.5 shrink-0 text-violet-500" />
                {emailUrl ? (
                  <a
                    href={emailUrl}
                    className="break-all rounded-md font-medium text-foreground underline-offset-4 hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    title={`Email ${contactEmail}`}
                  >
                    {contactEmail}
                  </a>
                ) : (
                  contactEmail
                )}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-slate-50/70 p-4 dark:border-blue-950 dark:bg-slate-900/40">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-blue-600" />
              <p className="text-sm font-semibold">Official identifiers</p>
            </div>
            <div className="space-y-2">
              {copyDetails.map(
                ({ field, label, value: detailValue, icon: Icon }) => (
                  <div
                    key={field}
                    className="flex items-center gap-3 rounded-xl border border-blue-200/70 bg-white p-3 dark:border-blue-900 dark:bg-slate-950/70"
                  >
                    <Icon className="size-4 shrink-0 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase text-muted-foreground">
                        {label}
                      </p>
                      <p className="truncate text-sm font-bold">
                        {detailValue}
                      </p>
                      {copiedField === field ? (
                        <p className="text-[10px] font-semibold text-emerald-600">
                          Copied to clipboard
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:bg-blue-100 hover:text-blue-700"
                      aria-label={`Copy ${label}`}
                      onClick={() => copyValue(field, detailValue)}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// function StatCard({ title, value, subtitle, icon: Icon, trend, tone }) {
//   return (
//     <Card className="overflow-hidden transition-shadow hover:shadow-md">
//       <CardContent className="p-4">
//         <div className="flex items-start justify-between gap-3">
//           <div
//             className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneChipClass(tone)}`}
//           >
//             <Icon className="size-5" />
//           </div>

//           <Badge variant="secondary" className="text-[10px]">
//             {trend}
//           </Badge>
//         </div>

//         <div className="mt-4">
//           <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>

//           <h2 className="mt-1 text-4xl font-bold tracking-tight">{value}</h2>

//           <button className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
//             {subtitle}
//             <ArrowRight className="size-3" />
//           </button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
const toneClass = (tone) => TONE_TILE_CLASSES[tone] ?? TONE_TILE_CLASSES.blue;
const chipClass = (tone) => TONE_CHIP_CLASSES[tone] ?? TONE_CHIP_CLASSES.blue;
export function StatCard({
  icon: Icon,
  tone = "blue",
  label,
  value,
  hint,
  title,
  subtitle,
}) {
  const heading = label ?? title;
  const caption = hint ?? subtitle;

  return (
    <Card className="relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-40 ${toneClass(tone)}`}
      />
      <CardContent className="px-5 py-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {heading}
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight tabular-nums">
              {value}
            </h2>
            {/* {caption ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {caption}
              </p>
            ) : null} */}
          </div>
          {Icon ? (
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${chipClass(tone)}`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
/* ============================================================
   SCREENING SUMMARY
============================================================ */

export function AgeGroupChart({
  ageGroups = {},
  averageAge = 0,
  totalStudents = 0,
  loading = false,
  error = null,
}) {
  const data = [
    { ageGroup: "0-5", students: Number(ageGroups?.["0-5"]) || 0 },
    { ageGroup: "6-10", students: Number(ageGroups?.["6-10"]) || 0 },
    { ageGroup: "11-15", students: Number(ageGroups?.["11-15"]) || 0 },
    { ageGroup: "16-18", students: Number(ageGroups?.["16-18"]) || 0 },
    { ageGroup: "19+", students: Number(ageGroups?.["19+"]) || 0 },
    { ageGroup: "Unknown", students: Number(ageGroups?.unknown) || 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Students by Age Group</CardTitle>
        <p className="text-xs text-muted-foreground">
          {totalStudents.toLocaleString()} students · Average age{" "}
          {averageAge.toFixed(1)}
        </p>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">
            Unable to load student age data.
          </p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">
            Loading student data...
          </p>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="ageGroup" tickLine={false} axisLine={false} />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
                <Bar
                  dataKey="students"
                  name="Students"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GenderChart({
  maleStudents = 0,
  femaleStudents = 0,
  otherStudents = 0,
  totalStudents = 0,
  loading = false,
  error = null,
}) {
  const data = [
    { name: "Male", value: Number(maleStudents) || 0, color: "#2563eb" },
    { name: "Female", value: Number(femaleStudents) || 0, color: "#db2777" },
    { name: "Other", value: Number(otherStudents) || 0, color: "#8b5cf6" },
  ];
  const displayedTotal =
    Number(totalStudents) || data.reduce((sum, item) => sum + item.value, 0);
  const hasGenderData = displayedTotal > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm">
              Student gender distribution
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              A quick view of the current student roster
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {displayedTotal.toLocaleString()} total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">
            Unable to load student gender data.
          </p>
        ) : loading ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Loading student data...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px] sm:items-center">
            <div className="relative h-[240px] min-w-0">
              {hasGenderData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.filter((item) => item.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="63%"
                      outerRadius="88%"
                      paddingAngle={4}
                      startAngle={90}
                      endAngle={-270}
                      cornerRadius={8}
                      stroke="none"
                    >
                      {data
                        .filter((item) => item.value > 0)
                        .map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${Number(value).toLocaleString()} (${displayedTotal ? Math.round((Number(value) / displayedTotal) * 100) : 0}%)`,
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No gender data available
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">
                  {displayedTotal.toLocaleString()}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  students
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {data.map((item) => {
                const percentage = hasGenderData
                  ? Math.round((item.value / displayedTotal) * 100)
                  : 0;
                return (
                  <div
                    key={item.name}
                    className="rounded-lg border bg-muted/20 p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </span>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                    <p className="mt-1 text-lg font-bold leading-none">
                      {item.value.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ScreeningSummary({
  generalScreeningRecord = [],
  hearingScreeningRecord = [],
  dentalScreeningRecord = [],
  visionScreeningRecord = [],
  totalStudents = 0,
  loading = false,
  error = null,
}) {
  const summary = React.useMemo(() => {
    const records = [
      { name: "General", value: generalScreeningRecord.length },
      { name: "Hearing", value: hearingScreeningRecord.length },
      { name: "Dental", value: dentalScreeningRecord.length },
      { name: "Vision", value: visionScreeningRecord.length },
    ];
    const completed = records.reduce((sum, item) => sum + item.value, 0);

    return records.map((item, index) => ({
      ...item,
      percentage: completed
        ? `${Math.round((item.value / completed) * 100)}%`
        : "0%",
      color: seriesColorAt(SCREENING_SERIES, index),
    }));
  }, [
    generalScreeningRecord,
    hearingScreeningRecord,
    dentalScreeningRecord,
    visionScreeningRecord,
  ]);

  const completed = summary.reduce((sum, item) => sum + item.value, 0);
  const hasData = completed > 0;
  const studentTotal = Number(totalStudents) || 0;
  const coverage = studentTotal
    ? Math.min(100, Math.round((completed / studentTotal) * 100))
    : 0;
  let accumulatedShare = 0;
  const conicStops = summary.flatMap((item) => {
    const start = accumulatedShare;
    accumulatedShare += completed ? (item.value / completed) * 100 : 0;
    return [`${item.color} ${start}%`, `${item.color} ${accumulatedShare}%`];
  });
  const screeningGradient = conicStops.length
    ? `conic-gradient(from -90deg, ${conicStops.join(", ")})`
    : "conic-gradient(#e2e8f0 0deg 360deg)";

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-card via-card to-success/5 shadow-sm">
      <CardHeader className="relative">
        <div className="absolute -right-10 -top-10 size-32 rounded-full bg-success/10 blur-2xl" />
        <CardTitle className="relative flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-success/10 text-success">
              <HealthWorkerFormOutlineIcon className="size-4" />
            </span>
            Screening pulse
          </span>
          <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-success">
            Live camp data
          </span>
        </CardTitle>
        <p className="relative mt-1 text-xs text-muted-foreground">
          Screening activity across every program
        </p>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            Unable to load screening data.
          </div>
        ) : loading ? (
          <div className="space-y-3" aria-label="Loading screening summary">
            <div className="mx-auto size-40 animate-pulse rounded-full bg-muted" />
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-11 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : !hasData ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <p className="font-medium">No screening activity yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Records will appear here when this camp starts screening.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div
              className="relative mx-auto flex size-40 items-center justify-center rounded-full p-[13px] shadow-inner"
              style={{ background: screeningGradient }}
            >
              <div className="flex size-full flex-col items-center justify-center rounded-full border border-background bg-card shadow-sm">
                <span className="text-3xl font-black tracking-tight">
                  {completed.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  screenings
                </span>
                <span className="mt-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                  {coverage}% student coverage
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {summary.map((item, index) => (
                <div
                  key={item.name}
                  className="group rounded-xl border border-border/70 bg-background/75 p-3 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        0{index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Screening program
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.value.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.percentage} of activity
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: item.percentage,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-xl bg-foreground/[0.04] px-3 py-2.5 text-xs">
              <span className="text-muted-foreground">
                Students in this camp
              </span>
              <span className="font-bold">{studentTotal.toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================
   REFERRALS BY TYPE
============================================================ */

function isReferralRequired(record) {
  const value =
    record?.referral_required ??
    record?.referralRequired ??
    record?.referral_is_required ??
    record?.is_referral_required;

  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["true", "1", "yes", "required"].includes(
      value.trim().toLowerCase(),
    );
  }
  return false;
}

export function ReferralsByType({
  generalScreeningRecord = [],
  hearingScreeningRecord = [],
  dentalScreeningRecord = [],
  visionScreeningRecord = [],
  loading = false,
  error = null,
}) {
  const chartData = React.useMemo(() => {
    const records = [
      ...generalScreeningRecord,
      ...hearingScreeningRecord,
      ...dentalScreeningRecord,
      ...visionScreeningRecord,
    ];
    const required = records.filter(isReferralRequired).length;
    const notRequired = records.length - required;

    return [
      { name: "Referral required", value: required },
      { name: "No referral required", value: notRequired },
    ];
  }, [
    generalScreeningRecord,
    hearingScreeningRecord,
    dentalScreeningRecord,
    visionScreeningRecord,
  ]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const required = chartData[0]?.value ?? 0;
  const requiredRate = total ? Math.round((required / total) * 100) : 0;

  return (
    <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-card via-card to-primary/[0.035]">
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Referral Pulse</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Live referral status across this camp
            </p>
          </div>
          <span className="rounded-full border border-primary/15 bg-primary/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {total.toLocaleString()} records
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.05] p-8 text-center text-sm text-destructive">
            Unable to load referral data.
          </div>
        ) : loading ? (
          <div className="space-y-4 py-4" aria-label="Loading referral data">
            <div className="mx-auto size-40 animate-pulse rounded-full bg-muted" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : !total ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm font-medium">No referrals to review</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Screening records will appear here once available.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border bg-background/55 p-4">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Referral decision split
                  </p>
                  <p className="mt-1 text-2xl font-black tracking-tight">
                    {required.toLocaleString()}
                    <span className="ml-2 text-sm font-medium text-muted-foreground">
                      need follow-up
                    </span>
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {requiredRate}% referred
                </span>
              </div>
              <div className="flex h-5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full min-w-1 bg-primary transition-all"
                  style={{ width: `${requiredRate}%` }}
                />
                <div className="h-full flex-1 bg-primary/15" />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-medium text-muted-foreground">
                <span>Referral required</span>
                <span>No referral</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {chartData.map((item, index) => {
                const isRequired = index === 0;
                const percentage = total
                  ? Math.round((item.value / total) * 100)
                  : 0;
                const color = seriesColorAt(REFERRAL_SERIES, index);

                return (
                  <div
                    key={item.name}
                    className={`relative overflow-hidden rounded-2xl border p-4 ${
                      isRequired ? "bg-primary/[0.06]" : "bg-muted/20"
                    }`}
                  >
                    <div
                      className="absolute right-0 top-0 size-20 translate-x-6 -translate-y-6 rounded-full opacity-10"
                      style={{ backgroundColor: color }}
                    />
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex size-8 items-center justify-center rounded-lg text-sm font-bold"
                          style={{ color, backgroundColor: `${color}18` }}
                        >
                          {isRequired ? "R" : "C"}
                        </span>
                        <p className="text-xs font-semibold text-muted-foreground">
                          {isRequired ? "Referral queue" : "Clear queue"}
                        </p>
                      </div>
                      <p className="mt-4 text-3xl font-black tracking-tight">
                        {item.value.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {percentage}% of all records · {item.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border bg-muted/20 p-3 text-center">
              <div>
                <p className="text-lg font-black">{total.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Analyzed</p>
              </div>
              <div className="border-x">
                <p className="text-lg font-black text-primary">
                  {requiredRate}%
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Referral rate
                </p>
              </div>
              <div>
                <p className="text-lg font-black">{100 - requiredRate}%</p>
                <p className="text-[10px] text-muted-foreground">No referral</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================
   REFERRALS BY GRADE
============================================================ */

export function ReferralsByGrade() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Referrals by Grade</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {gradeData.map((item) => (
            <div
              key={item.grade}
              className={`rounded-xl border p-4 text-center ${toneTileClass(item.tone)}`}
            >
              <p className="text-xs font-semibold">{item.grade}</p>

              <p className="mt-1 text-[10px] opacity-80">{item.level}</p>

              <p className="mt-2 text-2xl font-bold">{item.value}</p>

              <p className="mt-1 text-[10px] opacity-80">{item.percentage}</p>
            </div>
          ))}
        </div>

        <ViewLink text="View grade details" />
      </CardContent>
    </Card>
  );
}

/* ============================================================
   REFERRAL TREND
============================================================ */

export function ReferralTrend() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Referrals Trend</CardTitle>

        <ViewLink text="View report" />
      </CardHeader>

      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={referralTrend}>
              <defs>
                <linearGradient
                  id="referralGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={TREND_STROKE}
                    stopOpacity={0.25}
                  />

                  <stop
                    offset="100%"
                    stopColor={TREND_STROKE}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border"
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="value"
                stroke={TREND_STROKE}
                fill="url(#referralGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   TOP HEALTH ISSUES
============================================================ */

export function TopHealthIssues() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Top Health Issues</CardTitle>

        <ViewLink text="View report" />
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {healthIssues.map((item) => (
            <div key={item.name}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate">{item.name}</span>

                <span className="shrink-0 text-muted-foreground">
                  {item.value} ({item.percentage})
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(item.value / 1.7, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   INSURANCE
============================================================ */

export function InsuranceOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Insurance & Claims Overview</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {insuranceData.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border/70 bg-muted/20 p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[10px] text-muted-foreground">
                    {item.title}
                  </p>

                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              </div>

              <p className="mt-2 text-[10px] text-muted-foreground">
                {item.percentage}
              </p>
            </div>
          ))}
        </div>

        <ViewLink text="View claims" />
      </CardContent>
    </Card>
  );
}

/* ============================================================
   FOLLOW UPS
============================================================ */

export function UpcomingFollowUps() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Upcoming Follow-ups</CardTitle>

        <ViewLink text="View all" />
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-xs">
            <thead className="bg-muted/40">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Student Name</th>

                <th className="px-4 py-3 font-medium">Referral Type</th>

                <th className="px-4 py-3 font-medium">Grade</th>

                <th className="px-4 py-3 font-medium">Follow-up Date</th>

                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {followUps.map((item) => (
                <tr key={item.student} className="border-t border-border/60">
                  <td className="px-4 py-3 font-medium">{item.student}</td>

                  <td className="px-4 py-3">{item.type}</td>

                  <td className="px-4 py-3">{item.grade}</td>

                  <td className="px-4 py-3">{item.date}</td>

                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   ALERTS
============================================================ */

export function Alerts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Bell className="size-4" />

        <CardTitle className="text-sm">Alerts & Notifications</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {alerts.map((item, index) => {
          const Icon = ALERT_ICONS[item.type] ?? Info;

          return (
            <div key={index} className="flex gap-3">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${ALERT_TONE_CLASSES[item.type] ?? ALERT_TONE_CLASSES.info}`}
              >
                <Icon className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">{item.title}</p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <span className="shrink-0 text-[9px] text-muted-foreground">
                {item.time}
              </span>
            </div>
          );
        })}

        <ViewLink text="View all alerts" />
      </CardContent>
    </Card>
  );
}

/* ============================================================
   QUICK LINKS
============================================================ */

export function QuickLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Quick Links</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                href={item.link}
                passHref
                key={item.title}
                className="group flex min-h-[80px] flex-col items-center justify-center gap-2 rounded-xl border border-border/70 bg-muted/10 p-3 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:scale-105">
                  <Icon className="size-4" />
                </div>

                <span className="text-center text-[10px] font-medium">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-medium ${
        FOLLOW_UP_STATUS_CLASSES[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

/* ============================================================
   VIEW LINK
============================================================ */

function ViewLink({ text }) {
  return (
    <button className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
      {text}
      <ArrowRight className="size-3" />
    </button>
  );
}
