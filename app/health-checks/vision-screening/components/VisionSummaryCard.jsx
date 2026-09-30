"use client";

import React from "react";
import {
  Eye,
  Glasses,
  ScanEye,
  Send,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

/**
 * Compact vision readout for the left rail, shown under Assessment Details.
 *
 * Presentational only — every value is passed in from the page, so this adds
 * no state, no fetching and no side effects. It reuses the "Clinical Slate"
 * classes from the rest of the screening UI, with a colour rail per eye
 * (OD / OS / OU) so left and right are never confused at a glance.
 */

const EYE_RAIL = {
  od: "gs-subpanel--od",
  os: "gs-subpanel--os",
  ou: "gs-subpanel--ou",
};

const EYE_LABEL = {
  od: "Right Eye (OD)",
  os: "Left Eye (OS)",
  ou: "Both Eyes (OU)",
};

const NA = "—";

const clean = (value) => {
  const text = String(value ?? "").trim();

  return !text || text === "NA" ? NA : text;
};

const isBlank = (value) => clean(value) === NA;

function Readout({ icon: Icon, label, value, tone = "muted" }) {
  const toneClass = {
    info: "text-info bg-info/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
    muted: "text-muted-foreground bg-muted",
  }[tone];

  const blank = isBlank(value);

  return (
    <div
      className={`gs-readout ${blank ? "gs-readout--blank" : "gs-readout--filled"}`}
      title={`${label}: ${clean(value)}`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-md ${
          toneClass ?? tone
        }`}
      >
        <Icon className="size-3" strokeWidth={2.25} />
      </span>

      <span className="gs-readout__label">{label}</span>

      <span className="gs-readout__value">
        <span className={blank ? "gs-empty" : ""}>{clean(value)}</span>
      </span>
    </div>
  );
}

function EyeBlock({ railClass, label, eyeData }) {
  if (!eyeData) return null;

  return (
    <div className={`gs-subpanel ${railClass}`}>
      <p className="gs-subpanel__head">{label}</p>

      <div className="space-y-0.5 pl-2">
        <Readout
          icon={Eye}
          label="Distance"
          value={eyeData.distanceWith}
          tone="info"
        />
        <Readout
          icon={ScanEye}
          label="Near"
          value={eyeData.nearWith}
          tone="info"
        />
      </div>
    </div>
  );
}

export function VisionSummaryCard({
  od,
  os,
  ou,
  odStatus,
  osStatus,
  colorVisionStatus,
  coverTest,
  strabismus,
  usesGlasses,
  lensType,
  referral,
  followUp,
}) {
  return (
    <div className="gs-panel">
      <div className="gs-panel__head">
        <span className="gs-panel__icon">
          <ScanEye className="size-4" />
        </span>

        <div className="min-w-0">
          <p className="gs-panel__title">Vision Summary</p>

          <p className="gs-panel__sub">Acuity and findings at a glance</p>
        </div>
      </div>

      <div className="space-y-2 p-2.5">
        <EyeBlock
          railClass={EYE_RAIL.od}
          label={EYE_LABEL.od}
          eyeData={od}
        />
        <EyeBlock
          railClass={EYE_RAIL.os}
          label={EYE_LABEL.os}
          eyeData={os}
        />

        {/* OU is usually left blank — only show the block once it's filled. */}
        {ou && !isBlank(ou.distanceWith) ? (
          <EyeBlock
            railClass={EYE_RAIL.ou}
            label={EYE_LABEL.ou}
            eyeData={ou}
          />
        ) : null}

        <p className="gs-readout__group">Findings</p>

        <Readout
          icon={CheckCircle2}
          label="OD Acuity"
          value={odStatus?.label}
          tone={odStatus?.tone ?? "muted"}
        />
        <Readout
          icon={CheckCircle2}
          label="OS Acuity"
          value={osStatus?.label}
          tone={osStatus?.tone ?? "muted"}
        />
        <Readout
          icon={Eye}
          label="Color Vision"
          value={colorVisionStatus}
          tone="info"
        />
        <Readout
          icon={ScanEye}
          label="Cover Test"
          value={coverTest}
          tone="muted"
        />
        <Readout
          icon={AlertTriangle}
          label="Strabismus"
          value={strabismus === "yes" ? "Present" : "Absent"}
          tone={strabismus === "yes" ? "warning" : "success"}
        />
        <Readout icon={Glasses} label="Lens" value={lensType} tone="info" />
        <Readout
          icon={Glasses}
          label="Uses Correction"
          value={usesGlasses === "yes" ? "Yes" : "No"}
          tone="muted"
        />

        <p className="gs-readout__group">Plan</p>

        <Readout
          icon={Send}
          label="Referral"
          value={referral === "yes" ? "Required" : "Not Required"}
          tone={referral === "yes" ? "warning" : "success"}
        />
        <Readout icon={Send} label="Follow-up" value={followUp} tone="info" />
      </div>
    </div>
  );
}

export default VisionSummaryCard;
