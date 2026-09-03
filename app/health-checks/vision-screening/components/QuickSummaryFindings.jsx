import { FramerCard } from "@/util/FramerCard";
import { AlertTriangle, ClipboardCheckIcon, Eye, Glasses, Send } from "lucide-react";
import React from "react";

const QuickSummaryFindings = ({
  odStatus,
  osStatus,
  colorVisionStatus,
  lensType,
  strabismus,
  usesGlasses,
  referral,
  followUp,
}) => {


  const SUMMARY_TONE_CLASS = {
    success: "text-success bg-success/10",
    info: "text-info bg-info/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
    muted: "text-muted-foreground bg-muted",
  };
  function SummaryRow({ icon: Icon, label, value, tone }) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className={`flex size-6 items-center justify-center rounded-md ${SUMMARY_TONE_CLASS[tone] || SUMMARY_TONE_CLASS.muted}`}
          >
            <Icon className="size-3.5" strokeWidth={2.25} />
          </span>
          <span className="text-sm text-foreground">{label}</span>
        </div>
        <span className="text-sm font-semibold text-foreground">{value}</span>
      </div>
    );
  }
  return (
    <FramerCard>
      <article className="rounded-xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10">
            <ClipboardCheckIcon size={16} className="text-primary" />
          </span>
          Quick Findings Summary
        </h3>
        <div className="mt-3 space-y-2">
          <SummaryRow
            icon={Eye}
            label="OD Acuity"
            value={odStatus.label}
            tone={odStatus.tone}
          />
          <SummaryRow
            icon={Eye}
            label="OS Acuity"
            value={osStatus.label}
            tone={osStatus.tone}
          />
          <SummaryRow
            icon={Eye}
            label="Color Vision"
            value={colorVisionStatus || "Not tested"}
            tone="info"
          />
          <SummaryRow
            icon={AlertTriangle}
            label="Strabismus"
            value={strabismus === "yes" ? "Present" : "Absent"}
            tone={strabismus === "yes" ? "warning" : "success"}
          />
          <SummaryRow
            icon={Glasses}
            label="Lens Correction"
            value={lensType || "None"}
            tone="info"
          />
          <SummaryRow
            icon={Glasses}
            label="Uses Correction"
            value={usesGlasses === "yes" ? "Yes" : "No"}
            tone="muted"
          />
          <SummaryRow
            icon={Send}
            label="Referral"
            value={referral === "yes" ? "Required" : "Not Required"}
            tone={referral === "yes" ? "warning" : "success"}
          />
          <SummaryRow
            icon={Send}
            label="Follow-up"
            value={followUp || "Not specified"}
            tone="info"
          />
        </div>
      </article>
    </FramerCard>
  );
};

export default QuickSummaryFindings;
