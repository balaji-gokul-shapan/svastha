import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  createLoading: false,
  updateLoading: false,
  filterLoading: false,
  success: false,
  error: null,
  createdRecord: null,
  updatedRecord: null,
  filteredRecords: [],
};
const GET_ALL_ENT_SCREENINGS_REPORT = "/api/v1/ent-assessment/all";
const UPDATE_ENT_SCREENING_REPORT = "/api/v1/ent-assessment/update";
const CREATE_ENT_SCREENING_REPORT = "/api/v1/ent-assessment/create";
const FILTER_ENT_SCREENING_REPORT = "/api/v1/ent-assessment/filter";

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

export const getAllEntScreeningReport = createAsyncThunk(
  "registerEntScreening/getAllEntScreeningReport",
  async (params = {}, { getState, rejectWithValue, dispatch }) => {
    try {
      const endpoint = `${GET_ALL_ENT_SCREENINGS_REPORT}${buildQueryString(params)}`;
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
          errorPayload || { message: "Failed to fetch ENT screening report" }
        );
      }

      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to fetch ENT screening report" },
      );
    }
  },
);

export const updateEntScreening = createAsyncThunk(
  "registerEntScreening/updateEntScreening",
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

      const endpoint = `${UPDATE_ENT_SCREENING_REPORT}/${encodeURIComponent(normalizedId)}`;
      const { response } = await fetchWithAuth(endpoint, options, dispatch);

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }

        throw errorPayload || { message: "Failed to update ENT screening" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to update ENT screening" },
      );
    }
  },
);

// Normalize any list response into a plain array of rows. Handles the direct
// array, Laravel's { data: [...] }, the paginated { data: { data: [...] } }
// envelope these routes return, { items } / { results } / { records }, and a
// single row delivered as a bare object. Nested envelopes are unwrapped
// recursively so `data.data`, `data.items`, etc. all resolve.
const unwrapRows = (source) => {
  if (Array.isArray(source)) {
    return source;
  }

  if (!source || typeof source !== "object") {
    return [];
  }

  for (const key of ["data", "items", "results", "records", "rows"]) {
    const nested = source[key];

    if (Array.isArray(nested)) {
      return nested;
    }

    if (nested && typeof nested === "object") {
      const unwrapped = unwrapRows(nested);

      if (unwrapped.length) {
        return unwrapped;
      }
    }
  }

  // A single record (has an id but no list wrapper) is still useful.
  return source.id != null ? [source] : [];
};

export const filterEntScreening = createAsyncThunk(
  "registerEntScreening/filterEntScreening",
  async (
    { campId, class: classFilter, section: sectionFilter } = {},
    { rejectWithValue, dispatch },
  ) => {
    try {
      const normalizedCampId = String(campId ?? "").trim();
      const normalizedClass = String(classFilter ?? "").trim();
      const normalizedSection = String(sectionFilter ?? "").trim();

      if (!normalizedCampId) {
        return rejectWithValue("A camp is required to filter screenings.");
      }

      // Path form: /ent-assessment/filter/{campId}/{class} — exactly two
      // segments. Empty / "all" class collapses to the literal "all".
      const classSegment = normalizedClass || "all";

      const url = [
        FILTER_ENT_SCREENING_REPORT,
        encodeURIComponent(normalizedCampId),
        encodeURIComponent(classSegment),
      ].join("/");

      // Section is not a path segment; it rides as a query param when set.
      const finalUrl =
        normalizedSection && normalizedSection !== "all"
          ? `${url}?section=${encodeURIComponent(normalizedSection)}`
          : url;

      const { response } = await fetchWithAuth(finalUrl, {}, dispatch);

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = errorText;
        }

        throw errorPayload || { message: "Failed to filter ENT screening" };
      }

      return unwrapRows(await response.json());
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to filter ENT screening" },
      );
    }
  },
);

export const createEntScreening = createAsyncThunk(
  "registerEntScreening/createEntScreening",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const endpoint = `${CREATE_ENT_SCREENING_REPORT}`;

      const { response } = await fetchWithAuth(
        endpoint,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload ?? {}),
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

        throw errorPayload || { message: "Failed to create ENT screening" };
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error || { message: "Unable to create ENT screening" },
      );
    }
  },
);

const registerEntScreeningSlice = createSlice({
  name: "registerEntScreening",
  initialState,
  reducers: {
    resetRegisterEntScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEntScreening.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createEntScreening.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
      })
      .addCase(createEntScreening.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create ENT screening";
      })
      .addCase(updateEntScreening.pending, (state) => {
        state.updateLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateEntScreening.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.updatedRecord = action.payload;
      })
      .addCase(updateEntScreening.rejected, (state, action) => {
        state.updateLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to update ENT screening";
      })
      .addCase(filterEntScreening.pending, (state) => {
        state.filterLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(filterEntScreening.fulfilled, (state, action) => {
        state.filterLoading = false;
        state.success = true;
        state.filteredRecords = action.payload;
      })
      .addCase(filterEntScreening.rejected, (state, action) => {
        state.filterLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to filter ENT screening";
      });
  },
});

export const { resetRegisterEntScreeningState } =
  registerEntScreeningSlice.actions;

export default registerEntScreeningSlice.reducer;
