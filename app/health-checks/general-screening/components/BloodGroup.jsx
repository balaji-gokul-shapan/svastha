import { FramerCard } from "@/util/FramerCard";
import React, { useMemo } from "react";
import { ToggleGroup } from "../utilities/toggleGroup";
import { Syringe } from "lucide-react";
import BloodDropOutlineIcon from "@iconify-react/healthicons/blood-drop-outline";

const BloodGroup = ({ bloodGroup, handleBloodGroupChange, formErrors, bloodGroupToggleOptions, immunizationOptions, immunization, setImmunization }) => {


  return (
    <FramerCard>
      <article className="space-y-4 rounded-xl border border-border bg-card p-4">
        <ToggleGroup
          icon={BloodDropOutlineIcon}
          label="Blood Group"
          options={bloodGroupToggleOptions}
          value={bloodGroup}
          onChange={handleBloodGroupChange}
          columns={4}
          iconBg={"bg-destructive/10"}
          textClass={"text-destructive"}
        />
        {formErrors?.bloodGroup && (
          <p className="text-xs text-destructive">{formErrors.bloodGroup}</p>
        )}
        <ToggleGroup
          icon={Syringe}
          label="Immunization Status"
          options={immunizationOptions}
          value={immunization}
          onChange={setImmunization}
          columns={3}
          iconBg={"bg-info/20"}
          textClass={"text-info"}
        />
      </article>
    </FramerCard>
  );
};

export default BloodGroup;
