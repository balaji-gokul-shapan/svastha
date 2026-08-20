"use client";

import CaDrawer from "@/components/health-checks/ca-drawer";
import ReusableSelect from "@/components/ui/reusable-select";
import { CircleUserRound } from "lucide-react";

export default function CampStudentSelectorDrawer({
  open,
  onOpenChange,
  studentsLoading,
  studentsError,
  campsLoading,
  campsQueryError,
  studentCampLoading,
  studentCampQueryError,
  selectedCampId,
  onCampChange,
  campOptions,
  academicYears,
  activeAcademicYear,
  onAcademicYearChange,
  classOptions,
  selectedClassFilter,
  onClassChange,
  sectionOptions,
  selectedSectionFilter,
  onSectionChange,
  studentSelectValue,
  onStudentChange,
  filteredStudents,
  normalizedCampStudents,
}) {
  return (
    <CaDrawer
      icon={<CircleUserRound />}
      title="Student Selection"
      description="Select academic year, class, section and student."
      open={open}
      onOpenChange={onOpenChange}
    >
      {studentsLoading ? (
        <p className="text-sm text-muted-foreground">Loading students...</p>
      ) : studentsError ? (
        <p className="text-sm text-destructive">Unable to load students</p>
      ) : filteredStudents.length || campOptions.length ? (
        <div className="space-y-3">
          <ReusableSelect
            label="Select Camp"
            options={campOptions}
            value={selectedCampId}
            onChange={onCampChange}
            placeholder={campsLoading ? "Loading camps..." : "Select camp"}
            searchPlaceholder="Search camp"
            disabled={campsLoading || !!campsQueryError}
          />

          {campsQueryError ? (
            <p className="text-xs text-destructive">Unable to load camps</p>
          ) : null}

          {selectedCampId && studentCampQueryError ? (
            <p className="text-xs text-destructive">Unable to load camp students</p>
          ) : null}

          {selectedCampId && studentCampLoading ? (
            <p className="text-xs text-muted-foreground">Loading selected camp students...</p>
          ) : null}

          <ReusableSelect
            label="Academic Year"
            options={academicYears.map((year) => ({ value: year, label: year }))}
            value={activeAcademicYear}
            onChange={onAcademicYearChange}
            placeholder="Select academic year"
            searchPlaceholder="Search academic year"
            disabled={!selectedCampId || studentCampLoading || !!studentCampQueryError}
          />

          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
            <ReusableSelect
              className="flex-1 w-full lg:w-auto"
              label="Class"
              options={classOptions}
              value={selectedClassFilter}
              onChange={onClassChange}
              searchPlaceholder="Search class"
              disabled={!selectedCampId}
            />

            <ReusableSelect
              className="flex-1 w-full lg:w-auto"
              label="Section"
              options={sectionOptions}
              value={selectedSectionFilter}
              onChange={onSectionChange}
              searchPlaceholder="Search section"
              disabled={!selectedCampId}
            />
          </div>

          <ReusableSelect
            label="Student"
            value={studentSelectValue}
            onChange={onStudentChange}
            placeholder="Select student"
            searchPlaceholder="Search student"
            disabled={!selectedCampId || studentCampLoading}
            options={filteredStudents.map((student) => ({
              value: String(student.id ?? student.studentId ?? ""),
              label: `${student.name || "Unknown"} (${student.studentId || "No ID"})`,
            }))}
          />

          <p className="text-xs text-muted-foreground">
            Showing {filteredStudents.length} of {normalizedCampStudents.length} camp students
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No students found</p>
      )}
    </CaDrawer>
  );
}
