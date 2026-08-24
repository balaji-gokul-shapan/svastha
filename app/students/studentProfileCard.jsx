import React from "react";

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
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

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

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "--"}</p>
    </div>
  );
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
    student?.cus_id ??
    student?.id ??
    student?.school_registration_number ??
    student?.admission_number ??
    student?.id ??
    "--";

  const classValue = student?.Class ?? student?.class ?? student?.grade ?? "--";
  const sectionValue = student?.sec ?? student?.section ?? "--";
  const dobValue =
    student?.dob ?? student?.date_of_birth ?? student?.dateOfBirth ?? "";
  const ageValue = student?.age ? String(student.age) : calculateAgeFromDob(dobValue);

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col md:flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {getInitials(name)}
          </span>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{studentCode}</p>
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

      <div className="mt-4 grid w-full grid-cols-2 gap-4 text-sm sm:mt-5 sm:grid-cols-3 lg:grid-cols-6">
        <InfoItem label="Class" value={classValue} />
        <InfoItem label="Section" value={sectionValue} />
        <InfoItem label="DOB" value={formatDob(dobValue)} />
        <InfoItem label="Age" value={ageValue} />
        <InfoItem
          label="Father"
          value={student?.fatherName ?? student?.father_name ?? "--"}
        />
        <InfoItem
          label="Mother"
          value={student?.motherName ?? student?.mother_name ?? "--"}
        />
      </div>
    </article>
  );
};

// Memoized: the profile card is static while typing in the screening form.
export default React.memo(StudentProfileCard);
