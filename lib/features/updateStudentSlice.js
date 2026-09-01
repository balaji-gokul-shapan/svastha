import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  studentData: null,
  loading: false,
  success: false,
  error: null,
};

export const updateStudent = createAsyncThunk(
  "studentData/updateStudent",
  async ({ studentId, studentData, payload }, { rejectWithValue, dispatch }) => {
    try {
      const normalizedStudentId = String(studentId ?? "").trim();
      if (!normalizedStudentId) {
        throw new Error("Student ID is required for update");
      }

      const bodyData = payload ?? studentData;

      const isFormData = typeof FormData !== "undefined" && bodyData instanceof FormData;
      const endpoint = `/api/students/${encodeURIComponent(normalizedStudentId)}`;

      const fetchOptions = {
        method: "PATCH",
        body: isFormData ? bodyData : JSON.stringify(bodyData ?? {}),
      };
      if (!isFormData) {
        fetchOptions.headers = { "Content-Type": "application/json" };
      }

      const { response } = await fetchWithAuth(endpoint, fetchOptions, dispatch);

      if (!response.ok) {
        throw new Error("Failed to update student data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to update student data");
    }
  },
);

const updateStudentSlice = createSlice({
  name: "studentData",
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
