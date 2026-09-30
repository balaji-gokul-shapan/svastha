import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const BASE = "/api/v1/doctor-signature";
const REMOVE_SIGNATURE = `${BASE}/remove`; 

const initialState = {
  signature: null,
  loading: false,
  success: false,
  error: null,
  lastDoctorId: null,
};

const requireDoctorId = (doctorId) => {
  const id = String(doctorId ?? "").trim();

  if (!id) {
    throw new Error("Doctor id is required.");
  }

  return encodeURIComponent(id);
};

export const getDoctorSignature = createAsyncThunk(
  "doctorSignature/getDoctorSignature",
  async (doctorId, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        `${BASE}/${requireDoctorId(doctorId)}`,
        {},
        dispatch,
      );

      if (!response.ok) {

        if (response.status === 404) {
          return null;
        }

        throw new Error("Failed to fetch doctor signature");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to fetch doctor signature",
      );
    }
  },
);

export const saveDoctorSignature = createAsyncThunk(
  "doctorSignature/saveDoctorSignature",
  async (
    { doctorId, signature, file, eventId } = {},
    { rejectWithValue, dispatch },
  ) => {
    try {
      const hasSignatureString =
        typeof signature === "string" && signature.trim().length > 0;
      const hasFile = file instanceof File || file instanceof Blob;

      if (!hasSignatureString && !hasFile) {
        throw new Error("A signature is required.");
      }

      const trimmedDoctorId = String(doctorId ?? "").trim();
      const trimmedEventId = String(eventId ?? "").trim();

      let options;

      if (hasSignatureString) {
        // Backend validation expects `signature` to be a STRING (the data URL
        // produced by the signature pad), not a multipart file. The selected
        // event and doctor travel alongside it as plain string fields.
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signature,
            ...(trimmedDoctorId ? { doctor_id: trimmedDoctorId } : {}),
            ...(trimmedEventId ? { event_id: trimmedEventId } : {}),
          }),
        };
      } else {
        const formData = new FormData();
        formData.append(
          "signature",
          file,
          file instanceof File
            ? (file.name ?? "signature.png")
            : "signature.png",
        );

        if (trimmedDoctorId) formData.append("doctor_id", trimmedDoctorId);
        if (trimmedEventId) formData.append("event_id", trimmedEventId);

        options = { method: "POST", body: formData };
      }

      const { response } = await fetchWithAuth(
        `${BASE}/upload`,
        options,
        dispatch,
      );

      if (!response.ok) {
        // Surface backend validation messages (e.g. "The signature field must
        // be a string.") instead of a generic failure.
        let errorPayload = null;

        try {
          errorPayload = await response.json();
        } catch {
          errorPayload = null;
        }

        const firstFieldError = errorPayload?.errors
          ? Object.values(errorPayload.errors)?.flat?.()?.[0]
          : null;

        throw new Error(
          errorPayload?.message ||
            firstFieldError ||
            "Failed to save doctor signature",
        );
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to save doctor signature",
      );
    }
  },
);

export const removeDoctorSignature = createAsyncThunk(
  "doctorSignature/removeDoctorSignature",
  async (doctorId, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        REMOVE_SIGNATURE,
        { method: "DELETE" },
        dispatch,
      );

      if (!response.ok) {
        throw new Error("Failed to remove doctor signature");
      }

      return null;
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to remove doctor signature",
      );
    }
  },
);

const normalizeSignature = (payload) => {
  const signature =
    payload?.signature ??
    payload?.data?.signature ??
    payload?.data ??
    payload;

  if (!signature) {
    return null;
  }

  if (typeof signature === "string") {
    return { url: signature };
  }

  const url =
    signature.url ??
    signature.signature_url ??
    signature.signatureUrl ??
    signature.image_url ??
    signature.imageUrl ??
    signature.file_url ??
    signature.fileUrl ??
    signature.path ??
    "";

  const signaturePath =
    signature.signature_path ?? signature.signaturePath ?? "";

  return {
    ...signature,
    url: String(url ?? ""),
    signatureUrl: String(url ?? ""),
    signaturePath: String(signaturePath ?? ""),
    primaryDoctorId: String(
      signature.primary_doctor_id ??
        signature.primaryDoctorId ??
        signature.doctor_id ??
        "",
    ),
  };
};

const doctorSignatureSlice = createSlice({
  name: "doctorSignature",
  initialState,
  reducers: {
    resetDoctorSignatureState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDoctorSignature.pending, (state, action) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.lastDoctorId = action.meta.arg ?? null;
      })
      .addCase(getDoctorSignature.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.signature = normalizeSignature(action.payload);
      })
      .addCase(getDoctorSignature.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch doctor signature";
      })
      .addCase(saveDoctorSignature.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(saveDoctorSignature.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.signature = normalizeSignature(action.payload);
      })
      .addCase(saveDoctorSignature.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to save doctor signature";
      })
      .addCase(removeDoctorSignature.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(removeDoctorSignature.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.signature = null;
      })
      .addCase(removeDoctorSignature.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to remove doctor signature";
      });
  },
});

export const { resetDoctorSignatureState } = doctorSignatureSlice.actions;
export default doctorSignatureSlice.reducer;

