import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Login goes through Next's same-origin proxy (/api/login), which the catch-all
// app/api/[...path]/route.js forwards to the backend. The browser never makes a
// cross-origin fetch, so the backend's missing CORS headers can't block it.
// The env base (NEXT_PUBLIC_API_URL / API_URL) is read SERVER-SIDE inside the
// proxy route — NOT inlined here, because inlining it makes the browser call
// the backend directly and triggers a CORS preflight failure.
const LOGIN_ENDPOINT = "/api/login";
const initialState = {
  loading: false,
  success: false,
  error: null,
  user: null,
};

export const loginUser = createAsyncThunk(
  "login/loginUser",
  async ({ username = "", password = "" } = {}, { rejectWithValue }) => {
    const normalizedUsername = String(username).trim();
    const normalizedPassword = String(password);

    if (!normalizedUsername || !normalizedPassword) {
      return rejectWithValue("Please enter both username and password.");
    }

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_name: normalizedUsername,
          password: normalizedPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        return rejectWithValue(result?.message || "Invalid username or password.");
      }

      const accessToken = result?.data?.access_token;
      const tokenValue =
        typeof accessToken === "string"
          ? accessToken
          : accessToken && typeof accessToken === "object"
            ? accessToken.token ||
              accessToken.access_token ||
              accessToken.value ||
              ""
            : "";

      const refreshTokenValue =
        result?.data?.refresh_token ??
        result?.data?.refreshToken ??
        result?.refresh_token ??
        result?.refreshToken ??
        null;

      const responseData = result?.data ?? result;
      const staff =
        responseData?.staff ??
        responseData?.user ??
        (responseData?.emp_name || responseData?.emp_id
          ? responseData
          : null);
      const accountType = responseData?.account_type || "staff";

      return {
        role: accountType,
        account_type: accountType,
        username: staff?.user_name || normalizedUsername,
        label: staff?.full_name || staff?.user_name || normalizedUsername,
        token: tokenValue,
        token_type: responseData?.token_type || "Bearer",
        refresh_token: refreshTokenValue,
        expires_in: responseData?.expires_in || null,
        user: staff,
        redirectTo: "/",
        loginAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to login. Please try again."
      );
    }
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    clearLoginState: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.user = null;
        state.error = action.payload || "Unable to login";
      });
  },
});

export const { clearLoginState } = loginSlice.actions;
export default loginSlice.reducer;
