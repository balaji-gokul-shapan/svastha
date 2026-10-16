"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchScreeningStatuses,
  selectScreeningStatusesMap,
  studentKeyOf,
} from "@/lib/features/screeningStatusSlice";
import { EMPTY_SCREENING_STATUSES } from "@/lib/screening-status-utils";


const STUDENT_CONCURRENCY = 3;

/**
 * useScreeningStatuses — Redux-backed per-student screening statuses for
 * tables. Optimised so requests run ONCE per student:
 * Pass only the VISIBLE page rows — statuses resolve per row as you page.
 */
export function useScreeningStatuses(students = [], { campId } = {}) {
  const dispatch = useAppDispatch();
  const statusesByKey = useAppSelector(selectScreeningStatusesMap);
  const attemptedRef = useRef(new Set());

  const rows = useMemo(
    () => (Array.isArray(students) ? students : []),
    [students],
  );

  const normalizedCampId = String(campId ?? "").trim();

  // Primitive signature: changes only when the row set or cache keys change,
  // not when a cache entry's contents update.
  const rowsSignature = useMemo(
    () => rows.map((row) => studentKeyOf(row)).join(","),
    [rows],
  );
  const cacheSignature = useMemo(
    () => Object.keys(statusesByKey).sort().join(","),
    [statusesByKey],
  );

  useEffect(() => {

    const pending = [];
    const seen = new Set();
    for (const row of rows) {
      const key = studentKeyOf(row);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      if (statusesByKey[key]) continue; // already cached / loading / failed
      if (attemptedRef.current.has(key)) continue; // already dispatched once
      attemptedRef.current.add(key);
      pending.push(key);
    }
    if (!pending.length) return;

  
    let cursor = 0;
    void Promise.all(
      Array.from({ length: Math.min(STUDENT_CONCURRENCY, pending.length) }, async () => {
        while (cursor < pending.length) {
          const key = pending[cursor++];
          try {
            await dispatch(
              fetchScreeningStatuses({ studentId: key, campId: normalizedCampId }),
            ).unwrap();
          } catch {
         
            attemptedRef.current.delete(key);
          }
        }
      }),
    );
  }, [dispatch, rowsSignature, cacheSignature, normalizedCampId, rows, statusesByKey]);

  const isLoading = useMemo(
    () => Object.values(statusesByKey).some((entry) => entry?.status === "loading"),
    [statusesByKey],
  );

  return { statusesByKey, isLoading };
}

export { EMPTY_SCREENING_STATUSES, studentKeyOf };
export default useScreeningStatuses;
