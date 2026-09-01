import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  studentData: [],
  loading: false,
  success: false,
  error: null,
};

export const getStudentByCamp = createAsyncThunk(
  "studentHealthCamp/getStudentByCamp",
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
      const { response } = await fetchWithAuth(`/api/student-healthcamp${query ? `?${query}` : ""}`, {}, dispatch);

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to fetch health camp student data");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch health camp student data");
    }
  },
);

const getStudentbyCampSlice = createSlice({
  name: "getStudentbyCamp",
  initialState,
  reducers: {
    resetStudentByCampState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStudentByCamp.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getStudentByCamp.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.studentData = action.payload;
      })
      .addCase(getStudentByCamp.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch health camp student data";
      });
  },
});

export const { resetStudentByCampState } = getStudentbyCampSlice.actions;
export default getStudentbyCampSlice.reducer;
