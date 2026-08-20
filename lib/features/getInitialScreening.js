// http://localhost:5000/initial-Screening
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  studentData: [],
  total: 0,
  page: 1,
  limit: 10,
  activeQueryKey: "",
  loading: false,
  success: false,
  error: null,
};

function normalizeStudent(student = {}) {
  const gradeParts = [student.class, student.sec].filter(Boolean);

  return {
    ...student,
    studentId:
      student.studentId ??
      student.school_registration_number ??
      student.admission_number ??
      (student.id !== null && student.id !== undefined ? String(student.id) : ""),
    name: student.name ?? student.student_name ?? "",
    grade: student.grade ?? (gradeParts.length ? gradeParts.join("-") : ""),
    Class: student.class ?? student.grade ?? "",
    sec: student.sec ?? student.section ?? "",
    guardianPhone:
      student.guardianPhone ??
      student.father_contact_number ??
      student.mother_contact_number ??
      "",
    fatherName: student.fatherName ?? student.father_name ?? "",
    motherName: student.motherName ?? student.mother_name ?? "",
    status: student.status ?? "Pending",
  };
}



function getQueryKey(args = {}) {
  const {
    all = false,
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    sortBy = "name",
    sortOrder = "asc",
  } = args;

  return JSON.stringify({
    all,
    page,
    limit,
    search: String(search).trim(),
    status,
    sortBy,
    sortOrder,
  });
}

export const getInitialScreening = createAsyncThunk(
  "initialScreening/getInitialScreening",
  async (
    {
      all = false,
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      sortBy = "name",
      sortOrder = "asc",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        _sort: sortBy,
        _order: sortOrder,
      });

      if (!all) {
        params.set("_page", String(page));
        params.set("_limit", String(limit));
      }

      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        params.set("q", trimmedSearch);
      }

      if (status !== "all") {
        params.set("status", status);
      }

      const response = await fetch(`http://localhost:5000/initial-Screening?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch student data");
      }

      const data = await response.json();
      const headerTotal = Number(response.headers.get("x-total-count"));
      const items = Array.isArray(data) ? data.map((student) => normalizeStudent(student)) : [];

      return {
        items,
        total: Number.isFinite(headerTotal) ? headerTotal : items.length,
        page: all ? 1 : page,
        limit: all ? items.length : limit,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Unable to fetch student data");
    }
  },
  {
    condition: (args = {}, { getState }) => {
      const state = getState();
      const { loading, activeQueryKey } = state.getInitialScreening || {};
      const nextQueryKey = getQueryKey(args);

      // Skip duplicate in-flight request with exactly the same query params.
      if (loading && activeQueryKey === nextQueryKey) {
        return false;
      }

      return true;
    },
  }
);

const getInitialScreeningSlice = createSlice({
  name: "getInitialScreening",
  initialState,
  reducers: {
    resetGetInitialScreeningState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInitialScreening.pending, (state, action) => {
        state.loading = true;
        state.activeQueryKey = getQueryKey(action.meta.arg);
        state.success = false;
        state.error = null;
      })
      .addCase(getInitialScreening.fulfilled, (state, action) => {
        state.loading = false;
        state.activeQueryKey = "";
        state.studentData = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.success = true;
      })
      .addCase(getInitialScreening.rejected, (state, action) => {
        state.loading = false;
        state.activeQueryKey = "";
        state.error = action.payload || "Unable to fetch student data";
        state.success = false;
      });
  },
});

export const { resetGetInitialScreeningState } = getInitialScreeningSlice.actions;
export default getInitialScreeningSlice.reducer;
