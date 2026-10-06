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
      camp?.branch?.branch_id ??
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

export const isCampActive = (camp) => getCampStatus(camp) !== false;
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
    weekday: "short",
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

/* Resolves the camp's PRIMARY DOCTOR ID.
   NOTE: `primary_doctor` is a FLAG (0/1/true/false) on this payload, NOT an id
   — the id lives in `primary_doctor_id`. The flag is only usable as a source
   when the backend nests the whole doctor object there, so scalar flag values
   are deliberately ignored: treating `primary_doctor: 1` as the id "1" used to
   inject a phantom doctor into the dashboard roster. */
export const getCampPrimaryDoctorId = (camp) => {
  if (!camp) return null;

  const explicit = camp?.primary_doctor_id ?? camp?.primaryDoctorId ?? "";

  if (String(explicit).trim() && String(explicit).trim() !== "0") {
    return String(explicit).trim();
  }

  const inlined = camp?.primary_doctor ?? camp?.primaryDoctor;

  // Only a nested doctor object carries a real id.
  if (inlined && typeof inlined === "object") {
    const id = inlined.id ?? inlined.doctor_id ?? inlined.doctorId ?? "";
    return String(id).trim() || null;
  }

  return null;
};


/* The camp create/assign payload names this field `screening_type_ids`
   (see app/settings/pages/ScreeningPage.jsx). Older/other endpoints have been
   seen using the shorter `screening_ids`, and a few inline the whole screening
   object — so every observed name is accepted instead of guessing one. */
const SCREENING_ID_FIELDS = [
  "screening_type_ids",
  "screeningTypeIds",
  "screening_ids",
  "screeningIds",
  "screening_types",
  "screeningTypes",
];

/** The first screening field that actually carries a value, else []. */
const readScreeningField = (camp) => {
  if (!camp || typeof camp !== "object") return [];

  for (const field of SCREENING_ID_FIELDS) {
    const value = camp[field];

    if (value == null) continue;
    if (Array.isArray(value)) {
      if (value.length) return value;
      continue;
    }
    if (String(value).trim()) return value;
  }

  return [];
};

/** "1,3,4" -> ["1","3","4"]; scalars pass through trimmed. */
const splitScreeningValue = (value) =>
  String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

/**
 * The camp's screening entries, flattened but NOT stringified — inline objects
 * ({ id, screening_type: "Dental" }) are preserved so getScreeningKey can still
 * resolve them by name after the numeric id fails.
 */
export const getScreeningEntries = (camp) => {
  const raw = readScreeningField(camp);

  return (Array.isArray(raw) ? raw : [raw])
    .flatMap((entry) =>
      entry != null && typeof entry === "object"
        ? [entry]
        : splitScreeningValue(entry),
    )
    .filter((entry) => {
      if (entry == null) return false;
      if (typeof entry === "object") return true;

      return String(entry).trim() !== "";
    });
};

export const getScreeningIds = (camp) =>
  getScreeningEntries(camp)
    .map((entry) => {
      if (entry && typeof entry === "object") {
        // Prefer the numeric id, but fall back to the name so a name-only
        // object still contributes something getScreeningKey can resolve.
        return String(
          entry.screening_id ??
            entry.screeningId ??
            entry.id ??
            entry.screening_type ??
            entry.screeningType ??
            entry.type ??
            entry.name ??
            "",
        ).trim();
      }

      return String(entry).trim();
    })
    .filter(Boolean);

/* -------------------------------------------------------------------------- */
/* Screening id <-> screening key                                             */

/* -------------------------------------------------------------------------- */

export const SCREENING_KEYS = ["general", "dental", "vision", "hearing", "ent"];

/**
 * Runtime id -> key map, populated from the master screening-types endpoint
 * (`/api/v1/masters/screening-types/all`) via registerScreeningIdMap().
 *
 * The hardcoded 1..5 table below is only a fallback: the ids the camp payload
 * actually carries are database ids from that master table, and they are NOT
 * guaranteed to be 1..5 (a staging DB commonly starts at 7, 11, 12 …). Without
 * the runtime map every real id resolves to null, the assigned-key list comes
 * back empty, and the UI silently stops filtering.
 */
let runtimeScreeningIdMap = {};

/**
 * Teach the id -> key translation about the backend's real screening ids.
 * Accepts the raw master list (any of the observed envelopes) and is safe to
 * call on every render — it simply rebuilds the lookup table.
 */
export const registerScreeningIdMap = (masterList) => {
  const list = Array.isArray(masterList)
    ? masterList
    : Array.isArray(masterList?.data)
      ? masterList.data
      : Array.isArray(masterList?.screeningTypes)
        ? masterList.screeningTypes
        : [];

  const map = {};

  for (const item of list) {
    if (!item || typeof item !== "object") continue;

    const id = item.id ?? item.screening_type_id ?? item.screeningTypeId;
    const key = getScreeningKey(
      item.screening_type ?? item.screeningType ?? item.type ?? item.name,
    );

    if (id != null && String(id).trim() && key) {
      map[String(id).trim()] = key;
    }
  }

  runtimeScreeningIdMap = map;

  return runtimeScreeningIdMap;
};

/** Drop any registered master ids (used by tests). */
export const resetScreeningIdMap = () => {
  runtimeScreeningIdMap = {};
};

// Fallback only — see registerScreeningIdMap above.
const FALLBACK_SCREENING_ID_TO_KEY = {
  1: "general",
  2: "dental",
  3: "vision",
  4: "hearing",
  5: "ent",
};

export const SCREENING_ID_TO_KEY = FALLBACK_SCREENING_ID_TO_KEY;


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

  // Real (master-table) ids win, so a DB that happens to use 1..5 with a
  // different ordering still maps correctly.
  const runtime = runtimeScreeningIdMap[raw];
  if (runtime) return runtime;

  const byId =
    FALLBACK_SCREENING_ID_TO_KEY[raw] ??
    FALLBACK_SCREENING_ID_TO_KEY[Number(raw)];
  if (byId) return byId;

  return SCREENING_NAME_TO_KEY[normalizeScreeningName(raw)] ?? null;
};

export const getScreeningKeys = (camp) => {

  const keys = getScreeningEntries(camp)
    .map((entry) => getScreeningKey(entry))
    .filter(Boolean);

  if (!keys.length) return [];

  return Array.from(new Set(keys));
};

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

export const campMatchesBranch = (camp, branchId, branchLabel) => {
  const id = String(branchId ?? "").trim();

  if (!id || id === "all") {
    return true;
  }

  const label = String(branchLabel ?? "").trim();

  const campBranchId = getCampBranchId(camp);
  if (campBranchId) {
    return campBranchId === id;
  }

  const campSchoolId = getCampSchoolId(camp);
  if (campSchoolId) {
    return campSchoolId === id;
  }

  const campSchoolName = getCampSchoolName(camp);
  if (!campSchoolName) {
    return false;
  }

  return label ? campSchoolName === label : campSchoolName === id;
};
