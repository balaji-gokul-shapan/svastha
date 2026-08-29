"use client";

import { Activity } from "react";
import { ToggleGroup } from "./toggleGroup";
import { TextareaField } from "@/components/ui/text-field";
import { Separator } from "@/components/ui/separator";

/* Female-specific card. Container keeps .screening-card--female so the pink
   domain skin (tint, active toggle, textarea focus) from globals.css applies;
   only structural spacing/grid utilities live here. */
const FemaleStudentsCard = ({ data, onChange }) => {
  return (
    <section className="screening-card screening-card--female">
      <article className="space-y-4 rounded-xl border border-domain-female bg-domain-female-soft p-4 my-4">
        {/* Header */}
        {/* <div className="flex items-center gap-3 !border-b !border-female-soft px-5 py-4">
          <h5 className="screening-title text-domain-female">For Female Students</h5>
        </div> */}
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary aspect-square">
            <Activity className="size-4" />
          </span>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              For Female Students
            </h3>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Physical measurements and growth assessment
            </p>
          </div>
        </div>
        <div className="p-5">
          {/* Menstrual information */}
          <div className="grid gap-5 md:grid-cols-3">
            <ToggleGroup
              label="Menstrual Cycle"
              headingClass={"text-domain-female"}
              options={[
                { value: "Regular", label: "Regular" },
                { value: "Irregular", label: "Irregular" },
              ]}
              value={data.menstrualCycle}
              onChange={(value) => onChange("menstrualCycle", value)}
              columns={2}
            />

            <ToggleGroup
              label="Excessive Bleeding"
              headingClass={"text-domain-female"}
              options={[
                { value: "No", label: "No" },
                { value: "Yes", label: "Yes" },
              ]}
              value={data.excessiveBleeding}
              onChange={(value) => onChange("excessiveBleeding", value)}
              columns={2}
            />

            <ToggleGroup
              label="Menstrual Pain"
              headingClass={"!text-domain-female"}
              options={[
                { value: "No", label: "No" },
                { value: "Yes", label: "Yes" },
              ]}
              value={data.menstrualPain}
              onChange={(value) => onChange("menstrualPain", value)}
              columns={2}
            />
          </div>

          {/* Divider */}
          <Separator className="my-4 bg-domain-female-border" />
          {/* <div className="my-5 border-t border-domain-female-border" /> */}

          {/* Text areas */}
          <div className="grid gap-4 md:grid-cols-2">
            <TextareaField
              textFontClass="!text-domain-soft"
              textareaClassName="!bg-domain-female-hover"
              label="Other Concerns"
              value={data.otherConcerns}
              onChange={(event) =>
                onChange("otherConcerns", event.target.value)
              }
              placeholder="Enter details..."
              rows={3}
            />

            <TextareaField
              textFontClass="!text-domain-soft"
              textareaClassName="!bg-domain-female-hover"
              label="Referral (if any)"
              value={data.referral}
              onChange={(event) => onChange("referral", event.target.value)}
              placeholder="Enter referral details..."
              rows={3}
            />
          </div>
        </div>
      </article>
    </section>
  );
};

export default FemaleStudentsCard;
