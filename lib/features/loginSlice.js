import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const ROLE_CREDENTIALS = {
  user: {
    username: "user",
    password: "user123",
    label: "User",
    redirectTo: "/students",
  },
  admin: {
    username: "admin",
    password: "admin123",
    label: "Admin",
    redirectTo: "/",
  },
  superadmin: {
    username: "superadmin",
    password: "super123",
    label: "Super Admin",
    redirectTo: "/",
  },
};

const initialState = {
  loading: false,
  success: false,
  error: null,
  user: null,
};

export const loginUser = createAsyncThunk(
  "login/loginUser",
  async ({ username = "", password = "" } = {}, { rejectWithValue }) => {
    const normalizedUsername = String(username).trim().toLowerCase();
    const normalizedPassword = String(password);

    if (!normalizedUsername || !normalizedPassword) {
      return rejectWithValue("Please enter both username and password.");
    }

    const matchedCredential = Object.entries(ROLE_CREDENTIALS).find(
      ([, account]) =>
        account.username === normalizedUsername &&
        account.password === normalizedPassword,
    );

    if (!matchedCredential) {
      return rejectWithValue("Invalid username or password.");
    }

    const [role, selectedRole] = matchedCredential;
    console.log(role, selectedRole);
    

    return {
      role,
      username: selectedRole.username,
      label: selectedRole.label,
      account_type: role,
      redirectTo: selectedRole.redirectTo,
      loginAt: new Date().toISOString(),
    };
  },
);

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    clearLoginState: () => initialState,
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
