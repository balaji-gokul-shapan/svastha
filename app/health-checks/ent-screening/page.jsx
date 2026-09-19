"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  BadgeCheck,
  HeartPulse,
  Loader2,
  Moon,
  Save,
  Stethoscope,
  Wind,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { createEntScreening } from "@/lib/features/registerEntScreening";
import { getEntScreening } from "@/lib/features/getEntScreening";
import { getAllMasterScreening } from "@/lib/features/masterScreeningSlice";

import useAssignedEvents, { findSelectedCamp } from "@/lib/useAssignedEvents";
import useAuthUser from "@/lib/useAuthUser";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectAuthUser } from "@/lib/features/auth-slice";

import StudentFilter from "../utilities/studentFilter";
import StudentProfileCard from "@/app/students/utilities/studentProfileCard";
import AssessmentCard from "@/app/ui/AssessmentCard";
import { EmptyState } from "@/components/ui/empty-state";
import { FramerCard } from "@/util/FramerCard";

import {
  BooleanCard,
  ClinicalSelect,
  Field,
  SectionCard,
} from "./datas/ent-screening-data";

import { TextareaField } from "@/components/ui/text-field";
import ScreeningStepper from "@/components/ScreeningStepper";
import { getMasterData } from "@/util/masterData";

const ENT_STEPS = [
  {
    value: "nose",
    label: "Nose & Sinus",
    shortLabel: "Nose",
  },
  {
    value: "ear",
    label: "Ear Examination",
    shortLabel: "Ear Exam",
  },
  {
    value: "risk",
    label: "Risk Assessment",
    shortLabel: "Risk",
  },
  {
    value: "headneck",
    label: "Head, Neck & Speech",
    shortLabel: "Head & Neck",
  },
  {
    value: "throat",
    label: "Throat & Oropharynx",
    shortLabel: "Throat",
  },
  {
    value: "respiratory",
    label: "Respiratory & Sleep",
    shortLabel: "Respiratory",
  },
  {
    value: "review",
    label: "Clinical Assessment",
    shortLabel: "Review",
  },
  {
    value: "referral",
    label: "Referral & Follow-up",
    shortLabel: "Referral",
  },
];

const ScreeningSectionLoading = () => (
  <div className="min-h-24 rounded-xl border border-border bg-card p-4" />
);

const EarExamination = dynamic(() => import("./components/EarExamination"), {
  loading: ScreeningSectionLoading,
});

const RiskAssessment = dynamic(() => import("./components/RiskAssessment"), {
  loading: ScreeningSectionLoading,
});

const HeadNeckSpeech = dynamic(() => import("./components/HeadNeckSpeech"), {
  loading: ScreeningSectionLoading,
});

const initialForm = {
  // Ear
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

  // Nose
  nasal_breathing: "",
  nasal_discharge: "",
  nasal_blockage: "",
  allergic_rhinitis: "",
  nasal_septum: "",
  sinus_tenderness: "",
  history_of_nose_bleed: "",
  nose_sinus_comments: "",

  // Throat
  oropharynx: "",
  tonsils: "",
  tonsillar_enlargement: "",
  pharyngeal_wall: "",
  redness_congestion: "",
  exudates_pus: "",
  voice_quality: "",
  throat_comments: "",

  // Respiratory / Sleep
  snoring: "",
  mouth_breathing: "",
  sleep_disturbance: "",
  daytime_sleepiness: "",
  chronic_cough: "",
  respiratory_sleep_comments: "",

  // Head / Neck / Speech
  head_neck_lymph_nodes: "",
  neck_swelling: "",
  speech: "",
  speech_clarity: "",
  any_other_findings: "",

  // Risk
  risk_frequent_ear_infections: false,
  risk_allergic_rhinitis: false,
  risk_speech_delay: false,
  risk_hearing_difficulty: false,
  risk_tonsil_adenoid_problems: false,
  risk_nasal_obstruction: false,
  risk_others: "",

  // Clinical assessment
  severity: "",
  risk_level: "",
  ent_grade: "",

  // Referral
  referral_required: false,
  follow_up_recommended: false,
  next_review_date: "",
  summary_remarks: "",
  recommend_to: "",
  priority: "",
  reason: "",
};

