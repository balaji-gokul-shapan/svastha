import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  studentData: null,
  loading: false,
  success: false,
  error: null,
};

export const getStudent = createAsyncThunk(
  "studentData/getStudent",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch student data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to fetch student data");
    }
  }
);

const getStudentSlice = createSlice({
  name: "getStudent",
  initialState,
  reducers: {
    resetGetStudentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStudent.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.studentData = action.payload;
        state.success = true;
      })
      .addCase(getStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to fetch student data";
        state.success = false;
      });
  },
});

export const { resetGetStudentState } = getStudentSlice.actions;
export default getStudentSlice.reducer;