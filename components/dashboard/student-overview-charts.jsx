// "use client";


// import React from "react";

// import { normalizeEvents } from "@/lib/dashboard-stats";
// import { stats, schoolFoudationalStats } from "./datas/statisticsData";
// import { DashboardHeader } from "./components/DashboardHeader";
// import DoctorOverviewCharts from "./DoctorOverviewCharts";
// import SchoolOverviewCharts from "./SchoolOverviewCharts";

// /**
//  * Role-aware dashboard shell.
//  *
//  * The header (greeting + role filters) is rendered ONCE here and is common to
//  * every role. Only the body below it is split:
//  *   - <DoctorOverviewCharts />  — camp/event KPIs built from assigned events
//  *   - <SchoolOverviewCharts />  — foundation KPIs + branch/school detail panels
//  */
// export default function StudentOverviewCharts({
//   user,
//   role = "",
//   isDoctor = false,
//   schoolAdmin = null,
//   branches = [],
//   branchesLoading = false,
//   branchesError = null,
//   selectedBranchId = "all",
//   selectedBranch = null,
//   onBranchChange,
//   selectedDoctorId = "all",
//   onDoctorChange,
//   selectedCampId = "all",
//   onCampChange,
//   branchSummary = null,
//   assignedEvents = [],
//   assignEventLoading = false,
//   assignEventError = null,
//   totalStudents = 0,
//   maleStudents = 0,
//   femaleStudents = 0,
//   otherStudents = 0,
//   userAuthRole = "",
//   ageGroups = {},
//   averageAge = 0,
//   adminFoundationStats,
//   getStudentByEventLoading = false,
//   getStudentByEventError = null,
//   generalScreeningRecord = [],
//   hearingScreeningRecord = [],
//   dentalScreeningRecord = [],
//   visionScreeningRecord = [],
//   screeningLoading = false,
//   screeningError = null,
//   dashboardData = null,
//   dashboardLoading = false,
//   dashboardError = null,
//   dashboardSummaryData = null,
//   dashboardSummaryLoading = false,
//   dashboardSummaryError = null,
// }) {
//   // Branch records are passed directly from the all-branches API response.
//   const dashboardBranches = Array.isArray(branches)
//     ? branches
//     : Array.isArray(branches?.data)
//       ? branches.data
//       : Array.isArray(schoolAdmin?.getAllSchoolBranch)
//         ? schoolAdmin.getAllSchoolBranch
//         : Array.isArray(schoolAdmin?.getAllSchoolBranch?.data)
//           ? schoolAdmin.getAllSchoolBranch.data
//           : [];

//   const allEvents = React.useMemo(
//     () => normalizeEvents(assignedEvents?.data ?? assignedEvents),
//     [assignedEvents],
//   );

//   const kpiStatsByRole = {
//     doctor: null, // built inside <DoctorOverviewCharts /> from its events
//     admin: adminFoundationStats ?? schoolFoudationalStats,
//     school: schoolFoudationalStats ?? schoolFoudationalStats,
//     school_sub_account: schoolFoudationalStats ?? schoolFoudationalStats,
//   };

//   const kpiStats = kpiStatsByRole[userAuthRole] ?? stats;

//   /* Props every body needs, minus the role-specific extras. */
//   const bodyProps = {
//     totalStudents,
//     maleStudents,
//     femaleStudents,
//     otherStudents,
//     ageGroups,
//     averageAge,
//     generalScreeningRecord,
//     hearingScreeningRecord,
//     dentalScreeningRecord,
//     visionScreeningRecord,
//     screeningLoading,
//     screeningError,
//     getStudentByEventLoading,
//     getStudentByEventError,
//   };

//   return (
//     <main className="min-h-screen ">
//       <div className=" space-y-5 p-4 md:p-6">
//         {/* HEADER — common to every role */}
//         <DashboardHeader
//           user={user}
//           role={role}
//           isDoctor={isDoctor}
//           userAuthRole={userAuthRole}
//           branches={dashboardBranches}
//           branchesLoading={branchesLoading}
//           branchesError={branchesError}
//           selectedBranchId={selectedBranchId}
//           selectedBranch={selectedBranch}
//           onBranchChange={onBranchChange}
//           events={allEvents}
//           eventsLoading={assignEventLoading}
//           eventsError={assignEventError}
//           selectedDoctorId={selectedDoctorId}
//           onDoctorChange={onDoctorChange}
//           selectedCampId={selectedCampId}
//           onCampChange={onCampChange}
//         />

//         {/* BODY — role specific */}
//         {isDoctor ? (
//           <DoctorOverviewCharts assignedEvents={allEvents} {...bodyProps} />
//         ) : (
//           <SchoolOverviewCharts
//             userAuthRole={userAuthRole}
//             kpiStats={kpiStats}
//             selectedBranch={selectedBranch}
//             branchSummary={branchSummary}
//             {...bodyProps}
//           />
//         )}
//       </div>
//     </main>
//   );
// }
import * as React from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { BranchDetailsPanel, SchoolDetailsCard } from "./components/dashboard-sections";

