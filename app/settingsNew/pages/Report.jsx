"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, FileType } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

/* =========================================================
   Small building blocks
   ========================================================= */

// function Switch({ checked, onCheckedChange, ariaLabel }) {
//   return (
//     <button
//       type="button"
//       role="switch"
//       aria-checked={checked}
//       aria-label={ariaLabel}
//       onClick={() => onCheckedChange(!checked)}
//       className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
//         checked ? "bg-primary" : "bg-muted"
//       }`}
//     >
//       <span
//         className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
//           checked ? "translate-x-6" : "translate-x-1"
//         }`}
//       />
//     </button>
//   );
// }

function SelectableCard({ selected, onClick, label, description, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-40 flex-col gap-2 rounded-lg border p-3 text-left transition-colors ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border hover:bg-muted"
      }`}
    >
      {children}
      <div>
        <p className={`text-sm font-medium ${selected ? "text-primary" : "text-foreground"}`}>
          {label}
        </p>
        {description ? (
          <p className="text-[11px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </button>
  );
}

// Small mockup of a report page with N content lines — the more/fewer
// lines visually communicate "Detailed" vs "Summary" vs "Compact" better
// than the label alone.
function MiniReportPreview({ lineCount }) {
  return (
    <div className="flex h-16 w-full flex-col justify-center gap-1 rounded border border-border/60 bg-background p-2">
      <div className="h-2 w-2/3 rounded-full bg-primary/40" />
      {Array.from({ length: lineCount }).map((_, i) => (
        <div
          key={i}
          className="h-1 rounded-full bg-muted-foreground/25"
          style={{ width: `${65 + ((i * 13) % 30)}%` }}
        />
      ))}
    </div>
  );
}

// Small mockup of a table with different row spacing for Comfortable vs
// Compact density.
function MiniTablePreview({ compact }) {
  const rows = compact ? 5 : 3;
  return (
    <div className="flex h-16 w-full flex-col justify-center gap-1 rounded border border-border/60 bg-background p-2">
      <div className="flex gap-1">
        <div className="h-1.5 w-1/3 rounded-full bg-primary/40" />
        <div className="h-1.5 w-1/4 rounded-full bg-primary/40" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-1">
          <div className="h-1 w-1/3 rounded-full bg-muted-foreground/20" />
          <div className="h-1 w-1/4 rounded-full bg-muted-foreground/20" />
          <div className="h-1 w-1/5 rounded-full bg-muted-foreground/20" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   Data
   ========================================================= */

const FORMAT_OPTIONS = [
  { id: "pdf", label: "PDF", description: "Best for printing & sharing", icon: FileText, tone: "text-destructive" },
  { id: "excel", label: "Excel", description: "Best for data analysis", icon: FileSpreadsheet, tone: "text-success" },
  { id: "word", label: "Word", description: "Best for editing text", icon: FileType, tone: "text-info" },
];

const TEMPLATE_OPTIONS = [
  { id: "detailed", label: "Detailed", description: "Every field, fully expanded", lines: 6 },
  { id: "summary", label: "Summary", description: "Key findings only", lines: 3 },
  { id: "compact", label: "Compact", description: "Dense, multi-record view", lines: 8 },
];

const REPORT_SECTIONS = [
  { id: "student_info", label: "Student Information", defaultOn: true },
  { id: "vitals", label: "Vitals & Growth", defaultOn: true },
  { id: "vision", label: "Vision Screening", defaultOn: true },
  { id: "hearing", label: "Hearing Screening", defaultOn: true },
  { id: "dental", label: "Dental Screening", defaultOn: true },
  { id: "ent", label: "ENT Screening", defaultOn: false },
  { id: "immunization", label: "Immunization Status", defaultOn: true },
  { id: "recommendations", label: "Recommendations & Sign-off", defaultOn: true },
];

/* =========================================================
   Component
   ========================================================= */

const Report = () => {
  const [format, setFormat] = useState("pdf");
  const [template, setTemplate] = useState("detailed");
  const [tableDensity, setTableDensity] = useState("comfortable");
  const [includeLetterhead, setIncludeLetterhead] = useState(true);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [sections, setSections] = useState(
    Object.fromEntries(REPORT_SECTIONS.map((s) => [s.id, s.defaultOn])),
  );

  const toggleSection = (id) =>
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <article className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-col items-start">
          <h3 className="text-lg font-semibold text-foreground">Report</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize how your screening reports are generated, organized, and
            presented.
          </p>
        </div>
      </div>

      <div className="space-y-5 px-0 pb-5 sm:px-5">
        {/* Report format */}
        <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <p className="text-sm font-medium text-foreground">Report file format</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose the file type reports are downloaded as.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {FORMAT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <SelectableCard
                  key={option.id}
                  selected={format === option.id}
                  onClick={() => setFormat(option.id)}
                  label={option.label}
                  description={option.description}
                >
                  <span className={`flex size-9 items-center justify-center rounded-md bg-muted ${option.tone}`}>
                    <Icon className="size-4.5" />
                  </span>
                </SelectableCard>
              );
            })}
          </div>
        </div>

        {/* Report template */}
        <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <p className="text-sm font-medium text-foreground">Report template</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              How much detail is included per student.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {TEMPLATE_OPTIONS.map((option) => (
              <SelectableCard
                key={option.id}
                selected={template === option.id}
                onClick={() => setTemplate(option.id)}
                label={option.label}
                description={option.description}
              >
                <MiniReportPreview lineCount={option.lines} />
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Sections to include */}
        <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <p className="text-sm font-medium text-foreground">Sections to include</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Toggle which screening sections appear in the generated report.
            </p>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {REPORT_SECTIONS.map((section) => (
              <label
                key={section.id}
                className="flex items-center gap-2.5 rounded-md border border-border/70 bg-background px-3 py-2 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={sections[section.id]}
                  onChange={() => toggleSection(section.id)}
                  className="size-4 accent-primary"
                />
                {section.label}
              </label>
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-5">
          <div>
            <p className="text-sm font-medium text-foreground">School letterhead</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Include your school's logo and header on every report page.
            </p>
          </div>
          <Switch
            checked={includeLetterhead}
            onCheckedChange={setIncludeLetterhead}
            ariaLabel="Toggle school letterhead"
          />
        </div>

        {/* Auto-generate */}
        <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-5">
          <div>
            <p className="text-sm font-medium text-foreground">Auto-generate reports</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Automatically generate a report as soon as a screening is marked complete.
            </p>
          </div>
          <Switch
            checked={autoGenerate}
            onCheckedChange={setAutoGenerate}
            ariaLabel="Toggle auto-generate reports"
          />
        </div>

        {/* Table density */}
        <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <p className="text-sm font-medium text-foreground">Table density</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Row spacing for tables inside generated reports.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SelectableCard
              selected={tableDensity === "comfortable"}
              onClick={() => setTableDensity("comfortable")}
              label="Comfortable"
              description="More whitespace"
            >
              <MiniTablePreview compact={false} />
            </SelectableCard>
            <SelectableCard
              selected={tableDensity === "compact"}
              onClick={() => setTableDensity("compact")}
              label="Compact"
              description="More rows per page"
            >
              <MiniTablePreview compact />
            </SelectableCard>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 border-t border-border/70 pt-5">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="button">Save changes</Button>
        </div>
      </div>
    </article>
  );
};

export default Report;