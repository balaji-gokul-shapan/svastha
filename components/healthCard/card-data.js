/* ==========================================================================
   Health ID card — data mapping
   ==========================================================================
   Turns the student record + the four screening records into the flat slot
   object the card renders. Pure functions, no React and no JSX, so the card
   component stays presentational and this can be checked on its own.

   Field spellings are deliberately multi-key: every screening endpoint returns
   a different shape, and the consolidated report resolves them in this same
   order (see app/report/components/HealthCheckContent.jsx), so the card shows
   the identical values as the report instead of inventing its own rules.
   ========================================================================== */

/* Status text → tone. Mirrors the mapping the modal used before
   (STATUS_VARIANT) so "Normal"/"Up to Date" read as healthy and
   "Abnormal"/"Severe" read as a problem, and any unknown word stays neutral. */
const TONE_BY_STATUS = {
  good: "good",
  normal: "good",
  healthy: "good",
  uptodate: "good",
  completed: "good",
  mild: "warning",
  warning: "warning",
  moderate: "warning",
  borderline: "warning",
  review: "warning",
  monitor: "warning",
  bad: "bad",
  poor: "bad",
  abnormal: "bad",
  severe: "bad",
  critical: "bad",
  referred: "bad",
  referral: "bad",
};

export function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function statusTone(status) {
  return TONE_BY_STATUS[normalizeKey(status)] ?? "neutral";
}

export function formatMetric(value, unit) {
  const raw = String(value ?? "").trim();

  if (!raw) return "--";

  const text =
    unit && raw.toLowerCase().endsWith(unit.toLowerCase())
      ? raw.slice(0, -unit.length).trim()
      : raw;

  if (!text) return "--";

  return unit ? `${text} ${unit}` : text;
}

/* Records can hold either a scalar or a nested {name}/{label} object. */
export function getRecordName(record, ...keys) {
  for (const key of keys) {
    const value = record?.[key];
    const name =
      typeof value === "object" && value !== null
        ? (value.name ?? value.label)
        : value;
    const text = String(name ?? "").trim();

    if (text) return text;
  }

  return "";
}

export function formatAge(dob) {
  if (!dob) return "";

  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} Years ${months} Months`;
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* The consolidated status of one domain. `nested` covers the dental shape,
   where the result lives under `report` (see getDentalStatus in the report). */
function resolveStatus(record, nested) {
  return (
    getRecordName(record, "consolidate_report_result", "result", "status") ||
    getRecordName(nested, "consolidate_report_result", "result", "status") ||
    "--"
  );
}

function joinFacts(...values) {
  return values.filter((value) => value && value !== "--").join(" · ");
}

export function buildHealthCardData({ student, records = {}, sections = {} } = {}) {
  const general = records.general ?? null;
  const vision = records.vision ?? null;
  const hearing = records.hearing ?? null;
  const dental = records.dental ?? null;

  const name = student?.name ?? student?.student_name ?? "Student";
  const classValue = student?.class ?? student?.Class ?? "--";
  const sectionValue = student?.sec ?? student?.section ?? "--";
  // "--" is the codebase's placeholder for missing values, so build the class
  // label from whatever is actually present (never "Class -----").
  const klass = [classValue, sectionValue]
    .filter((value) => value && value !== "--")
    .join("-");
  const admissionNo = student?.admission_number ?? "--";
  const uhid = student?.uhid ?? "--";
  const svasthaId = student?.svastha_id ?? "";
  const academicYear = student?.academic_year ?? "";
  const school = student?.school_name ?? "";
  const gender = student?.gender ?? "";
  const dob = student?.dob ?? "";
  const photo =
    student?.image_path ??
    student?.profile_image ??
    student?.student_image ??
    student?.image ??
    student?.photo ??
    "";

  const screenedOn = getRecordName(
    general,
    "assessment_date",
    "screened_on",
    "screening_date",
    "created_at",
    "date",
  );

  const bmi = formatMetric(general?.bmi, "");
  const physicalFacts = joinFacts(
    formatMetric(general?.height, "cm"),
    formatMetric(general?.weight, "kg"),
    // A bare "18.8" means nothing to a parent, so the label travels with it.
    bmi !== "--" ? `BMI ${bmi}` : "",
  );

  const domainRows = [
    {
      key: "vitals",
      label: "PHYSICAL",
      status: resolveStatus(general),
      detail: physicalFacts,
    },
    { key: "vision", label: "VISION", status: resolveStatus(vision) },
    { key: "hearing", label: "HEARING", status: resolveStatus(hearing) },
    {
      key: "dental",
      label: "ORAL",
      status: resolveStatus(dental, dental?.report),
    },
    // TODO: useScreeningRecord fetches no immunization record — this keeps the
    // value the card showed before; swap it for the real record once the
    // immunization module exposes one per student.
    { key: "immunization", label: "IMMUNIZATION", status: "Up to Date" },
  ];

  // Settings → Report still decides which domains appear, exactly as it did
  // for the report sections.
  const domains = domainRows
    .filter((row) => sections[row.key] ?? true)
    .map(({ key, label, status, detail }) => ({
      key,
      label,
      value: detail ? `${status} · ${detail}` : status,
      tone: statusTone(status),
    }));

  return {
    brand: "Svastha",
    // Top-right micro-print: the identifier the admission office knows.
    code: svasthaId ? `ID ${svasthaId}` : uhid !== "--" ? `UHID ${uhid}` : "",
    event: [
      school,
      academicYear ? `Academic Year ${academicYear}` : "",
      screenedOn ? `Screened ${formatDate(screenedOn)}` : "",
    ].filter(Boolean),
    person: klass ? `Class ${klass}` : "",
    field: joinFacts(gender, formatAge(dob)),
    role: name,
    access: "STUDENT HEALTH CARD",
    site: admissionNo !== "--" ? `ADM ${admissionNo}` : "",
    seat: uhid !== "--" ? uhid : admissionNo !== "--" ? admissionNo : "",
    pill: "HEALTH SUMMARY",
    photo,
    domains,
    // Same student → same bar pattern, so the strip is not random noise.
    barcode: [svasthaId, uhid, admissionNo].find(
      (value) => value && value !== "--",
    ) ?? name,
  };
}
