"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Badge,
  Building2,
  Check,
  LayoutGrid,
  Monitor,
  MoreHorizontal,
  PanelLeft,
  PanelsTopLeft,
  Table2,
  Type,
} from "lucide-react";
import React from "react";

const APPEARANCE_THEMES = [
  { id: "system", label: "System preference" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];


const SIDEBAR_POSITIONS = [
  { id: "side", label: "Side" },
  { id: "top", label: "Top" },
];

function MiniSidebarPreview({ position }) {
  const isDark = position === "top";
  const shell = isDark ? "bg-slate-800" : "bg-white";
  const side = isDark ? "bg-slate-900" : "bg-slate-100";
  const line = isDark ? "bg-slate-600" : "bg-slate-300";
  const lineSoft = isDark ? "bg-slate-700" : "bg-slate-200";

  const railItems = (
    <>
      <span className={`h-1.5 w-4/5 rounded ${line}`} />
      <span className={`h-1.5 w-3/5 rounded ${lineSoft}`} />
      <span className={`h-1.5 w-3/5 rounded ${lineSoft}`} />
      <span className={`h-1.5 w-3/5 rounded ${lineSoft}`} />
    </>
  );

  return (
    <span className="flex h-20 w-full flex-col overflow-hidden">
      {position === "top" ? (
        <span className={`flex h-1/3 flex-row items-center gap-1 p-1.5 ${side}`}>
          {railItems}
        </span>
      ) : null}

      <span className="flex flex-1">
        {position === "side" ? (
          <span className={`flex w-1/3 flex-col gap-1 p-1.5 ${side}`}>
            {railItems}
          </span>
        ) : null}

        <span className={`flex-1 p-1.5 ${shell}`}>
          <span className={`mb-1 block h-1.5 w-1/2 rounded ${line}`} />
          <span className="flex flex-col gap-1">
            <span className={`h-1.5 w-full rounded ${lineSoft}`} />
            <span className={`h-1.5 w-5/6 rounded ${lineSoft}`} />
            <span className={`h-1.5 w-4/6 rounded ${lineSoft}`} />
          </span>
        </span>
      </span>
    </span>
  );
}

function SelectableCard({ selected, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      data-selected={selected ? "true" : "false"}
      className="appearance-option group flex w-[calc(50%-0.375rem)] shrink-0 flex-col items-start gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:w-[calc(50%-0.5rem)] lg:w-36"
    >
      <span
        className={`relative block w-full overflow-hidden rounded-lg border ${
          selected
            ? "border-primary shadow-md ring-2 ring-primary/25"
            : "border-border/70 shadow-xs group-hover:border-primary/40 group-hover:shadow-md"
        }`}
      >
        {children}
        {selected ? (
          <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background">
            <Check className="size-3" />
          </span>
        ) : null}
      </span>
      <span
        className={`text-xs font-medium transition-colors ${
          selected
            ? "text-primary"
            : "text-foreground/70 group-hover:text-foreground"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function MiniDashboardPreview({ variant }) {
  const isDark = variant === "dark";
  const shell = isDark ? "bg-slate-800" : "bg-white";
  const side = isDark ? "bg-slate-900" : "bg-slate-100";
  const line = isDark ? "bg-slate-600" : "bg-slate-300";
  const lineSoft = isDark ? "bg-slate-700" : "bg-slate-200";

  return (
    <span className="flex h-20 w-full overflow-hidden">
      <span className={`flex w-1/3 flex-col gap-1 p-1.5 ${side}`}>
        <span className={`h-1.5 w-4/5 rounded ${line}`} />
        <span className={`h-1.5 w-3/5 rounded ${lineSoft}`} />
        <span className={`h-1.5 w-3/5 rounded ${lineSoft}`} />
        <span className={`h-1.5 w-3/5 rounded ${lineSoft}`} />
      </span>
      <span className={`flex-1 p-1.5 ${shell}`}>
        <span className={`mb-1 block h-1.5 w-1/2 rounded ${line}`} />
        <span className="flex flex-col gap-1">
          <span className={`h-1.5 w-full rounded ${lineSoft}`} />
          <span className={`h-1.5 w-5/6 rounded ${lineSoft}`} />
          <span className={`h-1.5 w-4/6 rounded ${lineSoft}`} />
        </span>
      </span>
    </span>
  );
}

// function MiniTablePreview({ compact }) {
//   const rows = compact ? 5 : 4;
//   const rowGap = compact ? "gap-1.5" : "gap-1";

//   return (
//     <span className="flex h-20 w-full flex-col gap-1 bg-white p-1.5 dark:bg-slate-800">
//       <span className="flex items-center justify-between">
//         <span className="h-1.5 w-1/2 rounded bg-slate-300 dark:bg-slate-600" />
//         <span className="h-2 w-6 rounded bg-slate-800 dark:bg-slate-500" />
//       </span>
//       <span className={`flex flex-col ${rowGap}`}>
//         {Array.from({ length: rows }).map((_, index) => (
//           <span key={index} className="flex items-center gap-1">
//             <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" />
//             <span className="h-1.5 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
//           </span>
//         ))}
//       </span>
//     </span>
//   );
// }
function MiniTablePreview({ compact = false }) {
  const rows = compact ? 5 : 4;
  const rowGap = compact ? "gap-1" : "gap-1.5";

  return (
    <span className="flex h-20 w-full flex-col overflow-hidden rounded-md bg-white p-1.5 dark:bg-slate-800">
      {/* Table header */}
      <span className="grid grid-cols-4 gap-1 border-b border-slate-200 pb-1 dark:border-slate-700">
        <span className="h-1.5 rounded bg-slate-400 dark:bg-slate-500" />
        <span className="h-1.5 rounded bg-slate-300 dark:bg-slate-600" />
        <span className="h-1.5 rounded bg-slate-300 dark:bg-slate-600" />
        <span className="h-1.5 rounded bg-slate-300 dark:bg-slate-600" />
      </span>

      {/* Table rows */}
      <span className={`mt-1 flex flex-col ${rowGap}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <span key={index} className="grid grid-cols-4 items-center gap-1">
            <span className="h-1.5 rounded bg-slate-300 dark:bg-slate-600" />
            <span className="h-1.5 rounded bg-slate-200 dark:bg-slate-700" />
            <span className="h-1.5 rounded bg-slate-200 dark:bg-slate-700" />
            <span className="h-1.5 rounded bg-slate-200 dark:bg-slate-700" />
          </span>
        ))}
      </span>
    </span>
  );
}

