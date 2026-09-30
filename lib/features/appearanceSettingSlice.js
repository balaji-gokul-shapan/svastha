import { createSlice } from "@reduxjs/toolkit";

// Matches the options rendered by the Appearance settings page.
export const SIDEBAR_FEATURES = [
  "Recent changes",
  "Recent activity",
  "Notifications",
];

// Where the app shell's navigation rail is docked. Replaces SIDEBAR_FEATURES:
// the rail is always present, only its position changes.
export const SIDEBAR_POSITIONS = ["side", "top"];

export const APPEARANCE_THEMES = ["system", "light", "dark"];
export const TABLE_VIEWS = ["table", "card"];


export const FONT_FAMILIES = ["sf", "comfortaa", "fraunces"];

// Mirrors the "Settings → Appearance" form so any component (sidebar, tables,
// theme watchers) can apply the same customisation. Persisted to localStorage
// under "Svastha-appearance" on save and rehydrated by <AppearanceWatcher />.
const initialState = {
  theme: "system", // "system" | "light" | "dark"
  transparentSidebar: true,
  sidebarPosition: SIDEBAR_POSITIONS[0], // "side" | "top"
  tableView: "table", // "default" | "compact"
  fontFamily: FONT_FAMILIES[0], // "sf" | "comfortaa" | "fraunces"
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
