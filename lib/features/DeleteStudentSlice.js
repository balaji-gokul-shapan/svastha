import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  studentData: null,
  loading: false,
  success: false,
  error: null,
};

export const deleteStudent = createAsyncThunk(
  "studentData/deleteStudent",
  async ({ studentData, studentId, payload }, { rejectWithValue }) => {
    try {
      const normalizedStudentId = String(studentId ?? "").trim();
      if (!normalizedStudentId) {
        throw new Error("Student ID is required for delete");
      }
      const bodyData = payload ?? studentData;

      const isFormData =
        typeof FormData !== "undefined" && bodyData instanceof FormData;
      const endpoint = `/api/students/delete/${encodeURIComponent(normalizedStudentId)}`;

      // Build valid fetch options (the previous ternary put the request
      // BODY into HEADERS, which broke every delete call).
      const fetchOptions = isFormData
        ? { method: "DELETE", body: bodyData }
        : {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(bodyData ?? {}),
          };

      const response = await fetch(endpoint, fetchOptions);
      if (!response.ok) {
        throw new Error("Failed to Delete student data");
      }

      const data = await response.json();
      console.log(data, "response");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to Delete student data");
    }
  },
);

const deleteStudentSlice = createSlice({
  name: "deleteStudent",
  initialState,
  reducers: {
    resetDeleteStudentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.studentData = action.payload;
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Unable to update delete data";
      });
  },
});


export const { resetDeleteStudentState } = deleteStudentSlice.actions;
export default deleteStudentSlice.reducer;
