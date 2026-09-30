"use client";

import React from "react";
import {
  Stethoscope,
  Ear,
  Wind,
  Send,
  ShieldAlert,
  Activity,
  Mic,
  MessageCircle,
} from "lucide-react";



const NA_VALUES = new Set([
  "—",
  "",
  "Not assessed",
  "Not recorded",
  "NA",
  "None",
  "No",
  "Not specified",
]);

const clean = (value) => {
  if (value === true) return "Yes";
  if (value === false) return "No";

  const text = String(value ?? "").trim();

  return !text || NA_VALUES.has(text) ? "—" : text;
};

const isBlank = (value) => clean(value) === "—";

const TONE_CLASS = {
  info: "text-info bg-info/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
  muted: "text-muted-foreground bg-muted",
};

function Readout({ icon: Icon, label, value, tone = "muted" }) {
  const blank = isBlank(value);

  return (
    <div
      className={`gs-readout ${blank ? "gs-readout--blank" : "gs-readout--filled"}`}
      title={`${label}: ${clean(value)}`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-md ${
          TONE_CLASS[tone] ?? TONE_CLASS.muted
        }`}
      >
        <Icon className="size-3" strokeWidth={2.25} />
      </span>

      <span className="gs-readout__label">{label}</span>

      <span className="gs-readout__value">
        <span className={blank ? "gs-empty" : ""}>{clean(value)}</span>
      </span>
    </div>
  );
}

export function EntSummaryCard({ form = {} }) {
  /* Count the flagged risk factors so the header can show a live tally —
     derived from the same booleans, no new state. */
  const riskCount = [
    form.risk_frequent_ear_infections,
    form.risk_allergic_rhinitis,
    form.risk_speech_delay,
    form.risk_hearing_difficulty,
    form.risk_tonsil_adenoid_problems,
    form.risk_nasal_obstruction,
    form.risk_chronic_cough,
  ].filter(Boolean).length;

  return (
    <div className="gs-panel">
      <div className="gs-panel__head">
        <span className="gs-panel__icon">
          <Stethoscope className="size-4" />
        </span>

        <div className="min-w-0">
          <p className="gs-panel__title">ENT Summary</p>

          <p className="gs-panel__sub">
            {riskCount > 0
              ? `${riskCount} risk factor${riskCount === 1 ? "" : "s"} flagged`
              : "Ear, nose, throat and airway"}
          </p>
        </div>
      </div>

      <div className="space-y-2 p-2.5">
        {/* Grading first — the single most important readout. The rail turns
            green when nothing is flagged, blue once a risk appears. */}
        <div
          className={`gs-subpanel ${
            riskCount > 0 ? "gs-subpanel--od" : "gs-subpanel--ou"
          }`}
        >
          <p className="gs-subpanel__head">Clinical Grade</p>

          <div className="space-y-0.5 pl-2">
            <Readout
              icon={Activity}
              label="ENT Grade"
              value={form.ent_grade}
              tone="info"
            />
            <Readout
              icon={Stethoscope}
              label="Severity"
              value={form.severity}
              tone={form.severity ? "warning" : "muted"}
            />
            <Readout
              icon={ShieldAlert}
              label="Risk Level"
              value={form.risk_level}
              tone={riskCount > 0 ? "warning" : "muted"}
            />
          </div>
        </div>

        <p className="gs-readout__group">Nose &amp; Sinus</p>

        <Readout
          icon={Wind}
          label="Nasal Breathing"
          value={form.nasal_breathing}
          tone="info"
        />
        <Readout
          icon={Wind}
          label="Nasal Blockage"
          value={form.nasal_blockage}
          tone="info"
        />
        <Readout
          icon={Wind}
          label="Nasal Discharge"
          value={form.nasal_discharge}
          tone="info"
        />

        <p className="gs-readout__group">Throat</p>

        <Readout
          icon={MessageCircle}
          label="Oropharynx"
          value={form.oropharynx}
          tone="info"
        />
        <Readout
          icon={MessageCircle}
          label="Tonsils"
          value={form.tonsils}
          tone="info"
        />
        <Readout
          icon={MessageCircle}
          label="Pharyngeal Wall"
          value={form.pharyngeal_wall}
          tone="info"
        />

        <p className="gs-readout__group">Ear &amp; Speech</p>

        <Readout
          icon={Ear}
          label="TM Right"
          value={form.tympanic_membrane_re}
          tone="info"
        />
        <Readout
          icon={Ear}
          label="TM Left"
          value={form.tympanic_membrane_le}
          tone="info"
        />
        <Readout icon={Mic} label="Speech" value={form.speech} tone="info" />
        <Readout
          icon={ShieldAlert}
          label="Lymph Nodes"
          value={form.head_neck_lymph_nodes}
          tone="info"
        />

        <p className="gs-readout__group">Airway &amp; Sleep</p>

        <Readout icon={Wind} label="Snoring" value={form.snoring} tone="info" />
        <Readout
          icon={Wind}
          label="Mouth Breathing"
          value={form.mouth_breathing}
          tone="info"
        />

        <p className="gs-readout__group">Plan</p>

        <Readout
          icon={Send}
          label="Referral"
          value={form.referral_required ? "Required" : "Not Required"}
          tone={form.referral_required ? "warning" : "success"}
        />
        <Readout
          icon={Send}
          label="Follow-up"
          value={form.follow_up_recommended ? "Recommended" : "Not Required"}
          tone={form.follow_up_recommended ? "warning" : "success"}
        />
        <Readout
          icon={Send}
          label="Next Review"
          value={form.next_review_date}
          tone="info"
        />
      </div>
    </div>
  );
}

export default EntSummaryCard;
