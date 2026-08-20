import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  visionScreeningData: [],
  loading: false,
  success: false,
  error: null,
};

export const getVisionScreening = createAsyncThunk(
  "visionScreening/getVisionScreening",
  async (params = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        searchParams.set(key, String(value));
      });

      const query = searchParams.toString();
      const response = await fetch(`/api/vision-screening${query ? `?${query}` : ""}`);

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to fetch vision screening data");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
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