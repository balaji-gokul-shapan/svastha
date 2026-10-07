"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

const textOf = (value) => String(value ?? "").trim();

const idOf = (student) =>
  textOf(
    student?.id ??
      student?.student_id ??
      student?.studentId ??
      student?.cus_id ??
      student?.school_registration_number ??
      student?.admission_number,
  );

const nameOf = (student) =>
  textOf(student?.name ?? student?.student_name ?? student?.studentName);

/**
 * ReportStudentsTable — all-students table for the report page.
 * Purely additive: paginated via shared DataTable, row click opens the
 * existing detailed report. No changes to HealthCheckContent/PrimaryDoctorTab.
 */
export default function ReportStudentsTable({
  students = [],
  isLoading = false,
  onSelectStudent,
  // Controlled pagination — held by ConsolidateReport so the page survives
  // table -> report -> back (unmount would otherwise reset to page 1).
  pageIndex = 0,
  onPageIndexChange,
  pageSize = 10,
  onPageSizeChange,
}) {
  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorFn: (row) => nameOf(row) || "--",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {nameOf(row.original) || "--"}
          </span>
        ),
      },
      {
        header: "Class & Section",
        accessorFn: (row) =>
          textOf(row?.class ?? row?.Class ?? row?.class_name) + " - " + textOf(row?.sec ?? row?.section ?? row?.Section ?? row?.section_name),
      },
      {
        header: "Admission No",
        accessorFn: (row) => textOf(row?.admission_number),
      },
      {
        header: "Gender",
        accessorFn: (row) => textOf(row?.gender),
        cell: ({ getValue }) => (
          <span className="capitalize">{getValue() || "--"}</span>
        ),
      },
      {
        id: "actions",
        header: "Report",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={() => onSelectStudent?.(row.original)}
          >
            <Eye className="size-3.5" />
            View
          </Button>
        ),
      },
    ],
    [onSelectStudent],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <DataTable
        columns={columns}
        data={Array.isArray(students) ? students : []}
        isLoading={isLoading}
        enablePagination
        enableSorting
        pageIndex={pageIndex}
        onPageIndexChange={onPageIndexChange}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        initialPageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        onRowClick={onSelectStudent}
        emptyMessage="No students match the selected filters."
        tableClassName="min-w-[720px] md:min-w-0"
      />
    </div>
  );
}

export { idOf };
