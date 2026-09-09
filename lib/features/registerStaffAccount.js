import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  allSubAccounts: [],
  subAccountsLoading: false,
  subAccountsSuccess: false,
  subAccountsError: null,
  createLoading: false,
  createSuccess: false,
  createError: null,
  createSubAccountData: {},
  deleteLoading: false,
  deleteSuccess: false,
  deleteError: null,
};

const CREATE_SUB_ACCOUNT = "api/v1/school_acc/sub-acc/create";
const GET_ALL_SUB_ACCOUNT = "api/v1/school_acc/sub-acc/all";
const DELETE_SUB_ACCOUNT = "api/v1/school_acc/sub-acc";

export const getAllSubAccount = createAsyncThunk(
  "registerStaffAccount/getAllSubAccount",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        searchParams.set(key, String(value));
      });

      const queryString = searchParams.toString();
      const url = queryString
        ? `${GET_ALL_SUB_ACCOUNT}?${queryString}`
        : GET_ALL_SUB_ACCOUNT;

      const { response } = await fetchWithAuth(url, {}, dispatch);

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to fetch sub accounts");
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch sub accounts");
    }
  },
);

export const createSubAccount = createAsyncThunk(
  "registerStaffAccount/createSubAccount",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      const options = {
        method: "POST",
        body: isFormData ? payload : JSON.stringify(payload ?? {}),
      };

      if (!isFormData) {
        options.headers = { "Content-Type": "application/json" };
      }

      const { response } = await fetchWithAuth(
        CREATE_SUB_ACCOUNT,
        options,
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

        throw errorPayload || { message: "Failed to create sub account" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to create sub account",
      );
    }
  },
);

export const deleteSubAccount = createAsyncThunk(
  "registerStaffAccount/deleteSubAccount",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        `${DELETE_SUB_ACCOUNT}/${id}`,
        { method: "DELETE" },
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

        throw errorPayload || { message: "Failed to delete sub account" };
      }

      // Some backends return 204 No Content on delete.
      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to delete sub account",
      );
    }
  },
);

const registerStaffAccountSlice = createSlice({
  name: "registerStaffAccount",
  initialState,
  reducers: {
    resetRegisterStaffAccountState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ---- getAllSubAccount ----
      .addCase(getAllSubAccount.pending, (state) => {
        state.subAccountsLoading = true;
        state.subAccountsSuccess = false;
        state.subAccountsError = null;
      })
      .addCase(getAllSubAccount.fulfilled, (state, action) => {
        state.subAccountsLoading = false;
        state.subAccountsSuccess = true;
        // Tolerate both a raw array and a wrapped { data: [...] } response.
        state.allSubAccounts = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.data ?? []);
      })
      .addCase(getAllSubAccount.rejected, (state, action) => {
        state.subAccountsLoading = false;
        state.subAccountsSuccess = false;
        state.subAccountsError =
          action.payload || "Unable to fetch sub accounts";
      })
      // ---- createSubAccount ----
      .addCase(createSubAccount.pending, (state) => {
        state.createLoading = true;
        state.createSuccess = false;
        state.createError = null;
      })
      .addCase(createSubAccount.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.createSubAccountData = action.payload;
      })
      .addCase(createSubAccount.rejected, (state, action) => {
        state.createLoading = false;
        state.createSuccess = false;
        state.createError = action.payload || "Unable to create sub account";
      })
      // ---- deleteSubAccount ----
      .addCase(deleteSubAccount.pending, (state) => {
        state.deleteLoading = true;
        state.deleteSuccess = false;
        state.deleteError = null;
      })
      .addCase(deleteSubAccount.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
      })
      .addCase(deleteSubAccount.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = false;
        state.deleteError = action.payload || "Unable to delete sub account";
      });
  },
});

export const { resetRegisterStaffAccountState } =
  registerStaffAccountSlice.actions;

export default registerStaffAccountSlice.reducer;
