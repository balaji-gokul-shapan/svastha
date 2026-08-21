import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  visionScreeningData: [],
  loading: false,
  success: false,
  error: null,
};

export const getVisionScreening = createAsyncThunk(
  "visionScreening/getVisionScreening",
  async ({ studentId } = {}, { rejectWithValue, getState }) => {
    try {
      const normalizedStudentId = String(studentId ?? "").trim();
      if (!normalizedStudentId) {
        throw new Error("Student ID is required to fetch vision screening data");
      }

      const state = typeof getState === "function" ? getState() : null;
      let token = state?.auth?.token;
      let tokenType = state?.auth?.token_type || "Bearer";

      if (!token && typeof window !== "undefined") {
        try {
          const session = JSON.parse(window.sessionStorage.getItem("svastha-auth"));
          token = session?.token;
          tokenType = session?.token_type || tokenType;
        } catch {}
      }

      const headers = token
        ? { Authorization: `${tokenType} ${token}`.trim() }
        : {};
      const response = await fetch(
        `/api/vision-test/student/${encodeURIComponent(normalizedStudentId)}`,
        { headers },
      );

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to fetch vision screening data");
      }

      const data = await response.json();
      return Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : data?.data && typeof data.data === "object"
            ? [data.data]
            : data && typeof data === "object"
              ? [data]
              : [];
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
