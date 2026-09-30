import { FramerCard } from "@/util/FramerCard";
import React from "react";
import { StickyNote } from "lucide-react";
import { ToggleGroup } from "../utilities/toggleGroup";
import { yesNoOptions } from "../datas/dental-screening-data";

const Notes = ({
  notes,
  formErrors,
  handleNotesChange,
  referralRequired,
  setReferralRequired,
  followUpRequired,
  setFollowUpRequired,
}) => {
  return (
    <FramerCard>
      <div className="gs-panel">
        <div className="gs-panel__head">
          <span className="gs-panel__icon">
            <StickyNote className="size-4" />
          </span>

          <div className="min-w-0">
            <p className="gs-panel__title">Add Notes and Referral</p>

            <p className="gs-panel__sub">
              Clinical notes, referral and follow-up
            </p>
          </div>
        </div>

        <div className="gs-panel__body">
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={4}
            className={`w-full resize-none rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 ${formErrors?.notes ? "border-destructive focus:ring-destructive/30" : ""}`}
          />
          {formErrors?.notes && (
            <p className="mt-1.5 text-xs text-destructive">{formErrors.notes}</p>
          )}

          <div className="mt-4 space-y-4">
            <ToggleGroup
              label="Referral required ?"
              columns={2}
              options={yesNoOptions("no")}
              value={referralRequired}
              onChange={setReferralRequired}
            />

            <ToggleGroup
              label="Follow-up required ?"
              columns={2}
              options={yesNoOptions("no")}
              value={followUpRequired}
              onChange={setFollowUpRequired}
            />
          </div>
        </div>
      </div>
    </FramerCard>
  );
};

export default Notes;
