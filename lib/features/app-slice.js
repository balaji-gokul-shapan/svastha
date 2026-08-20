import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedStudentId: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSelectedStudentId(state, action) {
      state.selectedStudentId = action.payload;
    },
    clearSelectedStudentId(state) {
      state.selectedStudentId = null;
    },
  },
});

export const { setSelectedStudentId, clearSelectedStudentId } = appSlice.actions;
export default appSlice.reducer;
