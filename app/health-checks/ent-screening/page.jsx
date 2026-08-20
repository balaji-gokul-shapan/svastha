"use client";

import * as React from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Ear,
  FileText,
  Headphones,
  HeartPulse,
  Info,
  Mic,
  Moon,
  RefreshCcw,
  ShieldAlert,
  Stethoscope,
  Wind,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const initialForm = {
  system_examination_re: "",
  system_examination_le: "",

  ear_wax_re: "",
  ear_wax_le: "",

  infection_re: "",
  infection_le: "",

  discharge_re: "",
  discharge_le: "",

  perforation_re: "",
  perforation_le: "",

  foreign_body_re: "",
  foreign_body_le: "",

  tympanic_membrane_re: "",
  tympanic_membrane_le: "",

  hearing_whisper_re: "",
  hearing_whisper_le: "",

  ear_comments: "",

  nasal_breathing: "",
  nasal_discharge: "",
  nasal_blockage: "",
  allergic_rhinitis: "",
  nasal_septum: "",
  sinus_tenderness: "",
  history_of_nose_bleed: "",
  nose_sinus_comments: "",

  oropharynx: "",
  tonsils: "",
  tonsillar_enlargement: "",
  pharyngeal_wall: "",
  redness_congestion: "",
  exudates_pus: "",
  voice_quality: "",
  throat_comments: "",

  snoring: "",
  mouth_breathing: "",
  sleep_disturbance: "",
  daytime_sleepiness: "",
  chronic_cough: "",
  respiratory_sleep_comments: "",

  head_neck_lymph_nodes: "",
  neck_swelling: "",
  speech: "",
  speech_clarity: "",
  any_other_findings: "",

  risk_frequent_ear_infections: false,
  risk_allergic_rhinitis: false,
  risk_speech_delay: false,
  risk_hearing_difficulty: false,
  risk_tonsil_adenoid_problems: false,
  risk_nasal_obstruction: false,
  risk_chronic_cough: false,
  risk_others: "",

  severity: "",
  risk_level: "",
  ent_grade: "",

  referral_required: false,
  follow_up_recommended: false,

  next_review_date: "",
  summary_remarks: "",
  recommend_to: "",
  priority: "",
  reason: "",
};

