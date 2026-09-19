import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

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

  const primaryId =
    student.cus_id ??
    student.id ??
    student.studentId ??
    student.school_registration_number ??
    student.admission_number ??
    "";

  return {
    ...student,
    studentId: primaryId !== "" && primaryId !== null && primaryId !== undefined ? String(primaryId) : "",
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
    academicYear = "2026-2027",
    schoolName = "all",
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
    academicYear,
    schoolName,
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
      academicYear = "2026-2027",
      schoolName = "all",
      search = "",
      status = "all",
      classFilter = "all",
      sectionFilter = "all",
      sortBy = "name",
      sortOrder = "asc",
    } = {},
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        per_page: String(limit),
        academic_year: academicYear,
      });

      if (schoolName !== "all") {
        params.set("school", schoolName);
      }

      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        params.set("q", trimmedSearch);
        params.set("search", trimmedSearch);
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

      if (sortBy) {
        params.set("sortBy", sortBy);
      }

      if (sortOrder) {
        params.set("sortOrder", sortOrder);
      }

      const { response } = await fetchWithAuth(`/api/students/filter?${params.toString()}`, {}, dispatch);

      if (!response.ok) {
        let detail = "Failed to fetch student data";
        const errorText = await response.text();

        try {
          const errorPayload = JSON.parse(errorText);
          detail = errorPayload?.detail || errorPayload?.message || detail;
        } catch {
          detail = errorText || detail;
        }

        throw new Error(
          typeof detail === "string" ? detail : JSON.stringify(detail),
        );
      }

      const data = await response.json();
      const headerTotal = Number(response.headers.get("x-total-count"));
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
      const filteredItems = items.filter((student) => {
        const classValue = String(student?.Class ?? student?.class ?? student?.grade ?? "").trim();
        const sectionValue = String(student?.sec ?? student?.section ?? "").trim();

        const classMatch = classFilter === "all" || classValue === classFilter;
        const sectionMatch = sectionFilter === "all" || sectionValue === sectionFilter;

        return classMatch && sectionMatch;
      });

      const parsedTotal = Number(data?.data?.total) || Number(data?.total) || Number(data?.count);

      return {
        items: filteredItems,
        total: Number.isFinite(headerTotal) && headerTotal > 0
          ? headerTotal
          : Number.isFinite(parsedTotal)
            ? parsedTotal
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
