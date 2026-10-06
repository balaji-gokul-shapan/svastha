"use client";

import { BadgeCheck, Clock3, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStudentSlug } from "../datas/student-data";
import { getNormaliseName } from "./students-cards";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { deleteStudent } from "@/lib/features/DeleteStudentSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusStyles = {
  Active: "bg-success/15 text-success",
  Pending: "bg-warning/20 text-warning-foreground",
  "Follow-up": "bg-info/15 text-info",
};

function StatusPill({ status }) {
  const Icon =
    status === "Active"
      ? BadgeCheck
      : status === "Pending"
        ? Clock3
        : ShieldAlert;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-current/20 ${statusStyles[status]} || "bg-muted text-primary"}`}
    >
      <Icon className="size-3.5 shrink-0" />
      {status}
    </span>
  );
}

// Compact chip for short, low-variance values (gender, class/section).
function ValueChip({ value, dotClass }) {
  return (
    <span className="sl-chip">
      {dotClass ? <span className={`sl-chip-dot ${dotClass}`} /> : null}
      {value || "--"}
    </span>
  );
}

// Deterministic accent per student so the same person always gets the same
// avatar tint across reloads and across the list. Purely presentational.
const AVATAR_TINTS = [
  "bg-sky-500/12 text-sky-600 dark:text-sky-300",
  "bg-violet-500/12 text-violet-600 dark:text-violet-300",
  "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
  "bg-amber-500/14 text-amber-700 dark:text-amber-300",
  "bg-rose-500/12 text-rose-600 dark:text-rose-300",
  "bg-teal-500/12 text-teal-600 dark:text-teal-300",
];

function tintFor(seed = "") {
  const text = String(seed);
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }

  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

function SelectCheckbox({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
}) {
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={onChange}
      aria-label={ariaLabel}
      className="translate-y-px"
    />
  );
}

export function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return "NA";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function truncateText(value, maxLength = 25) {
  const text = String(value ?? "");

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

function TruncatedWithTooltip({ value, className = "", maxLength = 25 }) {
  const text = String(value ?? "");
  const truncated = truncateText(text, maxLength);
  const isTruncated = text.length > maxLength;

  if (!isTruncated) {
    return <span className={className}>{text}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{truncated}</span>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Resolves the two identifiers independently.
 *
 * `normalizeStudent` in getAllStudentSlice collapses cus_id / id / studentId
 * into a single `studentId` field
 */
function resolveStudentId(student = {}) {
  const value =
    student.cus_id ??
    student.student_cus_id ??
    student.student_id ??
    student.studentId ??
    student.id ??
    "";

  return value === null || value === undefined ? "" : String(value);
}

function resolveSvasthaId(student = {}) {
  const value =
    student.svastha_id ??
    student.svastha_student_id ??
    student.svasthaId ??
    "";

  return value === null || value === undefined ? "" : String(value);
}

const columns = [
  {
    accessorKey: "studentId",
    header: "Student ID",
    cell: ({ row }) => (
      <TruncatedWithTooltip
        value={resolveStudentId(row.original) || "--"}
        className="sl-num"
      />
    ),
  },
  {
    accessorKey: "svastha_id",
    header: "Svastha ID",
    cell: ({ row }) => (
      <TruncatedWithTooltip
        value={resolveSvasthaId(row.original) || "--"}
        className="sl-num"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.name ?? "";

      return (
        <div className="flex items-center gap-2.5">
          <span
            className={`sl-avatar ${tintFor(
              row.original.cus_id ?? row.original.id ?? name,
            )}`}
          >
            {getInitials(name)}
          </span>
          <span className="min-w-0">
            <TruncatedWithTooltip
              value={name}
              className="block font-semibold leading-tight"
            />
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const genderValue = getNormaliseName(
        row.original.gender ?? row.original.Gender ?? "",
      );

      return (
        <ValueChip
          value={genderValue || "--"}
          dotClass={
            genderValue === "Female"
              ? "bg-rose-500"
              : genderValue === "Male"
                ? "bg-sky-500"
                : "bg-muted-foreground/50"
          }
        />
      );
    },
  },
  {
    accessorKey: "Class & Section",
    header: "Class & Section",
    cell: ({ row }) => {
      const classValue =
        row.original.Class ?? row.original.class ?? row.original.grade ?? "";
      const sectionValue = row.original.sec ?? row.original.section ?? "";

      return (
        <span className="flex items-center gap-1.5">
          <ValueChip value={classValue || "--"} />
          {sectionValue ? (
            <span className="sl-chip sl-chip--section">{sectionValue}</span>
          ) : null}
        </span>
      );
    },
  },
  // {
  //   accessorKey: "sec",
  //   header: "Section",
  //   cell: ({ row }) => {
  //     const sectionValue = row.original.sec ?? row.original.section ?? "";

  //     return <TruncatedWithTooltip value={sectionValue || "--"} />;
  //   },
  // },
  // {
  //   accessorKey: "fatherName",
  //   header: "Father Name",
  //   cell: ({ row }) => {
  //     const fatherName = row.original.fatherName ?? "";

  //     return <TruncatedWithTooltip value={fatherName} />;
  //   },
  // },
  // {
  //   accessorKey: "motherName",
  //   header: "Mother Name",
  //   cell: ({ row }) => {
  //     const motherName = row.original.motherName ?? "";

  //     return <TruncatedWithTooltip value={motherName} />;
  //   },
  // },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
];

export function StudentsDataTable({
  data = [],
  backQuery = "",
  onDeleted,
  page = 1,
  totalPages = 1,
  totalRows = 0,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = React.useState(() => new Set());
  const [deleting, setDeleting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const getStudentId = (student) => resolveStudentId(student) || null;
  const selectedCount = selectedIds.size;

  const allSelected =
    data.length > 0 &&
    data.every((student) => {
      const id = getStudentId(student);
      return id !== null && selectedIds.has(id);
    });
  const someSelected =
    !allSelected &&
    data.some((student) => {
      const id = getStudentId(student);
      return id !== null && selectedIds.has(id);
    });

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    const next = new Set();
    data.forEach((student) => {
      const id = getStudentId(student);
      if (id !== null) next.add(id);
    });
    setSelectedIds(next);
  };

  const toggleSingleRow = (studentId) => {
    if (studentId === null || studentId === undefined) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (!ids.length || deleting) return;

    setDeleting(true);
    const results = await Promise.allSettled(
      ids.map((id) => dispatch(deleteStudent({ studentId: id })).unwrap()),
    );
    setDeleting(false);

    const failed = results.filter((r) => r.status === "rejected").length;
    setSelectedIds(new Set());

    if (failed === 0) {
      toast.success(
        `${ids.length} student${ids.length > 1 ? "s" : ""} deleted`,
      );
    } else {
      toast.error(`${ids.length - failed} deleted · ${failed} failed`);
    }

    onDeleted?.();
  };
  const clearSelection = () => setSelectedIds(new Set());

  // The checkbox is rendered as a leading select rail by DataTable rather than
  // as a column definition, so it does not take a slot in the column order and
  // every data column keeps its own index and width.
  const selectAllCheckbox = (
    <SelectCheckbox
      checked={allSelected}
      indeterminate={someSelected}
      onChange={toggleSelectAll}
      aria-label="Select all students"
    />
  );

  const renderSelectCell = (row) => {
    const studentId = getStudentId(row.original);

    return (
      <SelectCheckbox
        checked={studentId !== null && selectedIds.has(studentId)}
        onChange={() => toggleSingleRow(studentId)}
        aria-label={`Select ${row.original.name ?? "student"}`}
      />
    );
  };

  return (
    <TooltipProvider>
      {selectedCount > 0 && (
        <div className="sl-bulk mb-3 flex flex-wrap items-center gap-3 px-3 py-2">
          <span className="text-sm font-medium text-foreground">
            {selectedCount} selected
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Selected"}
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={data}
        pageSizeOptions={pageSizeOptions}
        serverPagination={{
          page,
          totalPages,
          totalRows,
          pageSize,
          onPageChange,
          onPageSizeChange,
          isLoading,
        }}
        // Checkbox rail, rendered outside the column model.
        selectHeader={selectAllCheckbox}
        selectCell={renderSelectCell}
        selectWidth="3.5rem"
        rootClassName="sl-root"
        shellClassName="sl-shell"
        tableClassName="sl-table"
        headClassName="sl-head"
        rowClassName="sl-row"
        withCellLabels
        columnWidths={["9rem", "11rem", "auto", "8rem", "11rem", "9rem"]}
        emptyState={
          <EmptyState
            title="No students found"
            description="Try changing filters or add a new student to get started."
          />
        }
        onRowClick={(student) => {
          const slug = getStudentSlug(student);
          if (!slug) {
            return;
          }

          router.push(
            backQuery ? `/students/${slug}?${backQuery}` : `/students/${slug}`,
          );
        }}
      />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) setConfirmOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete student{selectedCount === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCount} selected student
              {selectedCount === 1 ? "" : "s"}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep them</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                setConfirmOpen(false);
                handleBulkDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
