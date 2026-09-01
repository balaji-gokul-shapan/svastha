import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  visionScreeningData: [],
  loading: false,
  success: false,
  error: null,
};

export const getVisionScreening = createAsyncThunk(
  "visionScreening/getVisionScreening",
  async ({ studentId } = {}, { rejectWithValue, dispatch }) => {
    try {
      const normalizedStudentId = String(studentId ?? "").trim();
      if (!normalizedStudentId) {
        throw new Error("Student ID is required to fetch vision screening data");
      }

      const { response } = await fetchWithAuth(
        `/api/v1/vision-test/student/${encodeURIComponent(normalizedStudentId)}`,
        {},
        dispatch,
      );

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to fetch vision screening data");
      }

      const data = await response.json();
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
      return rejectWithValue(error?.message || "Failed to fetch vision screening data");
    }
  },
);

const getVisionScreeningSlice = createSlice({
  name: "getVisionScreening",
  initialState,
  reducers: {
    resetVisionScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVisionScreening.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getVisionScreening.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.visionScreeningData = action.payload;
      })
      .addCase(getVisionScreening.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch vision screening data";
      });
  },
});

export const { resetVisionScreeningState } = getVisionScreeningSlice.actions;
export default getVisionScreeningSlice.reducer;
