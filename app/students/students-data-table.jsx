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
import { getStudentSlug } from "./student-data";
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]} || bg-muted text-primary`}
    >
      <Icon className="size-3.5" />
      {status}
    </span>
  );
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

const columns = [
  {
    accessorKey: "studentId",
    header: "Student ID",
    cell: ({ row }) => {
      const studentId =
        row.original.cus_id ?? row.original.studentId ?? row.original.id ?? "";

      return <TruncatedWithTooltip value={studentId} />;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.name ?? "";

      return (
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
            {getInitials(name)}
          </span>
          <TruncatedWithTooltip value={name} className="font-medium" />
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

      return <TruncatedWithTooltip value={genderValue || "--"} />;
    },
  },
  {
    accessorKey: "Class",
    header: "Class",
    cell: ({ row }) => {
      const classValue =
        row.original.Class ?? row.original.class ?? row.original.grade ?? "";

      return <TruncatedWithTooltip value={classValue || "--"} />;
    },
  },
  {
    accessorKey: "sec",
    header: "Section",
    cell: ({ row }) => {
      const sectionValue = row.original.sec ?? row.original.section ?? "";

      return <TruncatedWithTooltip value={sectionValue || "--"} />;
    },
  },
  {
    accessorKey: "fatherName",
    header: "Father Name",
    cell: ({ row }) => {
      const fatherName = row.original.fatherName ?? "";

      return <TruncatedWithTooltip value={fatherName} />;
    },
  },
  {
    accessorKey: "motherName",
    header: "Mother Name",
    cell: ({ row }) => {
      const motherName = row.original.motherName ?? "";

      return <TruncatedWithTooltip value={motherName} />;
    },
  },
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
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = React.useState(() => new Set());
  const [deleting, setDeleting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const getStudentId = (student) =>
    student.cus_id ?? student.studentId ?? student.id ?? null;

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
      toast.success(`${ids.length} student${ids.length > 1 ? "s" : ""} deleted`);
    } else {
      toast.error(`${ids.length - failed} deleted · ${failed} failed`);
    }

    onDeleted?.();
  };
  const clearSelection = () => setSelectedIds(new Set());

  const columnsWithSelection = [
    {
      id: "select",
      header: () => (
        <SelectCheckbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={toggleSelectAll}
          ariaLabel="Select all students"
        />
      ),
      cell: ({ row }) => {
        const studentId = getStudentId(row.original);

        return (
          <div data-no-row-click="true">
            <SelectCheckbox
              checked={studentId !== null && selectedIds.has(studentId)}
              onChange={() => toggleSingleRow(studentId)}
              ariaLabel={`Select ${row.original.name ?? "student"}`}
            />
          </div>
        );
      },
    },
    ...columns,
  ];

  return (
    <TooltipProvider>
      {selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-2 px-3">
          <span className="text-sm text-muted-foreground">
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
        columns={columnsWithSelection}
        data={data}
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
              This will permanently delete {selectedCount} selected
              student{selectedCount === 1 ? "" : "s"}. This action cannot
              be undone.
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
