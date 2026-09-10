"use client";

import ReusableSelect from "@/components/ui/reusable-select";
import { getStudentByEvent } from "@/lib/features/getEventAssignSlice";
import { fetchWithAuth } from "@/lib/auth-utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { findSelectedCamp } from "@/lib/useAssignedEvents";
import { useQuery } from "@tanstack/react-query";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

  if (explicitSection) {
    return explicitSection;
  }

  return (
    String(student?.grade ?? "")
      .split("-")[1]
      ?.trim() || ""
  );
};

const getStudentId = (student) => {
  return String(
    student?.id ?? student?.studentId ?? student?.student_id ?? "",
  ).trim();
};

const getStudentCode = (student) => {
  return (
    student?.studentId ??
    student?.student_id ??
    student?.school_registration_number ??
    student?.admission_number ??
    ""
  );
};

const getStudentName = (student) => {
  return student?.student_name ?? student?.name ?? "Unknown";
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

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

  /* ------------------------------------------------------------------------ */
  /* Base students                                                            */
  /* ------------------------------------------------------------------------ */

  const students = useMemo(() => {
    return Array.isArray(filterPayload?.items) ? filterPayload.items : [];
  }, [filterPayload]);

  /* ------------------------------------------------------------------------ */
  /* Role                                                                     */
  /* ------------------------------------------------------------------------ */

  const isDoctor =
    authUser?.account_type === "doctor" || authUser?.account_type === "staff";

  const isSuperAdmin =
    authUser?.account_type === "school" || authUser?.role === "school";

  // Prevent unused-variable lint warning if this role is not currently used.
  void isSuperAdmin;

  /* ------------------------------------------------------------------------ */
  /* Students filtered by school + academic year                              */
  /* ------------------------------------------------------------------------ */

  const studentsBySchoolAndYear = useMemo(() => {
    return students.filter((student) => {
      const studentSchool = String(
        student?.school_name ?? student?.schoolName ?? student?.school ?? "",
      ).trim();

      const studentYear = String(
        student?.academic_year ?? student?.academicYear ?? "",
      ).trim();

      const schoolMatch =
        schoolName === "all" || !studentSchool || studentSchool === schoolName;

      const yearMatch =
        academicYear === "all" || !studentYear || studentYear === academicYear;

      return schoolMatch && yearMatch;
    });
  }, [students, schoolName, academicYear]);

  /* ------------------------------------------------------------------------ */
  /* Camp options                                                             */
  /* ------------------------------------------------------------------------ */

  const campOptions = useMemo(() => {
    const unique = new Set();

    const campList = Array.isArray(assignedEvents) ? assignedEvents : [];

    campList.forEach((camp) => {
      const value = String(
        camp?.name ?? camp?.Name ?? camp?.camp_name ?? "",
      ).trim();

      if (value) {
        unique.add(value);
      }
    });

    return [
      {
        label: "All Camps",
        value: "all",
      },

      ...Array.from(unique)
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
          }),
        )
        .map((value) => ({
          label: value,
          value,
        })),
    ];
  }, [assignedEvents]);

  /* ------------------------------------------------------------------------ */
  /* Selected camp                                                            */
  /* ------------------------------------------------------------------------ */

  const selectedCamp = useMemo(() => {
    const result = findSelectedCamp(assignedEvents, schoolName);

    return (
      result ?? {
        id: null,
        name: "all",
        schoolName: "all",
      }
    );
  }, [assignedEvents, schoolName]);

  /* ------------------------------------------------------------------------ */
  /* Camp selection                                                           */
  /* ------------------------------------------------------------------------ */

  const [campSelection, setCampSelection] = useState("all");

  useEffect(() => {
    setCampSelection(selectedCamp?.name ?? "all");
  }, [selectedCamp?.name]);

  /* ------------------------------------------------------------------------ */
  /* School options                                                           */
  /* ------------------------------------------------------------------------ */

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

    // Fallback to students if events don't contain schools.
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
      {
        label: "All Schools",
        value: "all",
      },

      ...Array.from(unique)
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
          }),
        )
        .map((value) => ({
          label: value,
          value,
        })),
    ];
  }, [assignedEvents, students]);

  /* ------------------------------------------------------------------------ */
  /* Get students by selected event                                           */
  /* ------------------------------------------------------------------------ */

 const {
  data: getStundentByEvent,
  isLoading: getStundentByEventLoading,
  isFetching: getStundentByEventFetching,
  error: getStundentByEventError,
  refetch: refetchStudentsByFilter,
} = useQuery({
  queryKey: [
    "get-event-student",
    selectedCamp?.id,
    String(classFilter ?? "all"),
    String(sectionFilter ?? "all"),
  ],

  queryFn: async () => {
    if (!selectedCamp?.id) {
      return [];
    }

    const result = await dispatch(
      getStudentByEvent({
        eventId: selectedCamp.id,
        page: 1,
        perPage: 50,

        studentClass:
          classFilter === "all" ? "" : String(classFilter),

        section:
          sectionFilter === "all" ? "" : String(sectionFilter),
      }),
    ).unwrap();

    return Array.isArray(result?.items)
      ? result.items
      : Array.isArray(result)
        ? result
        : [];
  },

  enabled: Boolean(selectedCamp?.id),

  // IMPORTANT:
  // Do not keep filtered student combinations fresh for 5 minutes.
  // When the user goes back to "All Classes", the API should run again.
  staleTime: 0,

  // IMPORTANT:
  // Always refetch when this query becomes active.
  refetchOnMount: "always",

  refetchOnWindowFocus: false,

  // This makes the query run immediately whenever the query key changes.
  refetchOnReconnect: true,
});


  /*
   * Fetch ALL students (all pages) for complete class/section dropdown options.
   *
   * CRITICAL: Uses fetchWithAuth directly (NOT Redux dispatch) so this query
   * never touches the shared Redux slice. Previously, dispatching getStudentByEvent
   * here caused a race condition — the Redux PENDING handler clears state.students,
   * and FULFILLED overwrites with all students — racing against the filtered query
   * and causing the student dropdown to show wrong data.
   */
  const { data: allStudentsForFilters = [] } = useQuery({
    queryKey: ["all-event-students-for-filters", selectedCamp?.id],
    queryFn: async () => {
      if (!selectedCamp?.id) return [];

      const allItems = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          page: String(page),
          per_page: "1000",
        });
        const endpoint = `/api/medical-event/${encodeURIComponent(selectedCamp.id)}/students?${params.toString()}`;

        try {
          const { response } = await fetchWithAuth(endpoint, {
            method: "GET",
            headers: { Accept: "application/json" },
          });

          if (!response.ok) break;

          const json = await response.json();

          // Parse the students array from any reasonable response shape.
          const findItems = (value, depth = 0) => {
            if (depth > 4 || value == null) return null;
            if (Array.isArray(value))
              return value.length === 0 || typeof value[0] === "object"
                ? value
                : null;
            if (typeof value !== "object") return null;
            for (const key of [
              "students",
              "data",
              "items",
              "results",
              "records",
            ]) {
              const found = findItems(value[key], depth + 1);
              if (found) return found;
            }
            return null;
          };

          const items = findItems(json) ?? [];
          if (items.length === 0) break;

          allItems.push(...items);

          // Check if there are more pages.
          const total =
            Number(json?.students?.total) ||
            Number(json?.data?.total) ||
            Number(json?.total) ||
            0;

          if (total > 0 && allItems.length >= total) {
            break;
          } else if (items.length < 1000) {
            // Got a partial page — no more data.
            break;
          } else {
            page++;
          }
        } catch (err) {
          console.warn(`[allStudentsForFilters] Page ${page} failed:`, err);
          break;
        }
      }

      return allItems;
    },
    enabled: Boolean(selectedCamp?.id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });

  /* ------------------------------------------------------------------------ */
  /* Redux event student state                                                */
  /* ------------------------------------------------------------------------ */

  const eventAssignState = useAppSelector((state) => state.eventAssign);

  /* ------------------------------------------------------------------------ */
  /* Event students                                                           */
  /* ------------------------------------------------------------------------ */

  const eventStudents = useMemo(() => {
    /*
     * When a camp is selected, PREFER the Redux roster (`eventAssignState.students`)
     * — it accumulates appended pages from infinite scroll (page 2+). The React
     * Query result (`getStundentByEvent`) is page 1 ONLY, so preferring it would
     * cap the dropdown at the first page forever.
     *
     * The slice is a reliable source now: the allStudentsForFilters query fetches
     * via fetchWithAuth directly and never touches Redux, so the roster is written
     * only by the filtered query + load-more appends.
     */
    if (selectedCamp?.id) {
      const roster = eventAssignState?.students;

      if (Array.isArray(roster) && roster.length > 0) {
        return roster;
      }

      // Slice not yet filled (page-1 request still in flight) — fall back to
      // the query result so the dropdown isn't empty for a frame.
      if (Array.isArray(getStundentByEvent)) {
        return getStundentByEvent;
      }

      return [];
    }

    // No camp selected: use the Redux roster as a fallback.
    const roster = eventAssignState?.students;
    if (Array.isArray(roster)) return roster;

    const legacy = eventAssignState?.fetchedRecord;
    if (Array.isArray(legacy)) return legacy;

    return [];
  }, [
    selectedCamp?.id,
    getStundentByEvent,
    eventAssignState?.students,
    eventAssignState?.fetchedRecord,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Send event students to parent                                            */
  /*                                                                          */
  /* NOTE: must be declared AFTER the eventStudents memo above — it reads it. */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof setGetStudentDataByEvent === "function") {
      // Send the full accumulated roster (all loaded pages), not just the
      // page-1 query result — otherwise students picked from page 2+ can't
      // be resolved by the parent.
      setGetStudentDataByEvent(eventStudents);
    }
  }, [eventStudents, setGetStudentDataByEvent]);

  /* ------------------------------------------------------------------------ */
  /* Pagination state                                                         */
  /* ------------------------------------------------------------------------ */

  const studentTotal = eventAssignState?.studentTotal ?? 0;

  const studentPage = eventAssignState?.studentPage ?? 1;

  // Page size the roster was actually loaded with (set by the fulfilled
  // handler from the initial query's arg). Load-more MUST reuse it — mixing
  // page sizes makes backend page N overlap already-loaded records, so the
  // dedupe appends nothing and infinite scroll looks broken.
  const studentPerPage = eventAssignState?.studentPerPage ?? 1000;

  const studentTotalKnown = eventAssignState?.studentTotalKnown ?? false;

  const loadingMoreStudents = eventAssignState?.loadingMore ?? false;

  const hasMoreStudents = eventAssignState?.studentHasMore ?? false;

  /* ------------------------------------------------------------------------ */
  /* Load more students                                                       */
  /*                                                                          */
  /* IMPORTANT:                                                              */
  /* This is the ONLY pagination trigger.                                    */
  /* Do NOT add another useEffect that fetches all pages.                     */
  /* ------------------------------------------------------------------------ */

  const handleLoadMoreStudents = useCallback(() => {
    if (!selectedCamp?.id) {
      return;
    }

    if (loadingMoreStudents) {
      return;
    }

    if (!hasMoreStudents) {
      return;
    }

    const nextPage = studentPage + 1;

    dispatch(
      getStudentByEvent({
        eventId: selectedCamp.id,
        page: nextPage,
        perPage: studentPerPage || 50,
        studentClass: classFilter === "all" ? "" : classFilter,
        section: sectionFilter === "all" ? "" : sectionFilter,
      }),
    );
  }, [
    dispatch,
    selectedCamp?.id,
    studentPage,
    studentPerPage,
    loadingMoreStudents,
    hasMoreStudents,
    classFilter,
    sectionFilter,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Student search                                                           */
  /* ------------------------------------------------------------------------ */

  const [studentSearchOptions, setStudentSearchOptions] = useState(null);
  const rosterRef = useRef(eventStudents);
  const rosterPageRef = useRef(studentPage);
  const rosterTotalRef = useRef(studentTotal);
  const rosterTotalKnownRef = useRef(studentTotalKnown);

  rosterRef.current = eventStudents;
  rosterPageRef.current = studentPage;
  rosterTotalRef.current = studentTotal;
  rosterTotalKnownRef.current = studentTotalKnown;

  /* ------------------------------------------------------------------------ */
  /* Search students                                                          */
  /* ------------------------------------------------------------------------ */

  const handleStudentSearch = useCallback(
    async (keyword) => {
      const term = String(keyword ?? "")
        .trim()
        .toLowerCase();

      /* -------------------------------------------------------------- */
      /* Clear search                                                    */
      /* -------------------------------------------------------------- */

      if (!term) {
        setStudentSearchOptions(null);
        return;
      }

      const seen = new Set();
      const allStudents = [];

      const pushAll = (list) => {
        if (!Array.isArray(list)) {
          return;
        }

        list.forEach((student) => {
          const key = getStudentId(student);

          /*
           * If ID is unavailable, use a combination
           * of name + code to prevent duplicate records.
           */
          const fallbackKey = [
            student?.student_name,
            student?.name,
            getStudentCode(student),
          ]
            .filter(Boolean)
            .join("-");

          const finalKey = key || fallbackKey;

          if (finalKey && !seen.has(finalKey)) {
            seen.add(finalKey);
            allStudents.push(student);
          }
        });
      };

      /* -------------------------------------------------------------- */
      /* Start with already loaded students                             */
      /* -------------------------------------------------------------- */

      pushAll(rosterRef.current);

      /* -------------------------------------------------------------- */
      /* Search currently loaded data first                              */
      /* -------------------------------------------------------------- */

      const createMatches = () => {
        return allStudents
          .filter((student) => {
            const studentClass = getStudentClass(student);

            const studentSection = getStudentSection(student);

            const classMatch =
              classFilter === "all" ||
              String(studentClass).trim() === String(classFilter).trim();

            const sectionMatch =
              sectionFilter === "all" ||
              String(studentSection).trim() === String(sectionFilter).trim();

            if (!classMatch || !sectionMatch) {
              return false;
            }

            const code = getStudentCode(student);

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
            const value = getStudentId(student);

            const code = getStudentCode(student);

            return {
              value,
              label: `${getStudentName(student)}${code ? ` (${code})` : ""}`,
            };
          })
          .filter((item) => item.value);
      };

      /* -------------------------------------------------------------- */
      /* If we already found matches, don't unnecessarily fetch pages.  */
      /* -------------------------------------------------------------- */

      let matches = createMatches();

      if (matches.length > 0) {
        setStudentSearchOptions(matches);
        return;
      }

      /* -------------------------------------------------------------- */
      /* Fetch remaining pages only while searching                      */
      /* -------------------------------------------------------------- */

      let page = rosterPageRef.current;

      let guard = 1000;

      try {
        while (guard-- > 0) {
          const total = rosterTotalRef.current;

          const totalKnown = rosterTotalKnownRef.current;

          /*
           * Stop if backend has told us
           * the complete total.
           */
          if (totalKnown && total > 0 && allStudents.length >= total) {
            break;
          }

          const nextPage = page + 1;

          const result = await dispatch(
            getStudentByEvent({
              eventId: selectedCamp?.id,
              page: nextPage,
              perPage: 50,
              studentClass: classFilter === "all" ? "" : classFilter,
              section: sectionFilter === "all" ? "" : sectionFilter,
            }),
          ).unwrap();

          const items = Array.isArray(result?.items)
            ? result.items
            : Array.isArray(result)
              ? result
              : [];

          /* -------------------------------------------------------- */
          /* Stop at an empty page                                    */
          /* -------------------------------------------------------- */

          if (!items.length) {
            break;
          }

          const beforeCount = allStudents.length;

          pushAll(items);

          page = result?.page ?? nextPage;

          /*
           * Backend returned same students again.
           * Stop to avoid infinite requests.
           */
          if (allStudents.length === beforeCount) {
            break;
          }

          matches = createMatches();

          /*
           * Once search finds a result,
           * stop loading more pages.
           */
          if (matches.length > 0) {
            break;
          }
        }
      } catch (error) {
        console.error("[StudentFilter] Student search error:", error);
      }

      /* -------------------------------------------------------------- */
      /* Final search result                                            */
      /* -------------------------------------------------------------- */

      matches = createMatches();

      setStudentSearchOptions(matches);
    },
    [dispatch, selectedCamp?.id, classFilter, sectionFilter],
  );

  /* ------------------------------------------------------------------------ */
  /* Option students                                                          */
  /* ------------------------------------------------------------------------ */

  /**
   * When a camp is selected, prefer the API-filtered result from the useQuery
   * (`getStundentByEvent`) which already has class/section applied server-side.
   * Fall back to the Redux roster (eventStudents) or the filterPayload students
   * when no camp is selected or the query hasn't resolved yet.
   */
  const optionStudents = useMemo(() => {
    if (selectedCamp?.id) {
      return Array.isArray(eventStudents) ? eventStudents : [];
    }

    return eventStudents.length > 0 ? eventStudents : studentsBySchoolAndYear;
  }, [selectedCamp?.id, eventStudents, studentsBySchoolAndYear]);

  /* ------------------------------------------------------------------------ */
  /* Academic year options                                                    */
  /* ------------------------------------------------------------------------ */

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
      {
        label: "All Academic Years",
        value: "all",
      },

      ...Array.from(unique)
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
          }),
        )
        .map((value) => ({
          label: value,
          value,
        })),
    ];
  }, [optionStudents]);

  /* ------------------------------------------------------------------------ */
  /* Class options                                                            */
  /* ------------------------------------------------------------------------ */

  const classOptions = useMemo(() => {
    const unique = new Set();

    /*
     * Use allStudentsForFilters for complete class dropdown options.
     */
    const allStudentsForClasses = [
      ...(Array.isArray(allStudentsForFilters) ? allStudentsForFilters : []),
      ...(Array.isArray(optionStudents) ? optionStudents : []),
    ];

    allStudentsForClasses.forEach((student) => {
      const value = getStudentClass(student);

      if (value) {
        unique.add(value);
      }
    });

    return [
      {
        label: "All Classes",
        value: "all",
      },
      ...Array.from(unique)
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
          }),
        )
        .map((value) => ({
          label: value,
          value,
        })),
    ];
  }, [allStudentsForFilters, optionStudents]);

  /* ------------------------------------------------------------------------ */
  /* Section options                                                          */
  /* ------------------------------------------------------------------------ */
  // useEffect(() => {
  //   if (classFilter === "all") {
  //     onSectionFilterChange?.("all");
  //     onStudentFilterChange?.("all");
  //     return;
  //   }

  //   onSectionFilterChange?.("all");
  //   onStudentFilterChange?.("all");
  // }, [classFilter, onSectionFilterChange, onStudentFilterChange]);
  /* ------------------------------------------------------------------------ */
  /* Section options                                                          */
  /* ------------------------------------------------------------------------ */

  const sectionOptions = useMemo(() => {
    const unique = new Set();

    /*
     * Use allStudentsForFilters for complete section dropdown options.
     * This includes all pages of event students (loaded via useQuery above)
     * plus any students from filterPayload.
     */

    const allStudentsForSections = [
      ...(Array.isArray(allStudentsForFilters) ? allStudentsForFilters : []),
      ...(Array.isArray(studentsBySchoolAndYear)
        ? studentsBySchoolAndYear
        : []),
    ];

    const seenStudents = new Set();

    allStudentsForSections.forEach((student) => {
      const studentId = getStudentId(student);
      const studentCode = getStudentCode(student);
      const studentName = getStudentName(student);

      const studentClass = getStudentClass(student);
      const studentSection = getStudentSection(student);

      /*
       * Prevent duplicate students because the same student can exist
       * in both arrays.
       */
      const uniqueStudentKey =
        studentId ||
        `${studentName}-${studentCode}-${studentClass}-${studentSection}`;

      if (seenStudents.has(uniqueStudentKey)) {
        return;
      }

      seenStudents.add(uniqueStudentKey);

      /*
       * Only show sections belonging to selected class.
       */
      const classMatch =
        classFilter === "all" ||
        String(studentClass).trim().toLowerCase() ===
          String(classFilter).trim().toLowerCase();

      if (!classMatch) {
        return;
      }

      if (studentSection) {
        unique.add(String(studentSection).trim());
      }
    });

    return [
      {
        label: "All Sections",
        value: "all",
      },

      ...Array.from(unique)
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        )
        .map((section) => ({
          label: section,
          value: section,
        })),
    ];
  }, [allStudentsForFilters, studentsBySchoolAndYear, classFilter]);

  /* ------------------------------------------------------------------------ */
  /* Student options                                                          */
  /* ------------------------------------------------------------------------ */
  const studentOptions = useMemo(() => {
    const filtered = Array.isArray(optionStudents) ? optionStudents : [];

    return [
      {
        label: "All Students",
        value: "all",
      },

      ...filtered
        .map((student) => {
          const value = getStudentId(student);
          const code = getStudentCode(student);

          return {
            value,
            label: `${getStudentName(student)}${code ? ` (${code})` : ""}`,
          };
        })
        .filter((item) => item.value),
    ];
  }, [optionStudents]);

  /* ------------------------------------------------------------------------ */
  /* Clear search when filters change                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setStudentSearchOptions(null);
  }, [selectedCamp?.id, classFilter, sectionFilter]);

  /* ------------------------------------------------------------------------ */
  /* Reset search while loading a new page                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!loadingMoreStudents) {
      return;
    }

    /*
     * Don't clear the search options here.
     * The select can continue displaying its current results.
     */
  }, [loadingMoreStudents]);

  /* ------------------------------------------------------------------------ */
  /* Loading state                                                            */
  /* ------------------------------------------------------------------------ */

  const studentLoading = isLoading || getStundentByEventLoading;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <div
        className={`grid gap-3 sm:grid-cols-2 py-5 ${
          isDoctor ? "xl:grid-cols-5" : "xl:grid-cols-4"
        }`}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Camp                                                               */}
        {/* ---------------------------------------------------------------- */}

        {isDoctor && (
          <>
            <ReusableSelect
              label="Camp Name"
              options={campOptions}
              value={campSelection}
              onChange={(value) => {
                setCampSelection(value);

                if (value === "all") {
                  onSchoolNameChange?.("all");

                  return;
                }

                const campList = Array.isArray(assignedEvents)
                  ? assignedEvents
                  : [];

                const selectedEvent = campList.find(
                  (event) =>
                    String(
                      event?.name ?? event?.Name ?? event?.camp_name ?? "",
                    ).trim() === String(value).trim(),
                );

                const eventSchool = String(
                  selectedEvent?.school?.school_name ??
                    selectedEvent?.school?.name ??
                    selectedEvent?.school_name ??
                    selectedEvent?.schoolName ??
                    "",
                ).trim();

                onSchoolNameChange?.(eventSchool || "all");
              }}
              placeholder={
                assignEventLoading ? "Loading camps..." : "Select Camp"
              }
              searchPlaceholder="Search Camp"
              disabled={isLoading || assignEventLoading}
            />

            {assignEventError ? (
              <p className="mt-1 text-xs text-destructive">
                Unable to load camps. Please retry.
              </p>
            ) : null}
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* School                                                             */}
        {/* ---------------------------------------------------------------- */}

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

        {/* ---------------------------------------------------------------- */}
        {/* Academic Year                                                      */}
        {/* ---------------------------------------------------------------- */}

        <ReusableSelect
          label="Academic Year"
          options={academicYearOptions}
          value={academicYear}
          onChange={onAcademicYearChange}
          placeholder="Select academic year"
          searchPlaceholder="Search academic year"
          disabled={isLoading}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Class + Section                                                   */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid grid-cols-2 gap-3 xl:col-span-1">
          <ReusableSelect
            label="Class"
            options={classOptions}
            value={classFilter}
            onChange={(value) => {
              // Change class
              onClassFilterChange?.(value);

              // Reset dependent filters
              onSectionFilterChange?.("all");
              onStudentFilterChange?.("all");
            }}
            placeholder="Select class"
            searchPlaceholder="Search class"
            disabled={isLoading}
          />

          <ReusableSelect
            label="Section"
            options={sectionOptions}
            value={sectionFilter}
            onChange={(value) => {
              onSectionFilterChange?.(value);

              // Reset student when section changes
              onStudentFilterChange?.("all");
            }}
            placeholder="Select section"
            searchPlaceholder="Search section"
            disabled={isLoading}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Student                                                            */}
        {/* ---------------------------------------------------------------- */}

        <ReusableSelect
          label="Student"
          options={studentSearchOptions ?? studentOptions}
          value={studentFilter}
          onChange={onStudentFilterChange}
          placeholder={
            studentLoading ? "Loading students..." : "Select student"
          }
          searchPlaceholder="Search student"
          disabled={isLoading}
          onSearch={handleStudentSearch}
          onLoadMore={handleLoadMoreStudents}
          hasMore={hasMoreStudents}
          isLoadingMore={loadingMoreStudents}
          // onScroll={handleScroll}
        />
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Memoized component                                                         */
/* -------------------------------------------------------------------------- */

export default React.memo(StudentFilter);
