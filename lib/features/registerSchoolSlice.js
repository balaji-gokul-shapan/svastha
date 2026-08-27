import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Adjust these two constants if the backend paths change.
const CREATE_SCHOOL_ENDPOINT = "/api/register";
const UPDATE_SCHOOL_ENDPOINT = "/api/v1/school";
const GET_SCHOOL_ENDPOINT = "/api/v1/school";
const GET_ALLSCHOOL_ENDPOINT = "/api/v1/school/all";

const initialState = {
  createLoading: false,
  updateLoading: false,
  getLoading: false,
  success: false,
  error: null,
  createdRecord: null,
  updatedRecord: null,
  fetchedRecord: null,
  getAllLoading: false,
  allSchools: [],
};

function getAuthToken(getState) {
  const state = typeof getState === "function" ? getState() : null;
  let token = state?.auth?.token;
  let tokenType = state?.auth?.token_type || "Bearer";

  if (!token && typeof window !== "undefined") {
    try {
      const rawSession = window.sessionStorage.getItem("svastha-auth");
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        token = parsed?.token;
        tokenType = parsed?.token_type || tokenType;
      }
    } catch {}
  }

  return token ? `${tokenType} ${token}`.trim() : null;
}

export const getRegisterSchool = createAsyncThunk(
  "registerSchool/getSchool",
  async ({ id } = {}, { rejectWithValue, getState }) => {
    try {
      const normalizedId = String(id ?? "").trim();

      const authToken = getAuthToken(getState);

      const headers = { Accept: "application/json" };
      if (authToken) {
        headers["Authorization"] = authToken;
      }

      // READ (GET). With an id it targets /school/:id; without one, the
      // endpoint returns the signed-in school's own profile.
      const endpoint = normalizedId
        ? `${GET_SCHOOL_ENDPOINT}/${encodeURIComponent(normalizedId)}`
        : GET_SCHOOL_ENDPOINT;

      const response = await fetch(endpoint, { method: "GET", headers });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load the school profile");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to load the school profile",
      );
    }
  },
);

export const getAllRegisterSchool = createAsyncThunk(
  "registerSchool/getAllSchool",
  async (_, { rejectWithValue, getState }) => {
    try {
      const authToken = getAuthToken(getState);

      const headers = { Accept: "application/json" };
      if (authToken) {
        headers["Authorization"] = authToken;
      }

      // READ ALL (GET) — no id involved; returns every registered school.
      const response = await fetch(GET_ALLSCHOOL_ENDPOINT, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load the registered schools");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to load the registered schools",
      );
    }
  },
);

export const createRegisterSchool = createAsyncThunk(
  "registerSchool/createSchool",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const authToken = getAuthToken(getState);
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      const headers = {};
      // Never set Content-Type manually for FormData — the browser must
      // generate the multipart boundary itself.
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }
      if (authToken) {
        headers["Authorization"] = authToken;
      }

      // CREATE = POST the full school payload to the collection endpoint.
      const response = await fetch(CREATE_SCHOOL_ENDPOINT, {
        method: "POST",
        headers,
        body: isFormData ? payload : JSON.stringify(payload ?? {}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to register the school");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "Unable to register the school");
    }
  },
);

export const updateRegisterSchool = createAsyncThunk(
  "registerSchool/updateSchool",
  async ({ id, payload } = {}, { rejectWithValue, getState }) => {
    try {
      const normalizedId = String(id ?? "").trim();

      const authToken = getAuthToken(getState);
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      const headers = {};
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }
      if (authToken) {
        headers["Authorization"] = authToken;
      }

      // UPDATE (PATCH) = send ONLY the changed fields. With an id it
      // targets /school/branch/profile/:id; without one, the endpoint
      // is treated as the signed-in school's own branch profile.
      const endpoint = normalizedId
        ? `${UPDATE_SCHOOL_ENDPOINT}/${encodeURIComponent(normalizedId)}/update`
        : UPDATE_SCHOOL_ENDPOINT;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers,
        body: isFormData ? payload : JSON.stringify(payload ?? {}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update the school profile");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to update the school profile",
      );
    }
  },
);

const registerSchoolSlice = createSlice({
  name: "registerSchool",
  initialState,
  reducers: {
    resetRegisterSchoolState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllRegisterSchool.pending, (state) => {
        state.getAllLoading = true;
        state.error = null;
      })
      .addCase(getAllRegisterSchool.fulfilled, (state, action) => {
        state.getAllLoading = false;
        // Tolerate both a raw array and a wrapped { data: [...] } response.
        state.allSchools = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.data ?? []);
      })
      .addCase(getAllRegisterSchool.rejected, (state, action) => {
        state.getAllLoading = false;
        state.error =
          action.payload || "Unable to load the registered schools";
      })
      .addCase(getRegisterSchool.pending, (state) => {
        state.getLoading = true;
        state.error = null;
      })
      .addCase(getRegisterSchool.fulfilled, (state, action) => {
        state.getLoading = false;
        state.fetchedRecord = action.payload;
      })
      .addCase(getRegisterSchool.rejected, (state, action) => {
        state.getLoading = false;
        state.error = action.payload || "Unable to load the school profile";
      })
      .addCase(createRegisterSchool.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createRegisterSchool.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createRegisterSchool.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to register the school";
      })
      .addCase(updateRegisterSchool.pending, (state) => {
        state.updateLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateRegisterSchool.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.updatedRecord = action.payload;
      })
      .addCase(updateRegisterSchool.rejected, (state, action) => {
        state.updateLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to update the school profile";
      });
  },
});

export const { resetRegisterSchoolState } = registerSchoolSlice.actions;

export default registerSchoolSlice.reducer;
