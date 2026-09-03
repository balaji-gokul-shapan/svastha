import { FramerCard } from "@/util/FramerCard";
import React from "react";
import { VisionSnapshot } from "../utilities/EyeSnapshot";
import ReusableSelect from "@/components/ui/reusable-select";
import { TextField } from "@/components/ui/text-field";
import { nearAcuityOptions } from "../datas/vision-screening-data";
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
    <div className="rounded-lg border border-border/70 bg-background p-3 sm:p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div>
          <ReusableSelect
            label="Distance (Without)"
            options={distanceOptions}
            value={eye.distanceWithout}
            onChange={(v) => onChange({ ...eye, distanceWithout: v })}
          />
          {/* {severityLine(eye.distanceWithout)} */}
        </div>
        <div>
          <ReusableSelect
            label="Near (Without)"
            options={nearAcuityOptions}
            value={eye.nearWithout}
            onChange={(v) => onChange({ ...eye, nearWithout: v })}
          />
        </div>
        <div>
          <ReusableSelect
            label="Distance (With)"
            options={distanceOptions}
            value={eye.distanceWith}
            onChange={(v) => onChange({ ...eye, distanceWith: v })}
          />
          {/* {severityLine(eye.distanceWith)} */}
        </div>
        <div>
          <ReusableSelect
            label="Near (With)"
            options={nearAcuityOptions}
            value={eye.nearWith}
            onChange={(v) => onChange({ ...eye, nearWith: v })}
          />
        </div>
      </div>
      <div className="mt-3">
        <TextField
          label="Remarks"
          value={eye.remarks}
          onChange={(v) => onChange({ ...eye, remarks: v })}
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
      <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-foreground">
          Visual Acuity Snapshot
        </h3>
        <div className="mt-4">
          <FramerCard>
          <VisionSnapshot
            odDistanceWith={od.distanceWith}
            odDistanceWithout={od.distanceWithout}
            osDistanceWith={os.distanceWith}
            osDistanceWithout={os.distanceWithout}
          />

          </FramerCard>
        </div>

        <div className="mt-5 space-y-3">
          <FramerCard>

          <AcuityRow
            label="Right Eye (OD)"
            eye={getSelectedStudentScreeningData?.od_distance_without || od}
            onChange={setOd}
            visionResultData={visionResultData}
            acuitySeverityMap={acuitySeverityMap}
          />
          <AcuityRow
            label="Left Eye (OS)"
            eye={getSelectedStudentScreeningData?.os_distance_without || os}
            onChange={setOs}
            visionResultData={visionResultData}
            acuitySeverityMap={acuitySeverityMap}
          />
          <AcuityRow
            label="Both Eyes (OU)"
            eye={getSelectedStudentScreeningData?.ou_distance_without || ou}
            onChange={setOu}
            visionResultData={visionResultData}
            acuitySeverityMap={acuitySeverityMap}
          />
          </FramerCard>
        </div>
      </article>
    </section>
    
  );
};

export default VisionSnapshotCard;
