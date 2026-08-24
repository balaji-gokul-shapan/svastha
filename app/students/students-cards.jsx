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

export function StudentsCards({ data = [] }) {
  const router = useRouter();

  if (!data.length) {
    return (
      <EmptyState
        title="No students found"
        description="Try changing filters or add a new student to get started."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((student) => {
        const slug = getStudentSlug(student);
        const canOpen = Boolean(slug);
        const getGender = student.gender || student.Gender;
        const getNormalise = getNormaliseName(getGender);
        const isMale = getNormalise === "Male";
        return (
          <button
            key={student.studentId || student.id || student.name}
            type="button"
            onClick={() => {
              if (!canOpen) {
                return;
              }

              router.push(`/students/${slug}`);
            }}
            className="rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
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
          </button>
        );
      })}
    </div>
  );
}
