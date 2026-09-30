import { FramerCard } from "@/util/FramerCard";
import { AlertTriangle, ClipboardCheckIcon, Eye, Glasses, Send } from "lucide-react";
import React from "react";

const SUMMARY_TONE_CLASS = {
  success: "text-success bg-success/10",
  info: "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
  muted: "text-muted-foreground bg-muted",
};

/* Hoisted to module scope on purpose: a component defined INSIDE another
   component is a new type on every render, so React unmounts and remounts the
   whole subtree each time (and trips react-hooks/static-components). */
function SummaryRow({ icon: Icon, label, value, tone }) {
  // Values that mean "nothing recorded" are dimmed + italic so a blank
  // finding is never mistaken for a real clinical result.
  const isEmpty =
    value === "Not tested" ||
    value === "Not specified" ||
    value === "None" ||
    value === "Not Required" ||
    value === "—" ||
    value === "" ||
    value === null ||
    value === undefined;

  return (
    <div
      className={`gs-readout ${
        isEmpty ? "gs-readout--blank" : "gs-readout--filled"
      }`}
      title={`${label}: ${value ?? "—"}`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-md ${
          SUMMARY_TONE_CLASS[tone] || SUMMARY_TONE_CLASS.muted
        }`}
      >
        <Icon className="size-3" strokeWidth={2.25} />
      </span>

      <span className="gs-readout__label">{label}</span>

      <span className="gs-readout__value">
        <span className={isEmpty ? "gs-empty" : ""}>{value ?? "—"}</span>
      </span>
    </div>
  );
}

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
  return (
    <FramerCard>
      {/* Same "Clinical Slate" language as the General Screening summary so the
          two screening pages feel like one product. */}
      <div className="gs-panel">
        <div className="gs-panel__head">
          <span className="gs-panel__icon">
            <ClipboardCheckIcon className="size-4" />
          </span>

          <div className="min-w-0">
            <p className="gs-panel__title">Quick Findings Summary</p>

            <p className="gs-panel__sub">
              Acuity, correction and referral at a glance
            </p>
          </div>
        </div>

        {/* Two per row at every size: 8 stacked full-width boxes ran the
            summary off the bottom of the step; paired readouts halve the
            height so nothing needs scrolling. */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-0.5 p-2.5 sm:grid-cols-2">
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
      </div>
    </FramerCard>
  );
};

export default QuickSummaryFindings;
