// "use client";

// import * as React from "react";

// import {
//   AlertTriangle,
//   ArrowRight,
//   Award,
//   Bell,
//   BookOpen,
//   Building2,
//   CalendarCheck,
//   Copy,
//   Hash,
//   MapPin,
//   School,
//   CalendarDays,
//   CheckCircle2,
//   ClipboardCheck,
//   FileBarChart,
//   FileText,
//   HeartPulse,
//   Hospital,
//   Info,
//   Mail,
//   Phone,
//   ExternalLink,
//   ShieldCheck,
//   Stethoscope,
//   Users,
//   XCircle,
// } from "lucide-react";

// import {
//   Area,
//   AreaChart,
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import HealthWorkerFormOutlineIcon from "@iconify-react/healthicons/health-worker-form-outline";
// import {
//   ALERT_TONE_CLASSES,
//   FOLLOW_UP_STATUS_CLASSES,
//   REFERRAL_SERIES,
//   SCREENING_SERIES,
//   TONE_CHIP_CLASSES,
//   TONE_TILE_CLASSES,
//   TREND_STROKE,
//   seriesColorAt,
//   toneChipClass,
//   toneTileClass,
// } from "../datas/dashboard-colors";
// import {
//   alerts,
//   followUps,
//   gradeData,
//   healthIssues,
//   insuranceData,
//   quickLinks,
//   referralData,
//   referralTrend,
//   stats,
//   schoolFoudationalStats,
// } from "../datas/statisticsData";
// import { buildDoctorStats, normalizeEvents } from "@/lib/dashboard-stats";
// import { getCampId } from "@/lib/camp-utils";
// import ReusableSelect from "@/components/ui/reusable-select";
// import SchoolFilter from "./SchoolFilter";
// import DoctorFilter from "./DoctorFilter";
// import Link from "next/link";
// import SchoolSubAccountFilter from "./SchoolSubAccountFilter";

import * as React from "react";
import ReusableSelect from "@/components/ui/reusable-select";
import { getCampDisplayLabel, getCampId } from "@/lib/camp-utils";

// export function DashboardHeader({
//   user,
//   role = "",
//   branches = [],
//   branchesLoading = false,
//   branchesError = null,
//   selectedBranchId = "all",
//   selectedBranch = null,
//   onBranchChange,
//   events = [],
//   eventsLoading = false,
//   eventsError = null,
//   selectedDoctorId = "all",
//   onDoctorChange,
//   selectedCampId = "all",
//   onCampChange,
//   userAuthRole = "",
// }) {
//   const campOptions = React.useMemo(() => {
//     const seen = new Set();

//     return normalizeEvents(events)
//       .map((event) => ({
//         value: getCampId(event),
//         label:
//           event?.name ??
//           event?.title ??
//           event?.camp_name ??
//           `Camp ${getCampId(event)}`,
//       }))
//       .filter((camp) => {
//         if (!camp.value || seen.has(camp.value)) return false;
//         seen.add(camp.value);
//         return true;
//       });
//   }, [events]);
//   console.log(role, "role3333");

//   const rawName =
//     user?.emp_name || user?.label || user?.full_name || user?.user_name || "";
//   const displayName = rawName
//     ? rawName.charAt(0).toUpperCase() + rawName.toLowerCase().slice(1)
//     : "there";
//   return (
//     <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//       <div>
//         <h1 className="text-xl font-bold tracking-tight md:text-4xl capitalize">
//           Welcome back, {displayName}
//         </h1>

//         <p className="text-sm text-muted-foreground">
//           Here&apos;s what&apos;s happening in your school today.
//         </p>
//       </div>

//       {/* <div className="flex flex-col gap-2 sm:flex-row">
//         <Button variant="outline" className="justify-center gap-2">
//           <CalendarDays className="size-4" />
//           Today, 20 May 2024
//         </Button>

//         <Button className="gap-2">
//           <FileBarChart className="size-4" />
//           Export Report
//         </Button>
//       </div> */}
//       {/* Role-aware filters: doctors pick a doctor, schools pick a school. */}
//       {role ? (
//         <div className="flex flex-col gap-3 sm:flex-row">
//           <section
//             className="school-subaccount-filter rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 shadow-sm sm:p-5 dark:border-blue-900/60 dark:from-blue-950/30 dark:via-slate-950 dark:to-cyan-950/20"
//             aria-label="School sub-account branch filter"
//           >
//             <DoctorFilter
//               events={events}
//               value={selectedCampId}
//               onChange={(campId, doctorId) => {
//                 onCampChange(campId);
//                 onDoctorChange(doctorId);
//               }}
//               loading={eventsLoading}
//               error={eventsError}
//             />
//           </section>
//           {/* <ReusableSelect
//             label="Camp"
//             options={[{ value: "all", label: "All camps" }, ...campOptions]}
//             value={selectedCampId}
//             onChange={onCampChange}
//             placeholder="Select camp"
//             searchPlaceholder="Search camp..."
//             disabled={eventsLoading}
//           /> */}
//         </div>
//       ) : null}

