import React from "react";
import {
  Baby,
  BookOpen,
  Cake,
  GraduationCap,
  Mars,
  Transgender,
  User,
  UserRound,
  Venus,
} from "lucide-react";
import { getNormaliseName } from "./students-cards";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

function formatDob(value) {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function calculateAgeFromDob(value) {
  if (!value) {
    return "--";
  }

  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) {
    return "--";
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "--";
}

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (!parts.length) {
    return "NA";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function statusToneClass(status) {
  const normalized = String(status ?? "").toLowerCase();

  if (["active", "approved", "confirmed"].includes(normalized)) {
    return "bg-success/15 text-success";
  }

  if (["pending", "in review"].includes(normalized)) {
    return "bg-warning/20 text-warning-foreground";
  }

  if (["inactive", "rejected", "suspended"].includes(normalized)) {
    return "bg-destructive/15 text-destructive";
  }

  return "bg-muted text-muted-foreground";
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon ? (
        <span className="mt-0.5 flex size-8 shrink-0 items-center aspect-square justify-center rounded-lg bg-muted">
          <Icon className="size-5 text-muted-foreground" strokeWidth={2} />
        </span>
      ) : null}
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value || "--"}</p>
      </div>
    </div>
  );
}

// getNormaliseName() yields "Male" / "Female" (capitalised); anything else
// (missing, "-", "other") falls back to a neutral icon.
function genderIcon(normalised) {
  if (normalised === "Female") return Venus;
  if (normalised === "Male") return Mars;
  return Transgender;
}

const StudentProfileCard = ({ student }) => {
  if (!student) {
    return (
      <article className="rounded-xl border border-dashed border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">No student selected.</p>
      </article>
    );
  }

  const name = student?.name ?? student?.student_name ?? "Student";
  const studentCode =
    student?.uhid ??
    student?.svastha_id ??
    student?.id ??
    student?.school_registration_number ??
    student?.admission_number ??
    student?.id ??
    "--";

  const svasthaId = student?.svastha_id ?? student?.cus_id ?? '--';

  const classValue = student?.Class ?? student?.class ?? student?.grade ?? "--";
  const sectionValue = student?.sec ?? student?.section ?? "--";
  const dobValue =
    student?.dob ?? student?.date_of_birth ?? student?.dateOfBirth ?? "";
  const ageValue = student?.age
    ? String(student.age)
    : calculateAgeFromDob(dobValue);
  const getGender = student?.gender ?? student?.Gender ?? "-";
  const getNormalise = getNormaliseName(getGender);

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col md:flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {getInitials(name)}
          </span>

          <div className="min-w-0 gap-5">
            <p className="truncate text-base font-semibold text-foreground">
              {name}
            </p>
           <div className="flex gap-2 my-1">
             <Badge variant="secondary" className="text-xs border border-primary flex flex-row items-end gap-1">
              <>
              <Image src={"/logo.svg"} width={16} height={16} alt="svastha-id"/>
              {studentCode}
              </>
              </Badge>
            <Badge className="text-xs">{svasthaId}</Badge>
           </div>
          </div>
        </div>

        {student?.status ? (
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusToneClass(
              student.status,
            )}`}
          >
            {student.status}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid w-full grid-cols-2 gap-4 text-sm sm:mt-5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
        <InfoItem icon={Cake} label="DOB" value={formatDob(dobValue)} />
        <InfoItem icon={Baby} label="Age" value={ageValue} />
        <InfoItem
          icon={genderIcon(getNormalise)}
          label="Gender"
          value={getNormalise}
        />
        <InfoItem icon={GraduationCap} label="Class" value={classValue} />
        <InfoItem icon={BookOpen} label="Section" value={sectionValue} />
        <InfoItem
          icon={User}
          label="Father"
          value={student?.fatherName ?? student?.father_name ?? "--"}
        />
        <InfoItem
          icon={UserRound}
          label="Mother"
          value={student?.motherName ?? student?.mother_name ?? "--"}
        />
      </div>
    </article>
  );
};

// Memoized: the profile card is static while typing in the screening form.
export default React.memo(StudentProfileCard);
