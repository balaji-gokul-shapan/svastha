"use client";

import { BadgeCheck, Clock3, Mars, ShieldAlert, Venus } from "lucide-react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { getStudentSlug } from "./student-data";
import Image from "next/image";
import {
  FemaleStudentIcon,
  MaleStudentIcon,
} from "@/components/assets/image/icon";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { deleteStudent } from "@/lib/features/DeleteStudentSlice";

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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status] || "bg-muted text-muted-foreground"}`}
    >
      <Icon className="size-3.5" />
      {status || "Unknown"}
    </span>
  );
}

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (!parts.length) {
    return "NA";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function getNormaliseName(userName) {
  const getNormalise =
    userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase();
  return getNormalise || userName || "";
}

export function StudentsCards({ data = [], backQuery = "", onDeleted }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getStudentId = (student) =>
    student.cus_id ??
    student.id ??
    student.studentId ??
    student.student_id ??
    null;

  const toggleSelected = (studentId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (!ids.length || deleting) return;

    setDeleting(true);
    const results = await Promise.allSettled(
      ids.map((studentId) => dispatch(deleteStudent({ studentId })).unwrap()),
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

  if (!data.length) {
    return (
      <EmptyState
        title="No students found"
        description="Try changing filters or add a new student to get started."
      />
    );
  }

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-2 px-3">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((student, index) => {
          const slug = getStudentSlug(student);
          const canOpen = Boolean(slug);
          const getGender = student.gender || student.Gender;
          const getNormalise = getNormaliseName(getGender);
          const isMale = getNormalise === "Male";
          const studentId = getStudentId(student);
          const isSelected = studentId !== null && selectedIds.has(studentId);

          return (
            <div
              key={`${
                student.cus_id ??
                student.id ??
                student.studentId ??
                student.student_id ??
                student.school_registration_number ??
                student.admission_number ??
                student.name ??
                "student"
              }-${index}`}
              className="relative"
            >
              <Checkbox
                checked={isSelected}
                disabled={studentId === null}
                onCheckedChange={() => toggleSelected(studentId)}
                aria-label={`Select ${student.name || "student"}`}
                className="absolute left-4 top-8 cursor-pointer"
              />
              <div
                role="button"
                tabIndex={canOpen ? 0 : -1}
                onClick={() => {
                  if (!canOpen) {
                    return;
                  }

                  router.push(
                    backQuery
                      ? `/students/${slug}?${backQuery}`
                      : `/students/${slug}`,
                  );
                }}
                onKeyDown={(e) => {
                  if (!canOpen || (e.key !== "Enter" && e.key !== " ")) return;
                  e.preventDefault();
                  router.push(
                    backQuery
                      ? `/students/${slug}?${backQuery}`
                      : `/students/${slug}`,
                  );
                }}
                className="w-full cursor-pointer rounded-xl border border-border bg-card p-4 pl-12 text-left transition hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                      {getInitials(student.name)}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        {student.name || "Unknown"}
                      </p>
                      <div className="flex flex-row items-center space-x-4">
                        <p className="text-xs text-muted-foreground">
                          {student.cus_id ??
                            student.id ??
                            student.studentId ??
                            "No ID"}
                        </p>
                        {/* <p className="text-xs flex flex-row gap-1 text-foreground capitalize">
                      {isMale ? (
                        <Mars size={'15'} className=" text-white" />
                      ) : (
                        <Venus size={'15'} className=" text-white" />
                      )}
                   
                      {getNormalise}
                    </p> */}
                        <Badge
                          variant={"outline"}
                          className="flex items-center  gap-1.5 text-xs text-foreground tracking-wider capitalize"
                        >
                          {isMale ? (
                            <MaleStudentIcon className="h-[18px] w-[18px] text-info" />
                          ) : (
                            <FemaleStudentIcon className="h-[18px] w-[18px] text-pink-600" />
                          )}

                          <p className="">{getNormalise}</p>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <StatusPill status={student.status} />
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Class</p>
                    <p className="font-medium text-foreground">
                      {student.class || student.Class || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Section</p>
                    <p className="font-medium text-foreground">
                      {student.sec || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Father</p>
                    <p className="truncate font-medium text-foreground">
                      {student.fatherName || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mother</p>
                    <p className="truncate font-medium text-foreground">
                      {student.motherName || "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) setConfirmOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete student{selectedIds.size === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.size} selected student
              {selectedIds.size === 1 ? "" : "s"}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep them</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Keep the dialog usable while deletes are in-flight.
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
    </>
  );
}
