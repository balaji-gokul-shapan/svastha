import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FramerCard } from "@/util/FramerCard";
import { Activity, Ear, ShieldAlert } from "lucide-react";
import React from "react";
import { SummaryRow } from "../utilities/SummaryRow";

const HearingSummary = ({reHearingResult, leHearingResult, form}) => {
  return (
    <FramerCard>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hearing Summary</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <SummaryRow
            icon={Ear}
            label="Right Ear"
            value={
              reHearingResult.classification
                ? `${reHearingResult.pta.toFixed(1)} dB · ${reHearingResult.classification.severity}`
                : form.overall_status_re || "Not assessed"
            }
          />

          <SummaryRow
            icon={Ear}
            label="Left Ear"
            value={
              leHearingResult.classification
                ? `${leHearingResult.pta.toFixed(1)} dB · ${leHearingResult.classification.severity}`
                : form.overall_status_le || "Not assessed"
            }
          />

          <SummaryRow
            icon={Activity}
            label="Overall Status"
            value={form.overall_status || "Not assessed"}
          />

          <SummaryRow
            icon={ShieldAlert}
            label="Referral"
            value={form.referral_priority || "None"}
          />
        </CardContent>
      </Card>
    </FramerCard>
  );
};

export default HearingSummary;
