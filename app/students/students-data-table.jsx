"use client";

import { BadgeCheck, Clock3, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getStudentSlug } from "./student-data";

const statusStyles = {
  Active: "bg-success/15 text-success",
  Pending: "bg-warning/20 text-warning-foreground",
  "Follow-up": "bg-info/15 text-info",
};

function StatusPill({ status }) {
  const Icon =
    status === "Active" ? BadgeCheck : status === "Pending" ? Clock3 : ShieldAlert;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]} || bg-muted text-primary`}
    >
      <Icon className="size-3.5" />
      {status}
    </span>
  );
}

function SelectCheckbox({ checked, indeterminate = false, onChange, ariaLabel }) {
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
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

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
        row.original.cus_id ??
        row.original.studentId ??
        row.original.id ??
        "";

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

export function StudentsDataTable({ data = [] }) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = React.useState({});

  const allSelected =
    data.length > 0 && data.every((student) => Boolean(selectedRows[student.studentId]));
  const someSelected =
    !allSelected && data.some((student) => Boolean(selectedRows[student.studentId]));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows({});
      return;
    }

    const nextSelected = {};
    data.forEach((student) => {
      nextSelected[student.studentId] = true;
    });
    setSelectedRows(nextSelected);
  };

  const toggleSingleRow = (studentId) => {
    setSelectedRows((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

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
        const studentId = row.original.studentId;

        return (
          <div data-no-row-click="true">
            <SelectCheckbox
              checked={Boolean(selectedRows[studentId])}
              onChange={() => toggleSingleRow(studentId)}
              ariaLabel={`Select ${row.original.name}`}
            />
          </div>
        );
      },
    },
    ...columns,
  ];

  return (
    <TooltipProvider>
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

          router.push(`/students/${slug}`);
        }}
      />
    </TooltipProvider>
  );
}
