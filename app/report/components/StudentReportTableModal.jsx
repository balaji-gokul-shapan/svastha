"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import HealthCheckContent from "./HealthCheckContent";
import ReportStudentsTable, { idOf as idOfReportStudent } from "./ReportStudentsTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReusableSelect from "@/components/ui/reusable-select";
import { useScreeningStatuses } from "../utilities/useScreeningStatuses";
import { getCampId } from "@/lib/camp-utils";

const textOf = (value) => String(value ?? "").trim();

const ALL = "all";

const nameOfStudent = (student) =>
  textOf(student?.name ?? student?.student_name ?? student?.studentName);

const classOfStudent = (student) =>
  textOf(student?.class ?? student?.Class ?? student?.class_name);

const sectionOfStudent = (student) =>
  textOf(student?.sec ?? student?.section ?? student?.Section ?? student?.section_name);

const uniqueSorted = (values) =>
  Array.from(new Set(values.map(textOf).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  );

const classLabelOf = (student) => classOfStudent(student);

const sectionLabelOf = (student) => sectionOfStudent(student);

const admissionNoOf = (student) =>
  textOf(student?.admission_number ?? student?.school_registration_number);

/**
 * StudentReportTableModal — table view where the View button opens the full
 * report in a modal. Never switches reportView: the table stays mounted
 * underneath and the dialog resolves the clicked row to a student record.
 */
export default function StudentReportTableModal({
  students = [],
  isLoading = false,
  pageIndex = 0,
  onPageIndexChange,
  pageSize = 10,
  onPageSizeChange,
  modalStudent,
  onSelectStudent,
  onCloseModal,
  selectUser,
  selectedSchoolBranch,
  setSelectedSchoolBranch,
  selectedBranch,
  defaultBranch,
  selectedCamp,
  activeEvent,
  primaryDoctorDetails,
  assignedScreeningIds,
  filterProps,
}) {
  const [nameQuery, setNameQuery] = useState("");
  const [classValue, setClassValue] = useState(ALL);
  const [sectionValue, setSectionValue] = useState(ALL);

  const rows = useMemo(
    () => (Array.isArray(students) ? students : []),
    [students],
  );

  const classOptions = useMemo(
    () => [
      { label: "All Classes", value: ALL },
      ...uniqueSorted(rows.map(classOfStudent)).map((value) => ({
        label: `Class ${value}`,
        value,
      })),
    ],
    [rows],
  );

  const sectionOptions = useMemo(() => {
    const scoped =
      classValue === ALL
        ? rows
        : rows.filter((row) => classOfStudent(row) === classValue);
    return [
      { label: "All Sections", value: ALL },
      ...uniqueSorted(scoped.map(sectionOfStudent)).map((value) => ({
        label: `Section ${value}`,
        value,
      })),
    ];
  }, [rows, classValue]);

  const filteredStudents = useMemo(() => {
    const query = textOf(nameQuery).toLowerCase();
    return rows.filter((row) => {
      if (classValue !== ALL && classOfStudent(row) !== classValue) return false;
      if (sectionValue !== ALL && sectionOfStudent(row) !== sectionValue)
        return false;
      if (query && !nameOfStudent(row).toLowerCase().includes(query))
        return false;
      return true;
    });
  }, [rows, nameQuery, classValue, sectionValue]);

  const hasActiveFilters =
    textOf(nameQuery) !== "" || classValue !== ALL || sectionValue !== ALL;

  // Redux-backed per-student statuses for the VISIBLE page only (by id/cus_id).
  // Slicing to the page bounds the fan-out: page 1 of 10 → 10 students, not the
  // whole filtered set. Cached per student key — rows already resolved never
  // refetch when paging back and forth.
  const pageStart = pageIndex * pageSize;
  const visibleStudents = useMemo(
    () => filteredStudents.slice(pageStart, pageStart + pageSize),
    [filteredStudents, pageStart, pageSize],
  );
  const { statusesByKey } = useScreeningStatuses(visibleStudents, {
    campId: getCampId(selectedCamp ?? activeEvent),
  });

  const handleNameChange = (value) => {
    setNameQuery(value);
    onPageIndexChange?.(0);
  };

  const handleClassChange = (value) => {
    const next = textOf(value) || ALL;
    setClassValue(next);
    // A section picked under another class is meaningless — reset it.
    setSectionValue(ALL);
    onPageIndexChange?.(0);
  };

  const handleSectionChange = (value) => {
    setSectionValue(textOf(value) || ALL);
    onPageIndexChange?.(0);
  };

  const handleClearFilters = () => {
    setNameQuery("");
    setClassValue(ALL);
    setSectionValue(ALL);
    onPageIndexChange?.(0);
  };

  const modalName = nameOfStudent(modalStudent);
  const modalClassSection = [classLabelOf(modalStudent), sectionLabelOf(modalStudent)]
    .filter(Boolean)
    .join(" - ");
  const modalAdmissionNo = admissionNoOf(modalStudent);
  const modalSubtitle = [modalClassSection, modalAdmissionNo && `Admission No: ${modalAdmissionNo}`]
    .filter(Boolean)
    .join("  •  ");

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="report-table-name-filter"
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              Student Name
            </label>
            <Input
              id="report-table-name-filter"
              value={nameQuery}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Search by name..."
              className="h-9"
            />
          </div>

          <div className="min-w-0 flex-1">
            <ReusableSelect
              label="Class"
              value={classValue}
              onChange={handleClassChange}
              options={classOptions}
              placeholder="All Classes"
            />
          </div>

          <div className="min-w-0 flex-1">
            <ReusableSelect
              label="Section"
              value={sectionValue}
              onChange={handleSectionChange}
              options={sectionOptions}
              placeholder="All Sections"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filteredStudents.length} of {rows.length}
            </span>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 px-2.5 text-xs"
                onClick={handleClearFilters}
              >
                <SearchX className="size-3.5" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <ReportStudentsTable
          students={filteredStudents}
          isLoading={isLoading}
          pageIndex={pageIndex}
          onPageIndexChange={onPageIndexChange}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          onSelectStudent={onSelectStudent}
          statusesByKey={statusesByKey}
        />
      </div>

      <Dialog open={Boolean(modalStudent)} onOpenChange={(open) => !open && onCloseModal?.()}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader className={"py-3"}>
            <DialogTitle>
              {modalName ? `Student Health Report — ${modalName}` : "Student Health Report"}
            </DialogTitle>
            {modalSubtitle ? (
              <DialogDescription>{modalSubtitle}</DialogDescription>
            ) : null}
          </DialogHeader>

          {modalStudent ? (
            <HealthCheckContent
              selectUser={selectUser}
              selectedSchoolBranch={selectedSchoolBranch}
              setSelectedSchoolBranch={setSelectedSchoolBranch}
              student={modalStudent}
              branch={selectedSchoolBranch ?? selectedBranch ?? defaultBranch}
              camp={selectedCamp}
              activeEvent={activeEvent}
              primaryDoctorDetails={primaryDoctorDetails}
              assignedScreeningIds={assignedScreeningIds}
              {...filterProps}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export { idOfReportStudent };
