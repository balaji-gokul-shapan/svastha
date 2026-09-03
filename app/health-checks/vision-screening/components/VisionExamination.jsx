import { FramerCard } from "@/util/FramerCard";
import React from "react";
import IExamMultipleChoiceOutlineIcon from "@iconify-react/healthicons/i-exam-multiple-choice-outline";
import ReusableSelect from "@/components/ui/reusable-select";
import { TextareaField } from "@/components/ui/text-field";
import { SelectField } from "../utilities/selectField";

const VisionExamination = ({
  lids,
  conjunctiva,
  cornea,
  pupil,
  externalOtherFindings,
  setExternalOtherFindings,
  setLids,
  setConjunctiva,
  setCornea,
  setPupil,
  lidsOptions,
  conjunctivaOptions,
  corneaOptions,
  pupilOptions,
}) => {
  return (
    <FramerCard>
      <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
        {/* <h3 className="text-sm font-semibold text-foreground">
                    External Examination
                  </h3> */}
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-domain-vision/10">
            <IExamMultipleChoiceOutlineIcon className="size-4 text-domain-vision" />
          </span>
          External Examination
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Lids"
            options={lidsOptions}
            value={lids}
            onChange={setLids}
          />
          <SelectField
            label="Conjunctiva"
            options={conjunctivaOptions}
            value={conjunctiva}
            onChange={setConjunctiva}
          />
          <SelectField
            label="Cornea"
            options={corneaOptions}
            value={cornea}
            onChange={setCornea}
          />
          <SelectField
            label="Pupil"
            options={pupilOptions}
            value={pupil}
            onChange={setPupil}
          />
        </div>
        <div className="mt-3">
          {/* <FieldLabel>Other Findings</FieldLabel> */}
          <TextareaField
            label="Other Findings"
            value={externalOtherFindings}
            onChange={(e) => setExternalOtherFindings(e.target.value)}
            rows={3}
            placeholder="Enter notes"
            className="w-full resize-none rounded-md   p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </article>
    </FramerCard>
  );
};

export default VisionExamination;