//       {role === "school" ? (
//         <section
//           className="school-subaccount-filter"
//           aria-label="School sub-account branch filter"
//         >
//           <SchoolFilter
//             branches={branches}
//             value={selectedBranchId}
//             onChange={onBranchChange}
//             selectedBranch={selectedBranch}
//             loading={branchesLoading}
//             error={branchesError}
//           />
//         </section>
//       ) : null}
//       {role === "admin" ? (
//         <section
//           className="school-subaccount-filter"
//           aria-label="School sub-account branch filter"
//         >
//           <SchoolSubAccountFilter
//             branches={branches}
//             value={selectedBranchId}
//             onChange={onBranchChange}
//             selectedBranch={selectedBranch}
//             loading={branchesLoading}
//             error={branchesError}
//           />
//         </section>
//       ) : null}
//     </div>
//   );
// }
export function DashboardHeader({
  user,
  role,
  userAuthRole,
  branches,
  branchOptions,
  branchesLoading,
  branchesError,
  selectedBranchId,
  selectedBranch,
  onBranchChange,
  events,
  eventsLoading,
  eventsError,
  selectedDoctorId,
  onDoctorChange,
  selectedCampId,
  onCampChange,
  dashboardData,
  dashboardLoading,
  dashboardError,
  dashboardSummaryData,
  dashboardSummaryLoading,
  dashboardSummaryError,
  schoolBranch,
}) {
  console.log(branchOptions, "branchOptions");

  const resolvedBranchOptions = React.useMemo(() => {
    /* NOTE: `branchOptions` is ALWAYS a non-empty array (the parent seeds it with
       the "all" row), so the old `branchOptions.length` guard always won and this
       fallback was dead code. Only fall back when there is nothing beyond "all". */
    const hasRealOption = (
      Array.isArray(branchOptions) ? branchOptions : []
    ).some((option) => String(option?.value ?? "").trim() !== "all");

    if (hasRealOption) {
      return branchOptions;
    }

    const seen = new Set();

    return [
      { value: "all", label: "All Branches" },
      ...(Array.isArray(schoolBranch) ? schoolBranch : [])
        .map((branch) => {
          const value = String(branch?.id ?? branch?.branch_id ?? "").trim();

          return {
            value,
            label: String(
              branch?.branch_name ??
                branch?.branchName ??
                branch?.name ??
                branch?.school_name ??
                "",
            ).trim(),
          };
        })
        .filter((option) => {
          if (!option.value || !option.label || seen.has(option.value)) {
            return false;
          }
          seen.add(option.value);
          return true;
        }),
    ];
  }, [branchOptions, schoolBranch]);

  console.log(role, "userssssssssss");

  const normalizedRole = String(role ?? userAuthRole ?? "")
    .trim()
    .toLowerCase();

  console.log(normalizedRole, "normalizedRole");

  const isDoctor =
    normalizedRole === "doctor" ||
    normalizedRole === "staff" ||
    normalizedRole === "primary_doctor";

  const showsBranchFilter = normalizedRole === "superadmin";
  /*
   * Camp options come from the doctor's assigned events. `events` may still be
   * a raw `{ data: [...] }` response, so unwrap it before mapping.
   */
  const resolvedCampOptions = React.useMemo(() => {
    const list = Array.isArray(events)
      ? events
      : Array.isArray(events?.data)
        ? events.data
        : [];

    const seen = new Set();

    return [
      { value: "all", label: "All Camps" },
      ...list
        .map((camp) => {
          const value = getCampId(camp);

          return {
            value,
            label: String(
              getCampDisplayLabel(camp) || camp?.title || "",
            ).trim(),
          };
        })
        .filter((option) => {
          if (!option.value || !option.label || seen.has(option.value)) {
            return false;
          }
          seen.add(option.value);
          return true;
        }),
    ];
  }, [events]);

  const rawName =
    user?.account?.name ??
    user?.emp_name ??
    user?.label ??
    user?.full_name ??
    user?.user_name ??
    "";
  console.log(user, "rawName");

  const displayName = rawName
    ? rawName.charAt(0).toUpperCase() + rawName.toLowerCase().slice(1)
    : "there";
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight capitalize break-words md:text-4xl">
          {" "}
          {greeting}, {displayName}
        </h1>

        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening in your school today.
        </p>
      </div>

      {/* Full width on mobile, auto on desktop so it never squeezes the title */}
      {(isDoctor || showsBranchFilter) && (
        <section
          className="school-subaccount-filter w-full shrink-0 sm:w-auto sm:min-w-[16rem]"
          aria-label={isDoctor ? "Camp filter" : "Branch filter"}
        >
          <ReusableSelect
            label={isDoctor ? "Camp" : "Branch"}
            options={isDoctor ? resolvedCampOptions : resolvedBranchOptions}
            value={(isDoctor ? selectedCampId : selectedBranchId) ?? "all"}
            onChange={(value) =>
              isDoctor ? onCampChange?.(value) : onBranchChange?.(value)
            }
            placeholder={isDoctor ? "Select camp" : "Select branch"}
            searchPlaceholder={isDoctor ? "Search camp..." : "Search branch..."}
            disabled={Boolean(isDoctor ? eventsLoading : branchesLoading)}
          />

          {/* Removed as it's now conditionally rendered above */}
        </section>
      )}
    </div>
  );
}
