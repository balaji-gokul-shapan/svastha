"use client";

import ReusableSelect from "@/components/ui/reusable-select";
import { getStudentByEvent } from "@/lib/features/getEventAssignSlice";
import { useAppDispatch } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";
import { findSelectedCamp } from "@/lib/useAssignedEvents";
import React, { useMemo } from "react";
// import { useDispatch } from "react-redux";

const getStudentClass = (student) => {
  const classValue = student?.Class ?? student?.class;

  if (
    classValue !== null &&
    classValue !== undefined &&
    String(classValue).trim()
  ) {
    return String(classValue).trim();
  }

  return String(student?.grade ?? "")
    .split("-")[0]
    .trim();
};

const getStudentSection = (student) => {
  const explicitSection = String(student?.sec ?? student?.section ?? "").trim();
  if (explicitSection) return explicitSection;

  return (
    String(student?.grade ?? "")
      .split("-")[1]
      ?.trim() || ""
  );
};

const StudentFilter = ({
  authUser,
  filterPayload,
  isLoading = false,
  schoolName = "all",
  academicYear = "all",
  classFilter = "all",
  sectionFilter = "all",
  studentFilter = "all",
  onSchoolNameChange,
  onAcademicYearChange,
  onClassFilterChange,
  onSectionFilterChange,
  onStudentFilterChange,
  assignedEvents,
  assignEventLoading = false,
  assignEventError = null,
}) => {
  const dispatch = useAppDispatch();
  const students = useMemo(
    () => (Array.isArray(filterPayload?.items) ? filterPayload.items : []),
    [filterPayload],
  );
  console.log(authUser, "authUser");

  const studentsBySchoolAndYear = useMemo(
    () =>
      students.filter((student) => {
        const studentSchool = String(
          student?.school_name ?? student?.schoolName ?? student?.school ?? "",
        ).trim();
        const studentYear = String(
          student?.academic_year ?? student?.academicYear ?? "",
        ).trim();

        const schoolMatch =
          schoolName === "all" ||
          !studentSchool ||
          studentSchool === schoolName;
        const yearMatch =
          academicYear === "all" ||
          !studentYear ||
          studentYear === academicYear;

        return schoolMatch && yearMatch;
      }),
    [academicYear, schoolName],
  );

  // Role gate for the Camp/School selects. Matches checkDoctor in
  // useStudentData: admins count as doctors.
  const isDoctor =
    authUser?.account_type === "doctor" || authUser?.account_type === "admin";
console.log(authUser,"isDoctor");

  // const schoolOptions = useMemo(() => {
  //   const unique = new Set();

  //   students.forEach((student) => {
  //     const value = String(
  //       student?.school_name ?? student?.schoolName ?? student?.school ?? "",
  //     ).trim();
  //     if (value) {
  //       unique.add(value);
  //     }
  //   });

  //   return [
  //     { label: "All Schools", value: "all" },
  //     ...Array.from(unique)
  //       .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  //       .map((value) => ({ label: value, value })),
  //   ];
  // }, [students]);

  const campOptions = useMemo(() => {
    const unique = new Set();
    const campList = Array.isArray(assignedEvents) ? assignedEvents : [];
    console.log(campList, "campList");

    campList.forEach((camp) => {
      const value = String(
        camp.name ?? camp.Name ?? camp.camp_name ?? "",
      ).trim();
      if (value) {
        unique.add(value);
      }
    });

    return [
      { label: "All Camps", value: "all" },
      ...Array.from(unique)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((value) => ({ label: value, value })),
    ];
  }, [assignedEvents]);

  console.log(campOptions, "campOptions");

  // Camp shown in the "Camp Name" select is derived from the active
  // school filter, so the Camp and School selects can never disagree.
  // Shared helper — same logic AssessmentCard uses. Exposes the camp's
  // id, name and school: { id: 1, name: "Svastha Health Camp",
  // schoolName: "Sudarshanam Vidyaashram" } or { id: null, name: "all",
  // schoolName: "all" } when no camp is selected.
  console.log(assignedEvents, schoolName, "schoolName");
  
  const selectedCamp = useMemo(
    () => findSelectedCamp(assignedEvents, schoolName),
    [assignedEvents, schoolName],
  );

  const schoolOptions = useMemo(() => {
    const unique = new Set();

    const eventList = Array.isArray(assignedEvents) ? assignedEvents : [];
    eventList.forEach((event) => {
      const value = String(
        event?.school?.school_name ??
          event?.school?.name ??
          event?.school_name ??
          event?.schoolName ??
          "",
      ).trim();
      if (value) {
        unique.add(value);
      }
    });

    if (unique.size === 0) {
      students.forEach((student) => {
        const value = String(
          student?.school_name ?? student?.schoolName ?? student?.school ?? "",
        ).trim();
        if (value) {
          unique.add(value);
        }
      });
    }

    return [
      { label: "All Schools", value: "all" },
      ...Array.from(unique)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((value) => ({ label: value, value })),
    ];
  }, [assignedEvents]);
console.log(selectedCamp,"selectedCamp");

  const {
    data: getStundentByEvent,
    isLoading: getStundentByEventLoading,
    error: getStundentByEventError,
  } = useQuery({
    queryKey: ["get-event-student", selectedCamp.id],
    queryFn: () =>
      dispatch(getStudentByEvent({ eventId: selectedCamp.id })).unwrap(),
    enabled: Boolean(selectedCamp.id),
    // The roster fetch can span many pages (20 students/page) — cache it
    // for 5 minutes and skip window-focus refetches so switching tabs
    // doesn't re-run the whole paginated fetch.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  console.log(getStundentByEvent, "getStundentByEvent");

  // Students belonging to the selected camp/event. The thunk already
  // unwraps paginator envelopes; guard alternate shapes anyway.
  const eventStudents = useMemo(() => {
    if (Array.isArray(getStundentByEvent)) return getStundentByEvent;
    if (Array.isArray(getStundentByEvent?.data)) return getStundentByEvent.data;
    return [];
  }, [getStundentByEvent]);

  console.log(eventStudents, "eventStudents");

  const optionStudents = eventStudents.length
    ? eventStudents
    : studentsBySchoolAndYear;

  const academicYearOptions = useMemo(() => {
    const unique = new Set();

    optionStudents.forEach((student) => {
      const value = String(
        student?.academic_year ?? student?.academicYear ?? "",
      ).trim();
      if (value) {
        unique.add(value);
      }
    });
    console.log(optionStudents, "optionStudents");

    return [
      { label: "All Academic Years", value: "all" },
      ...Array.from(unique)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((value) => ({ label: value, value })),
    ];
  }, [optionStudents]);

  const classOptions = useMemo(() => {
    const unique = new Set();

    optionStudents.forEach((student) => {
      const value = getStudentClass(student);

      if (value) {
        unique.add(value);
      }
    });

    return [
      { label: "All Classes", value: "all" },
      ...Array.from(unique)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((value) => ({ label: value, value })),
    ];
  }, [optionStudents]);

  const sectionOptions = useMemo(() => {
    const unique = new Set();

    optionStudents.forEach((student) => {
      const classValue = getStudentClass(student);
      if (classFilter !== "all" && classValue !== classFilter) {
        return;
      }

      const value = getStudentSection(student);

      if (value) {
        unique.add(value);
      }
    });

    return [
      { label: "All Sections", value: "all" },
      ...Array.from(unique)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((value) => ({ label: value, value })),
    ];
  }, [classFilter, optionStudents]);

  const studentOptions = useMemo(() => {
    const filtered = optionStudents.filter((student) => {
      const studentClass = getStudentClass(student);
      const studentSection = getStudentSection(student);

      const classMatch = classFilter === "all" || studentClass === classFilter;

      const sectionMatch =
        sectionFilter === "all" || studentSection === sectionFilter;

      return classMatch && sectionMatch;
    });

    return [
      {
        label: "All Students",
        value: "all",
      },

      ...filtered
        .map((student) => {
          const value = String(student?.id ?? student?.studentId ?? "").trim();

          const code =
            student?.studentId ??
            student?.student_id ??
            student?.school_registration_number ??
            student?.admission_number;

          return {
            value,
            label: `${student?.student_name ?? student?.name ?? "Unknown"}${
              code ? ` (${code})` : ""
            }`,
          };
        })
        .filter((item) => item.value),
    ];
  }, [optionStudents, classFilter, sectionFilter]);
  console.log(studentOptions, "studentOptions");

  return (
    <>
      <div
        className={`grid gap-3 sm:grid-cols-2 ${isDoctor ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}
      >
        {isDoctor && (
          <>
            <ReusableSelect
              label="Camp Name"
              options={campOptions}
              value={selectedCamp.name}
              onChange={(value) => {
                if (value === "all") {
                  onSchoolNameChange?.("all");
                  return;
                }

                // Selecting a camp drives the existing school filter via
                // that camp's school, so student filtering keeps working
                // without new parent state.
                const campList = Array.isArray(assignedEvents)
                  ? assignedEvents
                  : [];
                const selectedEvent = campList.find(
                  (event) => String(event?.name ?? "").trim() === value,
                );
                const eventSchool = String(
                  selectedEvent?.school?.school_name ??
                    selectedEvent?.school?.name ??
                    "",
                ).trim();

                onSchoolNameChange?.(eventSchool || "all");
              }}
              placeholder={
                assignEventLoading ? "Loading camps..." : "Select Camp"
              }
              searchPlaceholder="Search Camp"
              // Disabled only while something is loading — an empty or
              // errored camp list must not permanently lock the select.
              disabled={isLoading || assignEventLoading}
            />

            {assignEventError ? (
              <p className="mt-1 text-xs text-destructive">
                Unable to load camps. Please retry.
              </p>
            ) : null}
          </>
        )}

        {isDoctor && (
          <ReusableSelect
            label="School Name"
            options={schoolOptions}
            value={schoolName}
            onChange={onSchoolNameChange}
            placeholder="Select school"
            searchPlaceholder="Search school"
            disabled={isLoading}
          />
        )}
        <ReusableSelect
          label="Academic Year"
          options={academicYearOptions}
          value={academicYear}
          onChange={onAcademicYearChange}
          placeholder="Select academic year"
          searchPlaceholder="Search academic year"
          disabled={isLoading}
        />

        <div className="xl:col-span-1 grid grid-cols-2 gap-3">
          <ReusableSelect
            label="Class"
            options={classOptions}
            value={classFilter}
            onChange={onClassFilterChange}
            placeholder="Select class"
            searchPlaceholder="Search class"
            disabled={isLoading}
          />

          <ReusableSelect
            label="Section"
            options={sectionOptions}
            value={sectionFilter}
            onChange={onSectionFilterChange}
            placeholder="Select section"
            searchPlaceholder="Search section"
            disabled={isLoading}
          />
        </div>

        <ReusableSelect
          label="Student"
          options={studentOptions}
          value={studentFilter}
          onChange={onStudentFilterChange}
          placeholder="Select student"
          searchPlaceholder="Search student"
          disabled={isLoading}
        />
      </div>
    </>
  );
};

// Memoized: prevents re-rendering all five selects (and their option lists)
// on every keystroke in the parent screening form.
export default React.memo(StudentFilter);
