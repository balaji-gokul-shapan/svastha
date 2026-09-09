import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  screeningTypes: [],
  loading: false,
  success: false,
  error: null,
};
const GET_SCREENING_TYPES_DATA = "/api/v1/masters/screening-types/all";

export const getAllScreeningTypes = createAsyncThunk(
  "screeningTypes/getAllScreeningTypes",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        searchParams.set(key, String(value));
      });

      const queryString = searchParams.toString();
      const url = queryString
        ? `${GET_SCREENING_TYPES_DATA}?${queryString}`
        : GET_SCREENING_TYPES_DATA;

      const { response } = await fetchWithAuth(url, {}, dispatch);

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to fetch screening types data");
      }

      const data = await response.json();

      // The backend may return the list directly or wrap it — normalise every
      // observed envelope shape to a flat array (same idea as the unwrap in
      // getDentalCodingsSlice).
      const candidates = [
        data,
        data?.data,
        data?.data?.data,
        data?.data?.items,
        data?.data?.results,
        data?.data?.records,
        data?.data?.screening_types,
        data?.data?.types,
        data?.items,
        data?.results,
        data?.records,
        data?.screening_types,
        data?.types,
      ];

      const list = candidates.find((value) => Array.isArray(value)) ?? [];

      if (!list.length && data && typeof data === "object") {
        // Unrecognised envelope — surface it so the unwrap can be corrected
        // instead of failing silently with an empty array.
        console.warn(
          "[getAllScreeningTypes] Unrecognised response shape:",
          data,
        );
      }

      return list;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch screening types data",
      );
    }
  },
);

const screeningTypesSlice = createSlice({
  name: "screeningTypes",
  initialState,
  reducers: {
    resetScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllScreeningTypes.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getAllScreeningTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.screeningTypes = action.payload;
      })
      .addCase(getAllScreeningTypes.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to fetch screening types data";
      });
  },
});

export const { resetScreeningState } = screeningTypesSlice.actions;
export default screeningTypesSlice.reducer;
