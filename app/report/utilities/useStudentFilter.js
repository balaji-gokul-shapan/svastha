"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectAuthUser } from "@/lib/features/auth-slice";
import useAssignedEvents, { findSelectedCampEvent } from "@/lib/useAssignedEvents";
import { buildCampSummary, EMPTY_CAMP_SUMMARY, getCampId } from "@/lib/camp-utils";
import { getStudentByEvent } from "@/lib/features/getEventAssignSlice";
import { getFilterStudent } from "@/lib/features/getFilterStudent";


const STUDENT_ID_KEYS = [
  "id",
  "studentId",
  "student_id",
  "cus_id",
  "school_registration_number",
  "admission_number",
];

const matchesStudentId = (student, wantedId) =>
  STUDENT_ID_KEYS.some(
    (key) => String(student?.[key] ?? "").trim() === wantedId,
  );

/**
 * useStudentFilter — reusable hook for report pages.
 */
export default function useStudentFilter() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const { assignedEvents, assignEventLoading, assignEventError } =
    useAssignedEvents();


  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [schoolName, setSchoolName] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [studentId, setStudentId] = useState("");

  const [formData, setFormData] = useState({
    branchName: "",
    AcademicYear: "",
    classes: "",
    section: "",
    BeneficiaryId: "",
  });

  /* ----------------------------------------------------------------------
     Camp selection (DOCTORS ONLY)
     ----------------------------------------------------------------------
                               */
  const isDoctor =
    authUser?.account_type === "doctor" || authUser?.account_type === "staff";

  const [campSelection, setCampSelection] = useState("all");
console.log(isDoctor,"isDoctor");


  const selectedCamp = useMemo(() => {
    if (!isDoctor) {
      return EMPTY_CAMP_SUMMARY;
    }

    const campList = Array.isArray(assignedEvents) ? assignedEvents : [];

    if (campSelection && campSelection !== "all") {
      const wantedId = String(campSelection).trim();
      const pickedCamp = campList.find(
        (camp) => getCampId(camp) === wantedId,
      );
      if (pickedCamp) {
        return buildCampSummary(pickedCamp);
      }
    }



    const bySchool = findSelectedCampEvent(assignedEvents, schoolName);

    if (bySchool) {
      return buildCampSummary(bySchool, { schoolName });
    }

    const firstCamp = campList.find((camp) => getCampId(camp));

    return firstCamp
      ? buildCampSummary(firstCamp, { schoolName })
      : buildCampSummary(null, { schoolName });
  }, [assignedEvents, schoolName, campSelection, isDoctor]);

  useEffect(() => {
    if (!isDoctor || !campSelection || campSelection === "all") {
      return;
    }

    const campList = Array.isArray(assignedEvents) ? assignedEvents : [];
    const stillThere = campList.some(
      (camp) => getCampId(camp) === String(campSelection).trim(),
    );

    if (!stillThere) {
      setCampSelection("all");
    }
  }, [assignedEvents, campSelection]);

  console.log(schoolName,"schoolName");
  

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
    // Doctor-only: this roster map exists to resolve a student's camp. A
    // non-doctor has no camp concept (SchoolStudentFilter scopes by branch),
    // so firing one request per assigned camp would be pure waste.
    enabled: isDoctor && assignedEventIds.length > 0,
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
  const selectedBranchId = (formData?.branchName ?? "").trim();

  const { data: filterPayload, isLoading } = useQuery({
    queryKey: ["filter-student", schoolName, selectedBranchId, academicYear, "options"],
    queryFn: () =>
      dispatch(
        getFilterStudent({
          all: true,
          status: "all",
          schoolName: selectedBranchId ? "all" : schoolName,
          branch_id: selectedBranchId,
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
  console.log(students,"studentssssssssssssss33");

  /*
   * The dropdown is not always fed by `students` above: with a camp selected
   * <StudentFilter /> lists that camp's roster, and <SchoolStudentFilter />
   * runs its own getFilterStudent query. Both land in redux, so search them
   * too — otherwise the picked student resolves to null.
   */
  const reduxFilterStudents = useAppSelector(
    (state) => state.getFilterStudent?.studentData,
  );
  const campRosterStudents = useAppSelector((state) => state.eventAssign?.students);

  const selectedStudent = useMemo(() => {
    const wantedId = String(studentId ?? "").trim();
    if (!wantedId || wantedId === "all") return null;
    return (
      [
        ...students,
        ...(reduxFilterStudents ?? []),
        ...(campRosterStudents ?? []),
      ].find((student) => matchesStudentId(student, wantedId)) ?? null
    );
  }, [students, reduxFilterStudents, campRosterStudents, studentId]);

  console.log(selectedStudent,"selectedStudentssss");
  
  /* ---------------------------------------------------------------------- */
  /* Props to spread onto <StudentFilter />                                 */
  /* ---------------------------------------------------------------------- */
  const filterProps = {
    formData,
    setFormData,
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
    authUser,
  };


  const doctorFilterProps = {
    campSelection,
    setCampSelection,
    assignedEvents,
    assignEventLoading,
    assignEventError,
  };

  return {
    filterProps,
    doctorFilterProps,
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
    campSelection,
    setCampSelection,
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
