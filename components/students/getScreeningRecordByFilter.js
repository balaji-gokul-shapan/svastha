"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAppDispatch } from "@/lib/hooks";
import { getHearingScreening } from "@/lib/features/getHearingScreening";
import { getInitialScreening } from "@/lib/features/getInitialScreening";
import { getDentalScreening } from "@/lib/features/getDentalScreening";
import { getVisionScreening } from "@/lib/features/getVisionScreening";
import { getEntScreening } from "@/lib/features/getEntScreening";

/* -------------------------------------------------------------------------- */
/* Config: one entry per screening type. Adding a new screening = one row.     */
/* -------------------------------------------------------------------------- */

const SCREENING_DEFS = [
  {
    key: "general",
    queryKey: ["initial-screening", "health-card"],
    thunk: getInitialScreening,
  },
  { key: "hearing", queryKey: ["hearing-screening"], thunk: getHearingScreening },
  { key: "dental", queryKey: ["dental-screening"], thunk: getDentalScreening },
  { key: "vision", queryKey: ["vision-screening"], thunk: getVisionScreening },
  { key: "ent", queryKey: ["ent-screening"], thunk: getEntScreening },
];

const RECORD_KEYS = [
  "id",
  "cus_id",
  "CUS_ID",
  "student_cus_id",
  "student_id",
  "studentId",
  "school_registration_number",
  "admission_number",
  "svastha_id",
  "uhid",
  "student_id_ref",
  "student.id",
  "student.cus_id",
  "student.CUS_ID",
  "student.student_id",
  "student.svastha_id",
  "student.school_registration_number",
  "student.admission_number",
];

const getPath = (obj, path) =>
  path.split(".").reduce((acc, part) => acc?.[part], obj);

const WRAPPER_KEYS = ["data", "items", "results", "records", "rows"];

/** Flatten any backend envelope into a plain record array. */
function unwrapRows(source) {
  if (Array.isArray(source)) return source;
  if (!source || typeof source !== "object") return [];

  for (const key of WRAPPER_KEYS) {
    const nested = source[key];
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === "object") {
      const rows = unwrapRows(nested);
      if (rows.length) return rows;
    }
  }

  return source.id != null ? [source] : [];
}

/**
 * useScreeningRecordByFilter — ONE hook that fetches every screening type for
 * a student (optionally scoped to a camp) and returns the matched record per
 * type. Use it everywhere instead of per-screening thunks:
 */

export function useScreeningRecordByFilter({
  getId,
  campId,
  class: classFilter,
  section: sectionFilter,
} = {}) {
  const dispatch = useAppDispatch();
  const normalizedId = String(getId ?? "").trim();
  const hasStudent = Boolean(normalizedId);
  const selectedCampId = String(campId ?? "").trim();
  const normalizedClassFilter = String(classFilter ?? "").trim();
  const normalizedSectionFilter = String(sectionFilter ?? "").trim();

  // One query per screening type, driven by SCREENING_DEFS so the five
  // fetches stay identical except for key + thunk. useQueries (plural) is
  // the rules-of-hooks-safe way to run a dynamic list of queries — never
  // call useQuery inside .map().
  const queries = useQueries({
    queries: SCREENING_DEFS.map((def) => ({
      queryKey: [...def.queryKey, normalizedId, selectedCampId],
      queryFn: () =>
        dispatch(
          def.thunk({
            studentId: normalizedId,
            campId: selectedCampId,
            all: true,
            class: normalizedClassFilter,
            section: normalizedSectionFilter,
          }),
        ).unwrap(),
      enabled: hasStudent,
      staleTime: 60_000,
    })),
  });

  const [generalQ, hearingQ, dentalQ, visionQ, entQ] = queries;

  const generalScreeningItems = useMemo(
    () => unwrapRows(generalQ.data ?? []),
    [generalQ.data],
  );

  const studentKeys = useMemo(
    () => new Set([normalizedId.toLowerCase()].filter(Boolean)),
    [normalizedId],
  );

  const pickScopedRecord = (records) => {
    const list = Array.isArray(records) ? records : [];
    if (!studentKeys.size || !list.length) {
      return list.length === 1 ? (list[0] ?? null) : null;
    }

    return (
      list.find((record) => {
        const recordKeys = RECORD_KEYS.map((path) =>
          String(getPath(record, path) ?? "")
            .trim()
            .toLowerCase(),
        ).filter(Boolean);

        return recordKeys.some((key) => studentKeys.has(key));
      }) ?? (list.length === 1 ? list[0] : null)
    );
  };

  const generalScreeningRecord = useMemo(
    () => pickScopedRecord(generalScreeningItems),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [generalScreeningItems, studentKeys],
  );

  // These endpoints are already scoped to /<test>/student/{studentId}.
  const hearingScreeningRecord = useMemo(
    () => pickScopedRecord(hearingQ.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hearingQ.data, studentKeys],
  );

  const dentalScreeningRecord = useMemo(
    () => pickScopedRecord(dentalQ.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dentalQ.data, studentKeys],
  );

  const visionScreeningRecord = useMemo(
    () => pickScopedRecord(visionQ.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visionQ.data, studentKeys],
  );

  // This endpoint is already scoped to /ent-assessment/student/{studentId}.
  const entScreeningRecord = useMemo(
    () => pickScopedRecord(entQ.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entQ.data, studentKeys],
  );

  const records = useMemo(
    () => ({
      general: generalScreeningRecord,
      hearing: hearingScreeningRecord,
      dental: dentalScreeningRecord,
      vision: visionScreeningRecord,
      ent: entScreeningRecord,
    }),
    [
      generalScreeningRecord,
      hearingScreeningRecord,
      dentalScreeningRecord,
      visionScreeningRecord,
      entScreeningRecord,
    ],
  );

  const refetch = () => Promise.all(queries.map((q) => q.refetch()));

  return {
    records,
    generalScreeningRecord,
    hearingScreeningRecord,
    dentalScreeningRecord,
    visionScreeningRecord,
    entScreeningRecord,
    isLoading:
      hearingQ.isLoading ||
      generalQ.isLoading ||
      dentalQ.isLoading ||
      visionQ.isLoading ||
      entQ.isLoading,
    error:
      hearingQ.error ||
      generalQ.error ||
      dentalQ.error ||
      visionQ.error ||
      entQ.error,
    refetch,
  };
}

export default useScreeningRecordByFilter;
