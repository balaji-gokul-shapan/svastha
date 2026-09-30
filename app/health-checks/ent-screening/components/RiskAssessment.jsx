import React from "react";
import { RiskToggle } from "../datas/ent-screening-data";
import { FramerCard } from "@/util/FramerCard";
import { ShieldAlert } from "lucide-react";
import { TextField } from "@/components/ui/text-field";

const RiskAssessment = ({ form, updateField }) => {
  return (
    <FramerCard>
      <div className="gs-panel">
        <div className="gs-panel__head">
          <span className="gs-panel__icon text-warning">
            <ShieldAlert className="size-4" />
          </span>

          <div className="min-w-0">
            <p className="gs-panel__title">ENT Risk Assessment</p>

            <p className="gs-panel__sub">Identify relevant risk factors</p>
          </div>
        </div>

        <div className="gs-panel__body">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            <RiskToggle
              label="Frequent Ear Infections"
              checked={form.risk_frequent_ear_infections}
              onChange={(v) => updateField("risk_frequent_ear_infections", v)}
            />

            <RiskToggle
              label="Allergic Rhinitis"
              checked={form.risk_allergic_rhinitis}
              onChange={(v) => updateField("risk_allergic_rhinitis", v)}
            />

            <RiskToggle
              label="Speech Delay"
              checked={form.risk_speech_delay}
              onChange={(v) => updateField("risk_speech_delay", v)}
            />

            <RiskToggle
              label="Hearing Difficulty"
              checked={form.risk_hearing_difficulty}
              onChange={(v) => updateField("risk_hearing_difficulty", v)}
            />

            <RiskToggle
              label="Tonsil / Adenoid Problems"
              checked={form.risk_tonsil_adenoid_problems}
              onChange={(v) => updateField("risk_tonsil_adenoid_problems", v)}
            />

            <RiskToggle
              label="Nasal Obstruction"
              checked={form.risk_nasal_obstruction}
              onChange={(v) => updateField("risk_nasal_obstruction", v)}
            />

            <RiskToggle
              label="Chronic Cough"
              checked={form.risk_chronic_cough}
              onChange={(v) => updateField("risk_chronic_cough", v)}
            />
          </div>

          <div className="mt-4">
            {/* <FieldLabel>Other Risk Factors</FieldLabel> */}

            <TextField
              label="Other Risk Factors"
              value={form.risk_others}
              onChange={(e) => updateField("risk_others", e.target.value)}
              placeholder="Enter other risk factors..."
            />
          </div>
        </div>
      </div>
    </FramerCard>
  );
};

export default RiskAssessment;
