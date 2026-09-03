import React from "react";
import EarPanel, { SectionCard } from "../datas/ent-screening-data";
import { TextareaField } from "@/components/ui/text-field";
import { FramerCard } from "@/util/FramerCard";
import { Ear } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const EarExamination = ({ form, updateField }) => {
  return (
    <FramerCard>
      <SectionCard
        icon={Ear}
        title="Ear Examination"
        description="External ear, tympanic membrane and hearing assessment"
        tone="blue"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
          <EarPanel
            ear="Right Ear"
            short="RE"
            form={form}
            updateField={updateField}
          />

          <EarPanel
            ear="Left Ear"
            short="LE"
            form={form}
            updateField={updateField}
          />
        </div>

        <Separator className="my-6" />

        <div>
          <TextareaField
            label="Overall Ear Examination Findings"
            value={form.ear_comments}
            onChange={(e) => updateField("ear_comments", e.target.value)}
            placeholder="Enter overall ear examination findings..."
            rows={4}
          />
        </div>
      </SectionCard>
    </FramerCard>
  );
};

export default EarExamination;
