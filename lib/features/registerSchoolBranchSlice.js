import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const GET_A_SCHOOL_BRANCH = "/api/schools/branches/profile";
const GET_ALL_SCHOOL_BRANCHES = "/api/v1/schools/branch/all";
const CREATE_SCHOOL_BRANCH = "/api/v1/schools/branch/create";
const UPDATE_SCHOOL_BRANCH = "/api/v1/schools/branch/profile/update";

const initialState = {
  schoolBranchLoading: false,
  schoolBranchError: false,
  schoolBranchSuccess: false,
  getSchoolBranchLoading: false,
  getSchoolBranchError: false,
  getSchoolBranchSuccess: false,
  success: false,
  error: null,
  allSchools: [],
  branchProfileLoading: false,
  branchProfileSuccess: false,
  branchProfileError: null,
  branchProfile: null,
};


export const getSchoolBranch = createAsyncThunk(
  "registerSchoolBranch/getSchoolBranch",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        GET_A_SCHOOL_BRANCH,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          keepSessionOn401: true,
        },
        dispatch,
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load the school branch");
      }

      const data = await response.json();

      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to load the school branch",
      );
    }
  },
);

export const getAllSchoolBranches = createAsyncThunk(
  "registerSchoolBranch/getAllSchoolBranches",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        GET_ALL_SCHOOL_BRANCHES,
        {
          method: "GET",
          headers: { Accept: "application/json, ngrok-skip-browser-warning" },

          keepSessionOn401: true,
        },
        dispatch,
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load the school branches");
      }
       const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to load the registered schools",
      );
    }
  },
);

export const createSchoolBranches = createAsyncThunk(
  "registerSchoolBranch/createSchoolBranches",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      const fetchOptions = {
        method: "POST",
        body: isFormData ? payload : JSON.stringify(payload ?? {}),
      };

      if (!isFormData) {
        fetchOptions.headers = { "Content-Type": "application/json" };
      }

      const { response } = await fetchWithAuth(
        CREATE_SCHOOL_BRANCH,
        fetchOptions,
        dispatch,
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }

        throw errorPayload || {
          message: "Failed to register the school",
          status: response.status,
        };
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Unable to register the school",
      );
    }
  },
);

export const updateSchoolBranches = createAsyncThunk(
  "registerSchoolBranch/updateSchoolBranch",
  async ({ id, payload = {} } = {}, { rejectWithValue, dispatch }) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      const fetchOptions = {
        method: "PATCH",
        body: isFormData ? payload : JSON.stringify(payload ?? {}),
        headers: { Accept: "application/json" },
      };

      if (!isFormData) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          "Content-Type": "application/json",
        };
      }

      const { response } = await fetchWithAuth(
        UPDATE_SCHOOL_BRANCH,
        // `${UPDATE_SCHOOL_BRANCH}/${encodeURIComponent(id)}`,
        fetchOptions,
        dispatch
      );

      if (!response.ok) {
        const errorText = await response.text();

        let errorPayload;

        try {
          errorPayload = errorText
            ? JSON.parse(errorText)
            : null;
        } catch {
          errorPayload = errorText;
        }

        throw (
          errorPayload || {
            message: "Failed to update school branch",
          }
        );
      }

      const responseText = await response.text();

      try {
        return responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        return responseText;
      }
    } catch (error) {
      console.error(
        "Unable to update school branch:",
        error
      );

      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "Unable to update school branch"
      );
    }
  }
);

const registerSchoolBranch = createSlice({
  name: "registerSchoolBranch",
  initialState,
  reducers: {
    resetRegisterSchoolBranchState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ---- getSchoolBranch (single branch profile of the signed-in school) ----
      .addCase(getSchoolBranch.pending, (state) => {
        state.branchProfileLoading = true;
        state.branchProfileSuccess = false;
        state.branchProfileError = null;
      })
      .addCase(getSchoolBranch.fulfilled, (state, action) => {
        state.branchProfileLoading = false;
        state.branchProfileSuccess = true;
        state.branchProfile = action.payload ?? null;
      })
      .addCase(getSchoolBranch.rejected, (state, action) => {
        state.branchProfileLoading = false;
        state.branchProfileSuccess = false;
        state.branchProfileError =
          action.payload || "Unable to load the school branch";
      })
      // ---- getAllSchoolBranches ----
      .addCase(getAllSchoolBranches.pending, (state) => {
        state.getSchoolBranchLoading = true;
        state.getSchoolBranchSuccess = false;
        state.getSchoolBranchError = null;
      })
      .addCase(getAllSchoolBranches.fulfilled, (state, action) => {
        state.getSchoolBranchLoading = false;
        state.getSchoolBranchSuccess = true;
        // Tolerate both a raw array and a wrapped { data: [...] } response.
        state.allSchools = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.data ?? []);
      })
      .addCase(getAllSchoolBranches.rejected, (state, action) => {
        state.getSchoolBranchLoading = false;
        state.getSchoolBranchSuccess = false;
        state.getSchoolBranchError =
          action.payload || "Unable to load the school branches";
      })
      // ---- createSchoolBranches ----
      .addCase(createSchoolBranches.pending, (state) => {
        state.schoolBranchLoading = true;
        state.schoolBranchSuccess = false;
        state.error = null;
      })
      .addCase(createSchoolBranches.fulfilled, (state, action) => {
        state.schoolBranchLoading = false;
        state.schoolBranchSuccess = true;
        state.createdRecord = action.payload;
      })
      .addCase(createSchoolBranches.rejected, (state, action) => {
        state.schoolBranchLoading = false;
        state.schoolBranchSuccess = false;
        state.error = action.payload || "Unable to register the school branch";
      });
  },
});

export const { resetRegisterSchoolBranchState } = registerSchoolBranch.actions;
export default registerSchoolBranch.reducer;
