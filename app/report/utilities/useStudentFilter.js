"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectAuthUser } from "@/lib/features/auth-slice";
import useAssignedEvents, { findSelectedCamp } from "@/lib/useAssignedEvents";
import { getStudentByEvent } from "@/lib/features/getEventAssignSlice";
import { getFilterStudent } from "@/lib/features/getFilterStudent";

/**
 * useStudentFilter — reusable hook for report pages.
 *
 * Encapsulates ALL of the following so consumers don't have to:
 *   - Filter state (schoolName, academicYear, class/section/student filters)
 *   - The camp-student-roster reverse-lookup query (campStudentMap)
 *   - The /students/filter query (filterPayload)
 *   - Derived `students` list + `selectedStudent` lookup
 *   - All filter-change handlers (with proper dependent-filter resets)
 *   - The resolved `selectedCamp` from assigned events
 *
 * Usage:
 *   const { filterProps, students, selectedStudent } = useStudentFilter();
 *   <StudentFilter {...filterProps} />
 */
export default function useStudentFilter() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const { assignedEvents, assignEventLoading, assignEventError } =
    useAssignedEvents();

  /* ---------------------------------------------------------------------- */
  /* Filter state                                                           */
  /* ---------------------------------------------------------------------- */
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [schoolName, setSchoolName] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [studentId, setStudentId] = useState("");

  const selectedCamp = useMemo(
    () => findSelectedCamp(assignedEvents, schoolName),
    [assignedEvents, schoolName],
  );

  const assignedEventIds = useMemo(
    () =>
      (Array.isArray(assignedEvents) ? assignedEvents : [])
        .map((event) => String(event?.id ?? "").trim())
        .filter(Boolean)
        .sort(),
    [assignedEvents],
  );

  /* ---------------------------------------------------------------------- */
  /* Reverse lookup: student-key -> { campId, campName, schoolName }        */
  /* ---------------------------------------------------------------------- */
  const { data: campStudentMap } = useQuery({
    queryKey: ["report-camp-rosters", assignedEventIds],
    queryFn: async () => {
      const map = {};
      for (const event of Array.isArray(assignedEvents) ? assignedEvents : []) {
        const eventId = String(event?.id ?? "").trim();
        if (!eventId) continue;
        try {
          const result = await dispatch(getStudentByEvent({ eventId })).unwrap();
          const rows = Array.isArray(result?.items)
            ? result.items
            : Array.isArray(result)
              ? result
              : [];
          const campName = String(event?.name ?? "").trim();
          const campSchool = String(
            event?.school?.school_name ??
              event?.school?.name ??
              event?.school_name ??
              event?.schoolName ??
              "",
          ).trim();
          for (const row of Array.isArray(rows) ? rows : []) {
            const keys = [
              row?.id,
              row?.studentId,
              row?.student_id,
              row?.cus_id,
              row?.school_registration_number,
              row?.admission_number,
            ]
              .map((value) => String(value ?? "").trim())
              .filter(Boolean);
            for (const key of keys) {
              if (!map[key]) {
                map[key] = { campId: eventId, campName, schoolName: campSchool };
              }
            }
          }
        } catch {
          // One failed roster must not break the remaining camps.
        }
      }
      return map;
    },
    enabled: assignedEventIds.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  /* ---------------------------------------------------------------------- */
  /* Filter handlers                                                         */
  /* ---------------------------------------------------------------------- */
  const resetDependentFilters = useCallback(() => {
    setClassFilter("all");
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleSchoolFilterChange = useCallback(
    (value) => {
      setSchoolName(value);
      resetDependentFilters();
    },
    [resetDependentFilters],
  );

  const handleAcademicYearFilterChange = useCallback(
    (value) => {
      setAcademicYear(value);
      resetDependentFilters();
    },
    [resetDependentFilters],
  );

  const handleClassFilterChange = useCallback((value) => {
    setClassFilter(value);
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleSectionFilterChange = useCallback((value) => {
    setSectionFilter(value);
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleStudentFilterChange = useCallback((value) => {
    setStudentFilter(value);
    setStudentId(value === "all" ? "" : value);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Students query                                                         */
  /* ---------------------------------------------------------------------- */
  const { data: filterPayload, isLoading } = useQuery({
    queryKey: ["filter-student", schoolName, academicYear, "options"],
    queryFn: () =>
      dispatch(
        getFilterStudent({
          all: true,
          status: "all",
          schoolName,
          academicYear,
          sortBy: "name",
          sortOrder: "asc",
          search: "",
        }),
      ).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const students = useMemo(
    () => (Array.isArray(filterPayload?.items) ? filterPayload.items : []),
    [filterPayload],
  );

  const selectedStudent = useMemo(() => {
    if (!studentId) return null;
    return (
      students.find((student) => {
        const ids = [
          student?.id,
          student?.studentId,
          student?.cus_id,
          student?.school_registration_number,
          student?.admission_number,
        ]
          .map((value) => String(value ?? "").trim())
          .filter(Boolean);
        return ids.includes(String(studentId).trim());
      }) ?? null
    );
  }, [students, studentId]);

  /* ---------------------------------------------------------------------- */
  /* Props to spread onto <StudentFilter />                                 */
  /* ---------------------------------------------------------------------- */
  const filterProps = {
    filterPayload,
    isLoading,
    schoolName,
    academicYear,
    classFilter,
    sectionFilter,
    studentFilter,
    onSchoolNameChange: handleSchoolFilterChange,
    onAcademicYearChange: handleAcademicYearFilterChange,
    onClassFilterChange: handleClassFilterChange,
    onSectionFilterChange: handleSectionFilterChange,
    onStudentFilterChange: handleStudentFilterChange,
    assignedEvents,
    assignEventLoading,
    assignEventError,
    authUser,
  };

  return {
    filterProps,
    academicYear,
    setAcademicYear,
    schoolName,
    setSchoolName,
    classFilter,
    setClassFilter,
    sectionFilter,
    setSectionFilter,
    studentFilter,
    setStudentFilter,
    studentId,
    setStudentId,
    students,
    selectedStudent,
    selectedCamp,
    campStudentMap,
    filterPayload,
    isLoading,
    assignedEvents,
    assignEventLoading,
    assignEventError,
    handleSchoolFilterChange,
    handleAcademicYearFilterChange,
    handleClassFilterChange,
    handleSectionFilterChange,
    handleStudentFilterChange,
    resetDependentFilters,
  };
}
