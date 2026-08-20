import { createSlice } from "@reduxjs/toolkit";

export const AUTH_SESSION_KEY = "svastha-auth";

const emptyAuthState = {
  isAuthenticated: false,
  role: null,
  account_type: null,
  username: null,
  user: null,
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
      state.account_type = action.payload.account_type ?? action.payload.role;
      state.username = action.payload.username;
      state.user =
        action.payload.user ??
        {
          role: action.payload.role,
          account_type: action.payload.account_type ?? action.payload.role,
          username: action.payload.username,
          label: action.payload.username,
        };
      state.loginAt = action.payload.loginAt || null;
    },
    clearAuthSession(state) {
      state.isAuthenticated = false;
      state.role = null;
      state.account_type = null;
      state.username = null;
      state.user = null;
      state.loginAt = null;
    },
  },
});

export const { setAuthSession, clearAuthSession } = authSlice.actions;
export default authSlice.reducer;