export default function StudentOverviewCharts({
  user,
  role,
  dashboardData,
  dashboardLoading,
  dashboardError,
  dashboardSummaryData,
  dashboardSummaryLoading,
  dashboardSummaryError,
  schoolBranch,
  getAllSchoolBranchLoading,
  getAllSchoolBranchError,
}) {

  const getAllBranches = dashboardData?.data?.branches ?? [];
  console.log(getAllBranches, "getAllBranches");

  const getAllEvents = dashboardData?.data?.events ?? [];
  console.log(getAllEvents, "getAllEvents");

  /* ------------------------------------------------------------------ */
  /* Selected branch                                                    */
  /* ------------------------------------------------------------------ */

  const [selectedBranchId, setSelectedBranchId] = React.useState("all");

  const branchOptions = React.useMemo(() => {
    const seen = new Set();

    return [
      { value: "all", label: "All Branches" },
      ...(Array.isArray(getAllBranches) ? getAllBranches : [])
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
  }, [getAllBranches]);

  const selectedBranch = React.useMemo(() => {
    if (selectedBranchId === "all") return null;

    return (
      (Array.isArray(getAllBranches) ? getAllBranches : []).find(
        (branch) =>
          String(branch?.id ?? branch?.branch_id ?? "").trim() ===
          String(selectedBranchId).trim(),
      ) ?? null
    );
  }, [getAllBranches, selectedBranchId]);

  /* ------------------------------------------------------------------ */
  /* Selected school (from getAllSchoolBranch)                          */
  /* ------------------------------------------------------------------ */

  const allSchoolBranches = React.useMemo(() => {
    if (Array.isArray(schoolBranch)) return schoolBranch;
    if (Array.isArray(schoolBranch?.data)) return schoolBranch.data;
    /* Some endpoints wrap twice: { data: { data: [...] } } */
    if (Array.isArray(schoolBranch?.data?.data)) return schoolBranch.data.data;
    if (Array.isArray(schoolBranch?.branches)) return schoolBranch.branches;
    if (Array.isArray(schoolBranch?.data?.branches)) {
      return schoolBranch.data.branches;
    }
    return [];
  }, [schoolBranch]);

 console.log(role,"role");
 
  const readBranchIds = (branch) =>
    [branch?.id, branch?.branch_id, branch?.branchId, branch?.school_branch_id]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean);

  console.log(schoolBranch, allSchoolBranches);

  /*
   * Prefer the exact getAllSchoolBranch match (richest row). Fall back to the
   * dashboardData row so the card still renders when nothing lines up.
   */
  const selectedSchool = React.useMemo(() => {
    if (selectedBranchId === "all") return null;

    const wanted = new Set(readBranchIds(selectedBranch));
    if (wanted.size === 0) return selectedBranch ?? null;

    const match = allSchoolBranches.find((branch) =>
      readBranchIds(branch).some((id) => wanted.has(id)),
    );

    return match ?? selectedBranch ?? null;
  }, [allSchoolBranches, selectedBranchId, selectedBranch]);

  console.log(selectedSchool, "selectedSchool");

  /* ------------------------------------------------------------------ */
  /* Branch summary                                                     */
  /* ------------------------------------------------------------------ */

  const branchSummary = React.useMemo(() => {
    const list = Array.isArray(getAllBranches) ? getAllBranches : [];
    const scope = selectedBranch ? [selectedBranch] : list;

    const toArea = (branch) =>
      Number(branch?.total_building_area_sqft) ||
      Number(branch?.total_land_area_sqft) ||
      0;

    return {
      status: selectedBranch
        ? String(selectedBranch?.status ?? "Not available").trim()
        : "All branches",
      total_building_area_sqft: scope.reduce(
        (sum, branch) => sum + (Number(branch?.total_building_area_sqft) || 0),
        0,
      ),
      total_land_area_sqft: scope.reduce(
        (sum, branch) => sum + (Number(branch?.total_land_area_sqft) || 0),
        0,
      ),
      branchCount: selectedBranch ? 1 : list.length,
      hasArea: scope.some(toArea),
    };
  }, [getAllBranches, selectedBranch]);

  /* ------------------------------------------------------------------ */
  /* Selected camp (doctor)                                             */
  /* ------------------------------------------------------------------ */

  const [selectedCampId, setSelectedCampId] = React.useState("all");

  console.log(user, "user");

  return (
    <div className="w-full space-y-4 p-4 md:space-y-5 md:p-6">
      <DashboardHeader
        user={user}
        role={role}
        dashboardData={dashboardData}
        dashboardLoading={dashboardLoading}
        dashboardError={dashboardError}
        dashboardSummaryData={dashboardSummaryData}
        dashboardSummaryLoading={dashboardSummaryLoading}
        dashboardSummaryError={dashboardSummaryError}
        branches={getAllBranches}
        branchOptions={branchOptions}
        selectedBranchId={selectedBranchId}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranchId}
        events={getAllEvents}
        selectedCampId={selectedCampId}
        onCampChange={setSelectedCampId}
        schoolBranch={schoolBranch}
        getAllSchoolBranchLoading={getAllSchoolBranchLoading}
        getAllSchoolBranchError={getAllSchoolBranchError}
        // userAuthRole={userAuthRole}
        // branches={dashboardBranches}
        // branchesLoading={branchesLoading}
        // branchesError={branchesError}
        // selectedBranchId={selectedBranchId}
        // selectedBranch={selectedBranch}
        // onBranchChange={onBranchChange}
        // events={allEvents}
        // eventsLoading={assignEventLoading}
        // eventsError={assignEventError}
        // selectedDoctorId={selectedDoctorId}
        // onDoctorChange={onDoctorChange}
        // selectedCampId={selectedCampId}
        // onCampChange={onCampChange}
      />
    
      <BranchDetailsPanel branch={selectedBranch} summary={branchSummary} />
      {selectedSchool ? <SchoolDetailsCard school={selectedSchool} /> : null}
    </div>
  );
}
