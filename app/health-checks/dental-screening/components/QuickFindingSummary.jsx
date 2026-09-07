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
      className:
        "border-destructive/30 bg-destructive/10 text-destructive",
    },
    {
      label: "Other Issues",
      value: quickFindings.other ?? 0,
      icon: AlertTriangle,
      className: "border-warning/30 bg-warning/10 text-warning",
    },
    {
      label: "Healthy",
      value: quickFindings.healthy ?? 0,
      icon: CircleCheck,
      className: "border-success/30 bg-success/10 text-success",
    },
    {
      label: "Missing",
      value: quickFindings.missing ?? 0,
      icon: SquircleDashed,
      className: "border-info/30 bg-info/10 text-info",
    },
    {
      label: "Filled",
      value: quickFindings.filled ?? 0,
      icon: Badge,
      className: "border-domain-hearing/40 bg-domain-hearing/20 text-domain-hearing",
    },
    {
      label: "Sealant",
      value: quickFindings.sealant ?? 0,
      icon: CircleParkingOffIcon,
      className: "border-domain-immunization/40 bg-domain-immunization/20 text-domain-immunization",
    },
  ];

  return (
    <FramerCard>
      <article className="rounded-xl border bg-card p-4 shadow-sm">
        {/* Header */}
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <ListChecks className="size-[18px] shrink-0 text-primary" />
          <span>Quick Findings Summary</span>
        </h3>

        {/* Findings */}
        <div className="flex flex-col gap-2">
          {findings.map((finding) => {
            const Icon = finding.icon;

            return (
              <div
                key={finding.label}
                className={`flex min-h-9 w-full items-center justify-between rounded-md border px-3 py-2 ${finding.className}`}
              >
                {/* Label */}
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="size-4 shrink-0" />

                  <span className="truncate text-xs font-medium">
                    {finding.label}
                  </span>
                </div>

                {/* Count */}
                <span className="ml-3 shrink-0 text-xs font-semibold">
                  {finding.value}
                </span>
              </div>
            );
          })}
        </div>
      </article>
    </FramerCard>
  );
};

export default QuickFindingSummary;