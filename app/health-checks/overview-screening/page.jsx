"use client";

import {
  Activity,
  Baby,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Download,
  Ear,
  Eye,
  FileText,
  HeartPulse,
  Printer,
  ShieldCheck,
  Syringe,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* =========================================================
   COMPLETE STUDENT HEALTH PROFILE DATA
========================================================= */

const healthProfile = {
  student: {
    name: "Arjun Kumar",
    id: "SCH-104-001",
    class: "5-A",
    school: "Sunshine Public School",
    age: 10,
    gender: "Male",
    dateOfBirth: "12 March 2016",
    bloodGroup: "A+",
  },

  assessment: {
    date: "17 Aug 2026",
    examiner: "Dr. Priya Sharma",
    designation: "Medical Officer",
    assistant: "Riya Nair",
    location: "Sunshine Public School",
  },

  overall: {
    score: 92,
    status: "Healthy",
    summary: "Good overall health",
  },

  vitals: {
    height: {
      value: "145 cm",
      status: "Normal",
    },
    weight: {
      value: "38 kg",
      status: "Normal",
    },
    bmi: {
      value: "18.1",
      status: "Normal",
      percentile: "65th percentile",
    },
    bloodPressure: {
      value: "108/68 mmHg",
      status: "Normal",
    },
    pulse: {
      value: "82 bpm",
      status: "Normal",
    },
    temperature: {
      value: "98.4 °F",
      status: "Normal",
    },
    oxygen: {
      value: "99%",
      status: "Normal",
    },
  },

  vision: {
    status: "Normal",
    rightEye: {
      acuity: "6/6",
      corrected: "6/6",
    },
    leftEye: {
      acuity: "6/6",
      corrected: "6/6",
    },
    colorVision: "Normal",
    strabismus: "Absent",
    usesCorrection: "No",
    remarks:
      "No abnormal visual findings detected. Visual acuity is normal in both eyes.",
  },

  hearing: {
    status: "Normal",

    rightEar: {
      status: "Normal",
      threshold: "≤ 20 dB",
      findings: "No abnormality detected",
    },

    leftEar: {
      status: "Normal",
      threshold: "≤ 20 dB",
      findings: "No abnormality detected",
    },

    whisperTest: {
      right: "Pass",
      left: "Pass",
      distance: "2 feet",
    },

    speech: {
      right: "100%",
      left: "100%",
      srtRight: "10 dB",
      srtLeft: "10 dB",
    },

    tympanometry: {
      right: "Type A",
      left: "Type A",
    },

    remarks: "Hearing within normal range in both ears.",
  },

  dental: {
    status: "Good",
    oralHygiene: "Good",
    gingivalHealth: "Healthy",
    plaque: "Mild",
    caries: 2,
    otherIssues: 1,
    healthyTeeth: 25,
    missingTeeth: 0,

    currentTooth: {
      number: 16,
      name: "Upper Right First Molar",
      status: "Caries",
      surface: "Occlusal",
      severity: "Moderate",
      treatment: "Restoration",
    },

    referral: {
      action: "Routine dental follow-up",
      reason: "Minor dental caries",
      followUp: "6 months",
    },

    instructions: "Brush twice daily and floss regularly.",
    notes: "Overall good oral health",
  },

  ent: {
    status: "Normal",
    nose: "Normal",
    throat: "Normal",
    tonsils: "Normal",
    lymphNodes: "No abnormality",
    remarks: "No significant ENT findings.",
  },

  immunization: {
    status: "Up to date",
    vaccines: "Completed",
    nextReview: "As scheduled",
  },

  history: {
    allergies: "None",
    chronicDisease: "None",
    previousCondition: "None reported",
    surgeries: "None",
    medications: "None",
    familyHistory: "No significant history",
  },

  riskFactors: {
    earInfections: "No",
    speechDelay: "No",
    learningDifficulty: "No",
    familyHistory: "No",
    noiseExposure: "No",
    otherRisks: "None",
  },

  referral: {
    required: true,
    type: "Dental",
    priority: "Routine",
    referredTo: "Dental Clinic",
    reason: "Minor dental caries",
    followUp: "6 months",
  },

  recommendations: [
    "Maintain a balanced diet and regular physical activity.",
    "Continue regular oral hygiene practices.",
    "Continue routine annual health screening.",
    "Keep immunizations up to date.",
    "Follow up with a dentist within 6 months.",
  ],

  clinicalNotes:
    "Student is generally healthy. Growth parameters are within the expected range. Vision and hearing screenings show no significant concerns. Mild dental findings noted and routine dental follow-up is recommended.",
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function HealthOverviewReport() {
  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-200">

      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#0b1120]/95 backdrop-blur">
        <div className="mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-400" />

                <h1 className="text-lg font-semibold text-white">
                  Health Check Overview
                </h1>
              </div>

              <p className="text-xs text-slate-500">
                Complete student health assessment
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-300"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>

            <Button className="bg-sky-600 hover:bg-sky-700">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-5 px-4 py-5 lg:px-6">

        {/* STUDENT PROFILE */}
        <Card className="border-slate-800 bg-[#0e1525]">
          <CardContent className="p-5">

            <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">

              <div className="flex gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-sky-500/10">
                  <UserRound className="h-8 w-8 text-sky-400" />
                </div>

                <div>

                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-white">
                      {healthProfile.student.name}
                    </h2>

                    <Badge className="bg-emerald-500/10 text-emerald-400">
                      {healthProfile.overall.status}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    {healthProfile.student.id} • Class{" "}
                    {healthProfile.student.class} •{" "}
                    {healthProfile.student.school}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>
                      DOB: {healthProfile.student.dateOfBirth}
                    </span>

                    <span>
                      Age: {healthProfile.student.age}
                    </span>

                    <span>
                      Gender: {healthProfile.student.gender}
                    </span>

                    <span>
                      Blood Group: {healthProfile.student.bloodGroup}
                    </span>
                  </div>

                </div>

              </div>

              {/* SCORE */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4">
                <p className="text-xs text-slate-500">
                  Health Score
                </p>

                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-emerald-400">
                    {healthProfile.overall.score}
                  </span>

                  <span className="pb-1 text-sm text-slate-500">
                    /100
                  </span>
                </div>

                <p className="text-xs text-emerald-400">
                  {healthProfile.overall.summary}
                </p>
              </div>

            </div>

          </CardContent>
        </Card>

        {/* ASSESSMENT DETAILS */}
        <Card className="border-slate-800 bg-[#0e1525]">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Assessment Details
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-5">

              <Result
                label="Assessment Date"
                value={healthProfile.assessment.date}
              />

              <Result
                label="Location"
                value={healthProfile.assessment.location}
              />

              <Result
                label="Examiner"
                value={healthProfile.assessment.examiner}
              />

              <Result
                label="Assistant"
                value={healthProfile.assessment.assistant}
              />

              <Result
                label="Designation"
                value={healthProfile.assessment.designation}
              />

            </div>
          </CardContent>
        </Card>

        {/* VITALS */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            icon={<Activity />}
            label="Height"
            value={healthProfile.vitals.height.value}
            status={healthProfile.vitals.height.status}
            color="blue"
          />

          <StatCard
            icon={<HeartPulse />}
            label="Weight"
            value={healthProfile.vitals.weight.value}
            status={healthProfile.vitals.weight.status}
            color="green"
          />

          <StatCard
            icon={<Baby />}
            label="BMI"
            value={healthProfile.vitals.bmi.value}
            status={healthProfile.vitals.bmi.status}
            color="purple"
          />

          <StatCard
            icon={<ShieldCheck />}
            label="Immunization"
            value={healthProfile.immunization.status}
            status="Complete"
            color="cyan"
          />

        </section>

        {/* MORE VITALS */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            icon={<HeartPulse />}
            label="Blood Pressure"
            value={healthProfile.vitals.bloodPressure.value}
            status={healthProfile.vitals.bloodPressure.status}
            color="red"
          />

          <StatCard
            icon={<Activity />}
            label="Pulse"
            value={healthProfile.vitals.pulse.value}
            status={healthProfile.vitals.pulse.status}
            color="blue"
          />

          <StatCard
            icon={<Activity />}
            label="Temperature"
            value={healthProfile.vitals.temperature.value}
            status={healthProfile.vitals.temperature.status}
            color="orange"
          />

          <StatCard
            icon={<ShieldCheck />}
            label="SpO₂"
            value={healthProfile.vitals.oxygen.value}
            status={healthProfile.vitals.oxygen.status}
            color="cyan"
          />

        </section>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">

          <div className="space-y-5">

            {/* GROWTH */}
            <Card className="border-slate-800 bg-[#0e1525]">

              <CardHeader>
                <SectionTitle
                  icon={<Activity />}
                  title="Growth & BMI"
                  subtitle="Physical measurements and growth assessment"
                  badge="Normal"
                />
              </CardHeader>

              <CardContent className="space-y-4">

                <div className="grid gap-4 md:grid-cols-2">

                  <Measurement
                    title="Height"
                    value="145"
                    unit="cm"
                    standard="Average"
                  />

                  <Measurement
                    title="Weight"
                    value="38"
                    unit="kg"
                    standard="Average"
                  />

                </div>

                <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-5">

                  <div className="flex justify-between">

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Body Mass Index
                      </p>

                      <p className="text-xs text-slate-500">
                        Calculated from height and weight
                      </p>
                    </div>

                    <Badge className="bg-emerald-500/10 text-emerald-400">
                      Normal
                    </Badge>

                  </div>

                  <div className="py-8 text-center">

                    <p className="text-5xl font-bold text-white">
                      {healthProfile.vitals.bmi.value}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      BMI • {healthProfile.vitals.bmi.percentile}
                    </p>

                  </div>

                </div>

              </CardContent>
            </Card>

            {/* VISION */}
            <Card className="border-slate-800 bg-[#0e1525]">

              <CardHeader>
                <SectionTitle
                  icon={<Eye />}
                  title="Vision Screening"
                  subtitle="Visual acuity and eye health"
                  badge={healthProfile.vision.status}
                />
              </CardHeader>

              <CardContent className="space-y-4">

                <div className="grid gap-4 md:grid-cols-2">

                  <VisionCard
                    eye="Right Eye (OD)"
                    acuity={healthProfile.vision.rightEye.acuity}
                    corrected={healthProfile.vision.rightEye.corrected}
                  />

                  <VisionCard
                    eye="Left Eye (OS)"
                    acuity={healthProfile.vision.leftEye.acuity}
                    corrected={healthProfile.vision.leftEye.corrected}
                  />

                </div>

                <div className="grid gap-4 rounded-xl border border-slate-800 bg-[#080e1b] p-4 sm:grid-cols-3">

                  <Result
                    label="Color Vision"
                    value={healthProfile.vision.colorVision}
                  />

                  <Result
                    label="Strabismus"
                    value={healthProfile.vision.strabismus}
                  />

                  <Result
                    label="Uses Correction"
                    value={healthProfile.vision.usesCorrection}
                  />

                </div>

                <Note text={healthProfile.vision.remarks} />

              </CardContent>
            </Card>

            {/* HEARING */}
            <Card className="border-slate-800 bg-[#0e1525]">

              <CardHeader>
                <SectionTitle
                  icon={<Ear />}
                  title="Hearing Screening"
                  subtitle="Audiological assessment and hearing health"
                  badge={healthProfile.hearing.status}
                />
              </CardHeader>

              <CardContent className="space-y-4">

                <div className="grid gap-4 md:grid-cols-2">

                  <ScreeningResult
                    title="Right Ear"
                    value={healthProfile.hearing.rightEar.status}
                    description={
                      healthProfile.hearing.rightEar.findings
                    }
                  />

                  <ScreeningResult
                    title="Left Ear"
                    value={healthProfile.hearing.leftEar.status}
                    description={
                      healthProfile.hearing.leftEar.findings
                    }
                  />

                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  <InfoCard title="Whisper Test">

                    <div className="grid grid-cols-2 gap-4">
                      <Result
                        label="Right Ear"
                        value={healthProfile.hearing.whisperTest.right}
                      />

                      <Result
                        label="Left Ear"
                        value={healthProfile.hearing.whisperTest.left}
                      />
                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                      Distance:{" "}
                      {healthProfile.hearing.whisperTest.distance}
                    </p>

                  </InfoCard>

                  <InfoCard title="Speech Assessment">

                    <div className="grid grid-cols-2 gap-4">

                      <Result
                        label="Right"
                        value={healthProfile.hearing.speech.right}
                      />

                      <Result
                        label="Left"
                        value={healthProfile.hearing.speech.left}
                      />

                      <Result
                        label="SRT Right"
                        value={healthProfile.hearing.speech.srtRight}
                      />

                      <Result
                        label="SRT Left"
                        value={healthProfile.hearing.speech.srtLeft}
                      />

                    </div>

                  </InfoCard>

                </div>

                <InfoCard title="Tympanometry">

                  <div className="grid grid-cols-2 gap-4">

                    <Result
                      label="Right Ear"
                      value={healthProfile.hearing.tympanometry.right}
                    />

                    <Result
                      label="Left Ear"
                      value={healthProfile.hearing.tympanometry.left}
                    />

                  </div>

                </InfoCard>

              </CardContent>
            </Card>

            {/* DENTAL */}
            <Card className="border-slate-800 bg-[#0e1525]">

              <CardHeader>
                <SectionTitle
                  icon={<HeartPulse />}
                  title="Dental Screening"
                  subtitle="Oral and dental examination"
                  badge={healthProfile.dental.status}
                />
              </CardHeader>

              <CardContent className="space-y-4">

                <div className="grid gap-4 md:grid-cols-3">

                  <ScreeningResult
                    title="Oral Hygiene"
                    value={healthProfile.dental.oralHygiene}
                    description="Overall oral hygiene"
                  />

                  <ScreeningResult
                    title="Gingival Health"
                    value={healthProfile.dental.gingivalHealth}
                    description="Gum health"
                  />

                  <ScreeningResult
                    title="Plaque"
                    value={healthProfile.dental.plaque}
                    description="Plaque assessment"
                  />

                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                  <SummaryValue
                    label="Caries"
                    value={healthProfile.dental.caries}
                  />

                  <SummaryValue
                    label="Other Issues"
                    value={healthProfile.dental.otherIssues}
                  />

                  <SummaryValue
                    label="Healthy"
                    value={healthProfile.dental.healthyTeeth}
                  />

                  <SummaryValue
                    label="Missing"
                    value={healthProfile.dental.missingTeeth}
                  />

                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">

                  <p className="text-xs text-slate-500">
                    Current Tooth
                  </p>

                  <h3 className="mt-1 font-semibold text-white">
                    Tooth {healthProfile.dental.currentTooth.number}{" "}
                    <span className="font-normal text-slate-400">
                      ({healthProfile.dental.currentTooth.name})
                    </span>
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">

                    <Result
                      label="Status"
                      value={healthProfile.dental.currentTooth.status}
                    />

                    <Result
                      label="Surface"
                      value={healthProfile.dental.currentTooth.surface}
                    />

                    <Result
                      label="Severity"
                      value={healthProfile.dental.currentTooth.severity}
                    />

                    <Result
                      label="Treatment"
                      value={healthProfile.dental.currentTooth.treatment}
                    />

                  </div>

                </div>

                <InfoCard title="Dental Referral">

                  <div className="grid gap-4 md:grid-cols-3">

                    <Result
                      label="Recommended Action"
                      value={healthProfile.dental.referral.action}
                    />

                    <Result
                      label="Reason"
                      value={healthProfile.dental.referral.reason}
                    />

                    <Result
                      label="Follow-up"
                      value={healthProfile.dental.referral.followUp}
                    />

                  </div>

                </InfoCard>

              </CardContent>
            </Card>

            {/* ENT */}
            <Card className="border-slate-800 bg-[#0e1525]">

              <CardHeader>
                <SectionTitle
                  icon={<Activity />}
                  title="ENT Screening"
                  subtitle="Ear, nose and throat assessment"
                  badge={healthProfile.ent.status}
                />
              </CardHeader>

              <CardContent>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                  <Result
                    label="Nose"
                    value={healthProfile.ent.nose}
                  />

                  <Result
                    label="Throat"
                    value={healthProfile.ent.throat}
                  />

                  <Result
                    label="Tonsils"
                    value={healthProfile.ent.tonsils}
                  />

                  <Result
                    label="Lymph Nodes"
                    value={healthProfile.ent.lymphNodes}
                  />

                </div>

                <Note text={healthProfile.ent.remarks} />

              </CardContent>
            </Card>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-5">

            {/* BLOOD GROUP */}
            <Card className="border-slate-800 bg-[#0e1525]">

              <CardHeader>
                <CardTitle className="text-base text-white">
                  Blood Group
                </CardTitle>
              </CardHeader>

              <CardContent>

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 text-xl font-bold text-red-400">
                    {healthProfile.student.bloodGroup}
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      {healthProfile.student.bloodGroup}
                    </p>

                    <p className="text-xs text-slate-500">
                      Blood group recorded
                    </p>
                  </div>

                </div>

              </CardContent>
            </Card>

            {/* IMMUNIZATION */}
            <Card className="border-slate-800 bg-[#0e1525]">

              <CardHeader>
                <SectionTitle
                  icon={<Syringe />}
                  title="Immunization"
                  subtitle="Vaccination status"
                  badge={healthProfile.immunization.status}
                />
              </CardHeader>

              <CardContent className="space-y-4">

                <StatusLine
                  label="Recommended vaccines"
                  value={healthProfile.immunization.vaccines}
                />

                <StatusLine
                  label="Vaccination status"
                  value={healthProfile.immunization.status}
                />

                <StatusLine
                  label="Next review"
                  value={healthProfile.immunization.nextReview}
                />

              </CardContent>
            </Card>

            {/* HEALTH HISTORY */}
            <Card className="border-slate-800 bg-[#0e1525]">

              <CardHeader>
                <CardTitle className="text-base text-white">
                  Health History
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">

                <HistoryItem
                  label="Allergies"
                  value={healthProfile.history.allergies}
                />

                <HistoryItem
                  label="Chronic Disease"
                  value={healthProfile.history.chronicDisease}
                />

                <HistoryItem
                  label="Previous Condition"
                  value={healthProfile.history.previousCondition}
                />

                <HistoryItem
                  label="Surgeries"
                  value={healthProfile.history.surgeries}
                />

                <HistoryItem
                  label="Medications"
                  value={healthProfile.history.medications}
                />

              </CardContent>
            </Card>

            {/* RISK FACTORS */}
            <Card className="border-slate-800 bg-[#0e1525]">

              <CardHeader>
                <CardTitle className="text-base text-white">
                  Risk Factors
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">

                <StatusLine
                  label="Frequent Ear Infections"
                  value={healthProfile.riskFactors.earInfections}
                />

                <StatusLine
                  label="Speech Delay"
                  value={healthProfile.riskFactors.speechDelay}
                />

                <StatusLine
                  label="Learning Difficulty"
                  value={healthProfile.riskFactors.learningDifficulty}
                />

                <StatusLine
                  label="Family History"
                  value={healthProfile.riskFactors.familyHistory}
                />

                <StatusLine
                  label="Noise Exposure"
                  value={healthProfile.riskFactors.noiseExposure}
                />

              </CardContent>
            </Card>

            {/* REFERRAL */}
            <Card className="border-amber-500/30 bg-[#0e1525]">

              <CardHeader>
                <CardTitle className="text-base text-white">
                  Referral & Follow-up
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">

                <Badge className="bg-amber-500/10 text-amber-400">
                  {healthProfile.referral.priority}
                </Badge>

                <Result
                  label="Type"
                  value={healthProfile.referral.type}
                />

                <Result
                  label="Referred To"
                  value={healthProfile.referral.referredTo}
                />

                <Result
                  label="Reason"
                  value={healthProfile.referral.reason}
                />

                <Result
                  label="Follow-up"
                  value={healthProfile.referral.followUp}
                />

              </CardContent>
            </Card>

            {/* NOTES */}
            <Card className="border-slate-800 bg-[#0e1525]">

              <CardHeader>
                <CardTitle className="text-base text-white">
                  Clinical Notes
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="rounded-lg border border-slate-800 bg-[#080e1b] p-4 text-sm leading-6 text-slate-400">
                  {healthProfile.clinicalNotes}
                </p>
              </CardContent>
            </Card>

          </aside>

        </div>

        {/* FINAL ASSESSMENT */}
        <Card className="border-slate-800 bg-[#0e1525]">

          <CardHeader>

            <SectionTitle
              icon={<CheckCircle2 />}
              title="Overall Assessment"
              subtitle="Summary of complete health screening"
              badge="Healthy"
            />

          </CardHeader>

          <CardContent>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">

              <OverallItem title="Growth" value="Normal" />
              <OverallItem title="Vision" value="Normal" />
              <OverallItem title="Hearing" value="Normal" />
              <OverallItem title="Dental" value="Good" />
              <OverallItem title="ENT" value="Normal" />
              <OverallItem title="Immunization" value="Up to date" />

            </div>

            <Separator className="my-5 bg-slate-800" />

            <h3 className="text-sm font-semibold text-white">
              Recommendations
            </h3>

            <ul className="mt-3 grid gap-3 md:grid-cols-2">

              {healthProfile.recommendations.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm text-slate-400"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}

            </ul>

            <div className="mt-7 flex justify-between border-t border-slate-800 pt-5">

              <div>
                <p className="text-xs text-slate-500">
                  Examined by
                </p>

                <p className="mt-1 font-medium text-white">
                  {healthProfile.assessment.examiner}
                </p>

                <p className="text-xs text-slate-500">
                  {healthProfile.assessment.designation}
                </p>
              </div>

              <div className="text-right">

                <p className="font-serif text-2xl italic text-sky-400">
                  Priya Sharma
                </p>

                <p className="text-xs text-slate-500">
                  {healthProfile.assessment.date}
                </p>

              </div>

            </div>

          </CardContent>
        </Card>

      </main>
    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function StatCard({
  icon,
  label,
  value,
  status,
  color,
}) {
  const styles = {
    blue: "bg-sky-500/10 text-sky-400",
    green: "bg-emerald-500/10 text-emerald-400",
    purple: "bg-purple-500/10 text-purple-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
    red: "bg-red-500/10 text-red-400",
    orange: "bg-orange-500/10 text-orange-400",
  };

  return (
    <Card className="border-slate-800 bg-[#0e1525]">
      <CardContent className="p-4">

        <div className="flex justify-between">

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles[color]}`}
          >
            {icon}
          </div>

          <span className="text-xs text-emerald-400">
            {status}
          </span>

        </div>

        <p className="mt-4 text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-xl font-semibold text-white">
          {value}
        </p>

      </CardContent>
    </Card>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
  badge,
}) {
  return (
    <div className="flex items-start justify-between gap-3">

      <div className="flex gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
          {icon}
        </div>

        <div>

          <CardTitle className="text-base text-white">
            {title}
          </CardTitle>

          <p className="text-xs text-slate-500">
            {subtitle}
          </p>

        </div>

      </div>

      {badge && (
        <Badge className="bg-emerald-500/10 text-emerald-400">
          {badge}
        </Badge>
      )}

    </div>
  );
}

function Measurement({
  title,
  value,
  unit,
  standard,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-4">

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold text-white">
        {value}{" "}
        <span className="text-sm text-slate-400">
          {unit}
        </span>
      </p>

      <div className="mt-4 flex justify-between border-t border-slate-800 pt-3">

        <span className="text-xs text-slate-500">
          Standard
        </span>

        <span className="text-xs text-emerald-400">
          {standard}
        </span>

      </div>

    </div>
  );
}

function VisionCard({
  eye,
  acuity,
  corrected,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-4">

      <div className="flex justify-between">

        <p className="text-sm font-medium text-white">
          {eye}
        </p>

        <Badge className="bg-emerald-500/10 text-emerald-400">
          Normal
        </Badge>

      </div>

      <div className="mt-5 flex justify-between">

        <div>
          <p className="text-xs text-slate-500">
            Visual Acuity
          </p>

          <p className="text-3xl font-bold text-white">
            {acuity}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">
            Corrected
          </p>

          <p className="text-sm text-slate-300">
            {corrected}
          </p>
        </div>

      </div>

    </div>
  );
}

function ScreeningResult({
  title,
  value,
  description,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#080e1b] p-4">

      <div>
        <p className="text-sm font-medium text-white">
          {title}
        </p>

        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>

      <Badge className="bg-emerald-500/10 text-emerald-400">
        {value}
      </Badge>

    </div>
  );
}

function Result({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white">
        {value}
      </p>

    </div>
  );
}

function InfoCard({
  title,
  children,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-4">

      <p className="mb-4 text-sm font-semibold text-white">
        {title}
      </p>

      {children}

    </div>
  );
}

function Note({ text  }) {
  return (
    <div className="rounded-xl border border-slate-800 p-4">

      <p className="text-xs text-slate-500">
        Remarks
      </p>

      <p className="mt-1 text-sm text-slate-300">
        {text}
      </p>

    </div>
  );
}

function StatusLine({
  label,
  value,
}) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">

      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs text-emerald-400">
        {value}
      </span>

    </div>
  );
}

function HistoryItem({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <div className="mt-1 rounded-lg border border-slate-800 bg-[#080e1b] px-3 py-2">
        <p className="text-sm text-slate-300">
          {value}
        </p>
      </div>

    </div>
  );
}

function SummaryValue({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-4 text-center">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        {value}
      </p>

    </div>
  );
}

function OverallItem({
  title,
  value,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#080e1b] p-4">

      <div>
        <p className="text-xs text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-sm font-medium text-white">
          {value}
        </p>
      </div>

      <CheckCircle2 className="h-5 w-5 text-emerald-400" />

    </div>
  );
}