export default function ENTScreeningPage({ screening = {}, student = {} }) {
  const dispatch = useAppDispatch();

  const [studentId, setStudentId] = React.useState("");
  const [schoolName, setSchoolName] = React.useState("all");
  const [classFilter, setClassFilter] = React.useState("all");
  const [sectionFilter, setSectionFilter] = React.useState("all");
  const [studentFilter, setStudentFilter] = React.useState("all");
  const [academicYear, setAcademicYear] = React.useState("2026-2027");

  const [getStudentDataByEvent, setGetStudentDataByEvent] = React.useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [activeEntStep, setActiveEntStep] = useState("nose");

  const isSavingRef = React.useRef(false);
  const savedStudentKeyRef = React.useRef(null);

  const [savedStudentKey, setSavedStudentKey] = useState(null);
  const [selectedCampDetails, setSelectedCampDetails] = React.useState({});
      const selectedCampId = String(
        selectedCampDetails?.id ?? selectedCampDetails?.campId ?? "",
      ).trim();

  const [form, setForm] = React.useState({
    ...initialForm,
    ...screening,
  });

  // ---------------------------------------------------------
  // AUTH / EVENTS
  // ---------------------------------------------------------

  const { assignedEvents, assignEventLoading, assignEventError } =
    useAssignedEvents();

  const authUser = useAppSelector(selectAuthUser);

  // ---------------------------------------------------------
  // FORM UPDATE
  // ---------------------------------------------------------

  const updateField = React.useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // ---------------------------------------------------------
  // BACKEND ERROR
  // ---------------------------------------------------------

  function getBackendErrorMessage(error) {
    let payload = error;

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        return /<!doctype html|<html[\s>]/i.test(payload) ||
          payload.length > 240
          ? "Unable to save screening. Please try again."
          : payload;
      }
    }

    if (!payload || typeof payload !== "object") {
      return "Something went wrong. Please try again.";
    }

    const fieldMessages = Object.values(payload.errors ?? {})
      .flatMap((messages) => (Array.isArray(messages) ? messages : [messages]))
      .filter(Boolean);

    const message =
      fieldMessages[0] ??
      payload.message ??
      payload.error ??
      payload.detail ??
      "Something went wrong. Please try again.";

    const stringMessage = String(message);

    return /<!doctype html|<html[\s>]/i.test(stringMessage) ||
      stringMessage.length > 240
      ? "Unable to save screening. Please try again."
      : stringMessage;
  }

  // ---------------------------------------------------------
  // STUDENT ARRAY
  // ---------------------------------------------------------

  const studentsArray = React.useMemo(() => {
    if (Array.isArray(getStudentDataByEvent?.students?.data)) {
      return getStudentDataByEvent.students.data;
    }

    if (Array.isArray(getStudentDataByEvent?.students)) {
      return getStudentDataByEvent.students;
    }

    if (Array.isArray(getStudentDataByEvent?.data)) {
      return getStudentDataByEvent.data;
    }

    if (Array.isArray(getStudentDataByEvent)) {
      return getStudentDataByEvent;
    }

    return [];
  }, [getStudentDataByEvent]);

  // ---------------------------------------------------------
  // SELECTED CAMP
  // ---------------------------------------------------------

  const selectedCamp = React.useMemo(
    () => findSelectedCamp(assignedEvents, schoolName),
    [assignedEvents, schoolName],
  );

  // ---------------------------------------------------------
  // EVENT ROSTER
  // ---------------------------------------------------------

  const eventRoster =
    useAppSelector((state) => state.eventAssign?.students) || [];

  // ---------------------------------------------------------
  // SELECTED STUDENT FROM FILTER
  // ---------------------------------------------------------

  const selectedStudentFromFilter = React.useMemo(() => {
    const activeId = studentFilter !== "all" ? studentFilter : studentId;

    if (!activeId) {
      return null;
    }

    const roster = Array.isArray(studentsArray) ? studentsArray : [];

    return (
      roster.find(
        (studentItem) =>
          String(
            studentItem?.id ??
              studentItem?.studentId ??
              studentItem?.cus_id ??
              studentItem?.student_id,
          ) === String(activeId),
      ) ?? null
    );
  }, [studentsArray, studentFilter, studentId]);

  // ---------------------------------------------------------
  // SELECTED STUDENT
  // ---------------------------------------------------------

  const selectedStudent = React.useMemo(() => {
    if (selectedStudentFromFilter) {
      return selectedStudentFromFilter;
    }

    const activeId = studentFilter !== "all" ? studentFilter : studentId;

    if (!activeId) {
      return null;
    }

    if (Array.isArray(studentsArray) && studentsArray.length > 0) {
      const match = studentsArray.find(
        (studentItem) =>
          String(
            studentItem?.id ??
              studentItem?.studentId ??
              studentItem?.cus_id ??
              studentItem?.student_id,
          ) === String(activeId),
      );

      if (match) {
        return match;
      }
    }

    if (Array.isArray(eventRoster) && eventRoster.length > 0) {
      const match = eventRoster.find(
        (studentItem) =>
          String(
            studentItem?.id ??
              studentItem?.studentId ??
              studentItem?.cus_id ??
              studentItem?.student_id,
          ) === String(activeId),
      );

      if (match) {
        return match;
      }
    }

    return null;
  }, [
    studentsArray,
    selectedStudentFromFilter,
    studentFilter,
    studentId,
    eventRoster,
  ]);

  // ---------------------------------------------------------
  // SELECTED STUDENT KEY
  // ---------------------------------------------------------

  const selectedStudentKey = String(
    selectedStudent?.id ??
      selectedStudent?.studentId ??
      selectedStudent?.cus_id ??
      selectedStudent?.student_id ??
      "",
  );

  const studentSelectValue = selectedStudentKey || "";

  const hasSelectedStudent = Boolean(
    selectedStudent ||
    selectedStudentKey ||
    (studentFilter && studentFilter !== "all") ||
    studentId,
  );

  // ---------------------------------------------------------
  // FILTER HANDLERS
  // ---------------------------------------------------------

  const handleSchoolFilterChange = React.useCallback((value) => {
    setSchoolName(value);
    setClassFilter("all");
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
    setSavedStudentKey(null);
    savedStudentKeyRef.current = null;
  }, []);

  const handleAcademicYearFilterChange = React.useCallback((value) => {
    setAcademicYear(value);
    setClassFilter("all");
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
    setSavedStudentKey(null);
    savedStudentKeyRef.current = null;
  }, []);

  const handleClassFilterChange = React.useCallback((value) => {
    setClassFilter(value);
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
    setSavedStudentKey(null);
    savedStudentKeyRef.current = null;
  }, []);

  const handleSectionFilterChange = React.useCallback((value) => {
    setSectionFilter(value);
    setStudentFilter("all");
    setStudentId("");
    setSavedStudentKey(null);
    savedStudentKeyRef.current = null;
  }, []);

  const handleStudentFilterChange = React.useCallback((value) => {
    setStudentFilter(value);
    setStudentId(value === "all" ? "" : value);

    setSavedStudentKey(null);
    savedStudentKeyRef.current = null;

    setActiveEntStep("nose");
  }, []);

  // ---------------------------------------------------------
  // GET ENT SCREENING
  // ---------------------------------------------------------

  const {
    data: EntScreeningData = [],
    isLoading: EntScreeningDataLoading,
    error: EntScreeningDataQueryError,
    refetch: refetchEntScreening,
  } = useQuery({
    // Camp id is part of the key so switching camps refetches instead of
    // returning a stale cached record for the previous camp.
    queryKey: ["Ent-screening", studentId, selectedCampId],

    queryFn: () =>
      dispatch(
        getEntScreening({
          studentId,
          campId: selectedCampId,
        }),
      ).unwrap(),

    enabled: Boolean(String(studentId).trim()),

    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // ---------------------------------------------------------
  // MASTER SCREENING
  // ---------------------------------------------------------

  const {
    data: masterScreeningData = [],
    isLoading: masterScreeningDataLoading,
    error: masterScreeningQueryError,
  } = useQuery({
    queryKey: ["Ent-screening-master"],

    queryFn: () => dispatch(getAllMasterScreening()).unwrap(),

    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  
  const requiredMasterData = React.useMemo(
    () =>
      getMasterData(masterScreeningData, [
        "ear-examinations",
        "hearing-referral-reasons",
        "hearing-classifications",
      ]),
      [masterScreeningData],
    );
    
    console.log(requiredMasterData, "requiredMasterData");
  // ---------------------------------------------------------
  // ASSESSMENT STUDENT CHANGE
  // ---------------------------------------------------------

  const handleAssessmentStudentChange = React.useCallback((value) => {
    setStudentId(value);
    setStudentFilter(value);

    setSavedStudentKey(null);
    savedStudentKeyRef.current = null;

    setActiveEntStep("nose");
  }, []);

  // ---------------------------------------------------------
  // STUDENT OPTIONS
  // ---------------------------------------------------------

  const assessmentStudentOptions = React.useMemo(
    () =>
      studentsArray.map((studentItem) => {
        const value = String(
          studentItem?.id ??
            studentItem?.studentId ??
            studentItem?.cus_id ??
            studentItem?.student_id ??
            "",
        );

        const studentCode =
          studentItem?.studentId ??
          studentItem?.student_id ??
          studentItem?.school_registration_number ??
          studentItem?.admission_number;

        return {
          value,
          label: `${
            studentItem?.name ?? studentItem?.student_name ?? "Unknown"
          }${studentCode ? ` (${studentCode})` : ""}`,
        };
      }),
    [studentsArray],
  );

  // ---------------------------------------------------------
  // CURRENT SCREENING
  // ---------------------------------------------------------

  const getSelectedStudentScreeningData = React.useMemo(() => {
    if (!studentId || !Array.isArray(EntScreeningData)) {
      return null;
    }

    return EntScreeningData[0] ?? null;
  }, [EntScreeningData, studentId]);

  // ---------------------------------------------------------
  // SAVE
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (isSavingRef.current) {
      return;
    }

    const rawStudentId =
      selectedStudent?.id ??
      selectedStudent?.cus_id ??
      selectedStudent?.student_id ??
      selectedStudent?.studentId ??
      studentId;

    if (!String(rawStudentId ?? "").trim()) {
      toast.error("Select a student before saving the ENT screening");
      return;
    }

    const currentStudentKey = String(rawStudentId);

    if (savedStudentKeyRef.current === currentStudentKey) {
      toast.error(
        "This student's screening has already been saved. Select another student to continue.",
      );
      return;
    }

    const campId =
      selectedStudent?.camp_id ??
      selectedStudent?.campId ??
      selectedCamp?.id ??
      selectedCamp?.camp_id;

    const payload = {
      ...screening,
      ...form,

      // Keep these fields LAST so they cannot
      // accidentally be overwritten by form data.
      student_id: Number(rawStudentId) || 0,

      camp_id: Number(campId) || 0,
    };

    setIsSaving(true);
    isSavingRef.current = true;

    try {
      await dispatch(createEntScreening(payload)).unwrap();

      savedStudentKeyRef.current = currentStudentKey;

      setSavedStudentKey(currentStudentKey);

      toast.success("ENT screening saved successfully", {
        description: selectedStudent?.name
          ? `Record saved for ${selectedStudent.name}`
          : undefined,
      });

      await refetchEntScreening();
    } catch (error) {
      toast.error("Failed to save ENT screening", {
        description: getBackendErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  };

  // ---------------------------------------------------------
  // SAVED STATE
  // ---------------------------------------------------------

  const isCurrentStudentSaved = Boolean(
    selectedStudent &&
    savedStudentKey &&
    savedStudentKey ===
      String(
        selectedStudent?.id ??
          selectedStudent?.cus_id ??
          selectedStudent?.student_id ??
          selectedStudent?.studentId ??
          studentId,
      ),
  );

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sticky top-14 z-10 mb-4 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 py-3">
            <div className="flex size-12 aspect-square items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="size-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                ENT Screening
              </h1>

              <p className="text-sm text-muted-foreground">
                Ear, nose, throat, speech and respiratory assessment
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:flex-nowrap">
          <Button type="button" variant="outline">
            Save & Exit
          </Button>

          <Button
            type="submit"
            disabled={isSaving || isCurrentStudentSaved}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isCurrentStudentSaved ? (
              <BadgeCheck className="size-4" />
            ) : (
              <Save className="size-4" />
            )}

            {isSaving
              ? "Saving..."
              : isCurrentStudentSaved
                ? "Saved ✓"
                : "Save assessment"}
          </Button>
        </div>
      </div>

      <div className="space-y-5 pb-8">
        {/* =====================================================
            STUDENT FILTER
        ===================================================== */}

        <StudentFilter
          schoolName={schoolName}
          academicYear={academicYear}
          classFilter={classFilter}
          sectionFilter={sectionFilter}
          studentFilter={studentFilter}
          onSchoolNameChange={handleSchoolFilterChange}
          onAcademicYearChange={handleAcademicYearFilterChange}
          onClassFilterChange={handleClassFilterChange}
          onSectionFilterChange={handleSectionFilterChange}
          onStudentFilterChange={handleStudentFilterChange}
          assignedEvents={assignedEvents}
          assignEventLoading={assignEventLoading}
          assignEventError={assignEventError}
          authUser={authUser}
          getStudentDataByEvent={getStudentDataByEvent}
          setGetStudentDataByEvent={setGetStudentDataByEvent}
          setSelectedCampDetails={setSelectedCampDetails}
        />

        {/* =====================================================
            STUDENT CONTENT
        ===================================================== */}

        {hasSelectedStudent ? (
          <>
            <StudentProfileCard student={selectedStudent} />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
              {/* =================================================
                  LEFT COLUMN
              ================================================= */}

              <div className="space-y-4">
                <AssessmentCard
                  data={getSelectedStudentScreeningData}
                  studentOptions={assessmentStudentOptions}
                  studentValue={studentSelectValue}
                  isScreening={false}
                  schoolName={schoolName}
                  onStudentChange={handleAssessmentStudentChange}
                  authUser={authUser}
                />
              </div>

              {/* =================================================
                  RIGHT / CENTER COLUMN
              ================================================= */}

              <div className="min-w-0">
                <ScreeningStepper
                  activeStep={activeEntStep}
                  setActiveStep={setActiveEntStep}
                  steps={ENT_STEPS}
                  filterFemale={false}
                  onSave={handleSubmit}
                >
                  {/* =================================================
                      STEP 1 — NOSE & SINUS
                  ================================================= */}

                  <div className="space-y-4">
                    <FramerCard>
                      <SectionCard
                        icon={Wind}
                        title="Nose & Sinus Examination"
                        description="Nasal airway, discharge, obstruction and sinus assessment"
                        tone="purple"
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <ClinicalSelect
                            label="Nasal Breathing"
                            value={form.nasal_breathing}
                            onChange={(v) => updateField("nasal_breathing", v)}
                          />

                          <ClinicalSelect
                            label="Nasal Discharge"
                            value={form.nasal_discharge}
                            onChange={(v) => updateField("nasal_discharge", v)}
                          />

                          <ClinicalSelect
                            label="Nasal Blockage"
                            value={form.nasal_blockage}
                            onChange={(v) => updateField("nasal_blockage", v)}
                          />

                          <ClinicalSelect
                            label="Allergic Rhinitis"
                            value={form.allergic_rhinitis}
                            onChange={(v) =>
                              updateField("allergic_rhinitis", v)
                            }
                          />

                          <ClinicalSelect
                            label="Nasal Septum"
                            value={form.nasal_septum}
                            onChange={(v) => updateField("nasal_septum", v)}
                          />

                          <ClinicalSelect
                            label="Sinus Tenderness"
                            value={form.sinus_tenderness}
                            onChange={(v) => updateField("sinus_tenderness", v)}
                          />

                          <ClinicalSelect
                            label="History of Nose Bleed"
                            value={form.history_of_nose_bleed}
                            onChange={(v) =>
                              updateField("history_of_nose_bleed", v)
                            }
                          />
                        </div>

                        <div className="mt-5">
                          {/* <FieldLabel>
                            Nose & Sinus Comments
                          </FieldLabel> */}

                          <TextareaField
                            label="Nose & Sinus Comments"
                            value={form.nose_sinus_comments}
                            onChange={(e) =>
                              updateField("nose_sinus_comments", e.target.value)
                            }
                            placeholder="Enter nose and sinus findings..."
                            rows={4}
                          />
                        </div>
                      </SectionCard>
                    </FramerCard>
                  </div>

                  {/* =================================================
                      STEP 2 — EAR
                  ================================================= */}

                  <div className="space-y-4">
                    <EarExamination form={form} updateField={updateField} />
                  </div>

                  {/* =================================================
                      STEP 3 — RISK
                  ================================================= */}

                  <div className="space-y-4">
                    <RiskAssessment form={form} updateField={updateField} />
                  </div>

                  {/* =================================================
                      STEP 4 — HEAD / NECK / SPEECH
                  ================================================= */}

                  <div className="space-y-4">
                    <HeadNeckSpeech form={form} updateField={updateField} />
                  </div>

                  {/* =================================================
                      STEP 5 — THROAT
                  ================================================= */}

                  <div className="space-y-4">
                    <FramerCard>
                      <SectionCard
                        icon={Stethoscope}
                        title="Throat & Oropharynx"
                        description="Oropharynx, tonsils, pharyngeal wall and voice assessment"
                        tone="orange"
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <ClinicalSelect
                            label="Oropharynx"
                            value={form.oropharynx}
                            onChange={(v) => updateField("oropharynx", v)}
                          />

                          <ClinicalSelect
                            label="Tonsils"
                            value={form.tonsils}
                            onChange={(v) => updateField("tonsils", v)}
                          />

                          <ClinicalSelect
                            label="Tonsillar Enlargement"
                            value={form.tonsillar_enlargement}
                            onChange={(v) =>
                              updateField("tonsillar_enlargement", v)
                            }
                          />

                          <ClinicalSelect
                            label="Pharyngeal Wall"
                            value={form.pharyngeal_wall}
                            onChange={(v) => updateField("pharyngeal_wall", v)}
                          />

                          <ClinicalSelect
                            label="Redness / Congestion"
                            value={form.redness_congestion}
                            onChange={(v) =>
                              updateField("redness_congestion", v)
                            }
                          />

                          <ClinicalSelect
                            label="Exudates / Pus"
                            value={form.exudates_pus}
                            onChange={(v) => updateField("exudates_pus", v)}
                          />

                          <ClinicalSelect
                            label="Voice Quality"
                            value={form.voice_quality}
                            onChange={(v) => updateField("voice_quality", v)}
                          />
                        </div>

                        <div className="mt-5">
                          <TextareaField
                            label="Throat Comments"
                            value={form.throat_comments}
                            onChange={(e) =>
                              updateField("throat_comments", e.target.value)
                            }
                            placeholder="Enter throat examination findings..."
                            rows={4}
                          />
                        </div>
                      </SectionCard>
                    </FramerCard>
                  </div>

                  {/* =================================================
                      STEP 6 — RESPIRATORY / SLEEP
                  ================================================= */}

                  <div className="space-y-4">
                    <FramerCard>
                      <SectionCard
                        icon={Moon}
                        title="Respiratory & Sleep"
                        description="Sleep-related breathing and respiratory symptoms"
                        tone="cyan"
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <ClinicalSelect
                            label="Snoring"
                            value={form.snoring}
                            onChange={(v) => updateField("snoring", v)}
                          />

                          <ClinicalSelect
                            label="Mouth Breathing"
                            value={form.mouth_breathing}
                            onChange={(v) => updateField("mouth_breathing", v)}
                          />

                          <ClinicalSelect
                            label="Sleep Disturbance"
                            value={form.sleep_disturbance}
                            onChange={(v) =>
                              updateField("sleep_disturbance", v)
                            }
                          />

                          <ClinicalSelect
                            label="Daytime Sleepiness"
                            value={form.daytime_sleepiness}
                            onChange={(v) =>
                              updateField("daytime_sleepiness", v)
                            }
                          />

                          <ClinicalSelect
                            label="Chronic Cough"
                            value={form.chronic_cough}
                            onChange={(v) => updateField("chronic_cough", v)}
                          />
                        </div>

                        <div className="mt-5">
                          <TextareaField
                            label="Respiratory / Sleep Comments"
                            value={form.respiratory_sleep_comments}
                            onChange={(e) =>
                              updateField(
                                "respiratory_sleep_comments",
                                e.target.value,
                              )
                            }
                            placeholder="Enter respiratory and sleep findings..."
                            rows={4}
                          />
                        </div>
                      </SectionCard>
                    </FramerCard>
                  </div>

                  {/* =================================================
                      STEP 7 — CLINICAL ASSESSMENT
                  ================================================= */}

                  <div className="space-y-4">
                    <FramerCard>
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
                              onChange={(v) => updateField("severity", v)}
                            />

                            <ClinicalSelect
                              label="Risk Level"
                              value={form.risk_level}
                              onChange={(v) => updateField("risk_level", v)}
                            />

                            <ClinicalSelect
                              label="ENT Grade"
                              value={form.ent_grade}
                              onChange={(v) => updateField("ent_grade", v)}
                            />
                          </div>

                          <div className="mt-5">
                            <TextareaField
                              label="Summary Remarks"
                              value={form.summary_remarks}
                              onChange={(e) =>
                                updateField("summary_remarks", e.target.value)
                              }
                              placeholder="Enter overall ENT assessment..."
                              rows={5}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </FramerCard>
                  </div>

                  {/* =================================================
                      STEP 8 — REFERRAL
                  ================================================= */}

                  <div className="space-y-4">
                    <FramerCard>
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
                          <div className="grid gap-3 sm:grid-cols-1">
                            <BooleanCard
                              label="Referral Required"
                              description="Student requires specialist referral"
                              checked={form.referral_required}
                              onChange={(v) =>
                                updateField("referral_required", v)
                              }
                            />

                            <BooleanCard
                              label="Follow-up Recommended"
                              description="Further review is recommended"
                              checked={form.follow_up_recommended}
                              onChange={(v) =>
                                updateField("follow_up_recommended", v)
                              }
                            />
                          </div>

                          <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <ClinicalSelect
                              label="Priority"
                              value={form.priority}
                              onChange={(v) => updateField("priority", v)}
                            />

                            <Field
                              label="Recommend To"
                              value={form.recommend_to}
                              onChange={(e) =>
                                updateField("recommend_to", e.target.value)
                              }
                              placeholder="ENT specialist / Hospital"
                            />

                            <Field
                              label="Next Review Date"
                              type="date"
                              value={form.next_review_date}
                              onChange={(e) =>
                                updateField("next_review_date", e.target.value)
                              }
                            />

                            <div className="md:col-span-2">
                              {/* <FieldLabel>
                               
                              </FieldLabel> */}

                              <TextareaField
                                label=" Referral Reason"
                                value={form.reason}
                                onChange={(e) =>
                                  updateField("reason", e.target.value)
                                }
                                placeholder="Explain why referral is recommended..."
                                rows={4}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </FramerCard>
                  </div>
                </ScreeningStepper>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-6">
            <EmptyState
              title="No Student Data"
              description="Select a school, class and student above to view and edit ENT screening details."
            />
          </div>
        )}
      </div>
    </form>
  );
}

/* ============================================================
   FIELD LABEL
============================================================ */

export function FieldLabel({ children }) {
  return (
    <label className="text-xs font-medium text-muted-foreground">
      {children}
    </label>
  );
}
