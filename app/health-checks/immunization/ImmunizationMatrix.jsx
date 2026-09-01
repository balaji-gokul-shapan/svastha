"use client";

import { Check, CircleDot, Clock, X } from "lucide-react";

import { STATUS_META, ageMilestones, cellStatus } from "./immunization";

const STATUS_ICON = {
  given: Check,
  due: Clock,
  overdue: X,
  upcoming: CircleDot,
};

const STATUS_CELL_CLASS = {
  given: "bg-success/15 text-success hover:bg-success/25",
  due: "bg-warning/20 text-warning-foreground hover:bg-warning/30",
  overdue: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  upcoming: "bg-muted text-muted-foreground/60 hover:bg-muted-foreground/15",
};

const LEGEND_ITEMS = ["given", "due", "overdue", "upcoming"];

function Cell({ vaccine, milestone, ageMonths, record, isSelected, onSelect }) {
  const inSchedule = vaccine.schedule.includes(milestone.id);
  if (!inSchedule) {
    return <td className="w-14 min-w-14 border border-border/50 bg-background/50" aria-hidden="true" />;
  }

  const status = cellStatus({ ageMonths, milestoneMonths: milestone.months, record });
  const Icon = STATUS_ICON[status];

  return (
    <td className="w-14 min-w-14 border border-border/50 p-1">
      <button
        type="button"
        onClick={() => onSelect({ vaccine, milestone, status, record })}
        aria-label={`${vaccine.name}, ${milestone.label}, ${STATUS_META[status].label}`}
        className={`flex size-9 items-center justify-center rounded-md transition-colors ${STATUS_CELL_CLASS[status]} ${
          isSelected ? "ring-2 ring-primary" : ""
        }`}
      >
        <Icon className="size-4" strokeWidth={2.25} />
      </button>
    </td>
  );
}

export function ImmunizationMatrix({ vaccines, ageMonths, records, selectedCell, onSelectCell }) {
  const recordFor = (vaccineId, milestoneId) =>
    records.find((r) => r.vaccineId === vaccineId && r.milestoneId === milestoneId);

  return (
    <div>
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {LEGEND_ITEMS.map((status) => {
          const Icon = STATUS_ICON[status];
          return (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`flex size-5 items-center justify-center rounded ${STATUS_CELL_CLASS[status]}`}>
                <Icon className="size-3" strokeWidth={2.5} />
              </span>
              <span className="text-xs text-muted-foreground">{STATUS_META[status].label}</span>
            </div>
          );
        })}
      </div>

      {/* Matrix — scrolls on both axes; age-header row and vaccine column stay pinned */}
      <div className="max-h-[60vh] overflow-auto rounded-lg border border-border">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-30 min-w-[160px] border-b border-r border-border bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Vaccine
              </th>
              {ageMilestones.map((m) => (
                <th
                  key={m.id}
                  className="sticky top-0 z-20 min-w-14 border-b border-border bg-card px-1 py-2 text-center text-[11px] font-medium text-muted-foreground"
                >
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vaccines.map((vaccine) => (
              <tr key={vaccine.id}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border border-border/50 bg-card px-3 py-2 text-left text-sm font-medium text-foreground"
                >
                  {vaccine.name}
                </th>
                {ageMilestones.map((milestone) => (
                  <Cell
                    key={milestone.id}
                    vaccine={vaccine}
                    milestone={milestone}
                    ageMonths={ageMonths}
                    record={recordFor(vaccine.id, milestone.id)}
                    isSelected={
                      selectedCell?.vaccine.id === vaccine.id && selectedCell?.milestone.id === milestone.id
                    }
                    onSelect={onSelectCell}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}