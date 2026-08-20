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
    // guardian: student.guardian ?? student.father_name ?? student.mother_name ?? "",
    guardianPhone:
      student.guardianPhone ??
      student.father_contact_number ??
      student.mother_contact_number ??
      "",
    fatherName:
      student.fatherName ??
      student.father_name ??
      "",
    motherName:
      student.motherName ??
      student.mother_name ??
      "",
    status: student.status ?? "Pending",
  };
}

function getQueryKey(args = {}) {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    classFilter = "all",
    sectionFilter = "all",
    sortBy = "name",
    sortOrder = "asc",
  } = args;

  return JSON.stringify({
    page,
    limit,
    search: String(search).trim(),
    status,
    classFilter,
    sectionFilter,
    sortBy,
    sortOrder,
  });
}

export const getAllStudent = createAsyncThunk(
  "studentData/getAllStudent",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      classFilter = "all",
      sectionFilter = "all",
      sortBy = "name",
      sortOrder = "asc",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        _page: String(page),
        _limit: String(limit),
        _sort: sortBy,
        _order: sortOrder,
      });

      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        params.set("q", trimmedSearch);
      }

      if (status !== "all") {
        params.set("status", status);
      }

      if (classFilter !== "all") {
        params.set("class", classFilter);
      }

      if (sectionFilter !== "all") {
        params.set("sec", sectionFilter);
      }

      const response = await fetch(`http://localhost:5000/students?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch student data");
      }

      const data = await response.json();
      const headerTotal = Number(response.headers.get("x-total-count"));
      const items = Array.isArray(data) ? data.map((student) => normalizeStudent(student)) : [];
      const filteredItems = items.filter((student) => {
        const classValue = String(student?.Class ?? student?.class ?? student?.grade ?? "").trim();
        const sectionValue = String(student?.sec ?? student?.section ?? "").trim();

        const classMatch = classFilter === "all" || classValue === classFilter;
        const sectionMatch = sectionFilter === "all" || sectionValue === sectionFilter;

        return classMatch && sectionMatch;
      });

      return {
        items: filteredItems,
        total: Number.isFinite(headerTotal) && classFilter === "all" && sectionFilter === "all"
          ? headerTotal
          : filteredItems.length,
        page,
        limit,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Unable to fetch student data");
    }
  },
  {
    condition: (args = {}, { getState }) => {
      const state = getState();
      const { loading, activeQueryKey } = state.getAllStudent || {};
      const nextQueryKey = getQueryKey(args);

      // Skip duplicate in-flight request with exactly the same query params.
      if (loading && activeQueryKey === nextQueryKey) {
        return false;
      }

      return true;
    },
  }
);

const getAllStudentSlice = createSlice({
  name: "getAllStudent",
  initialState,
  reducers: {
    resetGetAllStudentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllStudent.pending, (state, action) => {
        state.loading = true;
        state.activeQueryKey = getQueryKey(action.meta.arg);
        state.success = false;
        state.error = null;
      })
      .addCase(getAllStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.activeQueryKey = "";
        state.studentData = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.success = true;
      })
      .addCase(getAllStudent.rejected, (state, action) => {
        state.loading = false;
        state.activeQueryKey = "";
        state.error = action.payload || "Unable to fetch student data";
        state.success = false;
      });
  },
});

export const { resetGetAllStudentState } = getAllStudentSlice.actions;
export default getAllStudentSlice.reducer;
