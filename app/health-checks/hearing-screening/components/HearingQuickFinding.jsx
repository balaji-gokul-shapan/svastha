import { FramerCard } from "@/util/FramerCard";
import React from "react";
import { Activity } from "lucide-react";
import { StatusItem } from "../utilities/SummaryRow";

const HearingQuickFinding = ({ form }) => {
  return (
    <FramerCard>
      <div className="gs-panel">
        <div className="gs-panel__head">
          <span className="gs-panel__icon">
            <Activity className="size-4" />
          </span>

          <div className="min-w-0">
            <p className="gs-panel__title">Quick Findings</p>

            <p className="gs-panel__sub">Ear examination and overall status</p>
          </div>
        </div>

        <div className="space-y-0.5 p-2.5">
          <StatusItem label="Right Ear" value={form.ear_exam_re} />

          <StatusItem
            label="Left Ear"
            // value={form.overall_status_le}
            value={form.ear_exam_le}
            // status={form.ear_exam_le}
          />

          <StatusItem label="Overall" value={form.overall_status} />
        </div>
      </div>
    </FramerCard>
  );
};

export default HearingQuickFinding;
