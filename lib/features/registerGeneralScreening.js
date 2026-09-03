import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  createLoading: false,
  updateLoading: false,
  success: false,
  error: null,
  createdRecord: null,
  updatedRecord: null,
};

export const createInitialScreening = createAsyncThunk(
  "registerGeneralScreening/createInitialScreening",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      const options = {
        method: "POST",
        body: isFormData ? payload : JSON.stringify(payload ?? {}),
      };
      if (!isFormData) {
        options.headers = { "Content-Type": "application/json" };
      }

      const endpoint = `/api/general-screenings`;

      const { response } = await fetchWithAuth(endpoint, options, dispatch);

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }

        throw errorPayload || { message: "Failed to create general screening" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to create general screening" },
      );
    }
  },
);

export const updateInitialScreening = createAsyncThunk(
  "registerGeneralScreening/updateInitialScreening",
  async ({ id, studentId, payload }, { rejectWithValue, dispatch }) => {
    try {
      const targetId = id || studentId;
      const normalizedId = String(targetId ?? "").trim();
      if (!normalizedId) {
        throw new Error("Screening or Student ID is required for update");
      }

      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      const options = {
        method: "PUT",
        body: isFormData ? payload : JSON.stringify(payload ?? {}),
      };
      if (!isFormData) {
        options.headers = { "Content-Type": "application/json" };
      }

      const endpoint = `/api/general-screenings/${encodeURIComponent(normalizedId)}`;
      const { response } = await fetchWithAuth(endpoint, options, dispatch);

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }

        throw errorPayload || { message: "Failed to update general screening" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to update general screening" },
      );
    }
  },
);

const registerGeneralScreeningSlice = createSlice({
  name: "registerGeneralScreening",
  initialState,
  reducers: {
    resetRegisterGeneralScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInitialScreening.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createInitialScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createInitialScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create initial screening";
      })
      .addCase(updateInitialScreening.pending, (state) => {
        state.updateLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateInitialScreening.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.updatedRecord = action.payload;
      })
      .addCase(updateInitialScreening.rejected, (state, action) => {
        state.updateLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to update initial screening";
      });
  },
});

export const { resetRegisterGeneralScreeningState } =
  registerGeneralScreeningSlice.actions;

export default registerGeneralScreeningSlice.reducer;
