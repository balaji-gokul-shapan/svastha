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
// import { getNormaliseName } from "../students-cards";
import Image from "next/image";
import { getNormaliseName } from "./students-cards";

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
    <div className="gs-info">
      {Icon ? (
        <span className="gs-info__icon">
          <Icon className="size-4" strokeWidth={2} />
        </span>
      ) : null}

      <div className="min-w-0">
        <p className="gs-info__label">{label}</p>

        <p className="gs-info__value truncate">{value || "--"}</p>
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
    <article className="gs-panel">
      <div className="flex flex-col items-start justify-between gap-3 p-4 pb-3 sm:flex-row sm:items-center sm:p-5 sm:pb-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="gs-avatar">{getInitials(name)}</span>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
              {name}
            </p>

            {/* Identity chips — tabular figures so the codes line up. */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="gs-chip">
                <Image
                  src="/logo.svg"
                  width={12}
                  height={12}
                  alt=""
                  aria-hidden="true"
                />
                {studentCode}
              </span>

              <span className="gs-chip">{svasthaId}</span>
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

      {/* Hairline separates identity from the detail rows. */}
      <div className="border-t border-border/60 bg-muted/20 p-2.5 sm:p-3">
        <div className="grid w-full grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
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
      </div>
    </article>
  );
};

// Memoized: the profile card is static while typing in the screening form.
export default React.memo(StudentProfileCard);
