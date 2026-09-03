import React from "react";
import { BmiGauge } from "../utilities/bmiCategory";
import { FramerCard } from "@/util/FramerCard";
import UnitConversionCard, {
  celsiusToFahrenheit,
  cmToInches,
  fahrenheitToCelsius,
  inchesToCm,
  kgToLbs,
  lbsToKg,
} from "../utilities/UnitConversionCard";
import EditableVitalCard from "../utilities/EditableVitalCard";
import { Activity, Stethoscope } from "lucide-react";
import HeightIcon from "@iconify-react/healthicons/height";
import BloodPressureMonitorIcon from "@iconify-react/healthicons/blood-pressure-monitor";
import PulseOximeterOutlineIcon from "@iconify-react/healthicons/pulse-oximeter-outline";
import ThermometerDigitalIcon from "@iconify-react/healthicons/thermometer-digital";
import WeightIcon from "@iconify-react/healthicons/weight";

const GrowthVitals = ({
  temperature,
  pulse,
  bloodPressure,
  spo2,
  height,
  weight,
  setBloodPressure,
  setTemperature,
  setPulse,
  setSpo2,
  handleHeightChange,
  handleWeightChange,
  heightStandardResult,
  weightStandardResult,
  pulseStandardResult,
  spo2StandardResult,
  bloodPressureStandardResult,
  temperatureStandardResult,
  bmi,
  displayBmi,
  bmiCategories,
  category,
}) => {
  function StandardStatus({
    label,
    value,
    status,
    tone = "success",
  }) {
    const dotClass =
      tone === "destructive"
        ? "bg-destructive"
        : tone === "warning"
          ? "bg-warning"
          : tone === "muted"
            ? "bg-muted-foreground"
            : "bg-success";

    const textClass =
      tone === "destructive"
        ? "text-destructive"
        : tone === "warning"
          ? "text-warning"
          : tone === "muted"
            ? "text-muted-foreground"
            : "text-success";

    return (
      <div className="flex flex-row items-center justify-between rounded-xl border border-border/70 bg-background p-3">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">{label}</p>

          <p className="mt-1 truncate text-sm font-medium">
            {value}
          </p>
        </div>

        <div className="ml-3 flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${dotClass}`} />

          <span className={`text-[11px] font-medium ${textClass}`}>
            {status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 aspect-square items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-4" />
            </span>

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Growth & Vitals
              </h3>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Physical measurements and growth assessment
              </p>
            </div>
          </div>
        </div>

        <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
          Assessment
        </span>
      </div>

      {/* Vital Inputs */}
      <FramerCard>
      <div className="grid grid-cols-2 gap-2 py-5 xl:grid-cols-3">
        <UnitConversionCard
          label="Temperature"
          value={temperature}
          onChange={setTemperature}
          unit="°C"
          unitImperial="°F"
          convertToImperial={celsiusToFahrenheit}
          convertFromImperial={fahrenheitToCelsius}
          icon={ThermometerDigitalIcon}
          iconClass="bg-domain-oral/10"
          iconColor="text-oral"
          placeholder="0"
        />

        <EditableVitalCard
          label="Pulse"
          value={pulse}
          onChange={setPulse}
          unit="bpm"
          icon={Stethoscope}
          iconClass="bg-domain-physical/10"
          iconColor="text-oral-physical"
          placeholder="0"
        />

        <EditableVitalCard
          label="Blood Pressure"
          value={bloodPressure}
          onChange={setBloodPressure}
          unit="mmHg"
          icon={BloodPressureMonitorIcon}
          iconClass="bg-destructive/10"
          iconColor="text-destructive"
          inputType="text"
          placeholder="120/80"
          displayValue={bloodPressure || "0/0"}
        />

        <EditableVitalCard
          label="SpO₂"
          value={spo2}
          onChange={setSpo2}
          unit="%"
          icon={PulseOximeterOutlineIcon}
          iconClass="bg-domain-vision/10"
          iconColor="text-domain-vision"
          placeholder="0"
        />

        <UnitConversionCard
          label="Height"
          value={height}
          onChange={handleHeightChange}
          unit="cm"
          unitImperial="in"
          convertToImperial={cmToInches}
          convertFromImperial={inchesToCm}
          icon={HeightIcon}
          iconClass="bg-domain-immunization/10"
          iconColor="text-immunization"
          placeholder="0"
        />

        <UnitConversionCard
          label="Weight"
          value={weight}
          onChange={handleWeightChange}
          unit="kg"
          unitImperial="lbs"
          convertToImperial={kgToLbs}
          convertFromImperial={lbsToKg}
          icon={WeightIcon}
          iconClass="bg-success/10"
          iconColor="text-success"
          placeholder="0"
        />
      </div>

      </FramerCard>

      {/* Standards + BMI */}
      <div className="grid grid-cols-1 gap-5 py-5 lg:grid-cols-2">
        {/* LEFT SIDE - Standards */}
        <FramerCard>
        <div className="grid gap-2 space-y-2">
          <div className="grid grid-cols-1 gap-3">
            <StandardStatus
              label="Temperature Standard"
              value={
                temperature || temperatureStandardResult?.standard
              }
              status={temperatureStandardResult?.status}
              tone={temperatureStandardResult?.tone}
            />

            <StandardStatus
              label="Height Standard"
              value={height || heightStandardResult?.standard}
              status={heightStandardResult?.status}
              tone={heightStandardResult?.tone}
            />

            <StandardStatus
              label="Weight Standard"
              value={weight || weightStandardResult?.standard}
              status={weightStandardResult?.status}
              tone={weightStandardResult?.tone}
            />

            <StandardStatus
              label="Pulse Standard"
              value={pulse || pulseStandardResult?.standard}
              status={pulseStandardResult?.status}
              tone={pulseStandardResult?.tone}
            />

            <StandardStatus
              label="Blood Pressure Standard"
              value={
                bloodPressure ||
                bloodPressureStandardResult?.standard
              }
              status={bloodPressureStandardResult?.status}
              tone={bloodPressureStandardResult?.tone}
            />

            <StandardStatus
              label="SpO₂ Standard"
              value={spo2 || spo2StandardResult?.standard}
              status={spo2StandardResult?.status}
              tone={spo2StandardResult?.tone}
            />
          </div>
        </div>

        </FramerCard>

        {/* RIGHT SIDE - BMI */}
        <FramerCard className="overflow-hidden rounded-2xl border border-border/70 bg-background">
          {/* BMI Visualization */}
          <div className="relative px-4 py-5">
            <BmiGauge
              categories={bmiCategories}
              bmi={displayBmi}
            />
          </div>

          {/* BMI Header */}
          <div className="flex flex-row items-center justify-between border-b border-border/70 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">
                Body Mass Index
              </h3>

              <p className="text-[11px] text-muted-foreground">
                Calculated from height and weight
              </p>
            </div>

            <div
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                category?.tone === "success"
                  ? "bg-success/10 text-success"
                  : category?.tone === "warning"
                    ? "bg-warning/10 text-warning"
                    : category?.tone === "destructive"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
              }`}
            >
              {category?.label}
            </div>
          </div>
        </FramerCard>
      </div>
    </section>
  );
};

export default GrowthVitals;