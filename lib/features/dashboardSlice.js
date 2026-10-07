import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  isLoading: false,
  data: null,
  error: null,

  summaryLoading: false,
  summaryData: null,
  summaryError: null,
};
// const GET_DASHBOARD_URL = "/api/v1/dashboard";
// const GET_DASHBOARD_SUMMARY = "/api/v1/dashboard/summary";
const GET_SCHOOL_DASHBOARD_URL = "/api/v1/school-dashboard";
const GET_DOCTOR_DASHBOARD_EVENTS_URL = "/api/v1/doctor-dashboard/events";
const GET_DOCTOR_DASHBOARD_SCHEDULE_URL = "/api/v1/doctor-dashboard/schedule";
const GET_DOCTOR_DASHBOARD_SELECTED_EVENT_URL = "/api/v1/doctor-dashboard/event";

function buildFiltersQuery(args = {}) {
  const {
    branch_id = "",
    camp_id = "",
    doctor_id = "",
    // API expects `from_date` / `to_date` (date-time or null). Accept the
    // older `from` / `to` aliases too so existing callers keep working.
    from_date = "",
    to_date = "",
    from = "",
    to = "",
    ...rest
  } = args ?? {};

  const params = new URLSearchParams();

  const setIfPresent = (key, value) => {
    // Dates may arrive as Date objects (date pickers) — serialise them as
    // ISO date-time so the API's `string<date-time>` contract is satisfied.
    const normalized =
      value instanceof Date
        ? Number.isNaN(value.getTime())
          ? ""
          : value.toISOString()
        : String(value ?? "").trim();

    if (normalized) params.set(key, normalized);
  };

  setIfPresent("branch_id", branch_id);
  setIfPresent("camp_id", camp_id);
  setIfPresent("doctor_id", doctor_id);
  setIfPresent("from_date", from_date || from);
  setIfPresent("to_date", to_date || to);

  Object.entries(rest).forEach(([key, value]) => setIfPresent(key, value));

  const query = params.toString();

  return query ? `?${query}` : "";
}
async function readError(response, fallback) {
  const errorText = await response.text().catch(() => "");
  let message = errorText || fallback;

  if (errorText) {
    try {
      const parsed = JSON.parse(errorText);

      message = parsed?.detail || parsed?.message || message;
    } catch {
      // Not JSON - keep the raw text.
    }
  }

  return typeof message === "string" ? message : JSON.stringify(message);
}

export const getSchoolDashboard = createAsyncThunk(
  "dashboard/getSchoolDashboard",
  async (args = {}, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        `${GET_SCHOOL_DASHBOARD_URL}${buildFiltersQuery(args)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
        dispatch,
      );

      if (!response.ok) {
        throw new Error(
          await readError(response, "Failed to fetch school dashboard data"),
        );
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to fetch school dashboard data",
      );
    }
  },
);

export const getDashboardEventsAssignedToDoctor = createAsyncThunk(
  "dashboard/getDashboardEventsAssignedToDoctor",
  async (args = {}, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        `${GET_DOCTOR_DASHBOARD_EVENTS_URL}${buildFiltersQuery(args)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
        dispatch,
      );

      if (!response.ok) {
        throw new Error(
          await readError(response, "Failed to fetch events assigned to doctor"),
        );
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to fetch events assigned to doctor",
      );
    }
  },
);

export const getDashboard = createAsyncThunk(
  "dashboard/getDashboard",
  async (args = {}, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        `${GET_DASHBOARD_URL}${buildFiltersQuery(args)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
        dispatch,
      );

      if (!response.ok) {
        throw new Error(
          await readError(response, "Failed to fetch dashboard data"),
        );
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to fetch dashboard data",
      );
    }
  },
);

export const getDashboardSummary = createAsyncThunk(
  "dashboard/getDashboardSummary",
  async (args = {}, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        `${GET_DASHBOARD_SUMMARY}${buildFiltersQuery(args)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
        dispatch,
      );

      if (!response.ok) {
        throw new Error(
          await readError(response, "Failed to fetch dashboard summary"),
        );
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to fetch dashboard summary",
      );
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboardState: () => initialState,
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Unable to fetch dashboard data";
      })

      .addCase(getDashboardSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(getDashboardSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summaryData = action.payload;
        state.summaryError = null;
      })
      .addCase(getDashboardSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError =
          action.payload || "Unable to fetch dashboard summary";
      });
  },
});

export const { resetDashboardState, clearDashboardError } =
  dashboardSlice.actions;

/* -------------------------------------------------------------------------- */
/* Selectors                                                                   */
/* -------------------------------------------------------------------------- */

export const selectDashboardData = (state) => state.dashboard?.data ?? null;
export const selectDashboardLoading = (state) =>
  Boolean(state.dashboard?.isLoading);
export const selectDashboardError = (state) => state.dashboard?.error ?? null;

export const selectDashboardSummaryData = (state) =>
  state.dashboard?.summaryData ?? null;
export const selectDashboardSummaryLoading = (state) =>
  Boolean(state.dashboard?.summaryLoading);
export const selectDashboardSummaryError = (state) =>
  state.dashboard?.summaryError ?? null;

export default dashboardSlice.reducer;

