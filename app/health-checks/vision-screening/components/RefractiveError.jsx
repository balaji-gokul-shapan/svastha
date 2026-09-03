import { TextField } from "@/components/ui/text-field";
import React from "react";
import { ToggleGroup } from "../utilities/toggleGroup";
import { EyeDashed } from "lucide-react";
import ReusableSelect from "@/components/ui/reusable-select";
import { FramerCard } from "@/util/FramerCard";
import { SelectField } from "../utilities/selectField";

const RefractiveError = ({
  colorVisionData,
  setColorVisionStatus,
  setColorVisionTestType,
  setColorVisionRemarks,
  coverTest,
  setCoverTest,
  strabismus,
  setStrabismus,
  muscleBalanceRemarks,
  setMuscleBalanceRemarks,
  colorVisionStatus,
  colorVisionRemarks,
  colorVisionTestType,
  coverTestOptions,
  colorVisionTestTypeOptions,
  yesNoOptions,
}) => {
  return (
    <FramerCard>
      <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
        {/* <h3 className="text-sm font-semibold text-foreground">
                    Color Vision &amp; Muscle Balance
                  </h3> */}
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-warning/10">
            <EyeDashed className="size-4 text-warning" />
          </span>
          Refractive Error
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Color Vision Status"
            options={colorVisionData?.map((item) => item.name)}
            value={colorVisionStatus}
            onChange={setColorVisionStatus}
          />
          <SelectField
            label="Test Type"
            options={colorVisionTestTypeOptions}
            value={colorVisionTestType}
            onChange={setColorVisionTestType}
          />
          <TextField
          className="sm:col-span-2"
            label="Color Vision Remarks"
            value={colorVisionRemarks}
            onChange={setColorVisionRemarks}
            placeholder="Optional"
          />
          <SelectField
            label="Muscle Balance Status"
            // options={muscleBalanceData?.map((item) => item.name)}
            // label="Cover Test"
            options={coverTestOptions}
            value={coverTest}
            onChange={setCoverTest}
          />
          <div>
            <ToggleGroup
                labelClassName="mb-1.5 block text-xs text-muted-foreground"
              label="Strabismus"
              options={yesNoOptions("no")}
              value={strabismus}
              onChange={setStrabismus}
            />
          </div>
          <TextField
            label="Muscle Balance Remarks"
            value={muscleBalanceRemarks}
            onChange={setMuscleBalanceRemarks}
            placeholder="Optional"
          />
        </div>
      </article>
    </FramerCard>
  );
};

export default RefractiveError;
