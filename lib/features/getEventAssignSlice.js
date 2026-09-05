import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const GET_ALL_EVENT_ASSIGN_USER = "/api/medical-event/assigned";
const CREATE_EVENT_ENDPOINT = "/api/medical-event";

const initialState = {
  getLoading: false,
  createLoading: false,
  success: false,
  error: null,
  createdRecord: null,
  updatedRecord: null,
  fetchedRecord: null,
  allEvents: [],
  // Dedicated store for the per-event student roster (page-1 + appended pages).
  // Kept separate from fetchedRecord so the camps list can never clobber it.
  students: [],
  // Pagination metadata for getStudentByEvent
  studentTotal: 0,
  studentPage: 1,
  studentPerPage: 50,
  studentHasMore: false,
  loadingMore: false,
};

function unwrapListPayload(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.data)) return json.data;
  return json;
}

export const getAssignEvent = createAsyncThunk(
  "event/getAllEventAssignUser",
  async ({ id } = {}, { rejectWithValue, dispatch }) => {
    try {
      const normalizedId = String(id ?? "").trim();
      const endpoint = normalizedId
        ? `${GET_ALL_EVENT_ASSIGN_USER}/${encodeURIComponent(normalizedId)}`
        : GET_ALL_EVENT_ASSIGN_USER;
      const { response } = await fetchWithAuth(endpoint, { method: "GET", headers: { Accept: "application/json" } }, dispatch);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load the assigned events");
      }
      const data = await response.json();
      return unwrapListPayload(data);
    } catch (error) {
      return rejectWithValue(error.message || "Unable to load the assigned events");
    }
  },
);

export const getStudentByEvent = createAsyncThunk(
  "event/getStudentByEvent",
  async ({ eventId, page = 1, perPage = 50 } = {}, { rejectWithValue, dispatch }) => {
    try {
      const normalizedId = String(eventId ?? "").trim();
      const endpoint = normalizedId
        ? `${CREATE_EVENT_ENDPOINT}/${encodeURIComponent(normalizedId)}/students?page=${page}&per_page=${perPage}`
        : CREATE_EVENT_ENDPOINT;
      const { response } = await fetchWithAuth(endpoint, { method: "GET", headers: { Accept: "application/json" } }, dispatch);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load students for this event");
      }
      const data = await response.json();
      // TEMP DEBUG: remove once the roster shows — reveals the exact response
      // shape if items come back empty.
      console.log("[getStudentByEvent] raw payload:", data);
      // Locate the students array robustly. Known backend shapes:
      //   1. { event: {...}, students: { data: [...], total } }  paginated under students
      //   2. { event: {...}, students: [...] }                   flat array under students
      //   3. { data: [...], total }                              paginator at top level
      //   4. { data: { data: [...] } }                           envelope + paginator
      //   5. [...]                                               bare array
      const findItems = (value, depth = 0) => {
        if (depth > 4 || value == null) return null;
        if (Array.isArray(value)) {
          return value.length === 0 || typeof value[0] === "object"
            ? value
            : null;
        }
        if (typeof value !== "object") return null;
        for (const key of ["students", "data", "items", "results", "records"]) {
          const found = findItems(value[key], depth + 1);
          if (found) return found;
        }
        return null;
      };
      const items = findItems(data) ?? [];
      // Prefer the backend's total when the paginator provides one; otherwise
      // fall back to "a full page means probably more" logic in the reducer.
      const explicitTotal =
        Number(data?.students?.total) ||
        Number(data?.data?.total) ||
        Number(data?.total) ||
        0;
      return {
        items,
        total: explicitTotal || items.length,
        totalKnown: Boolean(explicitTotal),
        page,
        perPage,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Unable to load students for this event");
    }
  },
);

export const createEvent = createAsyncThunk(
  "event/createEvent",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
      // Never set Content-Type manually for FormData - the browser must generate the multipart boundary itself.
      const fetchOptions = {
        method: "POST",
        body: isFormData ? payload : JSON.stringify(payload ?? {}),
      };
      if (!isFormData) {
        fetchOptions.headers = { "Content-Type": "application/json" };
      }
      const { response } = await fetchWithAuth(CREATE_EVENT_ENDPOINT, fetchOptions, dispatch);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create the event");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "Unable to create the event");
    }
  },
);

const getEventAssignSlice = createSlice({
  name: "eventAssign",
  initialState,
  reducers: {
    resetEventAssignState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAssignEvent.pending, (state) => {
        state.getLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getAssignEvent.fulfilled, (state, action) => {
        state.getLoading = false;
        state.success = true;
        // NOTE: do NOT write fetchedRecord here — it belongs to the student
        // roster now; the camps list lives in allEvents only.
        state.allEvents = Array.isArray(action.payload) ? action.payload : action.payload != null ? [action.payload] : [];
      })
      .addCase(getAssignEvent.rejected, (state, action) => {
        state.getLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to load the assigned events";
      })
      .addCase(getStudentByEvent.pending, (state, action) => {
        const isFirstPage = (action.meta.arg?.page ?? 1) === 1;
        if (isFirstPage) {
          state.getLoading = true;
          // New camp selected — clear the previous camp's roster so the
          // dropdown doesn't briefly show stale students.
          state.students = [];
          state.fetchedRecord = [];
          state.studentTotal = 0;
          state.studentTotalKnown = false;
          state.studentPage = 1;
          state.studentHasMore = false;
        } else {
          state.loadingMore = true;
        }
        state.success = false;
        state.error = null;
      })
      .addCase(getStudentByEvent.fulfilled, (state, action) => {
        const { items, total, totalKnown, page, perPage } = action.payload;
        const isFirstPage = page === 1;
        // Page 1 replaces data; page 2+ appends (infinite scroll).
        const prevItems = isFirstPage ? [] : state.students;
        // Dedupe appends so a backend that ignores ?page can't stack
        // duplicate rows into the dropdown.
        const keyOf = (s) => String(s?.id ?? s?.student_id ?? s?.student_name ?? "");
        const existingIds = new Set(prevItems.map(keyOf));
        const fresh = items.filter((s) => !existingIds.has(keyOf(s)));
        state.students = isFirstPage ? items : [...prevItems, ...fresh];
        // fetchedRecord kept in sync for any legacy readers.
        state.fetchedRecord = state.students;
        state.studentTotal = total;
        // Whether `total` came from the backend paginator (trustworthy) or was
        // faked from items.length (NOT trustworthy — never use it to stop
        // fetching; a full first page would read as "no more data").
        state.studentTotalKnown = totalKnown;
        state.studentPage = page;
        state.studentPerPage = perPage;
        // Stop conditions: trust the backend total when given; otherwise keep
        // going while pages come back full — but bail out if an append added
        // nothing new (backend ignoring the page parameter).
        state.studentHasMore = totalKnown
          ? state.students.length < total
          : isFirstPage
            ? items.length >= perPage
            : fresh.length > 0 && items.length >= perPage;
        if (isFirstPage) {
          state.getLoading = false;
        } else {
          state.loadingMore = false;
        }
        state.success = true;
      })
      .addCase(getStudentByEvent.rejected, (state, action) => {
        state.getLoading = false;
        state.loadingMore = false;
        state.success = false;
        state.error = action.payload || "Unable to load students for this event";
      })
      .addCase(createEvent.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
        if (action.payload != null) {
          state.allEvents = [action.payload, ...(state.allEvents ?? [])];
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create the event";
      });
  },
});

export const { resetEventAssignState } = getEventAssignSlice.actions;
export default getEventAssignSlice.reducer;