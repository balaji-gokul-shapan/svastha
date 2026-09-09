import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, MoreHorizontal } from "lucide-react";
import React from "react";
const APPEARANCE_THEMES = [
  { id: "system", label: "System preference" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];
function SelectableCard({ selected, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="group flex w-36 shrink-0 flex-col items-start gap-2 text-left"
    >
      <span
        className={`relative block w-full overflow-hidden rounded-lg border transition ${
          selected
            ? "border-primary ring-2 ring-primary/30"
            : "border-border group-hover:border-primary/40"
        }`}
      >
        {children}
        {selected ? (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3" />
          </span>
        ) : null}
      </span>
      <span className="text-xs font-medium text-foreground">{label}</span>
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
const SIDEBAR_FEATURES = ["Recent changes", "Recent activity", "Notifications"];
function MiniTablePreview({ compact }) {
  const rows = compact ? 5 : 4;
  const rowGap = compact ? "gap-0.5" : "gap-1";

  return (
    <span className="flex h-20 w-full flex-col gap-1 bg-white p-1.5 dark:bg-slate-800">
      <span className="flex items-center justify-between">
        <span className="h-1.5 w-1/2 rounded bg-slate-300 dark:bg-slate-600" />
        <span className="h-2 w-6 rounded bg-slate-800 dark:bg-slate-500" />
      </span>
      <span className={`flex flex-col ${rowGap}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <span key={index} className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="h-1.5 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
          </span>
        ))}
      </span>
    </span>
  );
}

export function AppearanceSettings({
  theme,
  onThemeChange,
  transparentSidebar,
  onTransparentSidebarChange,
  sidebarFeature,
  onSidebarFeatureChange,
  tableView,
  onTableViewChange,
  onCancel,
  onSave,
}) {
  
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-4 p-5 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Change how Svastha UI looks and feels in your browser.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="More appearance options"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="space-y-5 px-5 pb-5">
        {/* Interface theme */}
        <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <p className="text-sm font-medium text-foreground">
              Interface theme
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Select or customize your UI theme.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
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
        </div>

        {/* Transparent sidebar */}
        <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-5">
          <div>
            <p className="text-sm font-medium text-foreground">
              Transparent sidebar
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Make the desktop sidebar transparent.
            </p>
          </div>
          <Switch
            checked={transparentSidebar}
            onCheckedChange={onTransparentSidebarChange}
            aria-label="Toggle transparent sidebar"
          />
        </div>

        {/* Sidebar feature */}
        <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-5">
          <div>
            <p className="text-sm font-medium text-foreground">
              Sidebar feature
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              What shows in the desktop sidebar.
            </p>
          </div>
          <Select value={sidebarFeature} onValueChange={onSidebarFeatureChange}>
            <SelectTrigger className="w-56">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-success" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              {SIDEBAR_FEATURES.map((feature) => (
                <SelectItem key={feature} value={feature}>
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-success" />
                    {feature}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tables view */}
        <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <p className="text-sm font-medium text-foreground">Tables view</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              How are tables displayed in the app.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { id: "default", label: "Default", compact: false },
              { id: "compact", label: "Compact", compact: true },
            ].map((option) => (
              <SelectableCard
                key={option.id}
                selected={tableView === option.id}
                onClick={() => onTableViewChange(option.id)}
                label={option.label}
              >
                <MiniTablePreview compact={option.compact} />
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 border-t border-border/70 pt-5">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save changes
          </Button>
        </div>
      </div>
    </section>
  );
}
const AppearancePage = () => {
  return (
    <AppearanceSettings
      theme={theme}
      onThemeChange={setTheme}
      transparentSidebar={transparentSidebar}
      onTransparentSidebarChange={setTransparentSidebar}
      sidebarFeature={sidebarFeature}
      onSidebarFeatureChange={setSidebarFeature}
      tableView={tableView}
      onTableViewChange={setTableView}
      onCancel={handleAppearanceCancel}
      onSave={handleAppearanceSave}
    />
  );
};

export default AppearancePage;
