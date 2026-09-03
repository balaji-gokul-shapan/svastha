"use client";

import React from "react";
import { Stethoscope } from "lucide-react";
import { TextareaField } from "@/components/ui/text-field";
import { ToggleGroup } from "../utilities/toggleGroup";
import { FramerCard } from "@/util/FramerCard";

const ClinicalSignsCard = ({ data, onChange,  skinAssessmentToggleOptions }) => {
  return (
    <FramerCard>
    <section className="screening-card my-5">
      <article className="space-y-4 rounded-xl border border-border bg-card p-4 my-4">
        {/* Header */}
        {/* <div>
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h2 className="screening-title">Clinical Signs</h2>
          </div>
        </div> */}
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary aspect-square">
            <Stethoscope className="size-5" />
          </span>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
             Clinical Signs
            </h3>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Physical measurements and growth assessment
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-2">
          {/* LEFT - Clinical Signs (Yes/No pickers) */}
          <div className="grid gap-5">
            <ToggleGroup
              label="Pallor"
              options={[
                { value: "0", label: "No", tone: "good" },
                { value: "1", label: "Yes", tone: "warn" },
              ]}
              value={data.pallor}
              onChange={(value) => onChange("pallor", value)}
              columns={2}
            />

            <ToggleGroup
              label="Clubbing"
              options={[
                { value: "0", label: "No", tone: "good" },
                { value: "1", label: "Yes", tone: "warn" },
              ]}
              value={data.clubbing}
              onChange={(value) => onChange("clubbing", value)}
              columns={2}
            />

            <ToggleGroup
              label="Edema"
              options={[
                { value: "0", label: "No", tone: "good" },
                { value: "1", label: "Yes", tone: "warn" },
              ]}
              value={data.edema}
              onChange={(value) => onChange("edema", value)}
              columns={2}
            />

            <ToggleGroup
              label="Skin Assessment"
              options={skinAssessmentToggleOptions ?? [
                { value: "Normal", label: "Normal", tone: "good" },
                { value: "Abnormal", label: "Abnormal", tone: "warn" },
                { value: "Rashes", label: "Rashes", tone: "bad" },
              ]}
              value={data.skinAssessment}
              onChange={(value) => onChange("skinAssessment", value)}
              columns={3}
            />
          </div>

          {/* RIGHT - Free-text findings */}
          <div className="grid gap-4">
            <TextareaField
              label="Known Medical Condition / Allergy"
              value={data.medicalCondition}
              onChange={(event) =>
                onChange("medicalCondition", event.target.value)
              }
              rows={3}
              placeholder="Enter details..."
            />

            <TextareaField
              label="Any Current Complaints?"
              value={data.currentComplaints}
              onChange={(event) =>
                onChange("currentComplaints", event.target.value)
              }
              rows={3}
              placeholder="Enter details..."
            />

            <TextareaField
              label="Regular Medication"
              value={data.regularMedication}
              onChange={(event) =>
                onChange("regularMedication", event.target.value)
              }
              rows={3}
              placeholder="Enter details..."
            />
          </div>
        </div>
      </article>
    </section>
    </FramerCard>
  );
};

export default ClinicalSignsCard;
