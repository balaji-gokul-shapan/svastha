import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  createLoading: false,
  success: false,
  error: null,
  createdRecord: null,
};

function getAuthToken(getState) {
  const state = typeof getState === "function" ? getState() : null;
  let token = state?.auth?.token;
  let tokenType = state?.auth?.token_type || "Bearer";

  if (!token && typeof window !== "undefined") {
    try {
      const rawSession = window.sessionStorage.getItem("svastha-auth");
      if (rawSession) {
        const session = JSON.parse(rawSession);
        token = session?.token;
        tokenType = session?.token_type || tokenType;
      }
    } catch { }
  }

  return token ? `${tokenType} ${token}`.trim() : null;
}

export const createDentalScreening = createAsyncThunk(
  "registerDentalScreening/createDentalScreening",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const authToken = getAuthToken(getState);
      const headers = { "Content-Type": "application/json" };

      if (authToken) {
        headers.Authorization = authToken;
      }

      const response = await fetch("/api/dental-test/create", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create dental screening");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to create dental screening",
      );
    }
  },
);

const registerDentalScreeningSlice = createSlice({
  name: "registerDentalScreening",
  initialState,
  reducers: {
    resetRegisterDentalScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDentalScreening.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createDentalScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createDentalScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create dental screening";
      });
  },
});

export const { resetRegisterDentalScreeningState } =
  registerDentalScreeningSlice.actions;

export default registerDentalScreeningSlice.reducer;
