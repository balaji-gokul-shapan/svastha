"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  EMPTY_SCREENING_STATUSES,
  SCREENING_STATUS_KEYS,
} from "@/lib/screening-status-utils";
import { studentKeyOf } from "@/lib/features/screeningStatusSlice";

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

const STATUS_LABELS = {
  general: "General",
  vision: "Vision",
  dental: "Dental",
  hearing: "Hearing",
  ent: "ENT",
};

const statusTone = (value) => {
  const v = textOf(value).toLowerCase();
  if (!v || v === "--" || v === "pending" || v === "not recorded") return "outline";
  if (/(severe|abnormal|refer|high|risk|positive|fail|bad)/.test(v)) return "bad";
  if (/(normal|pass|low|negative|no issue|completed|good)/.test(v)) return "good";
  return "secondary";
};

const StatusCell = ({ value, loading }) => {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        ...
      </span>
    );
  }
  return <Badge variant={statusTone(value)}>{textOf(value) || "--"}</Badge>;
};

const statusesOf = (row, statusesByKey) => {
  const entry = statusesByKey?.[studentKeyOf(row)];
  return entry?.statuses ?? EMPTY_SCREENING_STATUSES;
};

const isStatusesLoading = (row, statusesByKey) =>
  statusesByKey?.[studentKeyOf(row)]?.status === "loading";

/**
 * ReportStudentsTable — all-students table for the report page.
 * Purely additive: paginated via shared DataTable, row click opens the
 * existing detailed report. No changes to HealthCheckContent/PrimaryDoctorTab.
 */
export default function ReportStudentsTable({
  students = [],
  isLoading = false,
  onSelectStudent,
  pageIndex = 0,
  onPageIndexChange,
  pageSize = 10,
  onPageSizeChange,
  statusesByKey = {},
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
      ...SCREENING_STATUS_KEYS.map((statusKey) => ({
        id: `status-${statusKey}`,
        header: STATUS_LABELS[statusKey] ?? statusKey,
        accessorFn: (row) =>
          textOf(statusesOf(row, statusesByKey)[statusKey]) || "--",
        cell: ({ row }) => (
          <StatusCell
            value={statusesOf(row.original, statusesByKey)[statusKey]}
            loading={isStatusesLoading(row.original, statusesByKey)}
          />
        ),
      })),
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
    [onSelectStudent, statusesByKey],
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
