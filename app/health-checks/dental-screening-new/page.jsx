"use client";

import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  Droplets,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { TONE_BADGE_CLASS, findingTone, formatDate, referralGradeTone } from "./dental-screening-data";


// import { formatDate, findingTone, referralGradeTone, TONE_BADGE_CLASS } from "@/components/dental/report-helpers";
import { FindingsDonut } from "./findingsDonut";
import { ScoreMeter } from "./scoreMeter";

// Demo record — replace with the fetched assessment (e.g. GET /dental-assessments/:id).
const sampleReport = {
  id: 101,
  student_id: 1001,
  created_at: "2026-08-01T09:30:00Z",
  updated_at: "2026-08-01T09:30:00Z",

  healthy_count: 25,
  caries_count: 2,
  missing_count: 0,
  other_issues_count: 1,

  oral_hygiene: "Good",
  gingival_health: "Healthy",
  plaque: "Mild",
  dental_fluorosis: "None",
  malocclusion: "None",
  tooth_wear: "Normal",
  oral_ulcer: "None",
  trauma: "None",
  other_findings: "Mild plaque accumulation",

  preventive_cleaning: "Recommended",
  preventive_fluoride: "Recommended",
  preventive_education: "Provided",

  risk_score: 2,
  severity_score: 2,

  referral_grade: "A",
  referral_action: "Routine dental follow-up",
  referral_reason: "Minor dental caries",

  care_instructions: "Brush twice daily and floss regularly",
  notes: "Overall good oral health",
  follow_up: "6 months",
};

const CLINICAL_FINDINGS = [
  { key: "oral_hygiene", label: "Oral Hygiene" },
  { key: "gingival_health", label: "Gingival Health" },
  { key: "plaque", label: "Plaque" },
  { key: "dental_fluorosis", label: "Dental Fluorosis" },
  { key: "malocclusion", label: "Malocclusion" },
  { key: "tooth_wear", label: "Tooth Wear" },
  { key: "oral_ulcer", label: "Oral Ulcer" },
  { key: "trauma", label: "Trauma" },
];

const PREVENTIVE_ITEMS = [
  { key: "preventive_cleaning", label: "Cleaning" },
  { key: "preventive_fluoride", label: "Fluoride" },
  { key: "preventive_education", label: "Education" },
];

function FindingBadge({ label, value }) {
  const tone = findingTone(value);
  return (
    <div className="rounded-lg border border-border/70 bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${TONE_BADGE_CLASS[tone]}`}>
        {value || "—"}
      </span>
    </div>
  );
}

export default function DentalAssessmentReportPage({ report = sampleReport }) {
  const overallTone = report.severity_score <= 1 ? "success" : report.severity_score <= 3 ? "warning" : "destructive";
  const overallLabel = report.severity_score <= 1 ? "Low Concern" : report.severity_score <= 3 ? "Some Concern" : "High Concern";

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sf text-xl font-bold text-foreground">Dental Assessment Report</h2>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_BADGE_CLASS[overallTone]}`}>
              {overallLabel}
            </span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>Student #{report.student_id}</span>
            <span className="text-border">•</span>
            <span>Assessment #{report.id}</span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {formatDate(report.created_at)}
            </span>
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${TONE_BADGE_CLASS[referralGradeTone(report.referral_grade)]}`}>
          Referral Grade {report.referral_grade}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        {/* ---------------- Main column ---------------- */}
        <div className="space-y-4">
          <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              Findings Overview
            </h3>
            <div className="mt-4">
              <FindingsDonut report={report} />
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Stethoscope className="size-4 text-primary" />
              Clinical Findings
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CLINICAL_FINDINGS.map((f) => (
                <FindingBadge key={f.key} label={f.label} value={report[f.key]} />
              ))}
            </div>
            {report.other_findings && (
              <div className="mt-3 rounded-lg border border-border/70 bg-background p-3">
                <p className="text-xs text-muted-foreground">Other Findings</p>
                <p className="mt-1 text-sm text-foreground">{report.other_findings}</p>
              </div>
            )}
          </article>

          <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Droplets className="size-4 text-primary" />
              Preventive Care Plan
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {PREVENTIVE_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background p-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-info/10 text-info">
                    <ClipboardCheck className="size-4" strokeWidth={2.25} />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{report[item.key]}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* ---------------- Sidebar ---------------- */}
        <div className="space-y-4">
          <article className="space-y-4 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Risk &amp; Severity</h3>
            <ScoreMeter label="Risk Score" score={report.risk_score} />
            <ScoreMeter label="Severity Score" score={report.severity_score} />
          </article>

          <article className="space-y-3 rounded-xl border border-warning/40 bg-warning/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldAlert className="size-4 text-warning" />
              Referral
            </h3>
            <div>
              <p className="text-xs text-muted-foreground">Recommended Action</p>
              <p className="text-sm font-medium text-foreground">{report.referral_action}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reason</p>
              <p className="text-sm font-medium text-foreground">{report.referral_reason}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Follow-up</p>
              <p className="text-sm font-medium text-foreground">{report.follow_up}</p>
            </div>
          </article>

          <article className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookOpen className="size-4 text-primary" />
              Care Instructions &amp; Notes
            </h3>
            <div>
              <p className="text-xs text-muted-foreground">Care Instructions</p>
              <p className="text-sm text-foreground">{report.care_instructions}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm text-foreground">{report.notes}</p>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">Last updated {formatDate(report.updated_at)}</p>
          </article>
        </div>
      </div>
    </section>
  );
}