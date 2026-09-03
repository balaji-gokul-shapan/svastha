import {
  Activity,
  CheckCircle2,
  Ear,
  Headphones,
  Radio,
  ShieldAlert,
  Stethoscope,
  Waves,
} from "lucide-react";
import React from "react";
import { SummaryRow } from "../utilities/SummaryRow";

function ReviewSection({ icon: Icon, title, description, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

const Review = ({ form, reHearingResult, leHearingResult, formErrors }) => {
  const riskFields = [
    { label: "Frequent Ear Infections", value: form.risk_frequent_ear_infections },
    { label: "Speech Delay", value: form.risk_speech_delay },
    { label: "Learning Difficulty", value: form.risk_learning_difficulty },
    { label: "Family History", value: form.risk_family_history_hearing_loss },
    { label: "Noise Exposure", value: form.risk_noise_exposure },
    { label: "Other Risks", value: form.risk_others },
  ];

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 className="size-5" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">
              Review &amp; Submit
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Review the complete hearing screening before saving.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
          <span className="size-2 rounded-full bg-emerald-500" />
          Ready to submit
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        {/* ------------------- Pure Tone Audiometry ------------------- */}
        <ReviewSection
          icon={Waves}
          title="Pure Tone Audiometry"
          description="Hearing thresholds summary"
        >
          <div className="space-y-2">
            <SummaryRow
              icon={Ear}
              label="Right Ear PTA"
              value={
                reHearingResult?.classification
                  ? `${reHearingResult.pta.toFixed(1)} dB · ${reHearingResult.classification.severity}`
                  : form.pta_500hz_re
                    ? `${form.pta_500hz_re} dB`
                    : "Not assessed"
              }
            />

            <SummaryRow
              icon={Ear}
              label="Left Ear PTA"
              value={
                leHearingResult?.classification
                  ? `${leHearingResult.pta.toFixed(1)} dB · ${leHearingResult.classification.severity}`
                  : form.pta_500hz_le
                    ? `${form.pta_500hz_le} dB`
                    : "Not assessed"
              }
            />

            <SummaryRow
              icon={Activity}
              label="Overall Status"
              value={form.overall_status || "Not assessed"}
            />
          </div>
        </ReviewSection>

        {/* ------------------- Whisper Test ------------------- */}
        <ReviewSection
          icon={Headphones}
          title="Whisper Test"
          description="Speech perception screening"
        >
          <div className="space-y-2">
            <SummaryRow
              icon={Ear}
              label="Right Ear"
              value={form.whisper_test_re || "Not assessed"}
            />

            <SummaryRow
              icon={Ear}
              label="Left Ear"
              value={form.whisper_test_le || "Not assessed"}
            />

            <SummaryRow
              icon={Activity}
              label="Distance"
              value={form.whisper_test_distance || "Not recorded"}
            />

            <SummaryRow
              icon={Activity}
              label="Remarks"
              value={form.whisper_test_remarks || "None"}
            />
          </div>
        </ReviewSection>

        {/* ------------------- Ear Examination ------------------- */}
        <ReviewSection
          icon={Stethoscope}
          title="Ear Health & Examination"
          description="Physical ear findings"
        >
          <div className="space-y-2">
            <SummaryRow
              icon={Ear}
              label="Right Ear Exam"
              value={form.ear_exam_re || "Not assessed"}
            />

            <SummaryRow
              icon={Ear}
              label="Left Ear Exam"
              value={form.ear_exam_le || "Not assessed"}
            />
          </div>
        </ReviewSection>

        {/* ------------------- Tympanometry ------------------- */}
        <ReviewSection
          icon={Radio}
          title="Tympanometry"
          description="Middle ear function"
        >
          <div className="space-y-2">
            <SummaryRow
              icon={Ear}
              label="Right Ear"
              value={form.tympanometry_re || "Not assessed"}
            />

            <SummaryRow
              icon={Ear}
              label="Left Ear"
              value={form.tympanometry_le || "Not assessed"}
            />
          </div>
        </ReviewSection>


        {/* ------------------- Risk Factors ------------------- */}
        <ReviewSection
          icon={ShieldAlert}
          title="Hearing Risk Factors"
          description="Recorded history and risk indicators"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {riskFields.map((risk) => (
              <div
                key={risk.label}
                className="flex items-center justify-between rounded-lg border border-border/70 p-2.5"
              >
                <span className="text-xs text-muted-foreground">
                  {risk.label}
                </span>

                <span className="text-xs font-medium text-foreground">
                  {risk.value || "—"}
                </span>
              </div>
            ))}
          </div>
        </ReviewSection>

        {/* ------------------- Referral & Follow-up ------------------- */}
        <ReviewSection
          icon={Radio}
          title="Referral & Follow-up"
          description="Recommended next steps"
        >
          <div className="space-y-2">
            <SummaryRow
              icon={Activity}
              label="Referral Grade"
              value={form.referral_grade || "—"}
            />

            <SummaryRow
              icon={Activity}
              label="Recommendation"
              value={form.recommendation_type || "—"}
            />

            <SummaryRow
              icon={Ear}
              label="Recommended To"
              value={form.recommended_to || "—"}
            />

            <SummaryRow
              icon={ShieldAlert}
              label="Priority"
              value={form.referral_priority || "None"}
            />

            <SummaryRow
              icon={ShieldAlert}
              label="Referral Reason"
              value={form.referral_reason || "—"}
            />

            <SummaryRow
              icon={Activity}
              label="Follow-up"
              value={form.follow_up || "—"}
            />
          </div>
        </ReviewSection>
      </div>

      {/* Validation summary */}
      {formErrors && Object.keys(formErrors).length > 0 ? (
        <div className="border-t bg-destructive/5 p-5">
          <p className="text-xs font-semibold text-destructive">
            Please fix the following before saving:
          </p>

          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-destructive">
            {Object.entries(formErrors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
};

export default Review;