function MiniCardPreview({ compact = false }) {
  const cards = compact ? 4 : 3;

  return (
    <span className="flex h-20 w-full flex-col gap-1.5 rounded-md bg-white p-1.5 dark:bg-slate-800">
      {/* Card heading */}
      <span className="flex items-center justify-between">
        <span className="h-1.5 w-2/5 rounded bg-slate-400 dark:bg-slate-500" />
        <span className="h-2 w-5 rounded-full bg-slate-200 dark:bg-slate-700" />
      </span>

      {/* Cards */}
      <span
        className={`grid flex-1 ${
          compact ? "grid-cols-4 gap-1" : "grid-cols-3 gap-1.5"
        }`}
      >
        {Array.from({ length: cards }).map((_, index) => (
          <span
            key={index}
            className="flex min-w-0 flex-col rounded border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Icon */}
            <span className="mb-1 flex size-3 items-center justify-center rounded bg-primary/10">
              <span className="size-1.5 rounded-full bg-primary/50" />
            </span>

            {/* Title */}
            <span className="h-1 w-4/5 rounded bg-slate-300 dark:bg-slate-600" />

            {/* Content */}
            <span className="mt-1 h-1 w-full rounded bg-slate-200 dark:bg-slate-700" />
            <span className="mt-0.5 h-1 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
          </span>
        ))}
      </span>
    </span>
  );
}

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="grid gap-4 border-b border-border/60 py-5 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-start">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}

/* ==========================================================================
   FONT FAMILIES

   ========================================================================== */

const FONT_OPTIONS = [
  {
    id: "sf",
    label: "Svastha SF",
    tagline: "Crisp · Neutral",
    stack:
      'var(--font-sf-pro), "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    sample: "Health check",
    specimenClass: "font-semibold tracking-tight",
  },
  {
    id: "comfortaa",
    label: "Comfortaa",
    tagline: "Rounded · Friendly",
    stack:
      'var(--font-comfortaa-pro), "Comfortaa", ui-rounded, "Segoe UI", system-ui, sans-serif',
    sample: "Health check",
    specimenClass: "font-bold tracking-tight",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    tagline: "Editorial · Warm",
    stack:
      'var(--font-fraunces-pro), "Fraunces", ui-serif, Georgia, "Times New Roman", serif',
    sample: "Health check",
    specimenClass: "font-semibold",
  },
];

