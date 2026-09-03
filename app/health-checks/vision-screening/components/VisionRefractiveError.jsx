import { TextField } from "@/components/ui/text-field";
import { FramerCard } from "@/util/FramerCard";
import { Focus } from "lucide-react";
import React from "react";
import { SelectField } from "../utilities/selectField";

const VisionRefractiveError = ({
  refractiveErrorRemarks,
  refractiveError,
  setRefractiveError,
  setRefractiveErrorRemarks,
  refractiveErrorOptions,
}) => {
  return (
    <FramerCard>
      <article className="rounded-xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-success/10">
            <Focus className="size-4 text-success" />
          </span>
          Refractive Error
        </h3>
        <div className="mt-3 space-y-3">
          <SelectField
            label="Refractive Error"
            options={refractiveErrorOptions}
            value={refractiveError}
            onChange={setRefractiveError}
          />
          <TextField
            label="Remarks"
            value={refractiveErrorRemarks}
            onChange={setRefractiveErrorRemarks}
            placeholder="Optional"
          />
        </div>
      </article>
    </FramerCard>
  );
};

export default VisionRefractiveError;
