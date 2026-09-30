import { FramerCard } from "@/util/FramerCard";
import {
  AlertTriangle,
  CircleCheck,
  CircleParkingOffIcon,
  ShieldAlert,
  ListChecks,
  SquircleDashed,
  Badge,
} from "lucide-react";
import React from "react";

const QuickFindingSummary = ({ quickFindings = {} }) => {

  const findings = [
    {
      label: "Caries",
      value: quickFindings.caries ?? 0,
      icon: ShieldAlert,
      tone: "text-destructive",
    },
    {
      label: "Other Issues",
      value: quickFindings.other ?? 0,
      icon: AlertTriangle,
      tone: "text-warning",
    },
    {
      label: "Healthy",
      value: quickFindings.healthy ?? 0,
      icon: CircleCheck,
      tone: "text-success",
    },
    {
      label: "Missing",
      value: quickFindings.missing ?? 0,
      icon: SquircleDashed,
      tone: "text-info",
    },
    {
      label: "Filled",
      value: quickFindings.filled ?? 0,
      icon: Badge,
      tone: "text-domain-hearing",
    },
    {
      label: "Sealant",
      value: quickFindings.sealant ?? 0,
      icon: CircleParkingOffIcon,
      tone: "text-domain-immunization",
    },
  ];

  /* "Findings needing attention" = the problems, not the healthy tally. */
  const issues = (quickFindings.caries ?? 0) + (quickFindings.other ?? 0);
  return (
    <FramerCard>
      <div className="gs-panel">
        <div className="gs-panel__head">
          <span className="gs-panel__icon">
            <ListChecks className="size-4" />
          </span>

          <div className="min-w-0">
            <p className="gs-panel__title">Quick Findings Summary</p>

            <p className="gs-panel__sub">
              {issues} finding{issues === 1 ? "" : "s"} need attention
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-3 lg:grid-cols-2">
          {findings.map((finding) => {
            const Icon = finding.icon;
            const count = Number(finding.value) || 0;
            return (
              <div
                key={finding.label}
                className={`gs-count ${finding.tone} ${count === 0 ? "gs-count--zero" : ""}`}
                title={`${finding.label}: ${count}`}
              >
                <p className="gs-count__label">{finding.label}</p>
                <p className="gs-count__figure">{count}</p>
                <Icon className="mt-0.5 size-3.5 opacity-70" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </FramerCard>
  );
};

export default QuickFindingSummary;