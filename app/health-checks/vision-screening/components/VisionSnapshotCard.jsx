import { FramerCard } from "@/util/FramerCard";
import React from "react";
import { Eye } from "lucide-react";
import { VisionSnapshot } from "../utilities/EyeSnapshot";
import ReusableSelect from "@/components/ui/reusable-select";
import { TextField } from "@/components/ui/text-field";
import {
  distanceAcuityOptions,
  nearAcuityOptions,
  severityTone,
} from "../datas/vision-screening-data";
const SEVERITY_TEXT_CLASS = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};
function AcuityRow({
  label,
  eye,
  onChange,
  visionResultData,
  acuitySeverityMap,
  railClass,
}) {
  const severityFor = (value) => {
    const record = (acuitySeverityMap ?? {})[String(value ?? "").trim()];
    return record?.severity ?? "";
  };

  const severityLine = (value) => {
    const severity = severityFor(value);
    if (!severity) return null;
    return (
      <p
        className={`mt-1 text-xs ${SEVERITY_TEXT_CLASS[severityTone(severity)]}`}
      >
        {severity}
      </p>
    );
  };

  const masterNames = (Array.isArray(visionResultData) ? visionResultData : [])
    .map((item) => item?.name)
    .filter(Boolean);
  const baseOptions = masterNames.length ? masterNames : distanceAcuityOptions;
  const distanceOptions = baseOptions.includes("NA")
    ? baseOptions
    : ["NA", ...baseOptions];

  return (
    <div className={`gs-subpanel ${railClass ?? ""}`}>
      <p className="gs-subpanel__head">{label}</p>

      <div className="grid grid-cols-2 gap-3 pl-2 lg:grid-cols-4">
        <div>
          <ReusableSelect
            withPortal
            label="Distance (Without)"
            options={distanceOptions}
            value={eye.distanceWithout}
            onChange={(v) => onChange({ ...eye, distanceWithout: v })}
          />
          {severityLine(eye.distanceWithout)}
        </div>
        <div>
          <ReusableSelect
          withPortal
            label="Near (Without)"
            options={nearAcuityOptions}
            value={eye.nearWithout}
            onChange={(v) => onChange({ ...eye, nearWithout: v })}
          />
        </div>
        <div>
          <ReusableSelect
            withPortal
            label="Distance (With)"
            options={distanceOptions}
            value={eye.distanceWith}
            onChange={(v) => onChange({ ...eye, distanceWith: v })}
          />
          {severityLine(eye.distanceWith)}
        </div>
        <div>
          <ReusableSelect
            withPortal
            label="Near (With)"
            options={nearAcuityOptions}
            value={eye.nearWith}
            onChange={(v) => onChange({ ...eye, nearWith: v })}
          />
        </div>
      </div>

      <div className="mt-3 pl-2">
        <TextField  
          label="Remarks"
          value={eye.remarks ?? ""}
          onChange={(e) => onChange({ ...eye, remarks: e.target.value })}
          placeholder="Optional notes for this eye"
        />
      </div>
    </div>
  );
}

const VisionSnapshotCard = ({
  getSelectedStudentScreeningData,
  od,
  os,
  ou,
  setOd,
  setOs,
  setOu,
  visionResultData,
  acuitySeverityMap
}) => {
  return (
    <section className="screening-card">
      {/* Same "Clinical Slate" panel as General Screening, so the two
          screening pages read as one product. */}
      <div className="gs-panel">
        <div className="gs-panel__head">
          <span className="gs-panel__icon">
            <Eye className="size-4" />
          </span>

          <div className="min-w-0">
            <p className="gs-panel__title">Visual Acuity Snapshot</p>

            <p className="gs-panel__sub">
              Distance and near acuity, with and without correction
            </p>
          </div>
        </div>

        <div className="gs-panel__body space-y-3">
          <FramerCard>
            <VisionSnapshot
              odDistanceWith={od.distanceWith}
              odDistanceWithout={od.distanceWithout}
              osDistanceWith={os.distanceWith}
              osDistanceWithout={os.distanceWithout}
            />
          </FramerCard>

          {/* <FramerCard> */}
            {/* Per-eye rail tints (OD / OS / OU) so left and right are never
                confused when scanning the block. */}
            <AcuityRow
              label="Right Eye (OD)"
              railClass="gs-subpanel--od"
              eye={od}
              onChange={setOd}
              visionResultData={visionResultData}
              acuitySeverityMap={acuitySeverityMap}
            />
            <AcuityRow
              label="Left Eye (OS)"
              railClass="gs-subpanel--os"
              eye={os}
              onChange={setOs}
              visionResultData={visionResultData}
              acuitySeverityMap={acuitySeverityMap}
            />
            <AcuityRow
              label="Both Eyes (OU)"
              railClass="gs-subpanel--ou"
              eye={ou}
              onChange={setOu}
              visionResultData={visionResultData}
              acuitySeverityMap={acuitySeverityMap}
            />
          {/* </FramerCard> */}
        </div>
      </div>
    </section>
  );
};

export default VisionSnapshotCard;
