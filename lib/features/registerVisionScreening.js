import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  createLoading: false,
  success: false,
  error: null,
  createdRecord: null,
};
const UPDATE_VISION_SCREENING_REPORT = "/api/v1/vision-test/update";
const GET_ALL_VISION_SCREENING_REPORT = "/api/v1/vision-test/all";

// Optional query params (page, per_page, camp_id, …). Empty values are skipped
// so the request never sends `?key=undefined`. The backend paginates this list,
// answering with current_page / per_page / last_page / total / from / to.
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



export const getAllVisionScreeningReport = createAsyncThunk(
  "registerVisionScreening/getAllVisionScreeningReport",
  async (params = {}, { getState, rejectWithValue, dispatch }) => {
    try {
      const endpoint = `${GET_ALL_VISION_SCREENING_REPORT}${buildQueryString(params)}`;
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

        throw errorPayload || { message: "Failed to fetch vision screening report" };
      }

      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to fetch vision screening report" },
      );
    }
  },
);

export const updateVisionScreening = createAsyncThunk(
  "registerVisionScreening/updateVisionScreening",
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

      const endpoint = `${UPDATE_VISION_SCREENING_REPORT}/${encodeURIComponent(normalizedId)}`;
      const { response } = await fetchWithAuth(endpoint, options, dispatch);

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }

        throw errorPayload || { message: "Failed to update vision screening" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to update vision screening" },
      );
    }
  },
);


export const createVisionScreening = createAsyncThunk(
  "registerVisionScreening/createVisionScreening",
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        "/api/vision-test/create",
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

        throw errorPayload || { message: "Failed to create vision screening" };
      }

      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to create vision screening" },
      );
    }
  },
);

const registerVisionScreeningSlice = createSlice({
  name: "registerVisionScreening",
  initialState,
  reducers: {
    resetRegisterVisionScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVisionScreening.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createVisionScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createVisionScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create vision screening";
      })
      .addCase(updateVisionScreening.pending, (state) => {
        state.updateLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateVisionScreening.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.updatedRecord = action.payload;
      })
      .addCase(updateVisionScreening.rejected, (state, action) => {
        state.updateLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to update vision screening";
      });
  },
});

export const { resetRegisterVisionScreeningState } = registerVisionScreeningSlice.actions;

export default registerVisionScreeningSlice.reducer;
