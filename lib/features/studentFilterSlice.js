import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  camp: "all",
  school: "all",
  academicYear: "all",
  class: "all",
  section: "all",
  studentId: "all",
};

const studentFilterSlice = createSlice({
  name: "studentFilters",
  initialState,
  reducers: {
    setCamp(state, action) {
      state.camp = action.payload;
    },

    setSchool(state, action) {
      state.school = action.payload;
    },

    setAcademicYear(state, action) {
      state.academicYear = action.payload;
    },

    setClass(state, action) {
      state.class = action.payload;
      state.section = "all";
      state.studentId = "all";
    },

    setSection(state, action) {
      state.section = action.payload;
      state.studentId = "all";
    },

    setStudentId(state, action) {
      state.studentId = action.payload;
    },

    setSchoolAndCamp(state, action) {
      const { school, camp = "all" } = action.payload;

      state.school = school;
      state.camp = camp;
      state.studentId = "all";
    },

    resetStudentFilters() {
      return initialState;
    },
  },
});

export const {
  setCamp,
  setSchool,
  setAcademicYear,
  setClass,
  setSection,
  setStudentId,
  setSchoolAndCamp,
  resetStudentFilters,
} = studentFilterSlice.actions;

export const selectStudentFilters = (state) => state.studentFilters;

export default studentFilterSlice.reducer;
