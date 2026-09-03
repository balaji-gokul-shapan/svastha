import React from "react";
import { ClinicalSelect, SectionCard } from "../datas/ent-screening-data";
import { TextareaField } from "@/components/ui/text-field";
import { FramerCard } from "@/util/FramerCard";
import { Headphones } from "lucide-react";

const HeadNeckSpeech = ({ form, updateField }) => {
  return (
    <FramerCard>
      <SectionCard
        icon={Headphones}
        title="Head, Neck & Speech"
        description="Lymph nodes, neck, speech and other clinical findings"
        tone="green"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <ClinicalSelect
            label="Head / Neck Lymph Nodes"
            value={form.head_neck_lymph_nodes}
            onChange={(v) => updateField("head_neck_lymph_nodes", v)}
          />

          <ClinicalSelect
            label="Neck Swelling"
            value={form.neck_swelling}
            onChange={(v) => updateField("neck_swelling", v)}
          />

          <ClinicalSelect
            label="Speech"
            value={form.speech}
            onChange={(v) => updateField("speech", v)}
          />

          <ClinicalSelect
            label="Speech Clarity"
            value={form.speech_clarity}
            onChange={(v) => updateField("speech_clarity", v)}
          />
        </div>

        <div className="mt-5">
          {/* <FieldLabel>Other Findings</FieldLabel> */}

          <TextareaField
            label="Other Findings"
            value={form.any_other_findings}
            onChange={(e) => updateField("any_other_findings", e.target.value)}
            placeholder="Enter any other clinical findings..."
            rows={4}
          />
        </div>
      </SectionCard>
    </FramerCard>
  );
};

export default HeadNeckSpeech;
