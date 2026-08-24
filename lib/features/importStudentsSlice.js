import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
  result: null,
};

/**
 * Uploads a CSV/XLS/XLSX file to /api/students/import.
 * The Next.js catch-all route proxies it to {API_URL}/students/import
 * (e.g. https://svastha-api.sms24hrs.org/api/v1/students/import).
 */
export const importStudents = createAsyncThunk(
  "importStudents/upload",
  async ({ file } = {}, { rejectWithValue, getState }) => {
    try {
      if (!file) {
        throw new Error("Please choose a file to upload.");
      }

      const state = typeof getState === "function" ? getState() : null;
      let token = state?.auth?.token;
      let tokenType = state?.auth?.token_type || "Bearer";

      if (!token && typeof window !== "undefined") {
        try {
          const rawSession = window.sessionStorage.getItem("svastha-auth");
          if (rawSession) {
            const parsed = JSON.parse(rawSession);
            token = parsed?.token;
            tokenType = parsed?.token_type || tokenType;
          }
        } catch {}
      }

      const headers = {};
      if (token) {
        headers["Authorization"] = `${tokenType} ${token}`.trim();
      }
      // NOTE: no Content-Type here — the browser sets the multipart
      // boundary automatically when the body is FormData.

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/students/import", {
        method: "POST",
        headers,
        body: formData,
      });

      const responseText = await response.text();
      let payload = null;
      try {
        payload = responseText ? JSON.parse(responseText) : null;
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            payload?.detail ||
            `Import failed (status ${response.status})`,
        );
      }

      return (
        payload ?? { message: "Students imported successfully" }
      );
    } catch (error) {
      return rejectWithValue(error.message || "Unable to import students");
    }
  },
);

const importStudentsSlice = createSlice({
  name: "importStudents",
  initialState,
  reducers: {
    resetImportStudentsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(importStudents.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.result = null;
      })
      .addCase(importStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.result = action.payload;
      })
      .addCase(importStudents.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Unable to import students";
      });
  },
});

export const { resetImportStudentsState } = importStudentsSlice.actions;
export default importStudentsSlice.reducer;