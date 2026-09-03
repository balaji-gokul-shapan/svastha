import { CheckCircle2 } from "lucide-react";
import React from "react";
import ToothIcon from "../asset/toothIcon";

const Review = ({
  quickFindings,
  oralHygiene,
  notes,
  otherFindingsOptions,
  gingivalHealth,
  plaque,
  referralAction,
  referralReason,
  followUpValue,
  riskScoreValue,
  severityScoreValue,
  otherFindings,
  careInstructions,
  sidebarNotes,
}) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 className="size-5" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">
              Review & Submit
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Review the complete dental screening before saving.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
          <span className="size-2 rounded-full bg-emerald-500" />
          Ready to submit
        </div>
      </div>

      <div className="space-y-6 p-5">
        {/* Tooth Details */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Tooth Details
              </h4>
              <p className="text-xs text-muted-foreground">
                Overview of the recorded tooth findings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border bg-background p-4 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Healthy
                </span>

                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <ToothIcon type="healthy" />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-foreground">
                {quickFindings.healthy}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Healthy teeth
              </p>
            </div>

            <div className="rounded-xl border bg-background p-4 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Caries
                </span>

                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <ToothIcon type="caries" />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-foreground">
                {quickFindings.caries}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Teeth with caries
              </p>
            </div>

            <div className="rounded-xl border bg-background p-4 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Missing
                </span>

                <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/10">
                  <ToothIcon type="missing" />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-foreground">
                {quickFindings.missing}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Missing teeth
              </p>
            </div>

            <div className="rounded-xl border bg-background p-4 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Other
                </span>

                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <ToothIcon type="other" />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-foreground">
                {quickFindings.other}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Other findings
              </p>
            </div>
          </div>
        </section>

        {/* Oral Health + Scores */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Oral Hygiene */}
          <section className="rounded-xl border bg-background p-4">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground">
                Oral Hygiene
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Current oral health assessment
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-3">
                <span className="text-sm text-muted-foreground">
                  Oral Hygiene
                </span>

                <span className="rounded-md border bg-background px-2.5 py-1 text-sm font-medium">
                  {oralHygiene || "Not assessed"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-3">
                <span className="text-sm text-muted-foreground">
                  Gingival Health
                </span>

                <span className="rounded-md border bg-background px-2.5 py-1 text-sm font-medium">
                  {gingivalHealth || "Not assessed"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-3">
                <span className="text-sm text-muted-foreground">Plaque</span>

                <span className="rounded-md border bg-background px-2.5 py-1 text-sm font-medium">
                  {plaque || "Not assessed"}
                </span>
              </div>
            </div>
          </section>

          {/* Scores */}
          <section className="rounded-xl border bg-background p-4">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground">
                Screening Scores
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Calculated dental screening scores
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Risk Score
                </p>

                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {riskScoreValue}
                  </span>

                  <span className="mb-1 text-sm text-muted-foreground">
                    / 5
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${(riskScoreValue / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Severity Score
                </p>

                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {severityScoreValue}
                  </span>

                  <span className="mb-1 text-sm text-muted-foreground">
                    / 5
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${(severityScoreValue / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
          {/* Findings */}
          <section className="rounded-xl border bg-background p-4">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground">
                Findings & Notes
              </h4>

              <p className="mt-1 text-xs text-muted-foreground">
                Additional observations recorded during screening
              </p>
            </div>

            <div className="space-y-4">
              {/* Selected Findings */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Selected Findings
                </p>

                <div className="flex flex-wrap gap-2">
                  {otherFindingsOptions.filter(({ id }) => otherFindings[id])
                    .length > 0 ? (
                    otherFindingsOptions
                      .filter(({ id }) => otherFindings[id])
                      .map(({ id, label }) => (
                        <span
                          key={id}
                          className="rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground"
                        >
                          {label}
                        </span>
                      ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No additional findings recorded
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Notes
                </p>

                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {notes || "No additional notes were recorded."}
                  </p>
                </div>
              </div>

              {/* Care Instructions */}
              {careInstructions && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Care Instructions
                  </p>

                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                      {careInstructions}
                    </p>
                  </div>
                </div>
              )}

              {/* Sidebar Notes */}
              {sidebarNotes && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Sidebar Notes
                  </p>

                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                      {sidebarNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Final Confirmation */}
        {/* <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CheckCircle2 className="size-4" />
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            Ready to submit
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Please verify the information above. Once submitted, the dental
            screening will be saved for this student.
          </p>
        </div>
      </div> */}
      </div>
    </article>
  );
};

export default Review;
