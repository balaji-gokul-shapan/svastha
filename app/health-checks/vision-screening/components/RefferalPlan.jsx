import { FramerCard } from "@/util/FramerCard";
import React from "react";
import { ToggleGroup } from "../utilities/toggleGroup";
import { SelectField } from "../utilities/selectField";
import { TextareaField } from "@/components/ui/text-field";
import ReferralIcon from "@iconify-react/healthicons/referral";

const RefferalPlan = ({
  referral,
  setReferral,
  referralReason,
  handleReferralReasonChange,
  adviceSuggestions,
  setAdviceSuggestions,
  followUp,
  setFollowUp,
  followUpOptions,
  referralReasons,
  handleFollowUpChange,
    formErrors,
    yesNoOptions,
}) => {
  return (
    <FramerCard>
      <article className="rounded-xl border border-border bg-card p-4">
        {/* <h3 className="text-sm font-semibold text-foreground">
                    Referral &amp; Follow-up
                  </h3> */}
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-domain-oral/10">
            <ReferralIcon className="size-5 text-domain-oral" />
          </span>
          Referral &amp; Follow-up
        </h3>
        <div className="mt-3 space-y-3">
          <ToggleGroup
            label="Referral to Specialist"
            options={yesNoOptions("no")}
            value={referral}
            onChange={setReferral}
          />
          {referral === "yes" && (
            <div>
              <SelectField
                label="Referral Reason"
                options={[
                  "",
                  ...(Array.isArray(referralReasons)
                    ? referralReasons
                    : []
                  ).map((item) => String(item?.name ?? "").trim()),
                ].filter((name, index, all) => all.indexOf(name) === index)}
                value={referralReason}
                onChange={handleReferralReasonChange}
                error={formErrors?.referralReason}
              />
              {formErrors?.referralReason && (
                <p className="mt-1.5 text-xs text-destructive">
                  {formErrors.referralReason}
                </p>
              )}
            </div>
          )}
          <div>
            {/* <FieldLabel>Advice / Suggestions</FieldLabel> */}
            <TextareaField
              label="Advice / Suggestions"
              value={adviceSuggestions}
              onChange={(e) => setAdviceSuggestions(e.target.value)}
              rows={3}
              placeholder="Enter notes"
              className="w-full resize-none rounded-md   p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <SelectField
            label="Follow-up"
            options={followUpOptions}
            value={followUp}
            onChange={handleFollowUpChange}
            error={formErrors?.followUp}
          />
        </div>
      </article>
    </FramerCard>
  );
};

export default RefferalPlan;
