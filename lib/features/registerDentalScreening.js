import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  createLoading: false,
  success: false,
  error: null,
  createdRecord: null,
};

const GET_DENTAL_REPORT = "/api/v1/dental-test/all";
const UPDATE_DENTAL_REPORT = "/api/v1/dental-test/update";
const CREATE_DENTAL_REPORT = "/api/v1/dental-test/create";
// const FILTER_DENTAL_REPORT = "/api/v1/dental-test/filter";


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

export const getAllDentalScreeningReports = createAsyncThunk(
  "registerDentalScreening/getAllDentalScreeningReports",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const endpoint = `${GET_DENTAL_REPORT}${buildQueryString(params)}`;
      const { response } = await fetchWithAuth(endpoint, {}, dispatch);

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
            message: "Failed to fetch dental screening reports",
          }
        );
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to fetch dental screening reports" },
      );
    }
  },
);

export const updateDentalScreening = createAsyncThunk(
  "registerDentalScreening/updateDentalScreening",
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

      const endpoint = `${UPDATE_DENTAL_REPORT}/${encodeURIComponent(normalizedId)}`;
      const { response } = await fetchWithAuth(endpoint, options, dispatch);

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }

        throw errorPayload || { message: "Failed to update dental screening" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to update dental screening" },
      );
    }
  },
);

export const createDentalScreening = createAsyncThunk(
  "registerDentalScreening/createDentalScreening",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { response } = await fetchWithAuth(
        CREATE_DENTAL_REPORT,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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

        throw errorPayload || { message: "Failed to create dental screening" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to create dental screening" },
      );
    }
  },
);

// export const filterDentalScreening = createAsyncThunk(
//   "registerDentalScreening/filterDentalScreening",
//   async ({payload,}, { rejectWithValue, dispatch }) => {
//     try {
//       const { response } = await fetchWithAuth(
//         FILTER_DENTAL_REPORT,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         },
//         dispatch,
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         let errorPayload;

//         try {
//           errorPayload = errorText ? JSON.parse(errorText) : null;
//         } catch {
//           errorPayload = errorText;
//         }

//         throw errorPayload || { message: "Failed to filter dental screening" };
//       }

//       return await response.json();
//     } catch (error) {
//       return rejectWithValue(
//         error || { message: "Unable to filter dental screening" },
//       );
//     }
//   },
// );

const registerDentalScreeningSlice = createSlice({
  name: "registerDentalScreening",
  initialState,
  reducers: {
    resetRegisterDentalScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDentalScreening.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createDentalScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createDentalScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create dental screening";
      })
      // .addCase(filterDentalScreening.pending, (state) => {
      //   state.filterLoading = true;
      //   state.success = false;
      //   state.error = null;
      // })
      // .addCase(filterDentalScreening.fulfilled, (state, action) => {
      //   state.filterLoading = false;
      //   state.success = true;
      //   state.filteredRecords = action.payload;
      // })
      // .addCase(filterDentalScreening.rejected, (state, action) => {
      //   state.filterLoading = false;
      //   state.success = false;
      //   state.error = action.payload || "Unable to filter dental screening";
      // })
      .addCase(updateDentalScreening.pending, (state) => {
        state.updateLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateDentalScreening.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.updatedRecord = action.payload;
      })
      .addCase(updateDentalScreening.rejected, (state, action) => {
        state.updateLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to update dental screening";
      });
  },
});

export const { resetRegisterDentalScreeningState } =
  registerDentalScreeningSlice.actions;

export default registerDentalScreeningSlice.reducer;
