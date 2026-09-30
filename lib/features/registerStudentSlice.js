import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";
const UPLOAD_STUDENT_PROFILE = "v1/students/{id}/upload-image";
export const STUDENT_IMAGE_FIELD = "profile_image";


export const UPLOAD_STUDENT_PROFILE_ENDPOINT = UPLOAD_STUDENT_PROFILE;

async function readErrorMessage(response, fallback) {
  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  const firstFieldError = payload?.errors
    ? Object.values(payload.errors).flat().filter(Boolean)[0]
    : null;

  return (
    payload?.message ?? payload?.detail ?? firstFieldError ?? text ?? fallback
  );
}

/**
 * Payload shape expected by the backend:
 * {
 *   school_registration_number: "string",
 *   academic_year: "string",
 *   student_name: "string",
 *   gender: "string",
 *   dob: "string",
 *   class: "string",
 *   sec: "string",
 *   admission_number: "string",
 *   student_aadhaar_number: "string",
 *   father_name: "string",
 *   father_contact_number: "string",
 *   father_aadhaar_number: "string",
 *   mother_name: "string",
 *   mother_contact_number: "string",
 *   mother_aadhaar_number: "string",
 *   school_id: 0,
 * }
 */

const PAYLOAD_KEYS = [
  "school_registration_number",
  "academic_year",
  "student_name",
  "gender",
  "dob",
  "class",
  "sec",
  "admission_number",
  "student_aadhaar_number",
  "father_name",
  "father_contact_number",
  "father_aadhaar_number",
  "mother_name",
  "mother_contact_number",
  "mother_aadhaar_number",
  "school_id",
];

/** Normalise incoming form values into the exact backend contract. */
export function buildRegisterStudentPayload(values = {}) {
  const payload = {};
  PAYLOAD_KEYS.forEach((key) => {
    const value = values[key];
    if (key === "school_id") {
      payload.school_id = Number(value) || 0;
      return;
    }
    payload[key] = String(value ?? "").trim();
  });
  return payload;
}

export const registerStudent = createAsyncThunk(
  "registerStudent/registerStudent",
  async (
    { student: values, profileImage } = {},
    { rejectWithValue, dispatch },
  ) => {
    try {
      const body = buildRegisterStudentPayload(values);

      if (!body.student_name) {
        throw new Error("Student name is required.");
      }
      if (!body.school_registration_number) {
        throw new Error("School registration number is required.");
      }
      if (!body.academic_year) {
        throw new Error("Academic year is required.");
      }
      if (!body.class) {
        throw new Error("Class is required.");
      }
      if (!body.sec) {
        throw new Error("Section is required.");
      }
      if (!body.gender) {
        throw new Error("Gender is required.");
      }
      if (!body.dob) {
        throw new Error("Date of birth is required.");
      }
      if (!body.school_id || Number(body.school_id) < 1) {
        throw new Error("A valid School ID is required.");
      }

      let fetchOptions;
      if (profileImage instanceof File) {
        // Multipart so the backend can persist the optional profile photo
        // alongside the student record. No Content-Type here  the browser
        // sets the multipart boundary automatically.
        const formData = new FormData();
        PAYLOAD_KEYS.forEach((key) => {
          formData.append(key, String(body[key]));
        });
        formData.append("profile_image", profileImage);
        fetchOptions = { method: "POST", body: formData };
      } else {
        fetchOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        };
      }

      const { response } = await fetchWithAuth(
        "/api/v1/students",
        fetchOptions,
        dispatch,
      );

      const responseText = await response.text();

      if (!response.ok) {
        // Backend validation errors usually arrive as JSON  surface the
        // human-readable detail when we can.
        let detail = null;
        try {
          const parsed = responseText ? JSON.parse(responseText) : null;
          detail = parsed?.detail || parsed?.message || responseText || null;
        } catch {
          detail = responseText || null;
        }
        throw new Error(detail || "Failed to register student.");
      }

      try {
        return responseText ? JSON.parse(responseText) : null;
      } catch {
        return responseText;
      }
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to register the student.",
      );
    }
  },
);


export const uploadStudentProfileImage = createAsyncThunk(
  "registerStudent/uploadStudentProfileImage",
  async ({ studentId, image } = {}, { rejectWithValue, dispatch }) => {
    try {
      const trimmedId = String(studentId ?? "").trim();

      if (!trimmedId) {
        throw new Error("Student id is required.");
      }

      const file = image instanceof File || image instanceof Blob ? image : null;

      if (!file) {
        throw new Error("Please select a profile photo to upload.");
      }

      // No Content-Type header: the browser must set the multipart boundary.
      const formData = new FormData();
      formData.append(
        STUDENT_IMAGE_FIELD,
        file,
        file instanceof File ? (file.name ?? "student-profile.png") : "student-profile.png",
      );

      const { response } = await fetchWithAuth(
        UPLOAD_STUDENT_PROFILE.replace("{id}", encodeURIComponent(trimmedId)),
        { method: "POST", body: formData },
        dispatch,
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Failed to upload the student photo."),
        );
      }

      const text = await response.text();

      try {
        return text ? JSON.parse(text) : { success: true };
      } catch {
        return text || { success: true };
      }
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to upload the student photo.",
      );
    }
  },
);

/* Reads the created student's id from any of the shapes the register endpoint
   has used, so the follow-up upload works without a second round trip. */
export function extractStudentId(payload) {
  const root = payload?.data ?? payload;

  return String(
    root?.id ??
      root?.student_id ??
      root?.studentId ??
      root?.student?.id ??
      root?.student?.student_id ??
      "",
  ).trim();
}

const initialState = {
  loading: false,
  success: false,
  error: null,
  createdStudent: null,
  uploadingImage: false,
  imageUploaded: false,
  uploadedImageUrl: null,
};

const registerStudentSlice = createSlice({
  name: "registerStudent",
  initialState,
  reducers: {
    resetRegisterStudentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerStudent.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.createdStudent = null;
      })
      .addCase(registerStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdStudent = action.payload;
      })
      .addCase(registerStudent.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Unable to register the student.";
      })
      .addCase(uploadStudentProfileImage.pending, (state) => {
        state.uploadingImage = true;
        state.imageUploaded = false;
        state.error = null;
      })
      .addCase(uploadStudentProfileImage.fulfilled, (state, action) => {
        state.uploadingImage = false;
        state.imageUploaded = true;
        state.uploadedImageUrl =
          action.payload?.image_url ??
          action.payload?.imageUrl ??
          action.payload?.url ??
          action.payload?.image ??
          null;
      })
      .addCase(uploadStudentProfileImage.rejected, (state, action) => {
        state.uploadingImage = false;
        state.imageUploaded = false;
        state.error = action.payload || "Failed to upload the student photo.";
      });
  },
});

export const { resetRegisterStudentState } = registerStudentSlice.actions;
export default registerStudentSlice.reducer;
