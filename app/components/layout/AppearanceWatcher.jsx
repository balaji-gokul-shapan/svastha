"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setAppearanceField,
  SIDEBAR_POSITIONS,
  APPEARANCE_THEMES,
  TABLE_VIEWS,
  FONT_FAMILIES,
} from "@/lib/features/appearanceSettingSlice";


export function AppearanceWatcher() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.appearanceSettings?.theme);
  const fontFamily = useAppSelector(
    (state) => state.appearanceSettings?.fontFamily,
  );

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
      if (SIDEBAR_POSITIONS.includes(saved.sidebarPosition)) {
        dispatch(
          setAppearanceField({
            field: "sidebarPosition",
            value: saved.sidebarPosition,
          }),
        );
      }
      if (TABLE_VIEWS.includes(saved.tableView)) {
        dispatch(
          setAppearanceField({ field: "tableView", value: saved.tableView }),
        );
      }
      if (FONT_FAMILIES.includes(saved.fontFamily)) {
        dispatch(
          setAppearanceField({ field: "fontFamily", value: saved.fontFamily }),
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

  // Apply the chosen typeface app-wide.
  //

  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const next = FONT_FAMILIES.includes(fontFamily) ? fontFamily : "sf";

    if (next === "sf") {
      // "sf" is the baseline, already applied by the stylesheet — drop the
      // attribute so the default needs no override.
      document.documentElement.removeAttribute("data-app-font");
      return;
    }

    document.documentElement.setAttribute("data-app-font", next);
  }, [fontFamily]);

  return null;
}

export default AppearanceWatcher;
