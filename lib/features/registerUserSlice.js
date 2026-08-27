import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  "registerUser/register",
  async (
    { fullName = "", username = "", password = "" } = {},
    { rejectWithValue }
  ) => {
    const normalizedFullName = String(fullName).trim();
    const normalizedUsername = String(username).trim();
    const normalizedPassword = String(password);

    if (!normalizedFullName || !normalizedUsername || !normalizedPassword) {
      return rejectWithValue("Please fill in all the required fields.");
    }

    try {
      // Goes through the Next.js API proxy (app/api/[...path]/route.js).
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          full_name: normalizedFullName,
          user_name: normalizedUsername,
          password: normalizedPassword,
        }),
      });

      let result = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || result?.success === false) {
        return rejectWithValue(
          result?.message || "Unable to create the account. Please try again."
        );
      }

      return { message: result?.message || "Account created successfully." };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to reach the server. Please try again."
      );
    }
  }
);

const registerUserSlice = createSlice({
  name: "registerUser",
  initialState,
  reducers: {
    resetRegisterUserState: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Unable to create the account.";
      });
  },
});

export const { resetRegisterUserState } = registerUserSlice.actions;
export default registerUserSlice.reducer;
