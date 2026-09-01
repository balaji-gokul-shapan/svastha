import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  camp: [],
  loading: false,
  success: false,
  error: null,
};

export const getCamp = createAsyncThunk(
  "camp/getCamp",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        searchParams.set(key, String(value));
      });

      const query = searchParams.toString();
      const { response } = await fetchWithAuth(`/api/doctor-camps${query ? `?${query}` : ""}`, {}, dispatch);

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to fetch camp data");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch camp data");
    }
  },
);

const getCampSlice = createSlice({
  name: "camp",
  initialState,
  reducers: {
    resetCampState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCamp.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getCamp.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.camp = action.payload;
      })
      .addCase(getCamp.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch camp data";
      });
  },
});

export const { resetCampState } = getCampSlice.actions;
export default getCampSlice.reducer;
