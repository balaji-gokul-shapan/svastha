import ReusableSelect from "@/components/ui/reusable-select";
import { FramerCard } from "@/util/FramerCard";
import React from "react";
import HealthDataSecurityOutlineIcon from "@iconify-react/healthicons/health-data-security-outline";

const HealthHistory = ({
  allergy,
  chronicDisease,
  handleAllergyChange,
  handleChronicDiseaseChange,
  formErrors,
  allergies,
  chronicDiseasesOption,
}) => {
  return (
    <FramerCard>
      <article className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
            <HealthDataSecurityOutlineIcon className="size-4 text-info" />
          </div>

          <h3 className="text-sm font-semibold text-foreground">
            Health History
          </h3>
        </div>
        <div className="mt-3 space-y-3">
          <ReusableSelect
            label="Allergy"
            options={["None", ...allergies.map((item) => item.name)]}
            value={allergy}
            onChange={handleAllergyChange}
            error={formErrors?.allergy}
          />
          <ReusableSelect
            label="Chronic Disease"
            options={[
              "None",
              ...chronicDiseasesOption.map((item) => item.name),
            ]}
            value={chronicDisease}
            onChange={handleChronicDiseaseChange}
            error={formErrors?.chronicDisease}
          />
        </div>
      </article>
    </FramerCard>
  );
};

export default HealthHistory;
