import { createSlice } from "@reduxjs/toolkit";
import { AUTH_SESSION_KEY } from "../auth-utils";

/* The backend has been seen sending `primary_doctor` as true/false, as 1/0,
   and as the strings "true"/"1". Normalise all of those to a real boolean so
   consumers can just do `if (primaryDoctor)`. */
const toBool = (value) =>
  value === true ||
  value === 1 ||
  (typeof value === "string" &&
    ["true", "1", "yes"].includes(value.trim().toLowerCase()));

const emptyAuthState = {
  isAuthenticated: false,
  role: null,
  account_type: null,
  primary_doctor: false,
  username: null,
  user: null,
  token: null,
  token_type: "Bearer",
  refresh_token: null,
  expires_in: null,
  loginAt: null,
  account: {}
};

function getInitialAuthState() {
  if (typeof window === "undefined") {
    return emptyAuthState;
  }

  try {
    const rawSession = window.sessionStorage.getItem(AUTH_SESSION_KEY);

    if (!rawSession) {
      return emptyAuthState;
    }

    const parsedSession = JSON.parse(rawSession);

    if (!parsedSession?.role || !parsedSession?.username) {
      return emptyAuthState;
    }

    return {
      isAuthenticated: true,
      role: parsedSession.role,
      account_type:
        parsedSession.account_type ??
        parsedSession?.user?.account_type ??
        parsedSession.role,
      primary_doctor: toBool(parsedSession.primary_doctor),
      username: parsedSession.username,
      user:
        parsedSession.user ??
        {
          role: parsedSession.role,
          account_type: parsedSession.role,
          username: parsedSession.username,
          label: parsedSession.username,
        },
      token: parsedSession.token ?? null,
      token_type: parsedSession.token_type ?? "Bearer",
      refresh_token: parsedSession.refresh_token ?? null,
      expires_in: parsedSession.expires_in ?? null,
      loginAt: parsedSession.loginAt || null,
      account: parsedSession.account
    };
  } catch {
    return emptyAuthState;
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuthState(),
  reducers: {
    setAuthSession(state, action) {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.account_type = action.payload.account_type;
      state.primary_doctor = toBool(action.payload.primary_doctor);
      state.username = action.payload.username;
      state.user = {
        ...(action.payload.user ?? {}),
        role: action.payload.role,
        account_type: action.payload.account_type,
        username: action.payload.username,
        label:
          action.payload.label ??
          action.payload.user?.emp_name ??
          action.payload.username,
        emp_name: action.payload.user?.emp_name ?? action.payload.emp_name ?? "",
        user_name:
          action.payload.user?.user_name ?? action.payload.username ?? "",
        user_type: action.payload.user?.user_type ?? action.payload.user_type ?? "",
        emp_id: action.payload.user?.emp_id ?? action.payload.emp_id ?? null,
        account: action.payload.account ?? {}
      };
      state.account = action.payload.account ?? {};
      state.token = action.payload.token ?? null;
      state.token_type = action.payload.token_type ?? "Bearer";
      state.refresh_token = action.payload.refresh_token ?? null;
      state.expires_in = action.payload.expires_in ?? null;
      state.loginAt = action.payload.loginAt || null;
    },
    clearAuthSession(state) {
      state.isAuthenticated = false;
      state.role = null;
      state.account_type = null;
      state.primary_doctor = false;
      state.account ={};
      state.username = null;
      state.user = null;
      state.token = null;
      state.token_type = "Bearer";
      state.refresh_token = null;
      state.expires_in = null;
      state.loginAt = null;
    },
    refreshAccessToken(state, action) {
      const session = action.payload;
      if (session?.token) {
        state.token = session.token;
      }
      if (session?.token_type) {
        state.token_type = session.token_type;
      }
      if (session?.refresh_token) {
        state.refresh_token = session.refresh_token;
      }
      if (session?.expires_in != null) {
        state.expires_in = session.expires_in;
      }
      state.loginAt = session?.loginAt || state.loginAt;
    },
  },
});

export const { setAuthSession, clearAuthSession, refreshAccessToken } = authSlice.actions;

export const selectAuthUser = (state) => state.auth?.user ?? null;
export const selectIsPrimaryDoctor = (state) => Boolean(state.auth?.primary_doctor);
export const selectIsPrimaryDoctorRole = (state) =>
  Boolean(state.auth?.primary_doctor) && state.auth?.role === "doctor";
export const selectEmployeeName = (state) => selectAuthUser(state)?.emp_name ?? "";
export const selectUsername = (state) => selectAuthUser(state)?.user_name ?? "";
export const selectUserType = (state) => selectAuthUser(state)?.user_type ?? "";
export const selectEmployeeId = (state) => selectAuthUser(state)?.emp_id ?? null;
export const selectAuthLoginAt = (state) => state.auth?.loginAt ?? null;
export const selectAuthAccount = (state) => state.auth?.account ?? {};
export const selectUserAccount = (state) =>
  selectAuthUser(state)?.account ?? state.auth?.account ?? {};

export default authSlice.reducer;