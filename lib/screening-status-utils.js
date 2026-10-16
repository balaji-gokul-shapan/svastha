// Shared screening-status derivation.
// Mirrors the logic in HealthCheckContent.getAllScreeningStatuses so the
// table columns and the detailed report can never drift apart.

const textOf = (value) => String(value ?? "").trim();

/** Records can hold either a scalar or a nested {name}/{label} object. */
export function getRecordName(record, ...keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (value === null || value === undefined) continue;
    if (typeof value === "object") {
      const nested = textOf(value?.name ?? value?.label ?? value?.value);
      if (nested) return nested;
      continue;
    }
    const text = textOf(value);
    if (text) return text;
  }
  return "";
}

export const getGeneralStatus = (generalRecord) =>
  getRecordName(
    generalRecord,
    "consolidate_report_result",
    "result",
    "status",
  ) || "--";

export const getVisionStatus = (visionRecord) =>
  getRecordName(
    visionRecord,
    "consolidate_report_result",
    "result",
    "status",
  ) || "--";

export const getDentalStatus = (dentalRecord) =>
  getRecordName(
    dentalRecord,
    "consolidate_report_result",
    "result",
    "status",
  ) ||
  getRecordName(
    dentalRecord?.report,
    "consolidate_report_result",
    "result",
    "status",
  ) ||
  "--";

export const getHearingStatus = (hearingRecord) =>
  getRecordName(
    hearingRecord,
    "consolidate_report_result",
    "result",
    "status",
  ) ||
  textOf(hearingRecord?.overall_status) ||
  "--";

const getEntFlag = (entRecord, ...keys) => {
  for (const key of keys) {
    const value = entRecord?.[key];
    if (value === true) return "Yes";
    if (value === false) return "No";
    const text = textOf(value);
    if (text && text !== "false") return text;
  }
  return "";
};

export const getEntStatus = (entRecord) =>
  getRecordName(
    entRecord,
    "consolidate_report_result",
    "summary_remarks",
    "result",
    "status",
  ) || "--";

export { getEntFlag };

/** Same shape as HealthCheckContent.getAllScreeningStatuses(). */
export function getAllScreeningStatuses({
  general,
  vision,
  dental,
  hearing,
  ent,
} = {}) {
  return {
    general: getGeneralStatus(general),
    vision: getVisionStatus(vision),
    dental: getDentalStatus(dental),
    hearing: getHearingStatus(hearing),
    ent: getEntStatus(ent),
  };
}

export const SCREENING_STATUS_KEYS = [
  "general",
  "vision",
  "dental",
  "hearing",
  "ent",
];

export const EMPTY_SCREENING_STATUSES = Object.freeze({
  general: "--",
  vision: "--",
  dental: "--",
  hearing: "--",
  ent: "--",
});
