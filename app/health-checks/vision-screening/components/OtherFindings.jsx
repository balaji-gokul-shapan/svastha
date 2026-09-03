import { TextareaField, TextField } from "@/components/ui/text-field";
import { FramerCard } from "@/util/FramerCard";
import React from "react";
import { ToggleGroup } from "../utilities/toggleGroup";

const OtherFindings = ({
  otherFindings,
  toggleFinding,
  otherFindingsOptions,
  selectedFinding,
  setSelectedFinding,
}) => {
  // Convert otherFindingsOptions to ToggleGroup format
  const toggleOptions = otherFindingsOptions.map((opt) => ({
    value: opt.id,
    label: opt.label,
    tone: "neutral",
  }));

  return (
    <FramerCard>
      <article className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Other Findings
        </h3>
        <div className="mt-3 space-y-2.5">
          <ToggleGroup
            label="Select Finding"
            options={toggleOptions}
            value={selectedFinding}
            onChange={setSelectedFinding}
            columns={2}
          />

          <div className="pt-1">
            <TextField
              label="Other Findings Notes"
              type="text"
              placeholder="Enter notes"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>
      </article>
    </FramerCard>
  );
};

export default OtherFindings;