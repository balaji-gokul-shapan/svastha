import ReusableSelect from "@/components/ui/reusable-select";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import {
  getAllSchoolBranches,
  getSchoolBranch,
} from "@/lib/features/registerSchoolBranchSlice";
import {
  campMatchesBranch,
  getCampBranchId,
  getCampDisplayLabel,
  getCampId,
  getCampPrimaryDoctorId,
  getCampSchoolId,
  getCampSchoolName,
} from "@/lib/camp-utils";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

/**
 * "All" is the sentinel every filter in this file already understands: the
 * query builders, the cascade resets and the parent callbacks all treat "all"
 * as "no restriction". Reusing it means a single option value works across the
 * whole filter chain instead of inventing a second empty-string convention.
 */
const ALL = "all";

/** Prepends an "All …" row unless the list already carries that value. */
const withAllOption = (options, label) => {
  const list = Array.isArray(options) ? options : [];
  if (list.some((option) => String(option?.value ?? "").trim() === ALL)) {
    return list;
  }

  return [{ value: ALL, label }, ...list];
};

const SchoolStudentFilter = ({
  setSelectedSchoolBranch,
  formData = {},
  setFormData = () => {},
  selectRole,
  schoolName,
  academicYear,
  onSchoolNameChange,
  onAcademicYearChange,
  onClassFilterChange,
  onSectionFilterChange,
  onStudentFilterChange,
  onSelectedBranchChange,
  ownBranch = null,
  assignedEvents = [],
  assignEventLoading = false,
  assignEventError = null,
  isLoading = false,
  campSelection,
  setCampSelection,
  onSelectedCampChange,
}) => {
  const dispatch = useDispatch();
  const roles = {
    1: "admin",
    2: "school",
    3: "teacher",
  };

  const getRole = roles[selectRole] ?? "";
  const showSchoolName = getRole === "admin" || getRole === "school";
  const isPlatformAdmin = getRole === "admin";
  const isSchoolScoped = !isPlatformAdmin && Boolean(getRole);

  const {
    data: getAllSchoolBranch = {},
    isLoading: getAllSchoolBranchLoading,
    error: getAllSchoolBranchError,
  } = useQuery({
    queryKey: ["getSchoolAllBranch"],
    queryFn: () => dispatch(getAllSchoolBranches()).unwrap(),
    enabled: isPlatformAdmin,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: getSchoolBranchData = {},
    isLoading: getSchoolBranchLoading,
    error: getSchoolBranchError,
  } = useQuery({
    queryKey: ["getSchoolBranch"],
    queryFn: () => dispatch(getSchoolBranch()).unwrap(),
    staleTime: 5 * 60 * 1000,
    enabled: isSchoolScoped,
    refetchOnWindowFocus: false,
  });


  const schoolBranch = useMemo(() => {
    const raw = getSchoolBranchData?.data ?? getSchoolBranchData;
    if (!raw || typeof raw !== "object") return null;
    const branch = Array.isArray(raw) ? raw[0] : raw;
    const id = String(
      branch?.branch_id ?? branch?.branchId ?? branch?.id ?? "",
    ).trim();
    const label = String(
      branch?.branch_name ?? branch?.name ?? branch?.school_name ?? "",
    ).trim();
    return id || label ? { ...branch, id, label } : null;
  }, [getSchoolBranchData]);
  const ownBranchValue = String(
    ownBranch?.value || schoolBranch?.id || "",
  ).trim();

  React.useEffect(() => {
    // Respect an explicit "All Branches" choice — auto-selecting the signed-in
    // school here would immediately override it on the next render.
    if (formData?.branchName) return;
    if (!ownBranchValue) return;
    setFormData((prev) =>
      prev?.branchName ? prev : { ...prev, branchName: ownBranchValue },
    );
  }, [formData?.branchName, ownBranchValue, setFormData]);

  const activeBranchFilter = String(formData.branchName ?? "").trim();
  const branchQueryId =
    !activeBranchFilter || activeBranchFilter === ALL ? "" : activeBranchFilter;

  const {
    data: getAllFilterStudent = {},
    isLoading: getAllFilterStudentLoading,
    error: getAllFilterStudentError,
  } = useQuery({
    queryKey: ["getAllFilterStudent", branchQueryId],
    queryFn: () =>
      dispatch(
        getFilterStudent({
          branch_id: branchQueryId,
          academicYear: "all",
          // classes:
        }),
      ).unwrap(),
    enabled: Boolean(activeBranchFilter),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const students = useMemo(() => {
    const items = Array.isArray(getAllFilterStudent?.items)
      ? getAllFilterStudent.items
      : [];
    const activeYear = String(academicYear ?? "all").trim();
    let yearFilteredStudents = items;
    if (activeYear !== "all" && activeYear) {
      yearFilteredStudents = items.filter(
        (student) =>
          String(
            student?.academic_year ?? student?.academicYear ?? "",
          ).trim() === activeYear,
      );
    }
    return yearFilteredStudents;
  }, [getAllFilterStudent, academicYear]);


  // const studentsBySchoolAndYear = useMemo(() => {
  //   return students.filter((student) => {
  //     const studentSchool = String(
  //       student?.school_name ?? student?.schoolName ?? student?.school ?? "",
  //     ).trim();

  //     const studentYear = String(
  //       student?.academic_year ?? student?.academicYear ?? "",
  //     ).trim();

  //     const schoolMatch =
  //       schoolName === "all" || !studentSchool || studentSchool === schoolName;

  //     const yearMatch =
  //       academicYear === "all" || !studentYear || studentYear === academicYear;

  //     return schoolMatch && yearMatch;
  //   });
  // }, [students, schoolName, academicYear]);
  const academicYearOptions = useMemo(() => {
    const allItems = Array.isArray(getAllFilterStudent?.items)
      ? getAllFilterStudent.items
      : [];
    const years = new Set();
    allItems.forEach((student) => {
      const year = String(
        student?.academic_year ?? student?.academicYear ?? "",
      ).trim();
      if (year) years.add(year);
    });
    // Always show the page-level active year even before students load.
    const activeYear = String(academicYear ?? "").trim();
    if (activeYear && activeYear !== "all") years.add(activeYear);
    return withAllOption(
      Array.from(years)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((year) => ({ label: year, value: year })),
      "All Academic Years",
    );
  }, [getAllFilterStudent, academicYear]);

  const selectedYearStudents = useMemo(() => {
    const activeYear =
      String(formData.AcademicYear ?? "").trim() ||
      String(academicYear ?? "").trim();
    if (!activeYear || activeYear === "all") return students ?? [];

    return (students ?? []).filter(
      (student) =>
        String(student?.academic_year ?? student?.academicYear ?? "").trim() ===
        activeYear,
    );
  }, [students, formData.AcademicYear, academicYear]);

  const classOptions = useMemo(() => {
    const uniqueClasses = [
      ...new Set(
        selectedYearStudents
          .map((student) => {
            const classValue =
              student?.Class ?? student?.class ?? student?.grade ?? "";

            return String(classValue).trim();
          })
          .filter(Boolean),
      ),
    ];

    return withAllOption(
      uniqueClasses
        .sort((a, b) => {
          const aNumber = Number(a.replace(/\D/g, ""));
          const bNumber = Number(b.replace(/\D/g, ""));

          return aNumber - bNumber;
        })
        .map((item) => ({
          label: `Class ${item}`,
          value: item,
        })),
      "All Classes",
    );
  }, [selectedYearStudents]);

  const sectionOptions = useMemo(() => {
    /* "All Classes" (or nothing picked yet) means sections are not narrowed to
       one class, so list every section rather than returning an empty list. */
    const activeClass = String(formData.classes ?? "").trim();
    if (!activeClass || activeClass === ALL) {
      const all = [
        ...new Set(
          selectedYearStudents
            .map((student) => String(student?.sec ?? student?.section ?? "").trim())
            .filter(Boolean),
        ),
      ].sort();

      return withAllOption(
        all.map((section) => ({ label: section, value: section })),
        "All Sections",
      );
    }

    const uniqueSections = [
      ...new Set(
        selectedYearStudents
          .filter((student) => {
            const studentClass =
              student?.Class ?? student?.class ?? student?.grade ?? "";

            return (
              String(studentClass).trim() === activeClass
            );
          })
          .map((student) => {
            return String(student?.sec ?? student?.section ?? "").trim();
          })
          .filter(Boolean),
      ),
    ];

    return withAllOption(
      uniqueSections.sort().map((section) => ({
        label: section,
        value: section,
      })),
      "All Sections",
    );
  }, [selectedYearStudents, formData.classes]);

  const filteredStudents = useMemo(() => {
    const activeYear =
      String(formData.AcademicYear ?? "").trim() ||
      String(academicYear ?? "").trim();
    const activeClass = String(formData.classes ?? "").trim();
    const activeSection = String(formData.section ?? "").trim();

    /* "all" is the no-restriction sentinel for every level, so each predicate
       has to skip its comparison when it holds that value — otherwise picking
       "All Classes" would match no student and the list came back empty. */
    return (students ?? []).filter((student) => {
      const studentYear = String(
        student?.academic_year ?? student?.academicYear ?? "",
      ).trim();

      const studentClass = String(
        student?.class ?? student?.Class ?? student?.grade ?? "",
      ).trim();

      const studentSection = String(
        student?.section ?? student?.sec ?? "",
      ).trim();

      const yearMatch =
        !activeYear || activeYear === ALL || studentYear === activeYear;
      const classMatch =
        !activeClass || activeClass === ALL || studentClass === activeClass;
      const sectionMatch =
        !activeSection || activeSection === ALL || studentSection === activeSection;

      return yearMatch && classMatch && sectionMatch;
    });
  }, [
    students,
    formData.AcademicYear,
    academicYear,
    formData.classes,
    formData.section,
  ]);

  const studentOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    (filteredStudents ?? []).forEach((student) => {
      const value = String(
        student?.id ??
          student?.studentId ??
          student?.student_id ??
          student?.admission_number ??
          "",
      ).trim();
      const label = String(
        student?.name ??
          student?.student_name ??
          student?.studentName ??
          value ??
          "",
      ).trim();
      if (!value || seen.has(value)) return;
      seen.add(value);
      options.push({ label: label || value, value });
    });

    return withAllOption(options, "All Students");
  }, [filteredStudents]);

  const fetchedBranchOptions = useMemo(() => {
    const list = Array.isArray(getAllSchoolBranch)
      ? getAllSchoolBranch
      : (getAllSchoolBranch?.data ?? []);

    // Carry the branch's address + contact fields alongside id/name so
    // consumers can read the full address of the selected branch.
    const toOption = (branch) => ({
      value: String(branch?.id ?? branch?.branch_id ?? "").trim(),
      label: String(branch?.branch_name ?? branch?.name ?? "").trim(),
      address_line_1:
        String(branch?.address_line_1 ?? branch?.address_line1 ?? "").trim() ||
        null,
      address_line_2:
        String(branch?.address_line_2 ?? branch?.address_line2 ?? "").trim() ||
        null,
      area: String(branch?.area ?? "").trim() || null,
      city: String(branch?.city ?? "").trim() || null,
      state: String(branch?.state ?? "").trim() || null,
      country: String(branch?.country ?? "").trim() || null,
      pincode:
        String(
          branch?.pincode ?? branch?.pin_code ?? branch?.zip ?? "",
        ).trim() || null,
      // Frequently-used extra details, kept on the option too.
      registration_number:
        String(branch?.registration_number ?? branch?.reg_no ?? "").trim() ||
        null,
      school_id:
        String(branch?.school_id ?? branch?.schoolId ?? "").trim() || null,
    });

    /* A school-scoped user gets ONLY their own branch — the "all branches"  */
    /* endpoint is not theirs to enumerate.                                     */
    if (isSchoolScoped) {
      const own = toOption(schoolBranch ?? {});
      return own.value && own.label ? [own] : [];
    }

    const options = list
      .map(toOption)
      .filter((option) => option.value && option.label);

    // Fallback to the signed-in school's branch if the list endpoint is empty.
    if (options.length === 0 && schoolBranch) {
      const option = toOption(schoolBranch);
      if (option.value && option.label) options.push(option);
    }

    return options;
  }, [getAllSchoolBranch, schoolBranch, isSchoolScoped]);

  const branchOptions = React.useMemo(() => {
    const options = fetchedBranchOptions.length
      ? [...fetchedBranchOptions]
      : [];
    const ownValue = String(ownBranch?.value ?? "").trim();
    const selected = String(formData?.branchName ?? "").trim();
    const ownIsListed = options.some(
      (option) => String(option?.value ?? "").trim() === ownValue,
    );

    if (ownValue && selected === ownValue && !ownIsListed) {
      options.push({
        ...ownBranch,
        value: ownValue,
        label: String(ownBranch?.label ?? "").trim() || ownValue,
      });
    }

    return withAllOption(options, "All Branches");
  }, [fetchedBranchOptions, ownBranch, formData.branchName]);

  /* ------------------------------------------------------------------------ */
  /* Camp options — scoped to the selected school                              */
  /* ------------------------------------------------------------------------ */

  const selectedBranchId = String(formData?.branchName ?? "").trim();

  const selectedBranchLabel = useMemo(() => {
    const match = branchOptions.find(
      (option) => String(option?.value ?? "").trim() === selectedBranchId,
    );

    return String(match?.label ?? "").trim();
  }, [branchOptions, selectedBranchId]);

  const isCampSelectionControlled =
    campSelection !== undefined && typeof setCampSelection === "function";

  const [internalCampSelection, setInternalCampSelection] = useState("all");

  const activeCampSelection = isCampSelectionControlled
    ? campSelection
    : internalCampSelection;

  const updateCampSelection = isCampSelectionControlled
    ? setCampSelection
    : setInternalCampSelection;

  const campList = useMemo(
    () => (Array.isArray(assignedEvents) ? assignedEvents : []),
    [assignedEvents],
  );

  const activeCampEvent = useMemo(() => {
    const id = String(activeCampSelection ?? "").trim();

    if (!id || id === "all") return null;

    return campList.find((camp) => getCampId(camp) === id) ?? null;
  }, [campList, activeCampSelection]);

  const primaryDoctorId = getCampPrimaryDoctorId(activeCampEvent) ?? "";

  /* Surfaced so the page can react to camp changes (roster, signature, etc.).*/
  React.useEffect(() => {
    onSelectedCampChange?.(
      activeCampEvent
        ? {
            ...activeCampEvent,
            id: getCampId(activeCampEvent),
            primaryDoctorId,
          }
        : null,
    );
  }, [activeCampEvent, primaryDoctorId, onSelectedCampChange]);

  const campOptions = useMemo(() => {
    const unique = new Map();

    campList.forEach((camp) => {
      if (!campMatchesBranch(camp, selectedBranchId, selectedBranchLabel)) {
        return;
      }

      const id = getCampId(camp);
      const label = getCampDisplayLabel(camp);

      if (id && label) {
        unique.set(id, { label, value: id });
      }
    });

    return [
      { label: "All Camps", value: "all" },
      ...Array.from(unique.values()).sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true }),
      ),
    ];
  }, [campList, selectedBranchId, selectedBranchLabel]);

  /* A camp picked under a different school is no longer a valid option, so it */
  /* must fall back to "all" instead of silently filtering nothing.            */
  useEffect(() => {
    updateCampSelection((current) => {
      if (!current || current === "all") return current ?? "all";

      const stillListed = campOptions.some(
        (option) => String(option?.value ?? "") === String(current).trim(),
      );

      return stillListed ? current : "all";
    });
  }, [campOptions, updateCampSelection]);

  const handleCampChange = (value) => {
    updateCampSelection(value);

    if (value === "all") {
      onSchoolNameChange?.("all");
      return;
    }

    const selectedEvent = campList.find(
      (event) => getCampId(event) === String(value).trim(),
    );

    // Prefer the branch id the school dropdown expects; fall back to the
    // school name only when the camp payload carries no id at all.
    const nextSchool =
      getCampBranchId(selectedEvent) ||
      getCampSchoolId(selectedEvent) ||
      getCampSchoolName(selectedEvent) ||
      "all";

    onSchoolNameChange?.(nextSchool);
  };

  const lastReportedBranchRef = React.useRef(null);
  React.useEffect(() => {
    const selected = String(formData?.branchName ?? "").trim();
    if (!selected || lastReportedBranchRef.current === selected) return;

    const option =
      branchOptions.find(
        (branchOption) => String(branchOption?.value ?? "").trim() === selected,
      ) ?? null;

    lastReportedBranchRef.current = selected;
    onSelectedBranchChange?.(option);

    /* Report the SELECTED branch to the parent too. This previously only */
    /* published the signed-in profile, so switching school updated */
    /* `onSelectedBranchChange` but left `selectedSchoolBranch` on the profile */
    /* and the report kept printing the old school. */
    if (option) setSelectedSchoolBranch?.(option);
  }, [
    branchOptions,
    formData?.branchName,
    onSelectedBranchChange,
    setSelectedSchoolBranch,
  ]);

  const handleChange = (name, value) => {
    const nextValue = value ?? "";

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: nextValue,
      };
      /* Changing school or year invalidates downstream picks. Reset them to the
         "all" sentinel (not "") so each dropdown keeps a valid selection and the
         user sees the full list rather than an empty one. */
      if (name === "branchName" || name === "AcademicYear") {
        next.classes = ALL;
        next.section = ALL;
        next.BeneficiaryId = ALL;
      } else if (name === "classes") {
        next.section = ALL;
        next.BeneficiaryId = ALL;
      } else if (name === "section") {
        next.BeneficiaryId = ALL;
      }
      return next;
    });

    if (name === "branchName") {
      onSchoolNameChange?.(nextValue || ALL);
      onSelectedBranchChange?.(
        branchOptions.find((option) => option.value === nextValue) ?? null,
      );
    } else if (name === "AcademicYear") {
      onAcademicYearChange?.(nextValue || ALL);
    } else if (name === "classes") {
      onClassFilterChange?.(nextValue || ALL);
    } else if (name === "section") {
      onSectionFilterChange?.(nextValue || ALL);
    } else if (name === "BeneficiaryId") {
      onStudentFilterChange?.(nextValue || ALL);
    }
  };

  // const optionStudents = useMemo(() => {
  //   if (selectedCamp?.id) {
  //     return Array.isArray(eventStudents) ? eventStudents : [];
  //   }

  //   return eventStudents.length > 0 ? eventStudents : studentsBySchoolAndYear;
  // }, [selectedCamp?.id, eventStudents, studentsBySchoolAndYear]);

  // const academicYearOptions = useMemo(() => {
  //   const unique = new Set();

  //   optionStudents.forEach((student) => {
  //     const value = String(
  //       student?.academic_year ?? student?.academicYear ?? "",
  //     ).trim();

  //     if (value) {
  //       unique.add(value);
  //     }
  //   });

  //   return [
  //     {
  //       label: "All Academic Years",
  //       value: "all",
  //     },

  //     ...Array.from(unique)
  //       .sort((a, b) =>
  //         a.localeCompare(b, undefined, {
  //           numeric: true,
  //         }),
  //       )
  //       .map((value) => ({
  //         label: value,
  //         value,
  //       })),
  //   ];
  // }, [optionStudents]);

  return (
    <>
      <div
        className={`grid gap-3 sm:grid-cols-2 my-4 md:grid-cols-3 ${
          showSchoolName ? "xl:grid-cols-5" : "xl:grid-cols-4"
        }`}
      >
        <>
          {showSchoolName && (
            <>
              <ReusableSelect
                name="branchName"
                label="School Name"
                searchPlaceholder="School Name"
                options={branchOptions}
                value={formData.branchName}
                onChange={(value) => handleChange("branchName", value)}
              />
            </>
          )}
          <ReusableSelect
            label="Camp Name"
            options={campOptions}
            value={activeCampSelection}
            onChange={handleCampChange}
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
        <ReusableSelect
          name="AcademicYear"
          label={"Academic Year"}
          options={academicYearOptions}
          value={formData.AcademicYear}
          onChange={(value) => handleChange("AcademicYear", value)}
        />
        <ReusableSelect
          name="classes"
          label={"Class"}
          options={classOptions}
          value={formData.classes}
          onChange={(value) => handleChange("classes", value)}
        />
        <ReusableSelect
          name="section"
          label={"Section"}
          options={sectionOptions}
          value={formData.section}
          onChange={(value) => handleChange("section", value)}
        />
        <ReusableSelect
          name="BeneficiaryId"
          label={"Students"}
          options={studentOptions}
          value={formData.BeneficiaryId}
          onChange={(value) => handleChange("BeneficiaryId", value)}
        />
      </div>
    </>
  );
};

export default SchoolStudentFilter;
