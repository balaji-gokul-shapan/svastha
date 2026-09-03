import { FramerCard } from "@/util/FramerCard";
import React from "react";
import { ScoreMeter } from "../utilities/scoreMeter";

const RiskSeverity = ({ riskScoreValue, severityScoreValue }) => {
  return (
    <FramerCard>
      <article className="space-y-4 rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Risk &amp; Severity
        </h3>
        <ScoreMeter label="Risk Score" score={riskScoreValue} />
        <ScoreMeter label="Severity Score" score={severityScoreValue} />
      </article>
    </FramerCard>
  );
};

export default RiskSeverity;
