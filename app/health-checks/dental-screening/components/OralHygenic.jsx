import { BookOpen, ShieldAlert } from "lucide-react";
import React from "react";
import { ToggleGroup } from "../utilities/toggleGroup";
import { TextareaField } from "@/components/ui/text-field";

const OralHygenic = ({
  oralHygiene,
  gingivalHealth,
  plaque,
  sidebarNotes,
  careInstructions,
  referralAction,
  referralReason,
  followUpValue,
  setReferralAction,
  setReferralReason,
  setFollowUpValue,
  setCareInstructions,
  setSidebarNotes,
  updatedAtValue,
  setOralHygiene,
  setGingivalHealth,
  setPlaque,
  oralHygieneToggleOptions,
  gingivalHealthToggleOptions,
  plaqueToggleOptions,
  formatDate,
}) => {
  return (
    <div className="grid grid-rows-1 gap-4 pt-4">
      <article className="space-y-4 rounded-xl border border-border bg-card p-4">
        <ToggleGroup
          label="Oral Hygiene"
          options={oralHygieneToggleOptions}
          value={oralHygiene}
          onChange={setOralHygiene}
        />
        <ToggleGroup
          label="Gingival Health"
          options={gingivalHealthToggleOptions}
          value={gingivalHealth}
          onChange={setGingivalHealth}
        />
        <ToggleGroup
          label="Plaque"
          options={plaqueToggleOptions}
          value={plaque}
          onChange={setPlaque}
        />
      </article>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <article className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpen className="size-4 text-primary" />
            Care Instructions &amp; Notes
          </h3>
          <TextareaField
            id="dental-care-instructions"
            label="Care Instructions"
            value={careInstructions}
            onChange={(event) => setCareInstructions(event.target.value)}
            rows={2}
            textareaClassName="resize-none bg-background text-sm"
          />
          <TextareaField
            id="dental-sidebar-notes"
            label="Notes"
            value={sidebarNotes}
            onChange={(event) => setSidebarNotes(event.target.value)}
            rows={2}
            textareaClassName="resize-none bg-background text-sm"
          />
          <p className="pt-1 text-xs text-muted-foreground">
            Last updated {formatDate(updatedAtValue)}
          </p>
        </article>
        <article className="space-y-3 rounded-xl border border-warning/40 bg-warning/5 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldAlert className="size-4 text-warning" />
            Referral
          </h3>
          <TextareaField
            id="dental-recommended-action"
            label="Recommended Action"
            value={referralAction}
            onChange={(event) => setReferralAction(event.target.value)}
            rows={2}
            textareaClassName="resize-none bg-background text-sm"
          />
          <TextareaField
            id="dental-referral-reason"
            label="Reason"
            value={referralReason}
            onChange={(event) => setReferralReason(event.target.value)}
            rows={2}
            textareaClassName="resize-none bg-background text-sm"
          />
          <TextareaField
            id="dental-follow-up"
            label="Follow-up"
            value={followUpValue}
            onChange={(event) => setFollowUpValue(event.target.value)}
            rows={2}
            textareaClassName="resize-none bg-background text-sm"
          />
        </article>
      </div>
    </div>
  );
};

export default OralHygenic;
