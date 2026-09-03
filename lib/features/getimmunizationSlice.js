import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  vaccinationData: [],
  loading: false,
  error: null,
  success: false,
};

const GET_IMMUNIZATION_DATA = "/api/immunizations/vaccination-report";

export const getVaccinationData = createAsyncThunk(
  "vaccinationData/getVaccinationScreening",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        GET_IMMUNIZATION_DATA,
        {},
        dispatch,
      );

      if (!response.ok) {
        const detail = await response.text();

        throw new Error(detail || "Failed to fetch vaccination report");
      }

      const data = await response.json();

      // Normalize every backend envelope shape into a flat array, mirroring
      // getVisionScreening.js so consumers can always map over the result.
      return (
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.items)
              ? data.data.items
              : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data?.results)
                  ? data.results
                  : Array.isArray(data?.records)
                    ? data.records
                    : data?.data && typeof data.data === "object"
                      ? [data.data]
                      : data && typeof data === "object"
                        ? [data]
                        : []
      );
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch vaccination data",
      );
    }
  },
);

const getImmunizationSlice = createSlice({
  name: "getImmunization",
  initialState,
  reducers: {
    resetImmunizationState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVaccinationData.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getVaccinationData.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.vaccinationData = action.payload;
      })
      .addCase(getVaccinationData.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch vaccination data";
      });
  },
});

export const { resetImmunizationState } = getImmunizationSlice.actions;
export default getImmunizationSlice.reducer;
