import { TextField } from "@/components/ui/text-field";
import { FramerCard } from "@/util/FramerCard";
import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { FieldLabel } from "@/components/ui/screening-fields";
import { Input } from "@/components/ui/input";

const OtherFindings = ({
  otherFindings,
  toggleFinding,
  otherFindingsOptions,
}) => {
  return (
    <FramerCard>
      <article className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Other Findings
        </h3>
        <div className="mt-3 space-y-2.5">
          <div className="flex flex-wrap gap-2">
            {otherFindingsOptions.map((opt) => {
              const isActive = !!otherFindings[opt.id];
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleFinding(opt.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {isActive && <Check className="size-3.5" />}
                  {opt.label}
                </button>
              );
            })}
          </div>

          {otherFindingsOptions.some((option) => otherFindings[option.id]) ? (
            <div className="pt-1">
              {/* <TextField
                label="Other Findings Notes"
                type="text"
                placeholder="Enter notes"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              /> */}
              {/* <FieldLabel>Others</FieldLabel>
                    <Input
                      type="text"
                      placeholder="Enter notes"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                    /> */}
              {/* <div className="mt-4"> */}
              {/* <FieldLabel>Other Risk Factors</FieldLabel> */}

              <TextField
                label="Other Risk Factors"
                //   value={form.risk_others}
                //   onChange={(e) => updateField("risk_others", e.target.value)}
                placeholder="Enter other risk factors..."
              />
            </div>
          ) : null}
        </div>
      </article>
    </FramerCard>
  );
};

export default OtherFindings;
