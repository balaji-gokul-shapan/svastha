import { REPORT_SECTIONS } from "@/app/settings/datas/settingsData";
import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "svastha-report-settings";

const loadPersistedState = () => {
  if (typeof window === "undefined") return undefined;
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    const parsed = JSON.parse(serialized);
    // Merge with defaults so new fields added in updates are always present
    const defaults = Object.fromEntries(
      REPORT_SECTIONS.map((section) => [section.id, section.defaultOn]),
    );
    return {
      reportType: parsed.reportType ?? "pdf",
      reportTemplate: parsed.reportTemplate ?? "detailed",
      reportSection: { ...defaults, ...(parsed.reportSection ?? {}) },
      schoolHead: parsed.schoolHead ?? false,
      includeLetterhead: parsed.includeLetterhead ?? true,
      tableDensity: parsed.tableDensity ?? "comfortable",
      autoGenerate: parsed.autoGenerate ?? false,
    };
  } catch {
    return undefined;
  }
};

const initialState = loadPersistedState() ?? {
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

const persistState = (state) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — fail silently, settings still work in-memory
  }
};

const reportSettingsSlice = createSlice({
  name: "reportSettings",
  initialState,
  reducers: {
    setReportField: (state, action) => {
      const { field, value } = action.payload;
      if (Object.prototype.hasOwnProperty.call(state, field)) {
        state[field] = value;
      }
      persistState(state);
    },
    resetReportSettings: () => {
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      return {
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
    },
  },
});

export const { setReportField, resetReportSettings } =
  reportSettingsSlice.actions;
export default reportSettingsSlice.reducer;
