import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getRoleFromTypeId } from "../user-role";
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

   
      const account =
        responseData?.account ??
        responseData?.organization ??
        responseData?.organisation ??
        responseData?.school ??
        responseData?.branch ??
        responseData?.staff?.account ??
        responseData?.user?.account ??
        {};


      const userTypeId =
        staff?.user_type_id ??
        staff?.userTypeId ??
        account?.user_type_id ??
        account?.userTypeId ??
        null;
      const roleFromTypeId = getRoleFromTypeId(userTypeId);


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

      const rawPrimaryDoctor =
        responseData?.primary_doctor ??
        responseData?.is_primary_doctor ??
        staff?.primary_doctor ??
        account?.primary_doctor ??
        false;
      const primaryDoctor =
        rawPrimaryDoctor === true ||
        rawPrimaryDoctor === 1 ||
        (typeof rawPrimaryDoctor === "string" &&
          ["true", "1", "yes"].includes(rawPrimaryDoctor.trim().toLowerCase()));

      return {
        role: accountType,
        account_type: accountType,
        primary_doctor: primaryDoctor,
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
