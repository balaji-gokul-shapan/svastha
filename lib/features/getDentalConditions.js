import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  dentalConditionsData: [],
  loading: false,
  success: false,
  error: null,
};

// Goes through the Next.js API proxy (app/api/[...path]/route.js) which maps
// /api/masters/... to the backend /api/v1/masters/... base.
const GET_DENTAL_CONDITIONS_DATA = "/api/masters/dental-conditions/all";

export const getDentalConditionsScreening = createAsyncThunk(
  "dentalScreening/getDentalConditionsScreening",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        GET_DENTAL_CONDITIONS_DATA,
        {},
        dispatch,
      );
      if (!response.ok) {
        const detail = await response.text();
        let detailMessage;
        try {
          detailMessage = detail ? JSON.parse(detail)?.message : null;
        } catch {
          detailMessage = detail;
        }
        throw new Error(detailMessage || "Failed to fetch dental Conditions data");
      }

      const result = await response.json();
      return (
        Array.isArray(result)
          ? result?.data
          : Array.isArray(result?.data)
            ? result.data?.data
            : Array.isArray(result?.data?.items)
              ? result.data.items
              : Array.isArray(result?.items)
                ? result.items
                : Array.isArray(result?.results)
                  ? result.results
                  : Array.isArray(result?.records)
                    ? result.records
                    : result?.data && typeof result.data === "object"
                      ? [result.data]
                      : result && typeof data === "object"
                        ? [result]
                        : []
      );
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch dental Conditions data",
      );
    }
  },
);

const getDentalConditionsSlice = createSlice({
  name: "getDentalConditions",
  initialState,
  reducers: {
    resetDentalConditionsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDentalConditionsScreening.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getDentalConditionsScreening.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.dentalConditionsData = action.payload;
      })
      .addCase(getDentalConditionsScreening.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch dental Conditions data";
      });
  },
});

export const { resetDentalConditionsState } = getDentalConditionsSlice.actions;
export default getDentalConditionsSlice.reducer;
