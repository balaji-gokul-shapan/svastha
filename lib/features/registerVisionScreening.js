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
      const session = JSON.parse(window.sessionStorage.getItem("svastha-auth"));
      token = session?.token;
      tokenType = session?.token_type || tokenType;
    } catch {}
  }

  return token ? `${tokenType} ${token}`.trim() : null;
}

export const createVisionScreening = createAsyncThunk(
  "registerVisionScreening/createVisionScreening",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const headers = { "Content-Type": "application/json" };
      const authorization = getAuthToken(getState);
      if (authorization) headers.Authorization = authorization;

      const response = await fetch("/api/vision-test/create", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const body = await response.text();
      if (!response.ok) throw new Error(body || "Failed to create vision screening");

      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    } catch (error) {
      return rejectWithValue(error?.message || "Unable to create vision screening");
    }
  },
);

const registerVisionScreeningSlice = createSlice({
  name: "registerVisionScreening",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createVisionScreening.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createVisionScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createVisionScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create vision screening";
      });
  },
});

export default registerVisionScreeningSlice.reducer;
