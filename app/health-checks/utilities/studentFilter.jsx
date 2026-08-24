"use client";

import ReusableSelect from "@/components/ui/reusable-select";
import React, { useMemo } from "react";

const getStudentClass = (student) => {
  const classValue = student?.Class ?? student?.class;

  if (classValue !== null && classValue !== undefined && String(classValue).trim()) {
    return String(classValue).trim();
  }

  return String(student?.grade ?? "").split("-")[0].trim();
};

const getStudentSection = (student) => {
  const explicitSection = String(student?.sec ?? student?.section ?? "").trim();
  if (explicitSection) return explicitSection;

  return String(student?.grade ?? "")
    .split("-")[1]
    ?.trim() || "";
};

const StudentFilter = ({
  isDoctor = true,
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
}) => {

  const students = useMemo(
    () => (Array.isArray(filterPayload?.items) ? filterPayload.items : []),
    [filterPayload],
  );

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
          schoolName === "all" || !studentSchool || studentSchool === schoolName;
        const yearMatch =
          academicYear === "all" || !studentYear || studentYear === academicYear;

        return schoolMatch && yearMatch;
      }),
    [academicYear, schoolName, students],
  );

  const schoolOptions = useMemo(() => {
    const unique = new Set();

    students.forEach((student) => {
      const value = String(
        student?.school_name ?? student?.schoolName ?? student?.school ?? "",
      ).trim();
      if (value) {
        unique.add(value);
      }
    });

    return [
      { label: "All Schools", value: "all" },
      ...Array.from(unique)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((value) => ({ label: value, value })),
    ];
  }, [students]);

  const academicYearOptions = useMemo(() => {
    const unique = new Set();

    students.forEach((student) => {
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
  }, [students]);

  const classOptions = useMemo(() => {
    const unique = new Set();

    studentsBySchoolAndYear.forEach((student) => {
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
  }, [studentsBySchoolAndYear]);
  const sectionOptions = useMemo(() => {
    const unique = new Set();

    studentsBySchoolAndYear.forEach((student) => {
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
  }, [classFilter, studentsBySchoolAndYear]);
 const studentOptions = useMemo(() => {
  const filtered = studentsBySchoolAndYear.filter((student) => {
    const studentClass = getStudentClass(student);
    const studentSection = getStudentSection(student);

    const classMatch =
      classFilter === "all" ||
      studentClass === classFilter;

    const sectionMatch =
      sectionFilter === "all" ||
      studentSection === sectionFilter;

    return classMatch && sectionMatch;
  });

  return [
    {
      label: "All Students",
      value: "all",
    },

    ...filtered
      .map((student) => {
        const value = String(
          student?.id ??
          student?.studentId ??
          ""
        ).trim();

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
}, [
  studentsBySchoolAndYear,
  classFilter,
  sectionFilter,
]);
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${isDoctor ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
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
  );
};

// Memoized: prevents re-rendering all five selects (and their option lists)
// on every keystroke in the parent screening form.
export default React.memo(StudentFilter);