function FontPreviewCard({ option, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex flex-1 basis-56 flex-col overflow-hidden rounded-xl border p-4 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary/50 ${
        selected
          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/25"
          : "border-border/70 bg-card hover:border-primary/40 hover:shadow-md"
      }`}
    >
      {/* Live specimen */}
      <span
        className={`block text-2xl leading-tight text-foreground ${option.specimenClass}`}
        style={{ fontFamily: option.stack }}
      >
        {option.label}
      </span>

      <span
        className="mt-1.5 block text-sm text-muted-foreground"
        style={{ fontFamily: option.stack }}
      >
        {option.sample} · 0123456789
      </span>

      {/* Character swatches */}
      <span
        className="mt-3 flex flex-wrap gap-1 text-[11px]"
        style={{ fontFamily: option.stack }}
      >
        {["Aa", "Bb", "Cc", "Rr", "Ss"].map((glyph) => (
          <span
            key={glyph}
            className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground"
          >
            {glyph}
          </span>
        ))}
      </span>

      <span className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {option.tagline}
        </span>

        {selected ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
            <Check className="size-3" />
            Active
          </span>
        ) : (
          <span className="text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Select
          </span>
        )}
      </span>
    </button>
  );
}

const AppearancePage = ({
  theme,
  onThemeChange,
  transparentSidebar,
  onTransparentSidebarChange,
  sidebarPosition,
  onSidebarPositionChange,
  tableView,
  onTableViewChange,
  fontFamily,
  onFontFamilyChange,
  onCancel,
  onSave,
}) => {

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="appearance-header flex items-start justify-between gap-4 border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5">
        {/* <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Appearance
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Change how Svastha UI looks and feels in your browser.
          </p>
        </div> */}
         <div className="sd-school-hero__eyebrow">
            <span className="sd-icon-badge sd-icon-badge--large">
              <PanelsTopLeft className="size-6 text-white" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="profile-settings-eyebrow__dot" />
                <p className="sd-school-hero__kicker">Personalized Appearance</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="sd-school-hero__title">Appearance</h2>
              </div>
            </div>
          </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="More appearance options"
          className="shrink-0 text-muted-foreground"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="px-4 pb-4 pt-1 sm:px-6 sm:pb-5">
        {/* Interface theme */}
        <SettingRow
          icon={Monitor}
          title="Interface theme"
          description="Follow the system, or lock Svastha to light or dark."
        >
          <div className="appearance-rail -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:gap-4 pt-2">
            {APPEARANCE_THEMES.map((option) => (
              <SelectableCard
                key={option.id}
                selected={theme === option.id}
                onClick={() => onThemeChange(option.id)}
                label={option.label}
              >
                {option.id === "system" ? (
                  <span className="flex h-20 w-full">
                    <span className="w-1/2 overflow-hidden">
                      <MiniDashboardPreview variant="light" />
                    </span>
                    <span className="w-1/2 overflow-hidden">
                      <MiniDashboardPreview variant="dark" />
                    </span>
                  </span>
                ) : (
                  <MiniDashboardPreview variant={option.id} />
                )}
              </SelectableCard>
            ))}
          </div>
        </SettingRow>

        {/* Transparent sidebar */}
        <SettingRow
          icon={LayoutGrid}
          title="Transparent sidebar"
          description="Let page content show through the desktop sidebar."
        >
          <div className="flex items-center sm:justify-end">
            <Switch
              checked={transparentSidebar}
              onCheckedChange={onTransparentSidebarChange}
              aria-label="Toggle transparent sidebar"
            />
          </div>
        </SettingRow>

        {/* Sidebar position */}
        <SettingRow
          icon={PanelLeft}
          title="Sidebar position"
          description="Where the navigation is docked in the app."
        >
          <div className="appearance-rail -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:gap-4 pt-1">
            {SIDEBAR_POSITIONS.map((position) => (
              <SelectableCard
                key={position.id}
                selected={sidebarPosition === position.id}
                onClick={() => onSidebarPositionChange(position.id)}
                label={position.label}
              >
                <MiniSidebarPreview position={position.id} />
              </SelectableCard>
            ))}
          </div>
        </SettingRow>

        {/* Tables view */}
        <SettingRow
          icon={Table2}
          title="Tables view"
          description="How tables are laid out across the app."
        >
          <div className="appearance-rail -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:gap-4 pt-1">
            {[
              { id: "table", label: "Table", compact: false },
              { id: "card", label: "Card", compact: true },
            ].map((option) => (
              <SelectableCard
                key={option.id}
                selected={tableView === option.id}
                onClick={() => onTableViewChange(option.id)}
                label={option.label}
              >
                {option.id === "table" ? (
                  <MiniTablePreview />
                ) : (
                  <MiniCardPreview />
                )}
                {/* <MiniTablePreview compact={option.compact} /> */}
              </SelectableCard>
            ))}
          </div>
        </SettingRow>

        {/* App typeface — applies to the whole app immediately. */}
        <SettingRow
          icon={Type}
          title="App typeface"
          description="Change the font used across the entire Svastha app."
        >
          <div className="appearance-rail -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 pt-1 sm:gap-4">
            {FONT_OPTIONS.map((option) => (
              <FontPreviewCard
                key={option.id}
                option={option}
                selected={fontFamily === option.id}
                onClick={() => onFontFamilyChange?.(option.id)}
              />
            ))}
          </div>
        </SettingRow>

        {/* Footer actions — the row above's border-b is the separator, so no
            border-t here or the two lines collide. */}
        <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} className="sm:min-w-36">
            Save changes
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AppearancePage;
