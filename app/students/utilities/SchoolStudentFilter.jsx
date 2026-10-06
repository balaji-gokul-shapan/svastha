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
import { usePathname } from "next/navigation";

const ALL = "all";

const withAllOption = (options, label) => {
  const list = Array.isArray(options) ? options : [];
  if (list.some((option) => String(option?.value ?? "").trim() === ALL)) {
    return list;
  }

  return [{ value: ALL, label }, ...list];
};

const sectionIdToLabel = (section) => {
  const value = String(section ?? "").trim();
  const id = Number(value);
  return /^\d+$/.test(value) && id >= 1 && id <= 26
    ? String.fromCharCode(64 + id)
    : value;
};

const getPrivilegePairs = (value) => {
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];
    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        return getPrivilegePairs(JSON.parse(text));
      } catch {
        return [];
      }
    }

    return text
      .split(",")
      .map((entry) => {
        const separator = entry.indexOf("-");
        if (separator <= 0) return null;
        const classValue = entry.slice(0, separator).trim();
        const section = sectionIdToLabel(entry.slice(separator + 1));
        return classValue && section ? { classValue, section } : null;
      })
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (typeof entry === "string") return getPrivilegePairs(entry);
      if (!entry || typeof entry !== "object") return [];
      const classValue = String(entry.class ?? entry.Class ?? "").trim();
      const section = sectionIdToLabel(entry.section ?? entry.Section);
      return classValue && section ? [{ classValue, section }] : [];
    });
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([classValue, sections]) => {
      const list = Array.isArray(sections) ? sections : [sections];
      return list
        .map((section) => ({
          classValue: String(classValue).trim(),
          section: sectionIdToLabel(section),
        }))
        .filter((pair) => pair.classValue && pair.section);
    });
  }

  return [];
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
  classSectionPrivileges,
}) => {
  const dispatch = useDispatch();
  const roles = {
    1: "admin",
    2: "school",
    3: "teacher",
  };
   const pathname = usePathname();

  console.log(pathname,"pathname");
  const getPathIsReport = pathname.includes("/report");


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

  const privilegePairs = useMemo(
    () => getPrivilegePairs(classSectionPrivileges),
    [classSectionPrivileges],
  );

  const classOptions = useMemo(() => {
    const uniqueClasses = [
      ...new Set(
        [
          ...selectedYearStudents.map((student) =>
            String(student?.Class ?? student?.class ?? student?.grade ?? "").trim(),
          ),
          ...privilegePairs.map((pair) => pair.classValue),
        ].filter(Boolean),
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
  }, [selectedYearStudents, privilegePairs]);

  const sectionOptions = useMemo(() => {
    /* "All Classes" (or nothing picked yet) means sections are not narrowed to
       one class, so list every section rather than returning an empty list. */
    const activeClass = String(formData.classes ?? "").trim();
    if (!activeClass || activeClass === ALL) {
      const all = [
        ...new Set(
          [
            ...selectedYearStudents.map((student) =>
              String(student?.sec ?? student?.section ?? "").trim(),
            ),
            ...privilegePairs.map((pair) => pair.section),
          ].filter(Boolean),
        ),
      ].sort();

      return withAllOption(
        all.map((section) => ({ label: section, value: section })),
        "All Sections",
      );
    }

    const uniqueSections = [
      ...new Set(
        [
          ...selectedYearStudents
            .filter((student) => {
              const studentClass =
                student?.Class ?? student?.class ?? student?.grade ?? "";

              return String(studentClass).trim() === activeClass;
            })
            .map((student) =>
              String(student?.sec ?? student?.section ?? "").trim(),
            ),
          ...privilegePairs
            .filter((pair) => pair.classValue === activeClass)
            .map((pair) => pair.section),
        ].filter(Boolean),
      ),
    ];

    return withAllOption(
      uniqueSections.sort().map((section) => ({
        label: section,
        value: section,
      })),
      "All Sections",
    );
  }, [selectedYearStudents, formData.classes, privilegePairs]);

  const filteredStudents = useMemo(() => {
    const activeYear =
      String(formData.AcademicYear ?? "").trim() ||
      String(academicYear ?? "").trim();
    const activeClass = String(formData.classes ?? "").trim();
    const activeSection = String(formData.section ?? "").trim();

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
  <div
    className={`grid gap-3 sm:grid-cols-2 md:grid-cols-3 my-4 ${
      showSchoolName ? "xl:grid-cols-5" : "xl:grid-cols-4"
    }`}
  >
    {showSchoolName && (
      <ReusableSelect
        name="branchName"
        label="School Name"
        searchPlaceholder="School Name"
        options={branchOptions}
        value={formData.branchName}
        onChange={(value) => handleChange("branchName", value)}
      />
    )}

    {getPathIsReport && (
      <div>
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

        {assignEventError && (
          <p className="mt-1 text-xs text-destructive">
            Unable to load camps. Please retry.
          </p>
        )}
      </div>
    )}

    <ReusableSelect
      name="AcademicYear"
      label="Academic Year"
      options={academicYearOptions}
      value={formData.AcademicYear}
      onChange={(value) => handleChange("AcademicYear", value)}
    />

    <ReusableSelect
      name="classes"
      label="Class"
      options={classOptions}
      value={formData.classes}
      onChange={(value) => handleChange("classes", value)}
    />

    <ReusableSelect
      name="section"
      label="Section"
      options={sectionOptions}
      value={formData.section}
      onChange={(value) => handleChange("section", value)}
    />

    <ReusableSelect
      name="BeneficiaryId"
      label="Students"
      options={studentOptions}
      value={formData.BeneficiaryId}
      onChange={(value) => handleChange("BeneficiaryId", value)}
    />
  </div>
  );
};

export default SchoolStudentFilter;
