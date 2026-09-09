import { REPORT_SECTIONS } from "@/app/settings/datas/settingsData";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reportType: "pdf",
  reportTemplate: "detailed",
  reportSection: Object.fromEntries(
    REPORT_SECTIONS.map((section) => [section.id, section.defaultOn]),
  ),
  schoolHead: false,
  includeLetterhead: true,
  tableDensity: "comfortable",
  autoGenerate: false,
};

const reportSettingsSlice = createSlice({
  name: "reportSettings",
  initialState,
  reducers: {
    // setReportField({ field: "reportTemplate", value: "summary" })
    setReportField: (state, action) => {
      const { field, value } = action.payload;

      if (Object.prototype.hasOwnProperty.call(state, field)) {
        state[field] = value;
      }
    },
    resetReportSettings: () => initialState,
  },
});

export const { setReportField, resetReportSettings } =
  reportSettingsSlice.actions;
export default reportSettingsSlice.reducer;
