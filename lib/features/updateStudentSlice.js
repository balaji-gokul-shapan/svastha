import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";
import {
  STUDENT_IMAGE_FIELD,
  UPLOAD_STUDENT_PROFILE_ENDPOINT,
} from "./registerStudentSlice";

const initialState = {
  studentData: null,
  loading: false,
  success: false,
  error: null,
  uploadingPhoto: false,
  photoUploaded: false,
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
      const endpoint = `/api/v1/students/${encodeURIComponent(normalizedStudentId)}`;

      const fetchOptions = {
        method: "PUT",
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

// Photo-only upload against the same endpoint register uses, so editing a
// student's details can replace the picture without folding it into the PATCH
// body. Returns the parsed response for the caller to surface.
export const uploadStudentPhoto = createAsyncThunk(
  "studentData/uploadStudentPhoto",
  async ({ studentId, image } = {}, { rejectWithValue, dispatch }) => {
    try {
      const normalizedStudentId = String(studentId ?? "").trim();

      if (!normalizedStudentId) {
        throw new Error("Student ID is required to upload a photo");
      }

      const hasFile = image instanceof File || image instanceof Blob;

      if (!hasFile) {
        throw new Error("Please select a photo to upload");
      }

      const formData = new FormData();
      formData.append(
        STUDENT_IMAGE_FIELD,
        image,
        image instanceof File
          ? (image.name ?? "student-profile.png")
          : "student-profile.png",
      );

      const { response } = await fetchWithAuth(
        UPLOAD_STUDENT_PROFILE_ENDPOINT.replace(
          "{id}",
          encodeURIComponent(normalizedStudentId),
        ),
        // No Content-Type: the browser sets the multipart boundary itself.
        { method: "POST", body: formData },
        dispatch,
      );

      if (!response.ok) {
        throw new Error("Failed to upload the student photo");
      }

      const text = await response.text();

      try {
        return text ? JSON.parse(text) : { success: true };
      } catch {
        return text || { success: true };
      }
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to upload the student photo",
      );
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
      })
      .addCase(uploadStudentPhoto.pending, (state) => {
        state.uploadingPhoto = true;
        state.photoUploaded = false;
        state.error = null;
      })
      .addCase(uploadStudentPhoto.fulfilled, (state) => {
        state.uploadingPhoto = false;
        state.photoUploaded = true;
      })
      .addCase(uploadStudentPhoto.rejected, (state, action) => {
        state.uploadingPhoto = false;
        state.photoUploaded = false;
        state.error = action.payload || "Unable to upload the student photo";
      });
  },
});

export const { resetUpdateStudentState } = updateStudentSlice.actions;
export default updateStudentSlice.reducer;
