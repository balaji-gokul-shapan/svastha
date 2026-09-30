/**
 * Camp (assigned event) field normalisation shared by the camp dropdown, the
 * selected-camp resolver and the roster queries.
 */

const getScreeningName = (screening) => {
  
}
export const getCampId = (camp) =>
  String(
    camp?.camp_id ??
      camp?.campId ??
      camp?.CampId ??
      camp?.id ??
      camp?.Id ??
      "",
  ).trim();

export const getCampName = (camp) =>
  String(camp?.name ?? camp?.Name ?? camp?.camp_name ?? "").trim();

export const getCampSchoolName = (camp) =>
  String(
    camp?.school?.school_name ??
      camp?.school?.name ??
      camp?.school_name ??
      camp?.schoolName ??
      "",
  ).trim();




export const getCampDate = (camp) =>
  String(camp?.camp_date ?? camp?.campDate ?? camp?.date ?? "").trim();

/* -------------------------------------------------------------------------- */
/* School / branch ids                                                        */
/* -------------------------------------------------------------------------- */

export const getCampSchoolId = (camp) =>
  String(
    camp?.school_id ??
      camp?.schoolId ??
      camp?.school?.id ??
      "",
  ).trim();

export const getCampBranchId = (camp) =>
  String(
    camp?.branch_id ??
      camp?.branchId ??
      camp?.branch?.id ??
      "",
  ).trim();

export const getCampBranchName = (camp) =>
  String(
    camp?.branch?.branch_name ??
      camp?.branch?.name ??
      camp?.branch_name ??
      camp?.branchName ??
      "",
  ).trim();

/* The camp's active flag. The backend sends a real boolean on `status`, but a
   0/1 or "true"/"false" string is tolerated so callers never have to branch on
   the shape. Returns null when the field is absent, so a caller can tell
   "explicitly inactive" apart from "unknown". */
export const getCampStatus = (camp) => {
  const raw =
    camp?.status ??
    camp?.is_active ??
    camp?.isActive ??
    camp?.active ??
    null;

  if (raw === null || raw === undefined || raw === "") {
    return null;
  }

  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase();
    if (["true", "1", "yes", "active"].includes(v)) return true;
    if (["false", "0", "no", "inactive"].includes(v)) return false;
    return null;
  }

  return Boolean(raw);
};

/* True only when the backend explicitly marked the camp inactive. An absent
   status counts as active so a payload that omits the field doesn't hide
   every camp. */
export const isCampActive = (camp) => getCampStatus(camp) !== false;

/* -------------------------------------------------------------------------- */
/* buildCampSummary                                                           */
/*                                                                            */
/* Normalises ONE camp/event object into the flat shape the report filters and */
/* detail cards consume. Every field comes from the same `camp` argument —     */
/* never mixed with another camp's data.                                       */
/*                                                                            */
/* This exists because the previous code did `{ ...fallback, ...pickedFields }` */
/* where `fallback` was resolved from a DIFFERENT camp (the first one matching  */
/* the school name). That silently produced a Frankenstein object: id/name/date */
/* from the picked camp but location/registrationNumber from the fallback camp. */
/* With two camps at one school (very common) those disagree.                 */
/*                                                                            */
/* Returns the neutral "all camps" shape for a missing camp, with `id: null` so */
/* callers can tell "nothing selected" apart from a real camp.                 */
export const EMPTY_CAMP_SUMMARY = Object.freeze({
  id: null,
  name: "all",
  schoolName: "all",
  date: null,
  schoolId: null,
  branchId: null,
  branchName: "",
  status: null,
  doctorIds: [],
  primaryDoctorId: null,
  primaryDoctor: false,
  screeningIds: [],
  location: null,
  registrationNumber: null,
});

export const buildCampSummary = (camp, { schoolName = "all" } = {}) => {
  if (!camp) {
    return { ...EMPTY_CAMP_SUMMARY, schoolName: schoolName || "all" };
  }

  const school = camp?.school ?? {};

  return {
    id: getCampId(camp) || null,
    name: getCampName(camp) || "all",
    schoolName: getCampSchoolName(camp) || schoolName || "all",
    date: getCampDate(camp) || camp?.date || null,
    schoolId: getCampSchoolId(camp) || null,
    branchId: getCampBranchId(camp) || null,
    branchName: getCampBranchName(camp) || "",
    status: getCampStatus(camp),
    doctorIds: getCampDoctorIds(camp),
    primaryDoctorId: getCampPrimaryDoctorId(camp),
    // `primary_doctor` is a FLAG (0/1), distinct from `primary_doctor_id`.
    primaryDoctor: getCampStatus({ status: camp?.primary_doctor }) ?? false,
    screeningIds: getScreeningIds(camp),
    location:
      [school.area ?? camp?.area, school.city ?? camp?.city]
        .filter(Boolean)
        .join(", ") || null,
    registrationNumber:
      school.registration_number ??
      camp?.registration_number ??
      null,
  };
};

