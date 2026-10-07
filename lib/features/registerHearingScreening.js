import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  createLoading: false,
  success: false,
  error: null,
  createdRecord: null,
};

const GET_ALL_HEARING_SCREENINGS_REPORT = "/api/v1/hear-test/all";
const UPDATE_HEARING_SCREENING = "/api/v1/hear-test/update";
const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const updateHearingScreening = createAsyncThunk(
  "registerHearingScreening/updateHearingScreening",
  async ({ id, student_id, ...data }, { getState, rejectWithValue, dispatch }) => {
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

      const endpoint = `${UPDATE_HEARING_SCREENING}/${encodeURIComponent(normalizedId)}`;
      const { response } = await fetchWithAuth(endpoint, options, dispatch);

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }

        throw errorPayload || { message: "Failed to update hearing screening" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to update hearing screening" },
      );
    }
  },
);

export const getAllHearingScreeningReport = createAsyncThunk(
  "registerHearingScreening/getAllHearingScreeningReport",
  async (params = {}, { getState, rejectWithValue, dispatch }) => {
    try {
      const endpoint = `${GET_ALL_HEARING_SCREENINGS_REPORT}${buildQueryString(params)}`;
      const { response } = await fetchWithAuth(
        endpoint,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          keepSessionOn401: true,
        },
        dispatch,
      );
      const body = await response.text();
      if (!response.ok) {
        let errorPayload;

        try {
          errorPayload = body ? JSON.parse(body) : null;
        } catch {
          errorPayload = body;
        }

        throw (
          errorPayload || {
            message: "Failed to fetch hearing screening report",
          }
        );
      }

      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to fetch hearing screening report" },
      );
    }
  },
);

export const createHearingScreening = createAsyncThunk(
  "registerHearingScreening/createHearingScreening",
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        "/api/v1/hear-test/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        dispatch,
      );
      const body = await response.text();
      if (!response.ok) {
        let errorPayload;

        try {
          errorPayload = body ? JSON.parse(body) : null;
        } catch {
          errorPayload = body;
        }

        throw errorPayload || { message: "Failed to create hearing screening" };
      }

      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to create hearing screening" },
      );
    }
  },
);

const registerHearScreeningSlice = createSlice({
  name: "registerHearingScreening",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createHearingScreening.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createHearingScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createHearingScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create hearing screening";
      })
      .addCase(updateHearingScreening.pending, (state) => {
        state.updateLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateHearingScreening.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.updatedRecord = action.payload;
      })
      .addCase(updateHearingScreening.rejected, (state, action) => {
        state.updateLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to update hearing screening";
      });
  },
});

export default registerHearScreeningSlice.reducer;
