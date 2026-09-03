import { FramerCard } from "@/util/FramerCard";
import { LensConvex } from "lucide-react";
import React from "react";
import { ToggleGroup } from "../utilities/toggleGroup";
import { SelectField } from "../utilities/selectField";
import { TextField } from "@/components/ui/text-field";

const LensCorrection = ({
  lensType,
  lensPower,
  lensRemarks,
  setLensType,
  setLensPower,
  setLensRemarks,
  yesNoOptions,
  usesGlasses,
  setUsesGlasses,
  getSelectedStudentScreeningData,
  lensTypeOptions,
}) => {
  return (
    <FramerCard>
      <article className="rounded-xl border border-border bg-card p-4">
        {/* <h3 className="text-sm font-semibold text-foreground">
                       
                      </h3> */}
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-info/10">
            <LensConvex className="size-4 text-info" />
          </span>
          Correction / Lens
        </h3>
        <div className="mt-3 space-y-3">
          <ToggleGroup
            label="Uses Glasses or Lens"
            options={yesNoOptions("neutral")}
            value={
              getSelectedStudentScreeningData?.uses_glasses_or_lens ||
              usesGlasses
            }
            onChange={setUsesGlasses}
          />
          <SelectField
            label="Lens Type"
            options={lensTypeOptions}
            value={lensType}
            onChange={setLensType}
          />
          <TextField
            label="Lens Power"
            value={lensPower}
            onChange={setLensPower}
            placeholder="e.g. -1.50 DS"
          />
          <TextField
            label="Lens Remarks"
            value={lensRemarks}
            onChange={setLensRemarks}
            placeholder="Optional"
          />
        </div>
      </article>
    </FramerCard>
  );
};

export default LensCorrection;
