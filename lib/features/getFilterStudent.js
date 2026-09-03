import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  studentData: [],
  total: 0,
  page: 1,
  limit: 10,
  search: "",
  status: "all",
  schoolName: "all",
  academicYear: "all",
  classFilter: "all",
  sectionFilter: "all",
  sortBy: "name",
  sortOrder: "asc",
  activeQueryKey: "",
  loading: false,
  success: false,
  error: null,
};

function normalizeStudent(student = {}) {
  const classValue = String(
    student?.class ?? student?.Class ?? student?.grade ?? "",
  ).trim();
  const sectionValue = String(student?.sec ?? student?.section ?? "").trim();
  const combinedClassMatch =
    !sectionValue && classValue.match(/^(.*)-([A-Za-z]\d*)$/);
  const normalizedClass = (combinedClassMatch?.[1] ?? classValue).trim();
  const normalizedSection = (combinedClassMatch?.[2] ?? sectionValue).trim();

  return {
    ...student,
    id: student?.id ?? student?.studentId ?? student?.student_id ?? "",
    studentId:
      student?.studentId ??
      student?.student_id ??
      student?.school_registration_number ??
      student?.admission_number ??
      (student?.id !== null && student?.id !== undefined ? String(student.id) : ""),
    name: student?.name ?? student?.student_name ?? student?.studentName ?? "",
    Class: normalizedClass,
    sec: normalizedSection,
    status: student?.status ?? "Pending",
  };
}

function getQueryKey(args = {}) {
  const {
    page = 1,
    limit = 10,
    schoolId = "",
    search = "",
    status = "all",
    schoolName = "all",
    academicYear = "all",
    classFilter = "all",
    sectionFilter = "all",
    sortBy = "name",
    sortOrder = "asc",
  } = args;

  return JSON.stringify({
    page,
    limit,
    schoolId,
    search: String(search).trim(),
    status,
    schoolName,
    academicYear,
    classFilter,
    sectionFilter,
    sortBy,
    sortOrder,
  });
}

export const getFilterStudent = createAsyncThunk(
  "filterStudent/getFilterStudent",
  async (
    {
      page = 1,
      limit = 10000,
      schoolId = "",
      search = "",
      status = "all",
      schoolName = "all",
      academicYear = "all",
      classFilter = "all",
      sectionFilter = "all",
      sortBy = "name",
      sortOrder = "asc",
    } = {},
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const headers = {};
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", String(limit));
      params.set("sortBy", String(sortBy));
      params.set("sortOrder", String(sortOrder));

      if (schoolId !== "") {
        params.set("school_id", String(schoolId));
      }

      const trimmedSearch = String(search).trim();
      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      if (status !== "all") {
        params.set("status", status);
      }

      if (schoolName !== "all") {
        params.set("school", schoolName);
      }

      if (academicYear !== "all") {
        params.set("academic_year", academicYear);
      }

      if (classFilter !== "all") {
        params.set("class", classFilter);
      }

      if (sectionFilter !== "all") {
        params.set("sec", sectionFilter);
      }

      const { response } = await fetchWithAuth(`/api/students/filter?${params.toString()}`, {
        headers,
      }, dispatch);

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to fetch filtered students");
      }

      const data = await response.json();
      const rawItems = Array.isArray(data)
        ? data
        : Array.isArray(data?.data?.data)
          ? data.data.data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data?.students)
                ? data.students
                : Array.isArray(data?.data?.students)
                  ? data.data.students
                  : [];

      const items = rawItems.map((student) => normalizeStudent(student));

      const parsedTotal = Number(data?.data?.total) || Number(data?.total) || Number(data?.count);
      const total = Number.isFinite(parsedTotal) ? parsedTotal : items.length;

      return {
        items,
        total: Number.isFinite(total) ? total : items.length,
        page,
        limit,
        search,
        status,
        schoolName,
        academicYear,
        classFilter,
        sectionFilter,
        sortBy,
        sortOrder,
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to fetch filtered students"
      );
    }
  },
  {
    condition: (args = {}, { getState }) => {
      const state = getState();
      const { loading, activeQueryKey } = state.getFilterStudent || {};
      const nextQueryKey = getQueryKey(args);

      if (loading && activeQueryKey === nextQueryKey) {
        return false;
      }

      return true;
    },
  }
);

const getFilterStudentSlice = createSlice({
  name: "getFilterStudent",
  initialState,
  reducers: {
    resetGetFilterStudentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFilterStudent.pending, (state, action) => {
        state.loading = true;
        state.activeQueryKey = getQueryKey(action.meta.arg);
        state.success = false;
        state.error = null;
      })
      .addCase(getFilterStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.activeQueryKey = "";
        state.success = true;
        state.studentData = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.search = action.payload.search;
        state.status = action.payload.status;
        state.schoolName = action.payload.schoolName;
        state.academicYear = action.payload.academicYear;
        state.classFilter = action.payload.classFilter;
        state.sectionFilter = action.payload.sectionFilter;
        state.sortBy = action.payload.sortBy;
        state.sortOrder = action.payload.sortOrder;
      })
      .addCase(getFilterStudent.rejected, (state, action) => {
        state.loading = false;
        state.activeQueryKey = "";
        state.success = false;
        state.error = action.payload || "Unable to fetch filtered students";
      });
  },
});

export const { resetGetFilterStudentState } = getFilterStudentSlice.actions;
export default getFilterStudentSlice.reducer;
