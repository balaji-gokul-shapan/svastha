import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FramerCard } from "@/util/FramerCard";
import React from "react";
import { StatusItem } from "../utilities/SummaryRow";

const HearingQuickFinding = ({ form }) => {
  return (
    <FramerCard>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Findings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <StatusItem label="Right Ear" value={form.ear_exam_re} />

          <StatusItem
            label="Left Ear"
            // value={form.overall_status_le}
            value={form.ear_exam_le}
            // status={form.ear_exam_le}
          />

          <StatusItem label="Overall" value={form.overall_status} />
        </CardContent>
      </Card>
    </FramerCard>
  );
};

export default HearingQuickFinding;
