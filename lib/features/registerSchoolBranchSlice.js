import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const GET_ALL_SCHOOL_BRANCHES = "/schools/branch/create";
const CREATE_SCHOOL_BRANCH = "/schools/branch/all";

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
};

export const getAllSchoolBranches = createAsyncThunk(
  "registerSchoolBranch/getAllSchoolBranches",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        GET_ALL_SCHOOL_BRANCHES,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
        dispatch,
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load the school branches");
      }
      return await response.json();
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
        throw new Error(errorText || "Failed to register the school");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "Unable to register the school");
    }
  },
);

const registerSchoolBranch = createSlice({
  name: "registerSchoolBranch",
  initialState,
  reducers: {
    resetRegisterSchoolBranchState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
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
