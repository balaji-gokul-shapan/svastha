import { createSlice } from "@reduxjs/toolkit";

// Matches the options rendered by the Appearance settings page.
export const SIDEBAR_FEATURES = [
  "Recent changes",
  "Recent activity",
  "Notifications",
];

export const APPEARANCE_THEMES = ["system", "light", "dark"];
export const TABLE_VIEWS = ["table", "card"];

// Mirrors the "Settings → Appearance" form so any component (sidebar, tables,
// theme watchers) can apply the same customisation. Persisted to localStorage
// under "Svastha-appearance" on save and rehydrated by <AppearanceWatcher />.
const initialState = {
  theme: "system", // "system" | "light" | "dark"
  transparentSidebar: true,
  sidebarFeature: SIDEBAR_FEATURES[0],
  tableView: "table", // "default" | "compact"
};

const appearanceSettingsSlice = createSlice({
  name: "appearanceSettings",
  initialState,
  reducers: {
    // setAppearanceField({ field: "theme", value: "dark" })
    setAppearanceField: (state, action) => {
      const { field, value } = action.payload;

      if (Object.prototype.hasOwnProperty.call(state, field)) {
        state[field] = value;
      }
    },
    resetAppearanceSettings: () => initialState,
  },
});

export const { setAppearanceField, resetAppearanceSettings } =
  appearanceSettingsSlice.actions;
export default appearanceSettingsSlice.reducer;
