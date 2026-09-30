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

const GET_DASHBOARD_URL = "/api/v1/dashboard";
const GET_DASHBOARD_SUMMARY = "/api/v1/dashboard/summary";


function buildFiltersQuery(args = {}) {
  const {
    branch_id = "",
    camp_id = "",
    doctor_id = "",
    from = "",
    to = "",
    ...rest
  } = args ?? {};

  const params = new URLSearchParams();

  const setIfPresent = (key, value) => {
    const normalized = String(value ?? "").trim();

    if (normalized) params.set(key, normalized);
  };

  setIfPresent("branch_id", branch_id);
  setIfPresent("camp_id", camp_id);
  setIfPresent("doctor_id", doctor_id);
  setIfPresent("from", from);
  setIfPresent("to", to);

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

