"use client";

import { useState } from "react";
import {
  Check,
  Ear,
  FileSpreadsheet,
  FileText,
  FileType,
  Heart,
  Minus,
  ShieldCheck,
  Smile,
  Syringe,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import HealthCheckModal from "@/components/students/health-check-modal";
import { useAppDispatch } from "@/lib/hooks";
import { REPORT_SECTIONS } from "../datas/settingsData";

function SelectableCard({
  selected,
  onClick,
  label,
  description,
  children,
  disabled,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
      className={`flex w-40 flex-col gap-2 rounded-lg border p-3 text-left transition-colors ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border hover:bg-muted"
      }`}
    >
      {children}
      <div>
        <p
          className={`text-sm font-medium ${selected ? "text-primary" : "text-foreground"}`}
        >
          {label}
        </p>
        {description ? (
          <p className="text-[11px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </button>
  );
}

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
  {
    id: "pdf",
    label: "PDF",
    description: "Best for printing & sharing",
    icon: FileText,
    tone: "text-destructive",
    disabled: false,
  },
  {
    id: "excel",
    label: "Excel",
    description: "Best for data analysis",
    icon: FileSpreadsheet,
    tone: "text-success",
    disabled: true,
  },
  {
    id: "word",
    label: "Word",
    description: "Best for editing text",
    icon: FileType,
    tone: "text-info",
    disabled: true,
  },
];

const TEMPLATE_OPTIONS = [
  {
    id: "detailed",
    label: "Detailed",
    description: "Every field, fully expanded",
    lines: 6,
  },
  {
    id: "summary",
    label: "Summary",
    description: "Key findings only",
    lines: 3,
  },
  {
    id: "compact",
    label: "Compact",
    description: "Dense, multi-record view",
    lines: 8,
  },
];


// Maps each report section to an icon so the scalable switch list can show a
// distinct, recognizable glyph per section without hard-coding the layout.
const SECTION_ICONS = {
  student_info: User,
  vitals: Heart,
  vision: Smile,
  hearing: Ear,
  dental: ShieldCheck,
  ent: Ear,
  immunization: Syringe,
  recommendations: FileText,
};

// Ordered list of sections rendered as a dynamic, scalable switch grid — add
// an entry to REPORT_SECTIONS and it appears here automatically.

/* =========================================================
   Component
   ========================================================= */

const Report = ({
  report,
  reportTemplate,
  reportSection,
  schoolHead,
  includeLetterhead,
  tableDensity,
  autoGenerate,
  onChange,
  student,
}) => {
  // const [format, setFormat] = useState("pdf");
  // const [template, setTemplate] = useState("detailed");
  // const [tableDensity, setTableDensity] = useState("comfortable");
  // const [includeLetterhead, setIncludeLetterhead] = useState(true);
  // const [autoGenerate, setAutoGenerate] = useState(false);
  const [sections, setSections] = useState(
    Object.fromEntries(REPORT_SECTIONS.map((s) => [s.id, s.defaultOn])),
  );
    const dispatch = useAppDispatch();
  // The health card mounts 4 screening queries — only render it after the
  // user asks for the preview so opening this tab stays instant.
  const [showPreview, setShowPreview] = useState(false);
  

  const setSectionIncluded = (id, value) => {
    onChange("reportSection", {
      ...reportSection,
      [id]: value === "include",
    });
  };

  // setSections((prev) => ({ ...prev, [id]: value === "include" }));

  return (
    <article className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-row items-center justify-between gap-2 py-4">
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
            <p className="text-sm font-medium text-foreground">
              Report file format
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose the file type reports are downloaded as.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {FORMAT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <SelectableCard
                  disabled={option.disabled}
                  key={option.id}
                  selected={report === option.id}
                  onClick={() => onChange("reportType", option.id)}
                  label={option.label}
                  description={option.description}
                >
                  <span
                    className={`flex size-9 items-center justify-center rounded-md bg-muted ${option.tone}`}
                  >
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
            <p className="text-sm font-medium text-foreground">
              Report template
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              How much detail is included per student.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {TEMPLATE_OPTIONS.map((option) => (
              <SelectableCard
                key={option.id}
                selected={reportTemplate === option.id}
                onClick={() => onChange("reportTemplate", option.id)}
                label={option.label}
                description={option.description}
              >
                <MiniReportPreview lineCount={option.lines} />
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Sections to include — scalable, dynamic switch list.
            Add an entry to REPORT_SECTIONS and it appears here automatically. */}
        <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <p className="text-sm font-medium text-foreground">
              Sections to include
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Toggle which screening sections appear in the generated report.
            </p>
          </div>
          <div className="space-y-3">
            {/* Header controls — select all / none + live included count */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {Object.values(sections).filter(Boolean).length} of{" "}
                {REPORT_SECTIONS.length} included
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      "reportSection",
                      Object.fromEntries(
                        REPORT_SECTIONS.map((section) => [section.id, true]),
                      ),
                    )
                  }
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Select all
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                       "reportSection",
                      Object.fromEntries(
                        REPORT_SECTIONS.map((s) => [s.id, false]),
                      ),
                    )
                  }
                  className="text-xs font-medium text-muted-foreground hover:underline"
                >
                  None
                </button>
              </div>
            </div>
            {/* Scalable section switch grid — auto-columns, icon + label + switch */}
            <div className="grid gap-2 sm:grid-cols-4">
              {REPORT_SECTIONS.map((section) => {
                const Icon = SECTION_ICONS[section.id] || FileText;
                const included = !!reportSection?.[section.id];

                return (
                  <div
                    key={section.id}
                    className="flex w-auto items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-md ${
                          included
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-3.5" />
                      </span>

                      <span
                        className={`truncate text-sm font-medium ${
                          included ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {section.label}
                      </span>
                    </div>

                    <Switch
                      checked={included}
                      onCheckedChange={(checked) =>
                        setSectionIncluded(
                          section.id,
                          checked ? "include" : "exclude",
                        )
                      }
                      ariaLabel={`Toggle ${section.label}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-5">
          <div>
            <p className="text-sm font-medium text-foreground">
              School letterhead
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Include your school's logo and header on every report page.
            </p>
          </div>
          <Switch
            checked={schoolHead}
            onCheckedChange={(checked) =>
              onChange("schoolHead", checked)
            }
            ariaLabel="Toggle school letterhead"
          />
        </div>

        {/* Auto-generate */}
        {/* <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-5">
          <div>
            <p className="text-sm font-medium text-foreground">
              Auto-generate reports
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Automatically generate a report as soon as a screening is marked
              complete.
            </p>
          </div>
          <Switch
            checked={autoGenerate}
            onCheckedChange={setAutoGenerate}
            ariaLabel="Toggle auto-generate reports"
          />
        </div> */}

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
              onClick={() => onChange("tableDensity", "comfortable")}
              label="Comfortable"
              description="More whitespace"
            >
              <MiniTablePreview compact={false} />
            </SelectableCard>
            <SelectableCard
              selected={tableDensity === "compact"}
              onClick={() => onChange("tableDensity", "compact")}
              label="Compact"
              description="More rows per page"
            >
              <MiniTablePreview compact />
            </SelectableCard>
          </div>
        </div>
        {/* Screening Types */}
        <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <p className="text-sm font-medium text-foreground">Screening Types</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Row spacing for tables inside generated reports.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* <SelectableCard
              selected={tableDensity === "comfortable"}
              onClick={() => onChange("tableDensity", "comfortable")}
              label="Comfortable"
              description="More whitespace"
            >
              <MiniTablePreview compact={false} />
            </SelectableCard>
            <SelectableCard
              selected={tableDensity === "compact"}
              onClick={() => onChange("tableDensity", "compact")}
              label="Compact"
              description="More rows per page"
            >
              <MiniTablePreview compact />
            </SelectableCard> */}
          </div>
        </div>

        {/* Health card preview — reuses the same HealthCheckModal used on the
            student detail page so the report preview matches production. */}
        <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-5">
          <div>
            <p className="text-sm font-medium text-foreground">
              Health card preview
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Open the student health card to preview how the enabled report
              sections look with real screening data.
            </p>
          </div>
          {student ? (
            showPreview ? (
              <HealthCheckModal student={student} />
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(true)}
              >
                Preview health card
              </Button>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              No student available for preview.
            </p>
          )}
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
