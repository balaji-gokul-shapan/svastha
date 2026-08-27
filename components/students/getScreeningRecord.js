"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/lib/hooks";
import { getHearingScreening } from "@/lib/features/getHearingScreening";
import { getInitialScreening } from "@/lib/features/getInitialScreening";
import { getDentalScreening } from "@/lib/features/getDentalScreening";
import { getVisionScreening } from "@/lib/features/getVisionScreening";

/**
 * Custom hook that loads all screening records for one student.
 *
 * Usage (call it like any other hook — NOT as a plain function):
 *   const { generalScreeningRecord, hearingScreeningRecord, ... } =
 *     useScreeningRecord({ getId: studentId });
 */
export function useScreeningRecord({ getId } = {}) {
  const dispatch = useAppDispatch();
  const normalizedId = String(getId ?? "").trim();
  const hasStudent = Boolean(normalizedId);
console.log(getId,"normalizedId");

  // Hearing screening for this student.
  const {
    data: hearingScreeningData = [],
    isLoading: hearingLoading,
    error: hearingError,
  } = useQuery({
    queryKey: ["hearing-screening", normalizedId],
    queryFn: () =>
      dispatch(getHearingScreening({ studentId: normalizedId })).unwrap(),
    enabled: hasStudent,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Initial (general) screenings — fetched once, then matched by student keys.
  const {
    data: generalScreeningPayload,
    isLoading: generalLoading,
    error: generalError,
  } = useQuery({
    queryKey: ["initial-screening", "health-card", normalizedId],
    queryFn: () =>
      dispatch(
        getInitialScreening({
          all: true,
          search: "",
          status: "all",
          sortBy: "name",
          sortOrder: "asc",
        }),
      ).unwrap(),
    enabled: hasStudent,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Dental screening for this student.
  const {
    data: dentalScreeningData = [],
    isLoading: dentalLoading,
    error: dentalError,
  } = useQuery({
    queryKey: ["dental-screening", normalizedId],
    queryFn: () =>
      dispatch(getDentalScreening({ studentId: normalizedId })).unwrap(),
    enabled: hasStudent,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Vision screening for this student.
  const {
    data: visionScreeningData = [],
    isLoading: visionLoading,
    error: visionError,
  } = useQuery({
    queryKey: ["vision-screening", normalizedId],
    queryFn: () =>
      dispatch(getVisionScreening({ studentId: normalizedId })).unwrap(),
    enabled: hasStudent,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  console.log(visionScreeningData,"visionScreeningData");
  

  // getInitialScreening resolves to { items: [...], total, page, limit } —
  // normalize it into a plain array of records.
  const generalScreeningItems = useMemo(() => {
    if (Array.isArray(generalScreeningPayload)) {
      return generalScreeningPayload;
    }
    if (Array.isArray(generalScreeningPayload?.items)) {
      return generalScreeningPayload.items;
    }
    return [];
  }, [generalScreeningPayload]);

  // Case-insensitive keys so a lowercased URL slug still matches
  // identifiers like "STU-2401" in the records.
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
          record?.student?.id,
          record?.student?.cus_id,
          record?.student?.school_registration_number,
          record?.student?.admission_number,
        ]
          .map((value) => String(value ?? "").trim().toLowerCase())
          .filter(Boolean);

        return recordKeys.some((key) => studentKeys.has(key));
      }) ?? null
    );
  };

  // Scoped endpoints (/<test>/student/{id}) normally return this student's
  // records only, so matching by key is a no-op — but it keeps behaviour
  // identical to general screening when the backend returns an unfiltered
  // list or nests the student under a different field name. If nothing
  // matches by key and there is exactly one record, it belongs to this
  // student; otherwise we must not show another student's data.
  const pickScopedRecord = (records) => {
    const list = Array.isArray(records) ? records : [];
    return findRecordByStudentKeys(list) ?? (list.length === 1 ? list[0] : null);
  };

  const generalScreeningRecord = useMemo(
    () => findRecordByStudentKeys(generalScreeningItems),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [generalScreeningItems, studentKeys],
  );

  // These endpoints are already scoped to /<test>/student/{studentId}.
  const hearingScreeningRecord = useMemo(
    () => pickScopedRecord(hearingScreeningData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hearingScreeningData, studentKeys],
  );

  const dentalScreeningRecord = useMemo(
    () => pickScopedRecord(dentalScreeningData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dentalScreeningData, studentKeys],
  );

  const visionScreeningRecord = useMemo(
    () => pickScopedRecord(visionScreeningData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visionScreeningData, studentKeys],
  );

  return {
    generalScreeningRecord,
    hearingScreeningRecord,
    dentalScreeningRecord,
    visionScreeningRecord,
    isLoading:
      hearingLoading || generalLoading || dentalLoading || visionLoading,
    error: hearingError || generalError || dentalError || visionError,
  };
}