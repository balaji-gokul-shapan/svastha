import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  dentalScreeningData: [],
  filteredRecords: [],
  loading: false,
  filterLoading: false,
  success: false,
  error: null,
};

const  FILTER_DENTAL_SCREENINGS = "/api/v1/dental-test/filter";

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


export const getDentalScreening = createAsyncThunk(
  "dentalScreening/getDentalScreening",
  async ({ studentId, campId } = {}, { rejectWithValue, dispatch }) => {
    try {
      const normalizedStudentId = String(studentId ?? "").trim();
      if (!normalizedStudentId) {
        throw new Error(
          "Student ID is required to fetch dental screening data",
        );
      }

      // campId is optional: the student detail page reads the same endpoint
      // without a camp, and "all"/empty means "no camp filter".
      const normalizedCampId = String(campId ?? "").trim();
      const hasCamp = normalizedCampId && normalizedCampId !== "all";

      // Path form: /codings/student/{studentId}/{campId}
      // The camp segment is omitted entirely when no camp is active.
      const path = [
        "/api/v1/dental-test/codings/student",
        encodeURIComponent(normalizedStudentId),
        hasCamp ? encodeURIComponent(normalizedCampId) : null,
      ]
        .filter(Boolean)
        .join("/");

      const { response } = await fetchWithAuth(path, {}, dispatch);

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to fetch dental screening data");
      }

      const data = await response.json();
      return Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.items)
            ? data.data.items
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data?.results)
                ? data.results
                : Array.isArray(data?.records)
                  ? data.records
                  : data?.data && typeof data.data === "object"
                    ? [data.data]
                    : data && typeof data === "object"
                      ? [data]
                      : [];
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch dental screening data",
      );
    }
  },
);

export const filterDentalScreening = createAsyncThunk(
  "getDentalScreening/filterDentalScreening",
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

      // Path form: /dental-test/filter/{campId}/{class} — exactly two
      // segments. Empty / "all" class collapses to the literal "all".
      const classSegment = normalizedClass || "all";

      const url = [
        FILTER_DENTAL_SCREENINGS,
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
        const detail = await response.text();
        throw new Error(detail || "Failed to fetch filtered dental screening data");
      }

      const data = await response.json();
      return unwrapRows(data);
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch filtered dental screening data",
      );
    }
  },
);

const getDentalScreeningSlice = createSlice({
  name: "getDentalScreening",
  initialState,
  reducers: {
    resetDentalScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDentalScreening.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getDentalScreening.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.dentalScreeningData = action.payload;
      })
      .addCase(getDentalScreening.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch dental screening data";
      })
      .addCase(filterDentalScreening.pending, (state) => {
        state.filterLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(filterDentalScreening.fulfilled, (state, action) => {
        state.filterLoading = false;
        state.success = true;
        state.filteredRecords = action.payload;
      })
      .addCase(filterDentalScreening.rejected, (state, action) => {
        state.filterLoading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to fetch filtered dental screening data";
      });
  },
});

export const { resetDentalScreeningState } = getDentalScreeningSlice.actions;
export default getDentalScreeningSlice.reducer;
