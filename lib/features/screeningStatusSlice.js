import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getInitialScreening } from "./getInitialScreening";
import { getHearingScreening } from "./getHearingScreening";
import { getDentalScreening } from "./getDentalScreening";
import { getVisionScreening } from "./getVisionScreening";
import { getEntScreening } from "./getEntScreening";
import {
  EMPTY_SCREENING_STATUSES,
  getAllScreeningStatuses,
} from "../screening-status-utils";

const textOf = (value) => String(value ?? "").trim();

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

const RECORD_KEY_PATHS = [
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
  "student.student_id",
  "student.school_registration_number",
  "student.admission_number",
];

const getPath = (obj, path) =>
  path.split(".").reduce((acc, part) => acc?.[part], obj);

/** Every id/cus_id variant a student or record can carry. */
export const studentKeyOf = (student) =>
  textOf(
    student?.id ??
      student?.student_id ??
      student?.studentId ??
      student?.cus_id ??
      student?.school_registration_number ??
      student?.admission_number,
  ).toLowerCase();

const pickRecord = (payload, wantedKey) => {
  const list = unwrapRows(
    Array.isArray(payload) ? payload : (payload?.items ?? payload),
  );
  if (!list.length) return null;
  if (!wantedKey) return list.length === 1 ? (list[0] ?? null) : null;
  return (
    list.find((record) =>
      RECORD_KEY_PATHS.map((path) => textOf(getPath(record, path)).toLowerCase())
        .filter(Boolean)
        .includes(wantedKey),
    ) ?? (list.length === 1 ? list[0] : null)
  );
};

/**
 * Fetch all 5 screening records for ONE student and derive the table-ready
 * statuses. Reuses the existing per-screening thunks; results are cached by
 * student key so the table never refetches a row it already resolved.
 */
export const fetchScreeningStatuses = createAsyncThunk(
  "screeningStatuses/fetchOne",
  async (
    { studentId, campId, classFilter, sectionFilter } = {},
    { dispatch, rejectWithValue },
  ) => {
    try {
      const normalizedId = textOf(studentId);
      if (!normalizedId) throw new Error("Student ID is required");
      const args = {
        studentId: normalizedId,
        campId: textOf(campId),
        all: true,
        class: textOf(classFilter),
        section: textOf(sectionFilter),
      };

      // allSettled (not all): one screening type 404-ing (e.g. no ENT record)
      // must not fail the whole row — we derive statuses from whatever
      // succeeded and only bail when EVERY request failed.
      const results = await Promise.allSettled([
        dispatch(getInitialScreening(args)).unwrap(),
        dispatch(getHearingScreening(args)).unwrap(),
        dispatch(getDentalScreening(args)).unwrap(),
        dispatch(getVisionScreening(args)).unwrap(),
        dispatch(getEntScreening(args)).unwrap(),
      ]);

      if (results.every((result) => result.status === "rejected")) {
        const firstError = results.find((r) => r.status === "rejected");
        throw new Error(firstError?.reason?.message || "Screening fetch failed");
      }

      const [generalPayload, hearingPayload, dentalPayload, visionPayload, entPayload] =
        results.map((result) =>
          result.status === "fulfilled" ? result.value : null,
        );

      const wantedKey = normalizedId.toLowerCase();
      const statuses = getAllScreeningStatuses({
        general: pickRecord(generalPayload, wantedKey),
        hearing: pickRecord(hearingPayload, wantedKey),
        dental: pickRecord(dentalPayload, wantedKey),
        vision: pickRecord(visionPayload, wantedKey),
        ent: pickRecord(entPayload, wantedKey),
      });

      return { key: wantedKey, statuses };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch screening statuses",
      );
    }
  },
  {
    condition: ({ studentId } = {}, { getState }) => {
      const key = textOf(studentId).toLowerCase();
      if (!key) return false;
      const entry = getState().screeningStatuses?.byKey?.[key];
      if (entry && (entry.status === "succeeded" || entry.status === "loading")) {
        return false;
      }
      return true;
    },
  },
);

const initialState = { byKey: {} };

const screeningStatusesSlice = createSlice({
  name: "screeningStatuses",
  initialState,
  reducers: {
    clearScreeningStatuses: () => initialState,
    invalidateScreeningStatus: (state, action) => {
      const key = textOf(action.payload).toLowerCase();
      if (key) delete state.byKey[key];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScreeningStatuses.pending, (state, action) => {
        const key = textOf(action.meta.arg?.studentId).toLowerCase();
        if (!key) return;
        state.byKey[key] = {
          statuses: { ...EMPTY_SCREENING_STATUSES },
          status: "loading",
          error: null,
          updatedAt: null,
        };
      })
      .addCase(fetchScreeningStatuses.fulfilled, (state, action) => {
        const { key, statuses } = action.payload ?? {};
        if (!key) return;
        state.byKey[key] = {
          statuses,
          status: "succeeded",
          error: null,
          updatedAt: Date.now(),
        };
      })
      .addCase(fetchScreeningStatuses.rejected, (state, action) => {
        const key = textOf(action.meta.arg?.studentId).toLowerCase();
        if (!key) return;
        state.byKey[key] = {
          statuses: { ...EMPTY_SCREENING_STATUSES },
          status: "failed",
          error: action.payload || "Failed to fetch screening statuses",
          updatedAt: null,
        };
      });
  },
});

export const { clearScreeningStatuses, invalidateScreeningStatus } =
  screeningStatusesSlice.actions;

export const selectScreeningStatusByKey = (state, key) =>
  state.screeningStatuses?.byKey?.[textOf(key).toLowerCase()] ?? null;

export const selectScreeningStatusesMap = (state) =>
  state.screeningStatuses?.byKey ?? {};

export default screeningStatusesSlice.reducer;
