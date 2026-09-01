import { createSlice } from "@reduxjs/toolkit";
import { AUTH_SESSION_KEY } from "../auth-utils";

const emptyAuthState = {
  isAuthenticated: false,
  role: null,
  account_type: null,
  username: null,
  user: null,
  token: null,
  token_type: "Bearer",
  refresh_token: null,
  expires_in: null,
  loginAt: null,
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
      };
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
export const selectEmployeeName = (state) => selectAuthUser(state)?.emp_name ?? "";
export const selectUsername = (state) => selectAuthUser(state)?.user_name ?? "";
export const selectUserType = (state) => selectAuthUser(state)?.user_type ?? "";
export const selectEmployeeId = (state) => selectAuthUser(state)?.emp_id ?? null;

export default authSlice.reducer;