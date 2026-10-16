import { useMemo } from "react";
import {
  getAllSchoolBranches,
  getSchoolBranch,
} from "@/lib/features/registerSchoolBranchSlice";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/lib/hooks";
import { useAuthRole } from "@/lib/user-role";
import { getAllSubAccount } from "@/lib/features/registerStaffAccount";
import { getAllScreening } from "@/lib/features/registerScreeningSlice";
import { getAllEvents } from "@/lib/features/getEventAssignSlice";
import { getAllStudent } from "@/lib/features/getAllStudentSlice";
import { getSchoolDashboard } from "@/lib/features/dashboardSlice";

export const useSchoolSuperAdminApi = (
  role,
  requestedSchoolBranchId,
  appliedFilters = {},
) => {
  const dispatch = useAppDispatch();
  const authRole = useAuthRole();
  const getRole = String(role ?? authRole ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  console.log(getRole, "getRolevvvvvvvvvvvv");

  const canAccessAllSchoolBranches =
    getRole === "admin" ||
    getRole === "superadmin" ||
    getRole === "super_admin" ||
    getRole === "school" ||
    getRole === "school_admin";
  const canLoadSchoolDashboard =
    canAccessAllSchoolBranches || getRole === "teacher";

  const dashboardFilterArgs = useMemo(() => {
    const range = appliedFilters?.selectedDate ?? null;
    const from = String(range?.from ?? "").trim();
    const to = String(range?.to ?? "").trim();
    const branchId = String(appliedFilters?.branchId ?? "").trim();
    const campId = String(appliedFilters?.campId ?? "").trim();

    const args = {};
    if (from) args.from_date = from;
    if (to) args.to_date = to;
    if (branchId && branchId !== "all") args.branch_id = branchId;
    if (campId && campId !== "all") args.camp_id = campId;
    return args;
  }, [appliedFilters]);

  const {
    data: getAllSchoolBranch = {},
    isLoading: getAllSchoolBranchLoading,
    error: getAllSchoolBranchError,
  } = useQuery({
    queryKey: ["getSchoolAllBranch", getRole],
    queryFn: () => dispatch(getAllSchoolBranches()).unwrap(),
    enabled: canAccessAllSchoolBranches,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  const {
    data: getSchoolBranchData = {},
    isLoading: getSchoolBranchLoading,
    error: getSchoolBranchError,
  } = useQuery({
    queryKey: ["getSchoolBranch", getRole],
    queryFn: () => dispatch(getSchoolBranch()).unwrap(),
    enabled: canAccessAllSchoolBranches || getRole === "teacher",
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  console.log(getSchoolBranchData, "getSchoolBranchData");

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboard", getRole, dashboardFilterArgs],
    queryFn: () => dispatch(getSchoolDashboard(dashboardFilterArgs)).unwrap(),
    enabled: canLoadSchoolDashboard,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const dashboardBranches = useMemo(() => {
    const list = dashboardData?.data?.branches;
    return Array.isArray(list) ? list.filter(Boolean) : [];
  }, [dashboardData]);

  const schoolBranch = useMemo(() => {
    if (!dashboardBranches.length) return null;
    const scopeIds = dashboardData?.scope?.branch_ids;
    const scoped =
      Array.isArray(scopeIds) && scopeIds.length
        ? dashboardBranches.find((branch) =>
            scopeIds.some(
              (id) =>
                String(id ?? "").trim() ===
                String(branch?.branch_id ?? branch?.id ?? "").trim(),
            ),
          )
        : null;

    return scoped ?? dashboardBranches[0] ?? null;
  }, [dashboardBranches, dashboardData]);

  console.log(schoolBranch, "schoolBranch3333333");

  const schoolBranchId = String(
    schoolBranch?.id ??
      schoolBranch?.branch_id ??
      schoolBranch?.school_branch_id ??
      "",
  ).trim();
  const schoolBranchName = String(
    schoolBranch?.branch_name ??
      schoolBranch?.name ??
      schoolBranch?.school_branch?.branch_name ??
      "",
  ).trim();

  const {
    data: subAccountsData = [],
    isLoading: subAccountsLoading,
    error: subAccountsError,
    refetch: refetchSubAccounts,
  } = useQuery({
    queryKey: ["getAllSubAccount"],
    queryFn: () => dispatch(getAllSubAccount()).unwrap(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: getRole === "school" || getRole === "school_admin",
  });

  const {
    data: getAllEventsData = [],
    isLoading: getAllEventsLoading,
    error: getAllEventsError,
  } = useQuery({
    queryKey: ["school-dashboard-events", getRole],
    queryFn: () => dispatch(getAllEvents()).unwrap(),
    enabled: canLoadSchoolDashboard,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  const resolvedSchoolBranchId = String(
    requestedSchoolBranchId ?? schoolBranchId ?? "",
  ).trim();

  const {
    data: getAllStudentData = [],
    isLoading: getAllStudentLoading,
    error: getAllStudentError,
  } = useQuery({
    queryKey: ["school-dashboard-students", getRole, resolvedSchoolBranchId],
    queryFn: () =>
      dispatch(
        getAllStudent({
          branch_id: resolvedSchoolBranchId,
        }),
      ).unwrap(),
    enabled:
      getRole === "admin" ||
      getRole === "school" ||
      getRole === "school_admin" ||
      getRole === "school_sub_account",
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  console.log(getAllStudentData, "getAllStudentData");

  const {
    data: getAllScreeningData = [],
    isLoading: getAllScreeningLoading,
    error: getAllScreeningError,
  } = useQuery({
    queryKey: ["getAllScreening"],
    queryFn: () => dispatch(getAllScreening()).unwrap(),
    enabled: canLoadSchoolDashboard,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return {
    getSchoolBranchData,
    getSchoolBranchLoading,
    getSchoolBranchError,
    getAllSchoolBranch,
    getAllSchoolBranchLoading,
    getAllSchoolBranchError,
    schoolBranch,
    schoolBranchId,
    schoolBranchName,
    subAccountsData,
    subAccountsLoading,
    subAccountsError,
    refetchSubAccounts,
    getAllScreeningData,
    getAllScreeningLoading,
    getAllScreeningError,
    getAllEventsData,
    getAllEventsLoading,
    getAllEventsError,
    getAllStudentData,
    getAllStudentLoading,
    getAllStudentError,
    dashboardData,
    dashboardLoading,
    dashboardError,
    dashboardSummaryData: dashboardData,
    dashboardSummaryLoading: dashboardLoading,
    dashboardSummaryError: dashboardError,
  };
};
