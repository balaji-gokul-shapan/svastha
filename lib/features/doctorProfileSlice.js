import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";
export const UPDATE_DOCTOR_PROFILE = "/api/v1/doctor/profile";

const initialState = {
  loading: false,
  success: false,
  error: null,
  data: null,
};

export const updateDoctorProfile = createAsyncThunk(
  "doctorProfile/updateDoctorProfile",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const options = {
        method: "PATCH",
        body: JSON.stringify(payload ?? {}),
      };
      options.headers = { "Content-Type": "application/json" };

      const { response } = await fetchWithAuth(
        `${UPDATE_DOCTOR_PROFILE}`,
        { ...options, keepSessionOn401: true },
        dispatch,
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;
        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }
        throw errorPayload || new Error("Failed to update doctor profile");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to update doctor profile",
      );
    }
  },
);

const doctorProfileSlice = createSlice({
  name: "doctorProfile",
  initialState,
  reducers: {
    resetDoctorProfileState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Unable to update doctor profile";
      });
  },
});

export const { resetDoctorProfileState } = doctorProfileSlice.actions;
export default doctorProfileSlice.reducer;
