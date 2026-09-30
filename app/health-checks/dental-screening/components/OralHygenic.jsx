import { BookOpen, ShieldAlert, Smile } from "lucide-react";
import React from "react";
import { ToggleGroup } from "../utilities/toggleGroup";
import { TextareaField } from "@/components/ui/text-field";
import { FramerCard } from "@/util/FramerCard";

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
  referralRequired,
  followUpRequired,
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
      <FramerCard>
        <div className="gs-panel">
          <div className="gs-panel__head">
            <span className="gs-panel__icon">
              <Smile className="size-4" />
            </span>

            <div className="min-w-0">
              <p className="gs-panel__title">Oral Hygiene</p>

              <p className="gs-panel__sub">
                Hygiene, gingival health and plaque score
              </p>
            </div>
          </div>

          <div className="gs-panel__body space-y-4">
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
          </div>
        </div>
      </FramerCard>
      <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
        <FramerCard>
          <div className="gs-panel">
            <div className="gs-panel__head">
              <span className="gs-panel__icon">
                <BookOpen className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="gs-panel__title">Care Instructions &amp; Notes</p>

                <p className="gs-panel__sub">Last updated {formatDate(updatedAtValue)}</p>
              </div>
            </div>

            <div className="gs-panel__body space-y-3">
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
            </div>
          </div>
        </FramerCard>
        <FramerCard>
          <div className="gs-panel">
            <div className="gs-panel__head">
              <span className="gs-panel__icon text-warning">
                <ShieldAlert className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="gs-panel__title">Referral</p>

                <p className="gs-panel__sub">Recommended action and follow-up</p>
              </div>
            </div>

            <div className="gs-panel__body space-y-3">
              {referralRequired === "yes" && (
                <>
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
                </>
              )}

              {followUpRequired === "yes" && (
                <TextareaField
                  id="dental-follow-up"
                  label="Follow-up"
                  value={followUpValue}
                  onChange={(event) => setFollowUpValue(event.target.value)}
                  rows={2}
                  textareaClassName="resize-none bg-background text-sm"
                />
              )}

              {referralRequired !== "yes" && followUpRequired !== "yes" && (
                <p className="text-xs text-muted-foreground">
                  No referral or follow-up needed.
                </p>
              )}
            </div>
          </div>
        </FramerCard>
      </div>
    </div>
  );
};

export default OralHygenic;
