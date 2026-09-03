import { FramerCard } from "@/util/FramerCard";
import { AlertTriangle, CircleCheck, CircleParkingOffIcon, ShieldAlert, Summary } from "lucide-react";
import React from "react";

const QuickFindingSummary = ({ quickFindings }) => {
  return (
    <FramerCard>
      <article className="rounded-xl border p-4 shadow-sm bg-card">
        <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
          <Summary size="18" className="text-primary" />
          Quick Findings Summary
        </h3>

        {/* Caries */}
        <div className="mb-2 flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-destructive" />

            <span className="text-xs font-medium text-destructive">Caries</span>
          </div>

          <span className="text-xs font-semibold text-destructive">
            {quickFindings.caries}
          </span>
        </div>

        {/* Other Issues */}
        <div className="mb-2 flex items-center justify-between rounded-md border border-warning/30 bg-warning/10 px-3 py-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-warning" />

            <span className="text-xs font-medium text-warning">
              Other Issues
            </span>
          </div>

          <span className="text-xs font-semibold text-warning">
            {quickFindings.other}
          </span>
        </div>

        {/* Healthy */}
        <div className="mb-2 flex items-center justify-between rounded-md border border-success/30 bg-success/10 px-3 py-2">
          <div className="flex items-center gap-2">
            <CircleCheck className="size-4 text-success" />

            <span className="text-xs font-medium text-success">Healthy</span>
          </div>

          <span className="text-xs font-semibold text-success">
            {quickFindings.healthy}
          </span>
        </div>

        {/* Missing */}
        <div className="flex items-center justify-between rounded-md border border-info/30 bg-info/10 px-3 py-2">
          <div className="flex items-center gap-2">
            <CircleParkingOffIcon className="size-4 text-info" />

            <span className="text-xs font-medium text-info">Missing</span>
          </div>

          <span className="text-xs font-semibold text-info">
            {quickFindings.missing}
          </span>
        </div>
      </article>
    </FramerCard>
  );
};

export default QuickFindingSummary;
