"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setAppearanceField,
  SIDEBAR_FEATURES,
  APPEARANCE_THEMES,
  TABLE_VIEWS,
} from "@/lib/features/appearanceSettingSlice";


export function AppearanceWatcher() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.appearanceSettings?.theme);

  // Rehydrate saved appearance settings once on mount (after hydration).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("Svastha-appearance");
      if (!raw) return;

      const saved = JSON.parse(raw);

      if (APPEARANCE_THEMES.includes(saved.theme)) {
        dispatch(setAppearanceField({ field: "theme", value: saved.theme }));
      }
      if (typeof saved.transparentSidebar === "boolean") {
        dispatch(
          setAppearanceField({
            field: "transparentSidebar",
            value: saved.transparentSidebar,
          }),
        );
      }
      if (SIDEBAR_FEATURES.includes(saved.sidebarFeature)) {
        dispatch(
          setAppearanceField({
            field: "sidebarFeature",
            value: saved.sidebarFeature,
          }),
        );
      }
      if (TABLE_VIEWS.includes(saved.tableView)) {
        dispatch(
          setAppearanceField({ field: "tableView", value: saved.tableView }),
        );
      }
    } catch {
      // Corrupt or unavailable storage — keep defaults.
    }
  }, [dispatch]);

  // Apply the theme app-wide whenever it changes.
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const dark = theme === "dark" || (theme === "system" && prefersDark);

    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("Svastha-theme", dark ? "dark" : "light");
  }, [theme]);

  return null;
}

export default AppearanceWatcher;
