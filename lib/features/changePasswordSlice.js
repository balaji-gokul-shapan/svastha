import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  password: null,
  error: null,
  success: false,
  loading: false,
};
const CHANGE_PASSWORD = "/api/v1/schools/change-password";

export const changePassword = createAsyncThunk(
  "changePassword/changePassword",
  async (payload = {}, { rejectWithValue, dispatch }) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      const options = {
        method: "POST",
        body: isFormData ? payload : JSON.stringify(payload),
      };
      if (!isFormData) {
        options.headers = { "Content-Type": "application/json" };
      }

      const { response } = await fetchWithAuth(
        CHANGE_PASSWORD,
        options,
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

        throw errorPayload || { message: "Failed to change password" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to change password" },
      );
    }
  },
);


const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState,
  reducers: {
    resetChangePasswordState: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.password = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "Unable to change password";
      });
  },
});

export default changePasswordSlice.reducer;