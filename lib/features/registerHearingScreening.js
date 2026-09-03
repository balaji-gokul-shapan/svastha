import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  createLoading: false,
  success: false,
  error: null,
  createdRecord: null,
};

export const createHearingScreening = createAsyncThunk(
  "registerHearingScreening/createHearingScreening",
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        "/api/hear-test/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        dispatch,
      );
      const body = await response.text();
      if (!response.ok) {
        let errorPayload;

        try {
          errorPayload = body ? JSON.parse(body) : null;
        } catch {
          errorPayload = body;
        }

        throw errorPayload || { message: "Failed to create hear screening" };
      }

      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to create hear screening" },
      );
    }
  },
);

const registerHearScreeningSlice = createSlice({
  name: "registerVisionScreening",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createHearingScreening.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createHearingScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createHearingScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create vision screening";
      });
  },
});

export default registerHearScreeningSlice.reducer;
