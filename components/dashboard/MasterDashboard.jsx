"use client";

import React, { use, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getRoleFromAccount,
  getRoleFromTypeId,
  useAuthRole,
} from "@/lib/user-role";
import StudentOverviewCharts from "./student-overview-charts";
import SchoolDashboardOverview from "./SchoolDashboardOverview";
import { useSchoolSuperAdminApi } from "./api/schoolSuperAdminApi";
import { useDoctorApi } from "./api/doctorApi";
import { normalizeEvents } from "@/lib/dashboard-stats";
import { schoolFoudationalStats } from "./datas/statisticsData";

const getNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

const getEventBranchId = (event) => {
  const directKeys = [
    "branch_id",
    "branchId",
    "school_branch_id",
    "schoolBranchId",
  ];

  for (const key of directKeys) {
    const value = event?.[key];
    if (value != null && String(value).trim()) {
      return String(value).trim();
    }
  }

  const branchSources = [
    event?.branch,
    event?.branch_data,
    event?.school?.branch,
    event?.school?.school_branch,
    event?.school_branch,
  ];

  for (const source of branchSources) {
    for (const key of [...directKeys, "id"]) {
      const value = source?.[key];
      if (value != null && String(value).trim()) {
        return String(value).trim();
      }
    }
  }

  return "";
};

const getEventTotal = (event, keys) => {
  const sources = [
    event,
    event?.branch,
    event?.branch_data,
    event?.school,
    event?.school_data,
    event?.statistics,
    event?.counts,
  ];

  for (const source of sources) {
    for (const key of keys) {
      if (source?.[key] != null && source[key] !== "") {
        return getNumber(source[key]);
      }
    }
  }

  return 0;
};

const resolveEffectiveRole = ({ account, user, account_type, role }) => {
  const namedRole = [account_type, role].find(
    (value) =>
      typeof value === "string" &&
      value.trim() &&
      value.trim().toLowerCase() !== "staff",
  );
  if (namedRole) {
    return getRoleFromTypeId(namedRole) || namedRole.trim().toLowerCase();
  }

  return getRoleFromAccount(account) || getRoleFromAccount(user) || "";
};

