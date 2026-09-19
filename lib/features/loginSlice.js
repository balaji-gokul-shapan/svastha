import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getRoleFromTypeId } from "../user-role";

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

      const responseData = result?.data ?? result;

      // Refresh token — required for silent session renewal when the access
      // token expires. The backend returns it alongside access_token; handle
      // both plain-string and object shapes (mirrors accessToken handling).
      const rawRefreshToken =
        responseData?.refresh_token ?? responseData?.refreshToken ?? null;
      const refreshTokenValue =
        typeof rawRefreshToken === "string"
          ? rawRefreshToken
          : rawRefreshToken && typeof rawRefreshToken === "object"
            ? rawRefreshToken.token ||
              rawRefreshToken.refresh_token ||
              rawRefreshToken.value ||
              ""
            : "";

      const staff =
        responseData?.staff ??
        responseData?.user ??
        (responseData?.emp_name || responseData?.emp_id
          ? responseData
          : null);

      // The account / organisation object returned by the backend, e.g.
      // { id, name, branch/school_id, school_name, ... }. Tries the common
      // shapes so every login carries the full account data downstream
      // (sessionStorage -> Redux `state.auth.account` -> selectUserAccount).
      const account =
        responseData?.account ??
        responseData?.organization ??
        responseData?.organisation ??
        responseData?.school ??
        responseData?.branch ??
        responseData?.staff?.account ??
        responseData?.user?.account ??
        {};

      // Resolve the login role. The backend does NOT return an `account_type`
      // string on this endpoint (it is null in the payload), so derive it from
      // the numeric `user_type_id` (1=admin, 2=school, 3=teacher, 5=doctor)
      // via the shared helper, falling back to any role NAME the payload does
      // carry (e.g. user_type: "school_sub_account"). This value lands in the
      // `svastha-auth` cookie, which proxy.js uses to enforce per-route
      // access — leaving it on the legacy "staff" fallback made every
      // restricted route bounce to "/?denied=1" even for valid roles.
      const userTypeId =
        staff?.user_type_id ??
        staff?.userTypeId ??
        account?.user_type_id ??
        account?.userTypeId ??
        null;
      const roleFromTypeId = getRoleFromTypeId(userTypeId);

      // Only accept a role NAME (never a numeric id string like "2") —
      // numbers are handled by the user_type_id path above.
      const rawRoleName = [
        responseData?.account_type,
        responseData?.role,
        staff?.user_type,
        account?.user_type,
      ].find(
        (value) =>
          typeof value === "string" &&
          value.trim() &&
          Number.isNaN(Number(value.trim())),
      );

      const accountType =
        (rawRoleName && rawRoleName.trim().toLowerCase()) ||
        roleFromTypeId ||
        "staff";

      return {
        role: accountType,
        account_type: accountType,
        username: staff?.user_name || normalizedUsername,
        label: staff?.full_name || staff?.user_name || normalizedUsername,
        token: tokenValue,
        refresh_token: refreshTokenValue || null,
        token_type: responseData?.token_type || "Bearer",
        expires_in: responseData?.expires_in || null,
        user: staff,
        account,
        accountData: responseData,
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
