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

export const createEntScreening = createAsyncThunk(
  "registerEntScreening/createEntScreening",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const authToken = getAuthToken(getState);
      const headers = { "Content-Type": "application/json" };

      if (authToken) {
        headers.Authorization = authToken;
      }

      const response = await fetch("/api/ent-assessment", {
        method: "POST",
        headers,
        body: JSON.stringify(payload ?? {}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create ENT screening");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to create ENT screening",
      );
    }
  },
);

const registerEntScreeningSlice = createSlice({
  name: "registerEntScreening",
  initialState,
  reducers: {
    resetRegisterEntScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEntScreening.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createEntScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createEntScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create ENT screening";
      });
  },
});

export const { resetRegisterEntScreeningState } =
  registerEntScreeningSlice.actions;

export default registerEntScreeningSlice.reducer;