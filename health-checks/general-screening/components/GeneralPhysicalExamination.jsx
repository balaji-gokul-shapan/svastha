"use client";

import React from "react";
import { Activity, Pill } from "lucide-react";
import {
  SegmentedField,
  ScreeningTextarea,
  SegmentedControl,
} from "@/components/ui/screening-fields";
import { TextField, TextareaField } from "@/components/ui/text-field";
import { FramerCard } from "@/util/FramerCard";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup } from "../utilities/toggleGroup";

const GeneralPhysicalExamination = ({
  data,
  onChange,
  setData,
  nutritionToggleOptions,
  consciousnessToggleOptions,
  generalAppearanceToggleOptions,
  skinAssessmentToggleOptions
}) => {
  return (
    // <section className="screening-card">
    //   {/* Header */}
    //   <div className="flex items-center gap-3">
    //     <div className="flex items-center gap-2">
    //       <Activity className="size-4 text-primary" />
    //       <h2 className="screening-title">General Physical Examination</h2>
    //     </div>
    //   </div>

    //   <div className="grid gap-6 xl:grid-cols-2">
    //     {/* =========================================================
    //         LEFT — General Assessment
    //         ========================================================= */}
    //     <div>
    //       <h3 className="screening-subtitle">General Assessment</h3>

    //       <div className="mt-4 grid gap-5 sm:grid-cols-1">
    //         <SegmentedControl
    //           label="General Appearance"
    //           options={["Normal", "Needs attention"]}
    //           value={data.generalAppearance}
    //           onChange={(value) => onChange("generalAppearance", value)}
    //         />

    //         <SegmentedControl
    //           label="Posture / Spine"
    //           options={["Normal", "Needs attention"]}
    //           value={data.postureSpine}
    //           onChange={(value) => onChange("postureSpine", value)}
    //         />

    //         <SegmentedControl
    //           label="Nutritional Status"
    //           options={["Normal", "Underweight", "Overweight"]}
    //           value={data.nutritionalStatus}
    //           onChange={(value) => onChange("nutritionalStatus", value)}
    //         />

    //         <SegmentedControl
    //           label="Consciousness"
    //           options={["Alert", "Drowsy", "Unresponsive"]}
    //           value={data.consciousness}
    //           onChange={(value) => onChange("consciousness", value)}
    //         />
    //       </div>
    //     </div>

    //     {/* =========================================================
    //         RIGHT — Systemic Examination
    //         ========================================================= */}
    //     <div>
    //       <h3 className="screening-subtitle">Systemic Examination</h3>

    //       <div className="mt-4 grid grid-cols-1 gap-4">
    //         <ScreeningInput
    //           label="CVS (Cardiovascular System)"
    //           value={data.cvs}
    //           onChange={(value) => onChange("cvs", value)}
    //           placeholder="Enter findings..."
    //         />

    //         <ScreeningInput
    //           label="RS (Respiratory System)"
    //           value={data.respiratorySystem}
    //           onChange={(value) => onChange("respiratorySystem", value)}
    //           placeholder="Enter findings..."
    //         />

    //         <ScreeningInput
    //           label="Abdomen"
    //           value={data.abdomen}
    //           onChange={(value) => onChange("abdomen", value)}
    //           placeholder="Enter findings..."
    //         />

    //         <ScreeningInput
    //           label="Neurology"
    //           value={data.neurology}
    //           onChange={(value) => onChange("neurology", value)}
    //           placeholder="Enter findings..."
    //         />

    //         <ScreeningTextarea
    //           label="Referral (if any)"
    //           value={data.referral}
    //           onChange={(value) => onChange("referral", value)}
    //           rows={3}
    //           placeholder="Enter referral details..."
    //         />
    //       </div>
    //     </div>
    //   </div>
    // </section>
    <div className="space-y-4">
      <FramerCard>
        <article className="space-y-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary aspect-square">
              <Pill  className="size-5" />
            </span>

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                 General Physical Examination
              </h3>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Physical measurements and Examination diagnostic
              </p>
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <ToggleGroup
              label="General Appearance"
              options={generalAppearanceToggleOptions ??[
                { value: "Normal", label: "Normal", tone: "good" },
                {
                  value: "Needs attention",
                  label: "Needs attention",
                  tone: "warn",
                },
              ]}
              value={data.generalAppearance}
              onChange={(value) => onChange("generalAppearance", value)}
              columns={2}
            />
            <ToggleGroup
              label="Posture / Spine"
              options={[
                { value: "Normal", label: "Normal", tone: "good" },
                {
                  value: "Needs attention",
                  label: "Needs attention",
                  tone: "warn",
                },
              ]}
              value={data.postureSpine}
              onChange={(value) => onChange("postureSpine", value)}
              columns={2}
            />
            <ToggleGroup
              label="Nutritional Status"
              options={
                nutritionToggleOptions ?? [
                  { value: "Normal", label: "Normal", tone: "good" },
                  { value: "Underweight", label: "Underweight", tone: "warn" },
                  { value: "Overweight", label: "Overweight", tone: "bad" },
                ]
              }
              value={data.nutritionalStatus}
              onChange={(value) => onChange("nutritionalStatus", value)}
            />
            <ToggleGroup
              label="Consciousness"
              options={consciousnessToggleOptions ?? [
                { value: "Alert", label: "Alert", tone: "good" },
                { value: "Drowsy", label: "Drowsy", tone: "warn" },
                { value: "Unresponsive", label: "Unresponsive", tone: "bad" },
              ]}
              value={data.consciousness}
              onChange={(value) => onChange("consciousness", value)}
            />
          </div>
          <Separator className="my-4 " />
          <div>
            <div className="flex items-center gap-2">
              {/* <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary aspect-square">
                <Activity className="size-4" />
              </span> */}

              {/* <div>
                <h3 className="text-sm font-semibold text-foreground">
                  General Physical Examination
                </h3>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Physical measurements and growth assessment
                </p>
              </div> */}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField
                label="CVS (Cardiovascular System)"
                value={data.cvs}
                onChange={(event) => onChange("cvs", event.target.value)}
                placeholder="Enter findings..."
              />

              <TextField
                label="RS (Respiratory System)"
                value={data.respiratorySystem}
                onChange={(event) =>
                  onChange("respiratorySystem", event.target.value)
                }
                placeholder="Enter findings..."
              />

              <TextField
                label="Abdomen"
                value={data.abdomen}
                onChange={(event) => {
                  console.log("Abdomen onChange fired:", event.target.value);
                  onChange("abdomen", event.target.value);
                }}
                placeholder="Enter findings..."
              />

              <TextField
                label="Neurology"
                value={data.neurology}
                onChange={(event) => onChange("neurology", event.target.value)}
                placeholder="Enter findings..."
              />

              <TextareaField
                label="Referral (if any)"
                value={data.referral}
                onChange={(event) => onChange("referral", event.target.value)}
                rows={3}
                placeholder="Enter referral details..."
                className="sm:col-span-2"
              />
            </div>
          </div>
        </article>
      </FramerCard>
    </div>
  );
};

export default GeneralPhysicalExamination;
