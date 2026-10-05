"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/lib/hooks";
import { getHearingScreening } from "@/lib/features/getHearingScreening";
import { getInitialScreening } from "@/lib/features/getInitialScreening";
import { getDentalScreening } from "@/lib/features/getDentalScreening";
import { getVisionScreening } from "@/lib/features/getVisionScreening";
import { getEntScreening } from "@/lib/features/getEntScreening";

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

  // Hearing screening for this student.
  const {
    data: hearingScreeningData = [],
    isLoading: hearingLoading,
    error: hearingError,
  } = useQuery({
    queryKey: ["hearing-screening", normalizedId, selectedCampId],
    queryFn: () =>
      dispatch(
        getHearingScreening({
          studentId: normalizedId,
          campId: selectedCampId,
        }),
      ).unwrap(),
    enabled: hasStudent,
    staleTime: 60_000,
  });

  const {
    data: generalScreeningPayload = [],
    isLoading: generalLoading,
    error: generalError,
  } = useQuery({
    queryKey: [
      "initial-screening",
      "health-card",
      normalizedId,
      selectedCampId,
    ],
    queryFn: () =>
      dispatch(
        getInitialScreening({
          studentId: normalizedId,
          campId: selectedCampId,
          all: true,
        }),
      ).unwrap(),
    enabled: hasStudent,
    staleTime: 60_000,
  });
  console.log(selectedCampId,  "hasStudent");
  console.log(selectedCampId,selectedCampId, generalScreeningPayload, "generalScreeningPayloadwwwww");

  const {
    data: dentalScreeningDataPayload = [],
    isLoading: dentalLoading,
    error: dentalError,
  } = useQuery({
    queryKey: ["dental-screening", normalizedId, selectedCampId],
    queryFn: () =>
      dispatch(
        // Student-scoped: /codings/student/{studentId}[/{campId}]. Replaces the
        // camp-required `filterDentalScreening`, so it works with camp.id null.
        getDentalScreening({
          studentId: normalizedId,
          campId: selectedCampId,
        }),
      ).unwrap(),
    enabled: hasStudent,
    staleTime: 60_000,
  });

  console.log(dentalScreeningDataPayload, "dentalScreeningDataPayload");

  // ENT screening for this student.
  const {
    data: entScreeningDataPayload = [],
    isLoading: entLoading,
    error: entError,
  } = useQuery({
    queryKey: ["ent-screening", normalizedId, selectedCampId],
    queryFn: () =>
      dispatch(
        getEntScreening({ studentId: normalizedId, campId: selectedCampId }),
      ).unwrap(),
    enabled: hasStudent,
    staleTime: 60_000,
  });

  console.log(entScreeningDataPayload, "entScreeningDataPayload");

  // Vision screening for this student.
  const {
    data: visionScreeningData = [],
    isLoading: visionLoading,
    error: visionError,
  } = useQuery({
    queryKey: ["vision-screening", normalizedId, selectedCampId],
    queryFn: () =>
      dispatch(
        getVisionScreening({ studentId: normalizedId, campId: selectedCampId }),
      ).unwrap(),
    enabled: hasStudent,
    staleTime: 60_000,
  });

  const generalScreeningItems = useMemo(() => {
    const unwrap = (source) => {
      if (Array.isArray(source)) {
        return source;
      }

      if (!source || typeof source !== "object") {
        return [];
      }

      for (const key of ["data", "items", "results", "records", "rows"]) {
        const nested = source[key];

        if (Array.isArray(nested)) {
          return nested;
        }

        if (nested && typeof nested === "object") {
          const rows = unwrap(nested);

          if (rows.length) {
            return rows;
          }
        }
      }

      return source.id != null ? [source] : [];
    };

    return unwrap(generalScreeningPayload);
  }, [generalScreeningPayload]);

  console.log(generalScreeningItems, "generalScreeningItems");

  const studentKeys = useMemo(
    () => new Set([normalizedId.toLowerCase()].filter(Boolean)),
    [normalizedId],
  );

  const findRecordByStudentKeys = (records) => {
    if (!studentKeys.size || !Array.isArray(records) || !records.length) {
      return null;
    }

    return (
      records.find((record) => {
        const recordKeys = [
          record?.id,
          record?.cus_id,
          record?.CUS_ID,
          record?.student_cus_id,
          record?.student_id,
          record?.studentId,
          record?.school_registration_number,
          record?.admission_number,
          record?.svastha_id,
          record?.uhid,
          record?.student?.id,
          record?.student?.cus_id,
          record?.student?.CUS_ID,
          record?.student_id_ref,
          record?.student?.student_id,
          record?.student?.svastha_id,
          record?.student?.school_registration_number,
          record?.student?.admission_number,
        ]
          .map((value) =>
            String(value ?? "")
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean);

        return recordKeys.some((key) => studentKeys.has(key));
      }) ?? null
    );
  };

  const pickScopedRecord = (records) => {
    const list = Array.isArray(records) ? records : [];
    return (
      findRecordByStudentKeys(list) ?? (list.length === 1 ? list[0] : null)
    );
  };


  const generalScreeningRecord = useMemo(
    () => pickScopedRecord(generalScreeningItems),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [generalScreeningItems, studentKeys],
  );
  console.log(generalScreeningRecord, "generalScreeningRecord");

  // These endpoints are already scoped to /<test>/student/{studentId}.
  const hearingScreeningRecord = useMemo(
    () => pickScopedRecord(hearingScreeningData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hearingScreeningData, studentKeys],
  );

  const dentalScreeningRecord = useMemo(
    () => pickScopedRecord(dentalScreeningDataPayload),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dentalScreeningDataPayload, studentKeys],
  );

  const visionScreeningRecord = useMemo(
    () => pickScopedRecord(visionScreeningData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visionScreeningData, studentKeys],
  );

  // This endpoint is already scoped to /ent-assessment/student/{studentId}.
  const entScreeningRecord = useMemo(
    () => pickScopedRecord(entScreeningDataPayload),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entScreeningDataPayload, studentKeys],
  );

  return {
    generalScreeningRecord,
    hearingScreeningRecord,
    dentalScreeningRecord,
    visionScreeningRecord,
    entScreeningRecord,
    isLoading:
      hearingLoading ||
      generalLoading ||
      dentalLoading ||
      visionLoading ||
      entLoading,
    error:
      hearingError || generalError || dentalError || visionError || entError,
  };
}
