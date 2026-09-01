"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, CheckCircle2, Clock, MousePointerClick, Syringe } from "lucide-react";

import { ImmunizationMatrix } from "./ImmunizationMatrix";
import {
  STATUS_META,
  ageInMonths,
  ageMilestones,
  cellStatus,
  demoDoseRecords,
  formatAge,
  studentOptions,
  vaccines,
} from "./immunization";

const STAT_TONE_CLASS = {
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
  muted: "text-muted-foreground bg-muted",
};

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2.5">
        <span className={`flex size-9 items-center justify-center rounded-lg ${STAT_TONE_CLASS[tone]}`}>
          <Icon className="size-4.5" strokeWidth={2.25} />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ImmunizationChartPage() {
  const [studentId, setStudentId] = useState(studentOptions[0].id);
  const [selectedCell, setSelectedCell] = useState(null);

  const student = studentOptions.find((s) => s.id === studentId);
  const ageMonths = ageInMonths(student.dob);

  // Every scheduled (vaccine, milestone) pair, each classified — the basis
  // for both the stat counts and the overdue/due-soon list.
  const allCells = useMemo(() => {
    const cells = [];
    vaccines.forEach((vaccine) => {
      vaccine.schedule.forEach((milestoneId) => {
        const milestone = ageMilestones.find((m) => m.id === milestoneId);
        if (!milestone) {
          // Unknown milestone id in a schedule — skip the cell (with a console
          // warning) instead of crashing the whole chart.
          console.warn(
            `immunization: vaccine "${vaccine.id}" references unknown milestone "${milestoneId}" — cell skipped`
          );
          return;
        }
        const record = demoDoseRecords.find((r) => r.vaccineId === vaccine.id && r.milestoneId === milestoneId);
        const status = cellStatus({ ageMonths, milestoneMonths: milestone.months, record });
        cells.push({ vaccine, milestone, status, record });
      });
    });
    return cells;
  }, [ageMonths]);

  const counts = useMemo(() => {
    const c = { given: 0, due: 0, overdue: 0, upcoming: 0 };
    allCells.forEach((cell) => (c[cell.status] += 1));
    return c;
  }, [allCells]);

  const completionPct = Math.round((counts.given / allCells.length) * 100);

  const actionItems = allCells
    .filter((c) => c.status === "overdue" || c.status === "due")
    .sort((a, b) => a.milestone.months - b.milestone.months);

  return (
    <section className="space-y-4">
      {/* Header — global .card style: student switcher + completion progress */}
      <div className="card flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-domain-immunization/10 text-domain-immunization">
            <Syringe className="size-5" strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Immunization Chart</h2>
            <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-3.5" />
              {student.name} · Age {formatAge(ageMonths)} · DOB {student.dob}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden w-40 sm:block">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Complete</span>
              <span className="font-semibold text-foreground">{completionPct}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-[width] duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <select
            value={studentId}
            onChange={(e) => {
              setStudentId(Number(e.target.value));
              setSelectedCell(null);
            }}
            aria-label="Select student"
            className="h-10 appearance-none rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            {studentOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Doses Given" value={`${counts.given} / ${allCells.length}`} tone="success" />
        <StatCard icon={Clock} label="Due Now" value={counts.due} tone="warning" />
        <StatCard icon={AlertTriangle} label="Overdue" value={counts.overdue} tone="destructive" />
        <StatCard icon={Syringe} label="Completion" value={`${completionPct}%`} tone={completionPct === 100 ? "success" : "muted"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Matrix */}
        <article className="card flex min-h-0 flex-col">
          <p className="text-xs text-muted-foreground">
            Tap any cell to see dose details. Blank cells mean that vaccine isn't scheduled at that age.
          </p>

           {selectedCell ? (
            <div className="mt-4 rounded-lg border border-border/70 bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {selectedCell.vaccine.name}{" "}
                  <span className="font-normal text-muted-foreground">— {selectedCell.milestone.label}</span>
                </p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STAT_TONE_CLASS[STATUS_META[selectedCell.status].tone]}`}
                >
                  {STATUS_META[selectedCell.status].label}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">Category</p>
                  <p className="text-sm font-medium text-foreground">{selectedCell.vaccine.category}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Date Given</p>
                  <p className="text-sm font-medium text-foreground">{selectedCell.record?.dateGiven ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Batch No.</p>
                  <p className="text-sm font-medium text-foreground">{selectedCell.record?.batch ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Administered By</p>
                  <p className="text-sm font-medium text-foreground">{selectedCell.record?.administeredBy ?? "—"}</p>
                </div>
              </div>
              {!selectedCell.record && (
                <button
                  type="button"
                  className="mt-4 h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Record Dose Given
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-4">
              <MousePointerClick className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Select a cell in the chart to see dose details — batch number, date given, and who administered it.
              </p>
            </div>
          )}
          <div className="mt-4 min-h-0">
            <ImmunizationMatrix
              vaccines={vaccines}
              ageMonths={ageMonths}
              records={demoDoseRecords}
              selectedCell={selectedCell}
              onSelectCell={setSelectedCell}
            />
          </div>

         
        </article>

        {/* Overdue & due-soon list */}
        <article className="card flex min-h-0 flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Needs Attention</h3>
            {actionItems.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                {actionItems.length}
              </span>
            )}
          </div>
          <div className="mt-3 max-h-[45vh] min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5 xl:max-h-[60vh]">
            {actionItems.length === 0 && (
              <p className="rounded-lg border border-border/70 bg-background p-3 text-sm text-muted-foreground">
                Nothing due or overdue right now.
              </p>
            )}
            {actionItems.map((item) => (
              <button
                key={`${item.vaccine.id}-${item.milestone.id}`}
                type="button"
                onClick={() => setSelectedCell(item)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/70 bg-background p-3 text-left transition-colors hover:bg-muted"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.vaccine.name}</p>
                  <p className="text-xs text-muted-foreground">{item.milestone.label}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STAT_TONE_CLASS[STATUS_META[item.status].tone]}`}
                >
                  {STATUS_META[item.status].label}
                </span>
              </button>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}