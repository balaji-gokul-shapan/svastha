"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/lib/hooks";
import { getAllEvents } from "@/lib/features/getEventAssignSlice";
import useAuthUser from "@/lib/useAuthUser";
import {
  campMatchesBranch,
  getCampBranchId,
  getCampDate,
  getCampId,
  getCampSchoolId,
  getCampSchoolName,
  isCampActive,
} from "@/lib/camp-utils";

/**
 * Resolves the camp (medical event) the report is currently scoped to, for
 * EVERY role — not just doctors.
 *
 * Why this exists: `useStudentFilter` returns EMPTY_CAMP_SUMMARY for
 * non-doctors, and `/medical-event/assigned` is a per-doctor endpoint that 401s
 * for school/teacher roles. So a school user had `activeCampEvent === null`,
 * which made getScreeningIds() return [] and silently disabled all report
 * screening filtering — the report rendered every section for a school that
 * only ever ran two of them.
 *
 * Doctors keep using their ASSIGNED camps; everyone else reads the full event
 * list and scopes it to the selected branch.
 */
export default function useActiveCampEvent({
  assignedEvents,
  selectedCamp,
  campSelection,
  branchId,
  branchLabel,
} = {}) {
  const dispatch = useAppDispatch();
  const { authUser } = useAuthUser();

  const accountType = String(
    authUser?.account_type ?? authUser?.role ?? "",
  )
    .trim()
    .toLowerCase();
  const isDoctor = accountType === "doctor" || accountType === "staff";

  // Doctors: their assigned camps. Non-doctors: every event, scoped by branch.
  const { data: allEvents } = useQuery({
    queryKey: ["all-medical-events", accountType],
    queryFn: () => dispatch(getAllEvents()).unwrap(),
    enabled: !isDoctor,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Stable identities: the ternaries below would otherwise build a fresh []
  // on every render and defeat the memo entirely.
  const doctorEvents = useMemo(
    () => (Array.isArray(assignedEvents) ? assignedEvents : []),
    [assignedEvents],
  );
  const schoolEvents = useMemo(
    () => (Array.isArray(allEvents) ? allEvents : []),
    [allEvents],
  );

  return useMemo(() => {
    /* ---------------- Doctor: assigned camps, honouring the dropdown ------- */
    if (isDoctor) {
      const wantedId = String(campSelection ?? "").trim();
      if (wantedId && wantedId !== "all") {
        const picked = doctorEvents.find(
          (event) => getCampId(event) === wantedId,
        );
        if (picked) return picked;
      }

      const summaryId = getCampId(selectedCamp);
      if (summaryId) {
        const match = doctorEvents.find(
          (event) => getCampId(event) === summaryId,
        );
        if (match) return match;
      }

      return null;
    }

    /* ---------------- Other roles: branch-scoped event list ---------------- */
    const pool = schoolEvents.length ? schoolEvents : doctorEvents;
    if (!pool.length) return null;

    const wantedId = String(campSelection ?? "").trim();
    if (wantedId && wantedId !== "all") {
      const picked = pool.find((event) => getCampId(event) === wantedId);
      if (picked) return picked;
    }

    // A camp selection may arrive as a branch id (SchoolStudentFilter pushes
    // the branch id when a camp is picked), so match on branch too.
    const branch = String(branchId ?? "").trim();
    if (branch && branch !== "all") {
      const byBranch = pool.find(
        (event) =>
          campMatchesBranch(event, branch, branchLabel) ||
          getCampBranchId(event) === branch ||
          getCampSchoolId(event) === branch,
      );
      if (byBranch) return byBranch;
    }

    // Fall back to the newest active camp so the report still reflects the
    // camp's screening subset rather than silently showing everything.
    return (
      pool
        .filter(isCampActive)
        .sort((a, b) => getCampDate(b).localeCompare(getCampDate(a)))[0] ??
      pool[0] ??
      null
    );
  }, [
    isDoctor,
    doctorEvents,
    schoolEvents,
    campSelection,
    selectedCamp,
    branchId,
    branchLabel,
  ]);
}
