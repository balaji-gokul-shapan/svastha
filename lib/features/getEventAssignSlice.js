import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const GET_ALL_EVENT_ASSIGN_USER = "/api/v1/medical-event/assigned";
const CREATE_EVENT_ENDPOINT = "/api/v1/medical-event";

const initialState = {
  getLoading: false,
  createLoading: false,
  success: false,
  error: null,
  createdRecord: null,
  updatedRecord: null,
  fetchedRecord: null,
  allEvents: [],
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
  async ({ eventId } = {}, { rejectWithValue, dispatch }) => {
    try {
      const normalizedId = String(eventId ?? "").trim();
      const endpoint = normalizedId
        ? `${CREATE_EVENT_ENDPOINT}/${encodeURIComponent(normalizedId)}/students`
        : CREATE_EVENT_ENDPOINT;
      console.log("getStudentByEvent endpoint:", endpoint);
      const { response } = await fetchWithAuth(endpoint, { method: "GET", headers: { Accept: "application/json" } }, dispatch);
      console.log("getStudentByEvent response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load students for this event");
      }
      const data = await response.json();
      console.log("getStudentByEvent API response:", data);
      console.log("getStudentByEvent data type:", typeof data);
      console.log("getStudentByEvent data keys:", Object.keys(data || {}));
      console.log("getStudentByEvent data.students:", data?.students);
      console.log("getStudentByEvent data.students?.data:", data?.students?.data);
      // API returns { event: {...}, students: { data: [...], current_page: ... } }
      const studentsData = data?.students?.data ?? data?.data?.data ?? data?.data ?? data;
      console.log("getStudentByEvent extracted studentsData:", studentsData);
      console.log("getStudentByEvent studentsData isArray:", Array.isArray(studentsData));
      console.log("getStudentByEvent studentsData length:", studentsData?.length);
      return studentsData;
    } catch (error) {
      console.error("getStudentByEvent error:", error);
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
        state.fetchedRecord = action.payload;
        state.allEvents = Array.isArray(action.payload) ? action.payload : action.payload != null ? [action.payload] : [];
      })
      .addCase(getAssignEvent.rejected, (state, action) => {
        state.getLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to load the assigned events";
      })
      .addCase(getStudentByEvent.pending, (state) => {
        state.getLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getStudentByEvent.fulfilled, (state, action) => {
        state.getLoading = false;
        state.success = true;
        state.fetchedRecord = action.payload;
      })
      .addCase(getStudentByEvent.rejected, (state, action) => {
        state.getLoading = false;
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