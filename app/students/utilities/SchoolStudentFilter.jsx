import ReusableSelect from "@/components/ui/reusable-select";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import {
  getAllSchoolBranches,
  getSchoolBranch,
} from "@/lib/features/registerSchoolBranchSlice";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { useDispatch } from "react-redux";

const SchoolStudentFilter = ({
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
}) => {
  const dispatch = useDispatch();
  const roles = {
    1: "admin",
    2: "school",
    3: "teacher",
  };

  const getRole = roles[selectRole] ?? "";

  const showSchoolName = getRole === "admin" || getRole === "school";

  const {
    data: getAllSchoolBranch = {},
    isLoading: getAllSchoolBranchLoading,
    error: getAllSchoolBranchError,
  } = useQuery({
    queryKey: ["getSchoolAllBranch"],
    queryFn: () => dispatch(getAllSchoolBranches()).unwrap(),
    enabled: getRole === "admin" || getRole === "school",
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
    enabled: getRole === "school" || getRole === "school_admin",
    refetchOnWindowFocus: false,
  });

console.log(getSchoolBranchData,"getSchoolBranchData");

  const ownBranchValue = String(ownBranch?.value ?? "").trim();
  React.useEffect(() => {
    if (formData?.branchName) return;
    if (!ownBranchValue) return;
    setFormData((prev) =>
      prev?.branchName ? prev : { ...prev, branchName: ownBranchValue },
    );
  }, [formData?.branchName, ownBranchValue, setFormData]);

  // getFilterStudent — filtered by selected school (branch) AND academic year.
  const {
    data: getAllFilterStudent = {},
    isLoading: getAllFilterStudentLoading,
    error: getAllFilterStudentError,
  } = useQuery({
    queryKey: ["getAllFilterStudent", formData.branchName],
    queryFn: () =>
      dispatch(
        getFilterStudent({
          branch_id: formData.branchName,

          academicYear: "all",
          // classes:
        }),
      ).unwrap(),
    enabled: Boolean(formData.branchName),
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
    return Array.from(years)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((year) => ({ label: year, value: year }));
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

    return uniqueClasses
      .sort((a, b) => {
        const aNumber = Number(a.replace(/\D/g, ""));
        const bNumber = Number(b.replace(/\D/g, ""));

        return aNumber - bNumber;
      })
      .map((item) => ({
        label: `Class ${item}`,
        value: item,
      }));
  }, [selectedYearStudents]);

  const sectionOptions = useMemo(() => {
    if (!formData.classes) return [];

    const uniqueSections = [
      ...new Set(
        selectedYearStudents
          .filter((student) => {
            const studentClass =
              student?.Class ?? student?.class ?? student?.grade ?? "";

            return (
              String(studentClass).trim() === String(formData.classes).trim()
            );
          })
          .map((student) => {
            return String(student?.sec ?? student?.section ?? "").trim();
          })
          .filter(Boolean),
      ),
    ];

    return uniqueSections.sort().map((section) => ({
      label: section,
      value: section,
    }));
  }, [selectedYearStudents, formData.classes]);

  const filteredStudents = useMemo(() => {
    const activeYear =
      String(formData.AcademicYear ?? "").trim() ||
      String(academicYear ?? "").trim();
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

      const sectionMatch =
        !String(formData.section ?? "").trim() ||
        studentSection === String(formData.section).trim();
      return (
        (!activeYear || activeYear === "all" || studentYear === activeYear) &&
        studentClass === String(formData.classes).trim() &&
        sectionMatch
      );
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
    return options;
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
        String(branch?.pincode ?? branch?.pin_code ?? branch?.zip ?? "").trim() ||
        null,
      // Frequently-used extra details, kept on the option too.
      registration_number:
        String(branch?.registration_number ?? branch?.reg_no ?? "").trim() ||
        null,
      school_id:
        String(branch?.school_id ?? branch?.schoolId ?? "").trim() || null,
    });

    const options = list
      .map(toOption)
      .filter((option) => option.value && option.label);

    if (options.length === 0 && getSchoolBranchData) {
      const single = getSchoolBranchData?.data ?? getSchoolBranchData;
      const option = toOption(single);
      if (option.value && option.label) options.push(option);
    }

    return options;
  }, [getAllSchoolBranch, getSchoolBranchData]);


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

    return options;
  }, [fetchedBranchOptions, ownBranch, formData?.branchName]);

  


  const lastReportedBranchRef = React.useRef(null);
  React.useEffect(() => {
    if (!onSelectedBranchChange) return;
    const selected = String(formData?.branchName ?? "").trim();
    if (!selected || lastReportedBranchRef.current === selected) return;
    const option =
      branchOptions.find(
        (branchOption) =>
          String(branchOption?.value ?? "").trim() === selected,
      ) ?? null;
    lastReportedBranchRef.current = selected;
    onSelectedBranchChange(option);
  }, [branchOptions, formData?.branchName, onSelectedBranchChange]);

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value ?? "",
      };
      // Changing school or year invalidates downstream picks.
      if (name === "branchName" || name === "AcademicYear") {
        next.classes = "";
        next.section = "";
        next.BeneficiaryId = "";
      } else if (name === "classes") {
        next.section = "";
        next.BeneficiaryId = "";
      } else if (name === "section") {
        next.BeneficiaryId = "";
      }
      return next;
    });

    if (name === "branchName") {
      onSchoolNameChange?.(value || "all");
      onSelectedBranchChange?.(
        branchOptions.find((option) => option.value === value) ?? null,
      );
    } else if (name === "AcademicYear") {
      onAcademicYearChange?.(value || "all");
    } else if (name === "classes") {
      onClassFilterChange?.(value || "all");
    } else if (name === "section") {
      onSectionFilterChange?.(value || "all");
    } else if (name === "BeneficiaryId") {
      onStudentFilterChange?.(value || "all");
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