export default function ENTScreeningPage({
  screening = {},
  student = {},
}) {
  const [form, setForm] = React.useState({
    ...initialForm,
    ...screening,
  });

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...screening,
      ...form,
    };

    console.log("ENT Screening Payload:", payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen space-y-5 bg-background"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Stethoscope className="size-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  ENT Screening
                </h1>

                <Badge variant="secondary">
                  Clinical Assessment
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Ear, nose, throat, speech and respiratory assessment
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>

            <Button type="submit">
              Save Screening
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-4 pb-8 md:px-6">
        {/* =====================================================
            STUDENT SUMMARY
        ===================================================== */}

        <StudentHeader student={student} />

        {/* =====================================================
            QUICK STATUS
        ===================================================== */}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickStatus
            icon={Ear}
            label="Ear Assessment"
            value={
              form.ear_comments
                ? "Completed"
                : "Pending"
            }
          />

          <QuickStatus
            icon={Wind}
            label="Nose & Sinus"
            value={
              form.nose_sinus_comments
                ? "Completed"
                : "Pending"
            }
          />

          <QuickStatus
            icon={Mic}
            label="Speech"
            value={
              form.speech || "Not assessed"
            }
          />

          <QuickStatus
            icon={ShieldAlert}
            label="Risk Level"
            value={
              form.risk_level || "Not assessed"
            }
          />
        </div>

        {/* =====================================================
            EAR EXAMINATION
        ===================================================== */}

        <SectionCard
          icon={Ear}
          title="Ear Examination"
          description="External ear, tympanic membrane and hearing assessment"
          tone="blue"
        >
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <EarPanel
              ear="Right Ear"
              short="RE"
              form={form}
              updateField={updateField}
            />

            <EarPanel
              ear="Left Ear"
              short="LE"
              form={form}
              updateField={updateField}
            />
          </div>

          <Separator className="my-6" />

          <div>
            <FieldLabel>
              Ear Comments
            </FieldLabel>

            <Textarea
              value={form.ear_comments}
              onChange={(e) =>
                updateField(
                  "ear_comments",
                  e.target.value
                )
              }
              placeholder="Enter overall ear examination findings..."
              rows={4}
            />
          </div>
        </SectionCard>

        {/* =====================================================
            NOSE & SINUS
        ===================================================== */}

        <SectionCard
          icon={Wind}
          title="Nose & Sinus Examination"
          description="Nasal airway, discharge, obstruction and sinus assessment"
          tone="purple"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ClinicalSelect
              label="Nasal Breathing"
              value={form.nasal_breathing}
              onChange={(v) =>
                updateField(
                  "nasal_breathing",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Nasal Discharge"
              value={form.nasal_discharge}
              onChange={(v) =>
                updateField(
                  "nasal_discharge",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Nasal Blockage"
              value={form.nasal_blockage}
              onChange={(v) =>
                updateField(
                  "nasal_blockage",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Allergic Rhinitis"
              value={form.allergic_rhinitis}
              onChange={(v) =>
                updateField(
                  "allergic_rhinitis",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Nasal Septum"
              value={form.nasal_septum}
              onChange={(v) =>
                updateField(
                  "nasal_septum",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Sinus Tenderness"
              value={form.sinus_tenderness}
              onChange={(v) =>
                updateField(
                  "sinus_tenderness",
                  v
                )
              }
            />

            <ClinicalSelect
              label="History of Nose Bleed"
              value={form.history_of_nose_bleed}
              onChange={(v) =>
                updateField(
                  "history_of_nose_bleed",
                  v
                )
              }
            />
          </div>

          <div className="mt-5">
            <FieldLabel>
              Nose & Sinus Comments
            </FieldLabel>

            <Textarea
              value={form.nose_sinus_comments}
              onChange={(e) =>
                updateField(
                  "nose_sinus_comments",
                  e.target.value
                )
              }
              placeholder="Enter nose and sinus findings..."
              rows={4}
            />
          </div>
        </SectionCard>

        {/* =====================================================
            THROAT
        ===================================================== */}

        <SectionCard
          icon={Stethoscope}
          title="Throat & Oropharynx"
          description="Oropharynx, tonsils, pharyngeal wall and voice assessment"
          tone="orange"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ClinicalSelect
              label="Oropharynx"
              value={form.oropharynx}
              onChange={(v) =>
                updateField("oropharynx", v)
              }
            />

            <ClinicalSelect
              label="Tonsils"
              value={form.tonsils}
              onChange={(v) =>
                updateField("tonsils", v)
              }
            />

            <ClinicalSelect
              label="Tonsillar Enlargement"
              value={form.tonsillar_enlargement}
              onChange={(v) =>
                updateField(
                  "tonsillar_enlargement",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Pharyngeal Wall"
              value={form.pharyngeal_wall}
              onChange={(v) =>
                updateField(
                  "pharyngeal_wall",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Redness / Congestion"
              value={form.redness_congestion}
              onChange={(v) =>
                updateField(
                  "redness_congestion",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Exudates / Pus"
              value={form.exudates_pus}
              onChange={(v) =>
                updateField(
                  "exudates_pus",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Voice Quality"
              value={form.voice_quality}
              onChange={(v) =>
                updateField(
                  "voice_quality",
                  v
                )
              }
            />
          </div>

          <div className="mt-5">
            <FieldLabel>
              Throat Comments
            </FieldLabel>

            <Textarea
              value={form.throat_comments}
              onChange={(e) =>
                updateField(
                  "throat_comments",
                  e.target.value
                )
              }
              placeholder="Enter throat examination findings..."
              rows={4}
            />
          </div>
        </SectionCard>

        {/* =====================================================
            RESPIRATORY / SLEEP
        ===================================================== */}

        <SectionCard
          icon={Moon}
          title="Respiratory & Sleep"
          description="Sleep-related breathing and respiratory symptoms"
          tone="cyan"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ClinicalSelect
              label="Snoring"
              value={form.snoring}
              onChange={(v) =>
                updateField("snoring", v)
              }
            />

            <ClinicalSelect
              label="Mouth Breathing"
              value={form.mouth_breathing}
              onChange={(v) =>
                updateField(
                  "mouth_breathing",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Sleep Disturbance"
              value={form.sleep_disturbance}
              onChange={(v) =>
                updateField(
                  "sleep_disturbance",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Daytime Sleepiness"
              value={form.daytime_sleepiness}
              onChange={(v) =>
                updateField(
                  "daytime_sleepiness",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Chronic Cough"
              value={form.chronic_cough}
              onChange={(v) =>
                updateField(
                  "chronic_cough",
                  v
                )
              }
            />
          </div>

          <div className="mt-5">
            <FieldLabel>
              Respiratory / Sleep Comments
            </FieldLabel>

            <Textarea
              value={form.respiratory_sleep_comments}
              onChange={(e) =>
                updateField(
                  "respiratory_sleep_comments",
                  e.target.value
                )
              }
              placeholder="Enter respiratory and sleep findings..."
              rows={4}
            />
          </div>
        </SectionCard>

        {/* =====================================================
            HEAD / NECK / SPEECH
        ===================================================== */}

        <SectionCard
          icon={Headphones}
          title="Head, Neck & Speech"
          description="Lymph nodes, neck, speech and other clinical findings"
          tone="green"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ClinicalSelect
              label="Head / Neck Lymph Nodes"
              value={form.head_neck_lymph_nodes}
              onChange={(v) =>
                updateField(
                  "head_neck_lymph_nodes",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Neck Swelling"
              value={form.neck_swelling}
              onChange={(v) =>
                updateField(
                  "neck_swelling",
                  v
                )
              }
            />

            <ClinicalSelect
              label="Speech"
              value={form.speech}
              onChange={(v) =>
                updateField("speech", v)
              }
            />

            <ClinicalSelect
              label="Speech Clarity"
              value={form.speech_clarity}
              onChange={(v) =>
                updateField(
                  "speech_clarity",
                  v
                )
              }
            />
          </div>

          <div className="mt-5">
            <FieldLabel>
              Other Findings
            </FieldLabel>

            <Textarea
              value={form.any_other_findings}
              onChange={(e) =>
                updateField(
                  "any_other_findings",
                  e.target.value
                )
              }
              placeholder="Enter any other clinical findings..."
              rows={4}
            />
          </div>
        </SectionCard>

        {/* =====================================================
            RISK ASSESSMENT
        ===================================================== */}

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <ShieldAlert className="size-5" />
              </div>

              <div>
                <CardTitle className="text-base">
                  ENT Risk Assessment
                </CardTitle>

                <p className="text-xs text-muted-foreground">
                  Identify relevant risk factors
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <RiskToggle
                label="Frequent Ear Infections"
                checked={
                  form.risk_frequent_ear_infections
                }
                onChange={(v) =>
                  updateField(
                    "risk_frequent_ear_infections",
                    v
                  )
                }
              />

              <RiskToggle
                label="Allergic Rhinitis"
                checked={
                  form.risk_allergic_rhinitis
                }
                onChange={(v) =>
                  updateField(
                    "risk_allergic_rhinitis",
                    v
                  )
                }
              />

              <RiskToggle
                label="Speech Delay"
                checked={
                  form.risk_speech_delay
                }
                onChange={(v) =>
                  updateField(
                    "risk_speech_delay",
                    v
                  )
                }
              />

              <RiskToggle
                label="Hearing Difficulty"
                checked={
                  form.risk_hearing_difficulty
                }
                onChange={(v) =>
                  updateField(
                    "risk_hearing_difficulty",
                    v
                  )
                }
              />

              <RiskToggle
                label="Tonsil / Adenoid Problems"
                checked={
                  form.risk_tonsil_adenoid_problems
                }
                onChange={(v) =>
                  updateField(
                    "risk_tonsil_adenoid_problems",
                    v
                  )
                }
              />

              <RiskToggle
                label="Nasal Obstruction"
                checked={
                  form.risk_nasal_obstruction
                }
                onChange={(v) =>
                  updateField(
                    "risk_nasal_obstruction",
                    v
                  )
                }
              />

              <RiskToggle
                label="Chronic Cough"
                checked={
                  form.risk_chronic_cough
                }
                onChange={(v) =>
                  updateField(
                    "risk_chronic_cough",
                    v
                  )
                }
              />
            </div>

            <div className="mt-4">
              <FieldLabel>
                Other Risk Factors
              </FieldLabel>

              <Input
                value={form.risk_others}
                onChange={(e) =>
                  updateField(
                    "risk_others",
                    e.target.value
                  )
                }
                placeholder="Enter other risk factors..."
              />
            </div>
          </CardContent>
        </Card>

        {/* =====================================================
            ASSESSMENT SUMMARY
        ===================================================== */}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HeartPulse className="size-5" />
              </div>

              <div>
                <CardTitle className="text-base">
                  Clinical Assessment
                </CardTitle>

                <p className="text-xs text-muted-foreground">
                  Overall ENT screening result
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <ClinicalSelect
                label="Severity"
                value={form.severity}
                onChange={(v) =>
                  updateField("severity", v)
                }
              />

              <ClinicalSelect
                label="Risk Level"
                value={form.risk_level}
                onChange={(v) =>
                  updateField("risk_level", v)
                }
              />

              <ClinicalSelect
                label="ENT Grade"
                value={form.ent_grade}
                onChange={(v) =>
                  updateField("ent_grade", v)
                }
              />
            </div>

            <div className="mt-5">
              <FieldLabel>
                Summary Remarks
              </FieldLabel>

              <Textarea
                value={form.summary_remarks}
                onChange={(e) =>
                  updateField(
                    "summary_remarks",
                    e.target.value
                  )
                }
                placeholder="Enter overall ENT assessment..."
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* =====================================================
            REFERRAL
        ===================================================== */}

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" />
              </div>

              <div>
                <CardTitle className="text-base">
                  Referral & Follow-up
                </CardTitle>

                <p className="text-xs text-muted-foreground">
                  Recommended next steps
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <BooleanCard
                label="Referral Required"
                description="Student requires specialist referral"
                checked={form.referral_required}
                onChange={(v) =>
                  updateField(
                    "referral_required",
                    v
                  )
                }
              />

              <BooleanCard
                label="Follow-up Recommended"
                description="Further review is recommended"
                checked={
                  form.follow_up_recommended
                }
                onChange={(v) =>
                  updateField(
                    "follow_up_recommended",
                    v
                  )
                }
              />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ClinicalSelect
                label="Priority"
                value={form.priority}
                onChange={(v) =>
                  updateField("priority", v)
                }
              />

              <Field
                label="Recommend To"
                value={form.recommend_to}
                onChange={(e) =>
                  updateField(
                    "recommend_to",
                    e.target.value
                  )
                }
                placeholder="ENT specialist / Hospital"
              />

              <Field
                label="Next Review Date"
                type="date"
                value={form.next_review_date}
                onChange={(e) =>
                  updateField(
                    "next_review_date",
                    e.target.value
                  )
                }
              />

              <div className="md:col-span-2 lg:col-span-3">
                <FieldLabel>
                  Referral Reason
                </FieldLabel>

                <Textarea
                  value={form.reason}
                  onChange={(e) =>
                    updateField(
                      "reason",
                      e.target.value
                    )
                  }
                  placeholder="Explain why referral is recommended..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
          >
            <RefreshCcw className="size-4" />
            Reset
          </Button>

          <Button
            type="submit"
            className="gap-2"
          >
            <CheckCircle2 className="size-4" />
            Save ENT Screening
          </Button>
        </div>
      </div>
    </form>
  );
}


/* ============================================================
   STUDENT HEADER
============================================================ */

function StudentHeader({ student }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Stethoscope className="size-6" />
          </div>

          <div className="min-w-0">
            <p className="text-base font-semibold">
              {student.name ||
                student.student_name ||
                "Student"}
            </p>

            <p className="text-xs text-muted-foreground">
              {student.studentId ||
                student.student_id ||
                "Student ID not available"}
            </p>
          </div>

          {student.grade && (
            <Badge
              variant="outline"
              className="ml-auto"
            >
              Grade {student.grade}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


/* ============================================================
   SECTION CARD
============================================================ */

function SectionCard({
  icon: Icon,
  title,
  description,
  tone = "blue",
  children,
}) {
  const tones = {
    blue: "bg-primary/10 text-primary",
    purple: "bg-purple-500/10 text-purple-600",
    orange: "bg-orange-500/10 text-orange-600",
    cyan: "bg-cyan-500/10 text-cyan-600",
    green: "bg-green-500/10 text-green-600",
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-muted/10">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}
          >
            <Icon className="size-5" />
          </div>

          <div>
            <CardTitle className="text-base">
              {title}
            </CardTitle>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {children}
      </CardContent>
    </Card>
  );
}


/* ============================================================
   EAR PANEL
============================================================ */

function EarPanel({
  ear,
  short,
  form,
  updateField,
}) {
  const side = short.toLowerCase();

  const fields = [
    [
      "Ear Wax",
      `ear_wax_${side}`,
    ],
    [
      "Infection",
      `infection_${side}`,
    ],
    [
      "Discharge",
      `discharge_${side}`,
    ],
    [
      "Perforation",
      `perforation_${side}`,
    ],
    [
      "Foreign Body",
      `foreign_body_${side}`,
    ],
    [
      "Tympanic Membrane",
      `tympanic_membrane_${side}`,
    ],
    [
      "Whisper Hearing",
      `hearing_whisper_${side}`,
    ],
  ];

  return (
    <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
      {/* Ear heading */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Ear className="size-5" />
          </div>

          <div>
            <p className="text-sm font-semibold">
              {ear}
            </p>

            <p className="text-xs text-muted-foreground">
              {short}
            </p>
          </div>
        </div>

        <Badge variant="outline">
          {short}
        </Badge>
      </div>

      {/* SVG ear illustration */}
      <div className="mb-5 flex justify-center rounded-xl bg-background p-5">
        <EarIllustration />
      </div>

      <div className="space-y-3">
        {fields.map(([label, field]) => (
          <ClinicalSelect
            key={field}
            label={label}
            value={form[field]}
            onChange={(value) =>
              updateField(field, value)
            }
          />
        ))}
      </div>

      <div className="mt-4">
        <FieldLabel>
          System Examination
        </FieldLabel>

        <Textarea
          value={form[`system_examination_${side}`]}
          onChange={(e) =>
            updateField(
              `system_examination_${side}`,
              e.target.value
            )
          }
          placeholder={`${ear} examination findings...`}
          rows={3}
        />
      </div>
    </div>
  );
}


/* ============================================================
   EAR SVG
============================================================ */

function EarIllustration() {
  return (
    <svg
      viewBox="0 0 180 180"
      className="size-32 text-primary"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="90"
        cy="90"
        r="76"
        className="fill-primary/5"
      />

      <path
        d="M110 130C110 147 96 157 82 157C66 157 56 146 56 131C56 116 63 108 68 99C73 90 72 79 72 71C72 54 83 42 99 42C118 42 131 57 131 76C131 92 122 100 115 109C111 114 110 120 110 130Z"
        className="stroke-primary"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M103 77C108 70 106 62 99 59C91 56 84 62 84 71C84 83 94 86 94 97C94 107 84 111 84 123"
        className="stroke-primary/60"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <circle
        cx="84"
        cy="128"
        r="6"
        className="fill-primary/20 stroke-primary"
        strokeWidth="3"
      />

      <path
        d="M84 128C91 126 96 130 99 137"
        className="stroke-primary/50"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}


/* ============================================================
   QUICK STATUS
============================================================ */

function QuickStatus({
  icon: Icon,
  label,
  value,
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <p className="mt-0.5 truncate text-sm font-semibold">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


/* ============================================================
   CLINICAL SELECT
============================================================ */

function ClinicalSelect({
  label,
  value,
  onChange,
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>
        {label}
      </FieldLabel>

      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
        >
          <option value="">
            Select finding
          </option>

          <option value="Normal">
            Normal
          </option>

          <option value="Present">
            Present
          </option>

          <option value="Absent">
            Absent
          </option>

          <option value="Mild">
            Mild
          </option>

          <option value="Moderate">
            Moderate
          </option>

          <option value="Severe">
            Severe
          </option>

          <option value="Not Assessed">
            Not Assessed
          </option>
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}


/* ============================================================
   RISK TOGGLE
============================================================ */

function RiskToggle({
  label,
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
        checked
          ? "border-warning/40 bg-warning/5"
          : "border-border/70 bg-background hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex size-9 items-center justify-center rounded-lg ${
            checked
              ? "bg-warning/10 text-warning"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <ShieldAlert className="size-4" />
        </div>

        <span className="text-sm font-medium">
          {label}
        </span>
      </div>

      <div
        className={`size-5 rounded-full border-2 ${
          checked
            ? "border-warning bg-warning"
            : "border-muted-foreground/30"
        }`}
      >
        {checked && (
          <CheckCircle2 className="size-full text-white" />
        )}
      </div>
    </button>
  );
}


/* ============================================================
   BOOLEAN CARD
============================================================ */

function BooleanCard({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-xl border p-4 text-left transition ${
        checked
          ? "border-destructive/30 bg-destructive/5"
          : "border-border/70 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {label}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        {checked ? (
          <CheckCircle2 className="size-5 text-destructive" />
        ) : (
          <Info className="size-5 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}


/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>
        {label}
      </FieldLabel>

      <Input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}


/* ============================================================
   FIELD LABEL
============================================================ */

function FieldLabel({ children }) {
  return (
    <label className="text-xs font-medium text-muted-foreground">
      {children}
    </label>
  );
}