export function formatCampDate(value) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


export const getCampDisplayLabel = (camp) => {
  const name = getCampName(camp);
  const date = formatCampDate(getCampDate(camp) || camp?.date);

  if (!name) return date ?? "";
  return date ? `${name} — ${date}` : name;
};


export const getCampDoctorIds = (camp) => {
  const raw = camp?.doctor_ids ?? camp?.doctorIds ?? camp?.doctors ?? [];
  const list = Array.isArray(raw) ? raw : [raw];

  return list
    .map((entry) =>
      entry && typeof entry === "object"
        ? (entry.id ?? entry.doctor_id ?? entry.doctorId ?? "")
        : entry,
    )
    .map((id) => String(id ?? "").trim())
    .filter(Boolean);
};

export const getCampPrimaryDoctorId = (camp) => {
  if (!camp) return null;

  const explicit = camp?.primary_doctor_id ?? camp?.primaryDoctorId ?? "";
  if (String(explicit).trim() && String(explicit).trim() !== "0") {
    return String(explicit).trim();
  }

  const inlined = camp?.primary_doctor ?? camp?.primaryDoctor;

  if (inlined && typeof inlined === "object") {
    const id = inlined.id ?? inlined.doctor_id ?? inlined.doctorId ?? "";
    return String(id).trim() || null;
  }

  // A plain positive number is a real id; 0 is the flag, not an id.
  if (typeof inlined === "number" && inlined > 0) {
    return String(inlined);
  }

  return null;
};


export const getScreeningIds = (camp) => {
  const raw = camp?.screening_ids ?? camp?.screeningIds ?? [];
  const list = Array.isArray(raw) ? raw : [raw];

  return list
    .map((id) => String(id ?? "").trim())
    .filter(Boolean);
};

/* -------------------------------------------------------------------------- */
/* Screening id <-> screening key                                             */
/*                                                                            */
/* The camp/event payload only carries numeric screening ids ("1".."5"). The    */
/* UI everywhere else (tabs, domain classes, detail sections) is keyed by slug  */
/* — general | dental | vision | hearing | ent. This is the only place that    */
/* translation is defined.                                                     */
/* -------------------------------------------------------------------------- */

export const SCREENING_ID_TO_KEY = {
  1: "general",
  2: "dental",
  3: "vision",
  4: "hearing",
  5: "ent",
};

export const SCREENING_KEYS = ["general", "dental", "vision", "hearing", "ent"];

// Some endpoints inline the screening as { id, screening_type: "Dental" } —
// so fall back to a name lookup when a raw id is not available.
const SCREENING_NAME_TO_KEY = {
  general: "general",
  "general screening": "general",
  initial: "general",
  dental: "dental",
  "dental screening": "dental",
  oral: "dental",
  vision: "vision",
  "vision screening": "vision",
  eye: "vision",
  hearing: "hearing",
  hear: "hearing",
  "hear screening": "hearing",
  "hearing screening": "hearing",
  ent: "ent",
  "ent screening": "ent",
};

const normalizeScreeningName = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

/**
 * Resolve anything screening-shaped (id, name or object) into one of
 * SCREENING_KEYS. Returns null when nothing matches.
 */
export const getScreeningKey = (screening) => {
  if (screening == null) return null;

  if (typeof screening === "object") {
    const nested = getScreeningKey(
      screening.screening_type ?? screening.screeningType ?? screening.type,
    );
    if (nested) return nested;

    return getScreeningKey(
      screening.screening_id ?? screening.screeningId ?? screening.id,
    );
  }

  const raw = String(screening).trim();
  if (!raw) return null;

  const byId = SCREENING_ID_TO_KEY[raw] ?? SCREENING_ID_TO_KEY[Number(raw)];
  if (byId) return byId;

  return SCREENING_NAME_TO_KEY[normalizeScreeningName(raw)] ?? null;
};

/**
 * Screening keys assigned to a camp. Falls back to every screening when the
 * camp carries no ids, so unfiltered camps keep the full report.
 */
export const getScreeningKeys = (camp) => {
  const keys = getScreeningIds(camp)
    .map((id) => getScreeningKey(id))
    .filter(Boolean);

  if (!keys.length) return [];

  return Array.from(new Set(keys));
};

/** True when the camp has no screening restriction or the key is assigned. */
export const isScreeningKeyAssigned = (assignedKeys, key) => {
  const list = Array.isArray(assignedKeys) ? assignedKeys : [];
  if (!list.length) return true;

  return list.includes(key);
};
export const campMatchesSchool = (camp, schoolName) => {
  const campSchool = getCampSchoolName(camp);
  const filter = String(schoolName ?? "").trim();

  if (!campSchool) {
    return filter === "all";
  }

  return campSchool === filter;
};
