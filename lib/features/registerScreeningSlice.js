import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  screeningData: {},
  createLoading: false,
  createSuccess: false,
  createError: null,
  getLoading: false,
  getSuccess: false,
  getError: null,
  updateLoading: false,
  updateSuccess: false,
  updateError: null,
};

const CREATE_NEW_SCREENING = "/api/v1/student-referrals/screening-requests";
const GET_ALL_SCREENING = "/api/v1/student-referrals/screening-requests";
const SREENING_RECORD_BY_ID = "/api/v1/student-referrals/screening-requests";

export const getAllScreening = createAsyncThunk(
  "registerScreening/getAllScreening",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        GET_ALL_SCREENING,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
        dispatch,
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || "Failed to load the screening request data(s)",
        );
      }
      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to load the screening request data(s)",
      );
    }
  },
);

export const createScreening = createAsyncThunk(
  "registerScreening/createScreening",
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
        CREATE_NEW_SCREENING,
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

        throw (
          errorPayload || {
            message: "Failed to register the screening request",
            status: response.status,
          }
        );
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Unable to register the screening request",
      );
    }
  },
);

export const getScreeningById = createAsyncThunk(
  "registerScreening/getScreeningById",
  async ({ id, payload }, { rejectWithValue, dispatch }) => {
    try {
      const targetId = id;
      const normalizedId = String(targetId ?? "").trim();
      if (!normalizedId) {
        throw new Error("Screening or Student ID is required for update");
      }

      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      const options = {
        method: "PUT",
        body: isFormData ? payload : JSON.stringify(payload ?? {}),
      };
      if (!isFormData) {
        options.headers = { "Content-Type": "application/json" };
      }

      const endpoint = `${SREENING_RECORD_BY_ID}/${encodeURIComponent(normalizedId)}`;
      const { response } = await fetchWithAuth(endpoint, options, dispatch);

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }

        throw errorPayload || { message: "Failed to update general screening" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to update general screening" },
      );
    }
  },
);

const registerScreening = createSlice({
  name: "registerScreening",
  initialState,
  reducers: {
    registerScreeningSliceState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllScreening.pending, (state) => {
        state.getLoading = true;
        state.getSuccess = false;
        state.getError = null;
      })
      .addCase(getAllScreening.fulfilled, (state, action) => {
        state.getLoading = false;
        state.getSuccess = true;
        state.screeningData = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.data ?? []);
      })
      .addCase(getAllScreening.rejected, (state, action) => {
        state.getLoading = false;
        state.getSuccess = false;
        state.getError = action.payload || "Unable to load the screening data";
      })
      .addCase(createScreening.pending, (state) => {
        state.createLoading = true;
        state.createSuccess = false;
        state.createError = null;
      })
      .addCase(createScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.createdRecord = action.payload;
      })
      .addCase(createScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.createSuccess = false;
        state.createError =
          action.payload || "Unable to register the screening dataD";
      })
      // ---- getScreeningById ----
      .addCase(getScreeningById.pending, (state) => {
        state.updateLoading = true;
        state.updateSuccess = false;
        state.updateError = null;
      })
      .addCase(getScreeningById.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.screeningData = action.payload;
      })
      .addCase(getScreeningById.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = false;
        state.updateError =
          action.payload || "Unable to update the screening data";
      });
  },
});
export const { registerScreeningSliceState } = registerScreening.actions;
export default registerScreening.reducer;
