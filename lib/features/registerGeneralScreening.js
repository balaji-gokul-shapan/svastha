import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  getAllLoading: false,
  getAllSuccess: false,
  getAllError: null,
  allScreeningRecords: [],
  createLoading: false,
  updateLoading: false,
  success: false,
  error: null,
  createdRecord: null,
  updatedRecord: null,
};

const GET_ALL_SCREENING = "/api/v1/general-screenings";
const UPDATE_GENERAL_SCREENING = "/api/general-screenings/update";

export const getAllScreeningRecord = createAsyncThunk(
  "registerGeneralScreening/getAllInitialScreenings",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      // Optional query params (page, per_page, search, …). Empty values are
      // skipped so the request never sends `?key=undefined`.
      const searchParams = new URLSearchParams();

      Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        searchParams.set(key, String(value));
      });

      const queryString = searchParams.toString();
      const endpoint = queryString
        ? `${GET_ALL_SCREENING}?${queryString}`
        : GET_ALL_SCREENING;

      const { response } = await fetchWithAuth(
        endpoint,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          keepSessionOn401: true,
        },
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

        throw errorPayload || { message: "Failed to load screening records" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to load screening records" },
      );
    }
  },
);

export const createInitialScreening = createAsyncThunk(
  "registerGeneralScreening/createInitialScreening",
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

      const endpoint = `/api/general-screenings`;

      const { response } = await fetchWithAuth(endpoint, options, dispatch);

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }

        throw errorPayload || { message: "Failed to create general screening" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to create general screening" },
      );
    }
  },
);

export const updateInitialScreening = createAsyncThunk(
  "registerGeneralScreening/updateInitialScreening",
  async ({ id, student_id, ...data }, { rejectWithValue, dispatch }) => {
    try {
      const targetId = id || student_id;
      const normalizedId = String(targetId ?? "").trim();
      if (!normalizedId) {
        throw new Error("Screening or Student ID is required for update");
      }

      const isFormData =
        typeof FormData !== "undefined" && data instanceof FormData;

      // Include student_id in the body since the server expects it
      const bodyData = { ...data, student_id };
      const options = {
        method: "PATCH",
        body: isFormData ? data : JSON.stringify(bodyData ?? {}),
      };
      if (!isFormData) {
        options.headers = { "Content-Type": "application/json" };
      }

      const endpoint = `${UPDATE_GENERAL_SCREENING}/${encodeURIComponent(normalizedId)}`;
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

const registerGeneralScreeningSlice = createSlice({
  name: "registerGeneralScreening",
  initialState,
  reducers: {
    resetRegisterGeneralScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ---- getAllScreeningRecord ----
      .addCase(getAllScreeningRecord.pending, (state) => {
        state.getAllLoading = true;
        state.getAllSuccess = false;
        state.getAllError = null;
      })
      .addCase(getAllScreeningRecord.fulfilled, (state, action) => {
        state.getAllLoading = false;
        state.getAllSuccess = true;
        // Tolerate every common response shape: a raw array, { data: [...] },
        // or a paginated { data: { data: [...] } }.
        state.allScreeningRecords = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.data)
            ? action.payload.data
            : Array.isArray(action.payload?.data?.data)
              ? action.payload.data.data
              : [];
      })
      .addCase(getAllScreeningRecord.rejected, (state, action) => {
        state.getAllLoading = false;
        state.getAllSuccess = false;
        state.getAllError =
          action.payload || "Unable to load screening records";
      })
      .addCase(createInitialScreening.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createInitialScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createInitialScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create initial screening";
      })
      .addCase(updateInitialScreening.pending, (state) => {
        state.updateLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateInitialScreening.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.updatedRecord = action.payload;
      })
      .addCase(updateInitialScreening.rejected, (state, action) => {
        state.updateLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to update initial screening";
      });
  },
});

export const { resetRegisterGeneralScreeningState } =
  registerGeneralScreeningSlice.actions;

export default registerGeneralScreeningSlice.reducer;
