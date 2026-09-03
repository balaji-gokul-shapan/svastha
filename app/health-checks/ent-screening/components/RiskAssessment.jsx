import React from "react";
import { RiskToggle } from "../datas/ent-screening-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FramerCard } from "@/util/FramerCard";
import { ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/ui/text-field";

const RiskAssessment = ({ form, updateField }) => {
  return (
    <FramerCard>
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <ShieldAlert className="size-5" />
            </div>

            <div>
              <CardTitle className="text-base">ENT Risk Assessment</CardTitle>

              <p className="text-xs text-muted-foreground">
                Identify relevant risk factors
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </CardContent>
      </Card>
    </FramerCard>
  );
};

export default RiskAssessment;
