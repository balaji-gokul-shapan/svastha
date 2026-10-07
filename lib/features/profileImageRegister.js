import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

// Profile-image endpoints (school-account scope, as used by Settings → Profile).
const GET_IMAGE = "/api/v1/school_acc/profile/image";
const UPLOAD_IMAGE = "/api/v1/school_acc/profile/upload-image";
const DELETE_IMAGE = "/api/v1/school_acc/profile/delete-image";

// The multipart field name expected by the backend.
const IMAGE_FIELD = "image";

const initialState = {
  profileImage: null,
  loading: false,
  success: false,
  error: null,
};

// Extract the most useful validation message the backend returned.
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

  return payload?.message || firstFieldError || text || fallback;
}

export const getProfileImage = createAsyncThunk(
  "profileImage/getProfileImage",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        GET_IMAGE,
        {
          headers: { Accept: "application/json" },
          keepSessionOn401: true,
        },
        dispatch,
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Failed to fetch profile image."),
        );
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to fetch profile image.",
      );
    }
  },
);
export const uploadProfileImage = createAsyncThunk(
  "profileImage/uploadProfileImage",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      let options;

      if (typeof FormData !== "undefined" && payload instanceof FormData) {
        // Keep explicit multipart payloads intact.
        options = { method: "POST", body: payload };
      } else {
        const payloadIsFile =
          typeof File !== "undefined" && payload instanceof File;
        const payloadIsBlob =
          typeof Blob !== "undefined" && payload instanceof Blob;
        const file =
          payloadIsFile || payloadIsBlob
            ? payload
            : payload?.image ?? payload?.file ?? null;

        if (typeof Blob === "undefined" || !(file instanceof Blob)) {
          throw new Error("Please select a profile image to upload.");
        }

        const formData = new FormData();
        const filename =
          typeof File !== "undefined" && file instanceof File
            ? file.name || "profile-image"
            : "profile-image";
        formData.append(IMAGE_FIELD, file, filename);
        options = {
          method: "POST",
          body: formData,
        };
      }

      const { response } = await fetchWithAuth(
        UPLOAD_IMAGE,
        { ...options, keepSessionOn401: true },
        dispatch,
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Failed to upload profile image."),
        );
      }

      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to upload profile image.",
      );
    }
  },
);

export const deleteProfileImage = createAsyncThunk(
  "profileImage/deleteProfileImage",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        DELETE_IMAGE,
        { method: "DELETE", keepSessionOn401: true },
        dispatch,
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Failed to delete profile image."),
        );
      }

      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to delete profile image.",
      );
    }
  },
);

const profileImageSlice = createSlice({
  name: "profileImage",
  initialState,
  reducers: {
    resetProfileImageState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfileImage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.profileImage =
          action.payload?.image ??
          action.payload?.url ??
          action.payload?.data ??
          action.payload ??
          null;
      })
      .addCase(getProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch profile image.";
      })
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.profileImage =
          action.payload?.image ??
          action.payload?.url ??
          action.payload?.data ??
          action.payload ??
          state.profileImage;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to upload profile image.";
      })
      .addCase(deleteProfileImage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteProfileImage.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.profileImage = null;
      })
      .addCase(deleteProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to delete profile image.";
      });
  },
});

export const { resetProfileImageState } = profileImageSlice.actions;

export default profileImageSlice.reducer;
