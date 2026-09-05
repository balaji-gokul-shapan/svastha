"use client";

import ReusableSelect from "@/components/ui/reusable-select";
import { getStudentByEvent } from "@/lib/features/getEventAssignSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";
import { findSelectedCamp } from "@/lib/useAssignedEvents";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import { selectAuthRole } from "@/lib/features/auth-slice";
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
  getStudentDataByEvent,
  setGetStudentDataByEvent,
}) => {
  const dispatch = useAppDispatch();
  const students = useMemo(
    () => (Array.isArray(filterPayload?.items) ? filterPayload.items : []),
    [filterPayload],
  );
  console.log(authUser, "authUser");
  // const getRole=  selectAuthRole
  // console.log(selectAuthRole,"selectAuthRole");

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
    authUser?.account_type === "doctor" || authUser?.account_type === "staff";
  console.log(authUser, "isDoctor");

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

  // Local selection state for the Camp Name dropdown so the dropdown gives
  // immediate feedback, then snaps in sync with the school-derived camp.
  const [campSelection, setCampSelection] = useState("all");

  useEffect(() => {
    setCampSelection(selectedCamp.name);
  }, [selectedCamp.name]);

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
  console.log(selectedCamp, "selectedCamp");

  const {
    data: getStundentByEvent,
    isLoading: getStundentByEventLoading,
    error: getStundentByEventError,
  } = useQuery({
    queryKey: ["get-event-student", selectedCamp.id],
    queryFn: async () => {
      try {
        const result = await dispatch(getStudentByEvent({ eventId: selectedCamp.id })).unwrap();
        console.log("[StudentFilter] Raw thunk result:", result);
        const items = Array.isArray(result?.items) ? result.items : Array.isArray(result) ? result : [];
        console.log("[StudentFilter] Extracted items:", items.length, "items");
        return items;
      } catch (err) {
        console.error("[StudentFilter] queryFn error:", err);
        throw err;
      }
    },
    enabled: Boolean(selectedCamp.id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log("[StudentFilter] selectedCamp.id:", selectedCamp?.id, "| enabled:", Boolean(selectedCamp?.id), "| loading:", getStundentByEventLoading, "| error:", getStundentByEventError?.message, "| data length:", Array.isArray(getStundentByEvent) ? getStundentByEvent.length : "not array");

  // Update parent state after render to avoid "Cannot update a component while rendering" error
  useEffect(() => {
    if (typeof setGetStudentDataByEvent === "function") {
      setGetStudentDataByEvent(getStundentByEvent);
    }
  }, [getStundentByEvent, setGetStudentDataByEvent]);

  console.log(getStudentDataByEvent, "getStudentDataByEvent");

  // Students belonging to the selected camp/event. Read from the Redux slice's
  // dedicated `students` field so that infinite-scroll appends (page 2+) are
  // reflected and the camps query can never clobber the roster.
  // The useQuery only triggers page 1; subsequent pages dispatch directly.
  const eventAssignState = useAppSelector((state) => state.eventAssign);
  const eventStudents = useMemo(() => {
    // Primary source: slice.students (always a flat array)
    const roster = eventAssignState?.students;
    if (Array.isArray(roster) && roster.length) {
      return roster;
    }
    // Legacy fallback: fetchedRecord (may be flat array)
    const legacy = eventAssignState?.fetchedRecord;
    if (Array.isArray(legacy) && legacy.length) {
      return legacy;
    }
    // Last resort: the useQuery result (flat array from queryFn)
    if (Array.isArray(getStundentByEvent)) {
      return getStundentByEvent;
    }
    if (Array.isArray(getStundentByEvent?.items)) {
      return getStundentByEvent.items;
    }
    return [];
  }, [eventAssignState?.students, eventAssignState?.fetchedRecord, getStundentByEvent]);

  // Pagination metadata from the slice (studentTotal, studentPage, loadingMore).
  // studentHasMore is computed in the slice (trusts backend total when given,
  // falls back to "full page = probably more" and dedupe-based bail-out).
  const studentTotal = eventAssignState?.studentTotal ?? 0;
  const studentPage = eventAssignState?.studentPage ?? 1;
  const studentTotalKnown = eventAssignState?.studentTotalKnown ?? false;
  const loadingMoreStudents = eventAssignState?.loadingMore ?? false;
  const hasMoreStudents = eventAssignState?.studentHasMore ?? false;

  // Infinite scroll: dispatch the next page when the dropdown bottom is reached.
  const handleLoadMoreStudents = useCallback(() => {
    if (loadingMoreStudents || !hasMoreStudents) return;
    const nextPage = studentPage + 1;
    dispatch(getStudentByEvent({ eventId: selectedCamp.id, page: nextPage, perPage: 50 }));
  }, [dispatch, selectedCamp?.id, studentPage, loadingMoreStudents, hasMoreStudents]);

  // Search across the FULL camp roster: typing in the Student select first
  // fetches any not-yet-loaded pages (beyond the initial 50), then filters
  // every student — so a match on page 7 is found without scrolling.
  const [studentSearchOptions, setStudentSearchOptions] = useState(null);

  // Latest-value refs keep handleStudentSearch's identity stable, so the
  // select's debounce effect doesn't re-fire every time the roster grows.
  const rosterRef = useRef(eventStudents);
  const rosterPageRef = useRef(studentPage);
  const rosterTotalRef = useRef(studentTotal);
  const rosterTotalKnownRef = useRef(studentTotalKnown);
  rosterRef.current = eventStudents;
  rosterPageRef.current = studentPage;
  rosterTotalRef.current = studentTotal;
  rosterTotalKnownRef.current = studentTotalKnown;

  const handleStudentSearch = useCallback(
    async (keyword) => {
      const term = String(keyword ?? "").trim().toLowerCase();
      if (!term) {
        setStudentSearchOptions(null);
        return;
      }

      const seen = new Set();
      const allStudents = [];
      const pushAll = (list) => {
        (list ?? []).forEach((student) => {
          const key = String(
            student?.id ?? student?.student_id ?? student?.student_name ?? "",
          );
          if (key && !seen.has(key)) {
            seen.add(key);
            allStudents.push(student);
          }
        });
      };
      pushAll(rosterRef.current);

      // Fetch remaining pages until the roster is complete. Robust against
      // backend quirks: keep going until an empty page, a page that adds
      // nothing new (backend repeating itself), or the reported total —
      // do NOT trust item counts or per_page being honored.
      let page = rosterPageRef.current;
      let guard = 60; // ≈ 3000 students max
      try {
        while (guard-- > 0) {
          // Only trust the total when the backend actually reported one.
          // A faked total (= items.length of the first page) would read as
          // "all loaded" and abort the search before page 2.
          const total = rosterTotalRef.current;
          const totalKnown = rosterTotalKnownRef.current;
          if (totalKnown && total && allStudents.length >= total) break;
          const result = await dispatch(
            getStudentByEvent({
              eventId: selectedCamp?.id,
              page: page + 1,
              perPage: 50,
            }),
          ).unwrap();
          const items = Array.isArray(result?.items) ? result.items : [];
          if (!items.length) break; // genuine end of data
          const before = allStudents.length;
          pushAll(items);
          page = result?.page ?? page + 1;
          if (allStudents.length === before) break; // backend repeating a page
        }
      } catch {
        // Page fetch failed — fall back to filtering whatever is loaded.
      }

      // Same label/value shape as studentOptions, honoring class/section filters.
      const matches = allStudents
        .filter((student) => {
          const studentClass = getStudentClass(student);
          const studentSection = getStudentSection(student);
          const classMatch = classFilter === "all" || studentClass === classFilter;
          const sectionMatch =
            sectionFilter === "all" || studentSection === sectionFilter;
          if (!classMatch || !sectionMatch) return false;

          const code =
            student?.studentId ??
            student?.student_id ??
            student?.school_registration_number ??
            student?.admission_number;
          const haystack = [
            student?.student_name,
            student?.name,
            code,
            studentClass,
            studentSection,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(term);
        })
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
        .filter((item) => item.value);

      console.log(
        `[StudentFilter] search "${term}": scanned ${allStudents.length} students (started with ${rosterRef.current.length}) → ${matches.length} match(es)`,
      );
      setStudentSearchOptions(matches);
    },
    [dispatch, selectedCamp?.id, classFilter, sectionFilter],
  );

  const optionStudents = eventStudents.length
    ? eventStudents
    : studentsBySchoolAndYear;

  console.log(
    "[StudentFilter] roster:", eventStudents.length,
    "| total:", studentTotal,
    "| page:", studentPage,
    "| optionStudents:", optionStudents.length,
    "| source:", eventStudents.length ? "Redux roster" : "filterPayload fallback",
  );

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

    return [
      { label: "All Academic Years", value: "all" },
      ...Array.from(unique)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((value) => ({ label: value, value })),
    ];
  }, [optionStudents]);

  console.log(academicYearOptions, "academicYearOptions");

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

    // Derive sections from the FULL roster (eventStudents) so all sections
    // always appear regardless of the selected class filter. Filtering by
    // class here would hide sections that don't have students in the selected
    // class (e.g. picking class "1" would drop sections that only exist in
    // other classes).
    eventStudents.forEach((student) => {
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
  }, [eventStudents]);

  const studentOptions = useMemo(() => {
    const matchesBoth = optionStudents.filter((student) => {
      const studentClass = getStudentClass(student);
      const studentSection = getStudentSection(student);
      const classMatch = classFilter === "all" || studentClass === classFilter;
      const sectionMatch = sectionFilter === "all" || studentSection === sectionFilter;
      return classMatch && sectionMatch;
    });

    // Fallback: when no student matches both class AND section (e.g. class 1 +
    // section A exists but no student is in both), show all students matching the
    // class filter instead of an empty list.
    const filtered =
      matchesBoth.length > 0
        ? matchesBoth
        : classFilter !== "all"
          ? optionStudents.filter((student) => getStudentClass(student) === classFilter)
          : sectionFilter !== "all"
            ? optionStudents.filter((student) => getStudentSection(student) === sectionFilter)
            : optionStudents;

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
              value={campSelection}
              onChange={(value) => {
                // Immediate feedback for the dropdown itself.
                setCampSelection(value);

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
          options={studentSearchOptions ?? studentOptions}
          value={studentFilter}
          onChange={onStudentFilterChange}
          placeholder="Select student"
          searchPlaceholder="Search student"
          disabled={isLoading}
          onSearch={handleStudentSearch}
          onLoadMore={handleLoadMoreStudents}
          hasMore={hasMoreStudents}
          isLoadingMore={loadingMoreStudents}
        />
      </div>
    </>
  );
};

// Memoized: prevents re-rendering all five selects (and their option lists)
// on every keystroke in the parent screening form.
export default React.memo(StudentFilter);
