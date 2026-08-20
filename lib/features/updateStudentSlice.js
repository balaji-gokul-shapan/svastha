import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  studentData: null,
  loading: false,
  success: false,
  error: null,
};

export const updateStudent = createAsyncThunk(
  "studentData/updateStudent",
  async ({ studentId, studentData, payload }, { rejectWithValue }) => {
    try {
      const normalizedStudentId = String(studentId ?? "").trim();
      if (!normalizedStudentId) {
        throw new Error("Student ID is required for update");
      }

      const bodyData = payload ?? studentData;

      const isFormData = typeof FormData !== "undefined" && bodyData instanceof FormData;
      const endpoint = `/api/students/${encodeURIComponent(normalizedStudentId)}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: isFormData ? undefined : { "Content-Type": "application/json" },
        body: isFormData ? bodyData : JSON.stringify(bodyData ?? {}),
      });

      if (!response.ok) {
        throw new Error("Failed to update student data");
      }
      
      
      const data = await response.json();
      console.log(data,"response");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to update student data");
    }
  },
);

const updateStudentSlice = createSlice({
  name: "updateStudent",
  initialState,
  reducers: {
    resetUpdateStudentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.studentData = action.payload;
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Unable to update student data";
      });
  },
});

export const { resetUpdateStudentState } = updateStudentSlice.actions;
export default updateStudentSlice.reducer;