const MasterDashboard = () => {
  const authRoleFromHook = useAuthRole();
  const {
    user: authUser,
    account,
    account_type,
    role,
  } = useSelector((state) => state.auth);

  const effectiveRole = resolveEffectiveRole({
    account,
    user: authUser,
    account_type,
    role,
  });

  console.log(effectiveRole, "effectiveRole");

  const userAuthRole = authRoleFromHook || "";

  const isDoctor = userAuthRole === "doctor";
  const isAdmin = userAuthRole === "admin";
  const isSchool = userAuthRole === "school";
  const isSchoolSubAccount = effectiveRole === "school_sub_account";
  const showOverview = isDoctor || isAdmin || isSchool;

  const showSchoolDashboard =
    isSchool ||
    isSchoolSubAccount ||
    userAuthRole === "correspondent" ||
    effectiveRole === "correspondent" ||
    effectiveRole === "school";
  console.log(userAuthRole, "userAuthRole");

  // const data = useAppSelector(selectDashboardData);
  // const isLoading = useAppSelector(selectDashboardLoading);
  // const error = useAppSelector(selectDashboardError);

  const [selectedBranchId, setSelectedBranchId] = React.useState("all");
  const [selectedDoctorId, setSelectedDoctorId] = React.useState("all");
  const [selectedCampId, setSelectedCampId] = React.useState("all");

  const {
    getAllSchoolBranch,
    getAllSchoolBranchLoading,
    getAllSchoolBranchError,
    getAllEventsData: schoolEventsData,
    getAllEventsLoading: schoolEventsLoading,
    getAllEventsError: schoolEventsError,
    getAllStudentData,
    schoolBranch,
    dashboardData,
    dashboardLoading,
    dashboardError,
    dashboardSummaryData,
    dashboardSummaryLoading,
    dashboardSummaryError,
  } = useSchoolSuperAdminApi(

    effectiveRole || userAuthRole,
    selectedBranchId === "all" ? "" : selectedBranchId,
  );

  console.log(dashboardData?.data, "dashboardDataWWWWW");

  const {
    assignedEvents,
    assignEventLoading,
    assignEventError,
    totalStudents,
    maleStudents,
    femaleStudents,
    otherStudents,
    ageGroups,
    averageAge,
    generalScreeningRecord,
    hearingScreeningRecord,
    dentalScreeningRecord,
    visionScreeningRecord,
    screeningLoading,
    screeningError,
    getStudentByEventLoading,
    getStudentByEventError,
  } = useDoctorApi(undefined, selectedDoctorId, selectedCampId);

  const schoolAdmin = React.useMemo(
    () => ({ getAllSchoolBranch }),
    [getAllSchoolBranch],
  );

  const branches = React.useMemo(() => {
    const rawBranches = getAllSchoolBranch?.data ?? getAllSchoolBranch;

    if (Array.isArray(rawBranches)) return rawBranches;
    if (Array.isArray(rawBranches?.data)) return rawBranches.data;
    if (Array.isArray(rawBranches?.branches)) return rawBranches.branches;
    return [];
  }, [getAllSchoolBranch]);
  console.log(branches, "branches");

  const selectedBranch = React.useMemo(() => {
    if (selectedBranchId === "all" && isSchoolSubAccount) {
      return schoolBranch ?? null;
    }

    if (selectedBranchId === "all") return null;
    return (
      branches.find(
        (item) =>
          String(item?.id ?? item?.branch_id ?? "") ===
          String(selectedBranchId),
      ) ??
      schoolBranch ??
      null
    );
  }, [branches, selectedBranchId, schoolBranch, isSchoolSubAccount]);

  console.log(selectedBranch, "sssssssfff");

  const roleEvents = isDoctor ? assignedEvents : schoolEventsData;
  const roleEventsLoading = isDoctor ? assignEventLoading : schoolEventsLoading;
  const roleEventsError = isDoctor ? assignEventError : schoolEventsError;

  const schoolStudentData = React.useMemo(() => {
    const response = getAllStudentData?.data ?? getAllStudentData ?? {};
    const items = Array.isArray(response?.items)
      ? response.items
      : Array.isArray(response?.students)
        ? response.students
        : Array.isArray(response)
          ? response
          : [];
    const total =
      Number(response?.total ?? response?.count ?? items.length) || 0;

    return { items, total };
  }, [getAllStudentData]);

  const allAssignedEvents = React.useMemo(
    () => normalizeEvents(roleEvents?.data ?? roleEvents),
    [roleEvents],
  );

  const isBranchSelected =
    selectedBranchId !== "all" &&
    selectedBranchId != null &&
    String(selectedBranchId).trim() !== "";

  const branchFilteredAssignedEvents = React.useMemo(() => {
    if (!isBranchSelected) return allAssignedEvents;

    const selectedId = String(selectedBranchId).trim();
    return allAssignedEvents.filter(
      (event) => getEventBranchId(event) === selectedId,
    );
  }, [allAssignedEvents, isBranchSelected, selectedBranchId]);
  console.log(isBranchSelected, "isBranchSelected");

  const adminTotals = React.useMemo(() => {
    const studentKeys = [
      "total_students",
      "totalStudents",
      "student_count",
      "students_count",
      "students",
    ];
    const teachingStaffKeys = [
      "total_teaching_staff",
      "totalTeachingStaff",
      "teaching_staff",
      "teaching_staff_count",
      "teachingStaff",
      "teachers_count",
      "teachers",
    ];
    const nonTeachingStaffKeys = [
      "total_non_teaching_staff",
      "totalNonTeachingStaff",
      "non_teaching_staff",
      "non_teaching_staff_count",
      "nonTeachingStaff",
      "non_teachingStaff_count",
      "non_teachingStaff",
    ];

    // A branch object already carries its own head-count
    // (`students`, `event_requests`, ...), so read it from the branch first.
    const readCounts = (source) => ({
      students: getEventTotal(source, studentKeys),
      teachingStaff: getEventTotal(source, teachingStaffKeys),
      nonTeachingStaff: getEventTotal(source, nonTeachingStaffKeys),
    });

    const hasAnyCount = (counts) =>
      counts.students > 0 ||
      counts.teachingStaff > 0 ||
      counts.nonTeachingStaff > 0;

    // ---- Branch selected: only that branch's counts -------------------
    if (isBranchSelected && selectedBranch) {
      const branchCounts = readCounts(selectedBranch);

      if (hasAnyCount(branchCounts)) {
        return branchCounts;
      }
    }

    // ---- "All branches" (default): aggregate every branch -------------
    // Summing the branch list gives the school-wide total instead of only
    // the students attached to camps/events.
    if (!isBranchSelected && branches.length) {
      const allBranchCounts = branches.reduce(
        (totals, branch) => {
          const counts = readCounts(branch);
          totals.students += counts.students;
          totals.teachingStaff += counts.teachingStaff;
          totals.nonTeachingStaff += counts.nonTeachingStaff;
          return totals;
        },
        { students: 0, teachingStaff: 0, nonTeachingStaff: 0 },
      );

      if (hasAnyCount(allBranchCounts)) {
        return allBranchCounts;
      }
    }

    // ---- Fallback: derive from the events payload ---------------------
    const sourceEvents = isBranchSelected
      ? branchFilteredAssignedEvents
      : allAssignedEvents;

    return sourceEvents.reduce(
      (totals, event) => {
        const counts = readCounts(event);
        totals.students += counts.students;
        totals.teachingStaff += counts.teachingStaff;
        totals.nonTeachingStaff += counts.nonTeachingStaff;
        return totals;
      },
      { students: 0, teachingStaff: 0, nonTeachingStaff: 0 },
    );
  }, [
    allAssignedEvents,
    branches,
    branchFilteredAssignedEvents,
    isBranchSelected,
    selectedBranch,
  ]);

  const adminFoundationStats = React.useMemo(
    () =>
      schoolFoudationalStats.map((stat) => {
        if (stat.key === "students") {
          return { ...stat, value: adminTotals.students.toLocaleString() };
        }
        if (stat.key === "teachingStaff") {
          return {
            ...stat,
            value: adminTotals.teachingStaff.toLocaleString(),
          };
        }
        if (stat.key === "nonTeachingStaff") {
          return {
            ...stat,
            value: adminTotals.nonTeachingStaff.toLocaleString(),
          };
        }
        return stat;
      }),
    [adminTotals],
  );



  const branchSummary = React.useMemo(() => {
    const toArea = (branch) =>
      Number(branch?.total_building_area_sqft) ||
      Number(branch?.total_land_area_sqft) ||
      0;

    return {
      status: selectedBranch
        ? String(selectedBranch?.status ?? "Not available").trim()
        : "All branches",
      total_building_area_sqft: (isBranchSelected
        ? [selectedBranch]
        : branches
      ).reduce(
        (sum, branch) => sum + (Number(branch?.total_building_area_sqft) || 0),
        0,
      ),
      total_land_area_sqft: (isBranchSelected
        ? [selectedBranch]
        : branches
      ).reduce(
        (sum, branch) => sum + (Number(branch?.total_land_area_sqft) || 0),
        0,
      ),
      branchCount: isBranchSelected ? 1 : branches.length,
      hasArea: (isBranchSelected ? [selectedBranch] : branches).some(toArea),
    };
  }, [branches, isBranchSelected, selectedBranch]);

  if (showOverview) {
    return (
      <>
        <StudentOverviewCharts
          user={authUser}
          role={effectiveRole}
          isDoctor={isDoctor}
          adminFoundationStats={adminFoundationStats}
          userAuthRole={userAuthRole}
          assignedEvents={branchFilteredAssignedEvents}
          assignEventLoading={roleEventsLoading}
          assignEventError={roleEventsError}
          schoolAdmin={schoolAdmin}
          branches={branches}
          branchesLoading={getAllSchoolBranchLoading}
          branchesError={getAllSchoolBranchError}
          selectedBranchId={selectedBranchId}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranchId}
          selectedDoctorId={selectedDoctorId}
          onDoctorChange={setSelectedDoctorId}
          selectedCampId={selectedCampId}
          branchSummary={branchSummary}
          onCampChange={setSelectedCampId}
          totalStudents={isDoctor ? totalStudents : schoolStudentData.total}
          maleStudents={maleStudents}
          femaleStudents={femaleStudents}
          otherStudents={otherStudents}
          ageGroups={ageGroups}
          averageAge={averageAge}
          generalScreeningRecord={generalScreeningRecord}
          hearingScreeningRecord={hearingScreeningRecord}
          dentalScreeningRecord={dentalScreeningRecord}
          visionScreeningRecord={visionScreeningRecord}
          screeningLoading={screeningLoading}
          screeningError={screeningError}
          getStudentByEventLoading={getStudentByEventLoading}
          getStudentByEventError={getStudentByEventError}
          dashboardData={dashboardData}
          dashboardLoading={dashboardLoading}
          dashboardError={dashboardError}
          dashboardSummaryData={dashboardSummaryData}
          dashboardSummaryLoading={dashboardSummaryLoading}
          dashboardSummaryError={dashboardSummaryError}
        />
        {showSchoolDashboard ? (
          <div className="mb-6">
            <SchoolDashboardOverview />
          </div>
        ) : null}
      </>
    );
  }

  return <div>Welcome, user</div>;
};

export default MasterDashboard;
