import { FramerCard } from "@/util/FramerCard";
import { Activity, Ear, ShieldAlert } from "lucide-react";
import React from "react";
import { SummaryRow } from "../utilities/SummaryRow";

const HearingSummary = ({reHearingResult, leHearingResult, form}) => {
  return (
    <FramerCard>

      <div className="gs-panel">
        <div className="gs-panel__head">
          <span className="gs-panel__icon">
            <Activity className="size-4" />
          </span>

          <div className="min-w-0">
            <p className="gs-panel__title">Hearing Summary</p>

            <p className="gs-panel__sub">
              PTA and classification for each ear
            </p>
          </div>
        </div>

        <div className="space-y-2 p-2.5">

          <div className="gs-subpanel gs-subpanel--od">
            <p className="gs-subpanel__head">Right Ear (RE)</p>

            <div className="pl-2">
              <SummaryRow
                icon={Ear}
                label="Pure Tone Average"
                value={
                  reHearingResult.classification
                    ? `${reHearingResult.pta.toFixed(1)} dB`
                    : "Not assessed"
                }
                tone="info"
              />
            </div>
          </div>

          <div className="gs-subpanel gs-subpanel--os">
            <p className="gs-subpanel__head">Left Ear (LE)</p>

            <div className="pl-2">
              <SummaryRow
                icon={Ear}
                label="Pure Tone Average"
                value={
                  leHearingResult.classification
                    ? `${leHearingResult.pta.toFixed(1)} dB`
                    : "Not assessed"
                }
                tone="info"
              />
            </div>
          </div>

          <p className="gs-readout__group">Findings</p>

          <SummaryRow
            icon={Ear}
            label="RE Classification"
            value={reHearingResult.classification?.severity ?? "Not assessed"}
            tone={
              reHearingResult.classification?.tone ??
              (reHearingResult.classification ? "info" : "muted")
            }
          />

          <SummaryRow
            icon={Ear}
            label="LE Classification"
            value={leHearingResult.classification?.severity ?? "Not assessed"}
            tone={
              leHearingResult.classification?.tone ??
              (leHearingResult.classification ? "info" : "muted")
            }
          />

          <SummaryRow
            icon={Activity}
            label="Overall Status"
            value={form.overall_status || "Not assessed"}
            tone="muted"
          />

          <p className="gs-readout__group">Plan</p>

          <SummaryRow
            icon={ShieldAlert}
            label="Referral"
            value={form.referral_priority || "None"}
            tone={form.referral_required ? "warning" : "success"}
          />
        </div>
      </div>
    </FramerCard>
  );
};

export default HearingSummary;
