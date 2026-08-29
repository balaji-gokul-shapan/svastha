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
  Save,
  Search,
  ShieldAlert,
  Stethoscope,
  Wind,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import EarIllustration from "./EarSvg";
import EarPanel, {
  BooleanCard,
  ClinicalSelect,
  Field,
  QuickStatus,
  RiskToggle,
} from "./ent-screening-data";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import { useQuery } from "@tanstack/react-query";
import { getEntScreening } from "@/lib/features/getEntScreening";
import { createEntScreening } from "@/lib/features/registerEntScreening";
import useAssignedEvents from "@/lib/useAssignedEvents";
import useAuthUser from "@/lib/useAuthUser";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/hooks";
import StudentFilter from "../utilities/studentFilter";
import StudentProfileCard from "@/app/students/studentProfileCard";
import { EmptyState } from "@/components/ui/empty-state";
import AssessmentCard from "@/app/ui/AssessmentCard";
import { getAllMasterScreening } from "@/lib/features/masterScreeningSlice";
import { FramerCard } from "@/util/FramerCard";

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

export default function ENTScreeningPage({ screening = {}, student = {} }) {
  const dispatch = useAppDispatch();
  const [studentId, setStudentId] = React.useState("");
  const [schoolName, setSchoolName] = React.useState("all");
  const [classFilter, setClassFilter] = React.useState("all");
  const [sectionFilter, setSectionFilter] = React.useState("all");
  const [studentFilter, setStudentFilter] = React.useState("all");
  const [academicYear, setAcademicYear] = React.useState("2026-2027");

  // Assigned camps/events power the Camp Name select in StudentFilter.
  const { assignedEvents, assignEventLoading, assignEventError } =
    useAssignedEvents();

  // Auth user drives the doctor-only camp/school selects in StudentFilter.
  const { authUser } = useAuthUser();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const payload = {
      student_id: Number(rawStudentId) || 0,
      camp_id: Number(selectedStudent?.camp_id ?? selectedStudent?.campId) || 0,
      ...screening,
      ...form,
    };

    try {
      await dispatch(createEntScreening(payload)).unwrap();

      toast.success("ENT screening saved successfully", {
        description: selectedStudent?.name
          ? `Record saved for ${selectedStudent.name}`
          : undefined,
      });

      refetchEntScreening();
    } catch (error) {
      toast.error("Failed to save ENT screening", {
        description:
          error?.message ?? "Something went wrong. Please try again.",
      });
    }
  };

  const { data: filterPayload, isLoading } = useQuery({
    queryKey: ["filter-student", schoolName, academicYear, "options"],
    queryFn: () =>
      dispatch(
        getFilterStudent({
          all: true,
          status: "all",
          schoolName,
          academicYear,
          sortBy: "name",
          sortOrder: "asc",
          search: "",
        }),
      ).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const selectedStudentFromFilter = React.useMemo(() => {
    const activeId = studentFilter !== "all" ? studentFilter : studentId;
    if (activeId && Array.isArray(filterPayload?.items)) {
      return (
        filterPayload.items.find(
          (studentItem) =>
            String(
              studentItem?.id ?? studentItem?.studentId ?? studentItem?.cus_id,
            ) === String(activeId),
        ) ?? null
      );
    }
    return null;
  }, [filterPayload?.items, studentFilter, studentId]);

  const selectedStudent = React.useMemo(() => {
    if (selectedStudentFromFilter) {
      return selectedStudentFromFilter;
    }

    if (studentId && Array.isArray(filterPayload?.items)) {
      const match = filterPayload.items.find(
        (studentItem) =>
          String(
            studentItem.id ?? studentItem.studentId ?? studentItem.cus_id,
          ) === String(studentId),
      );
      if (match) return match;
    }

    return null;
  }, [filterPayload?.items, selectedStudentFromFilter, studentId]);

  const selectedStudentKey = String(
    selectedStudent?.id ?? selectedStudent?.studentId ?? "",
  );
  const studentSelectValue = selectedStudentKey || "";
  const hasSelectedStudent = Boolean(
    selectedStudent ||
    selectedStudentKey ||
    (studentFilter && studentFilter !== "all") ||
    studentId,
  );

  const handleSchoolFilterChange = React.useCallback((value) => {
    setSchoolName(value);
    setClassFilter("all");
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleAcademicYearFilterChange = React.useCallback((value) => {
    setAcademicYear(value);
    setClassFilter("all");
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleClassFilterChange = React.useCallback((value) => {
    setClassFilter(value);
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleSectionFilterChange = React.useCallback((value) => {
    setSectionFilter(value);
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleStudentFilterChange = React.useCallback((value) => {
    setStudentFilter(value);
    setStudentId(value === "all" ? "" : value);
  }, []);

  const {
    data: EntScreeningData = [],
    isLoading: EntScreeningDataLoading,
    error: EntScreeningDataQueryError,
    refetch: refetchEntScreening,
  } = useQuery({
    queryKey: ["Ent-screening", studentId],
    queryFn: () => dispatch(getEntScreening({ studentId })).unwrap(),
    enabled: Boolean(String(studentId).trim()),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  console.log(EntScreeningData, "EntScreeningData");

  const {
    data: masterScreeningData = [],
    isLoading: masterScreeningDataLoading,
    error: masterScreeningQueryError,
  } = useQuery({
    queryKey: ["Ent-screening"],
    queryFn: () => dispatch(getAllMasterScreening()).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  console.log(masterScreeningData, "EntScreeningData");

  // Keep studentFilter in sync: selectedStudentFromFilter gives
  // studentFilter precedence over studentId, so without this the
  // assessment-card selection would be ignored once a student has
  // been picked in the filter dropdown.
  const handleAssessmentStudentChange = React.useCallback((value) => {
    setStudentId(value);
    setStudentFilter(value);
  }, []);

  const assessmentStudentOptions = React.useMemo(
    () =>
      (filterPayload?.items ?? []).map((student) => {
        const value = String(
          student.id ?? student.studentId ?? student.cus_id ?? "",
        );
        const studentCode =
          student.studentId ??
          student.student_id ??
          student.school_registration_number ??
          student.admission_number;

        return {
          value,
          label: `${student.name || student.student_name || "Unknown"}${studentCode ? ` (${studentCode})` : ""}`,
        };
      }),
    [filterPayload?.items],
  );

  const getSelectedStudentScreeningData = React.useMemo(() => {
    if (!studentId || !Array.isArray(EntScreeningData)) {
      return null;
    }

    // The API endpoint is already scoped to /dental-test/student/{studentId}.
    return EntScreeningData[0] ?? null;
  }, [EntScreeningData, studentId]);
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 py-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary aspect-square">
              <Stethoscope className="size-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                ENT Screening
              </h1>

              <p className="text-sm text-muted-foreground">
                Ear, nose, throat, speech and respiratory assessment
              </p>

              {/* <p className="text-xs text-muted-foreground">
                  {studentsLoading
                    ? "Loading students..."
                    : studentsError
                      ? "Unable to load students"
                      : selectedStudent?.name
                        ? `Student: ${selectedStudent.name}`
                        : ""}
                </p> */}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            // onClick={handleCancelAssessment}
          >
            Save & Exit
          </Button>

          <Button type="button" onClick={handleSubmit}>
            <Save className="size-4" />
            Save & Next
          </Button>
        </div>
        {/* <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Stethoscope className="size-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  ENT Screening
                </h1>

                <Badge variant="secondary">Clinical Assessment</Badge>
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

            <Button type="submit">Save Screening</Button>
          </div>
        </div> */}
      </div>

      <div className="space-y-5  pb-8">
        {/* =====================================================
            STUDENT FILTER & SUMMARY
        ===================================================== */}

        <StudentFilter
          filterPayload={filterPayload}
          isLoading={isLoading}
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
        />

        {hasSelectedStudent ? (
          <>
            <StudentProfileCard student={selectedStudent} />
            {/* <FramerCard> */}
            <div className="grid gap-4 grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
              {/* =====================================================
            NOSE & SINUS
        ===================================================== */}
              <FramerCard>
                <div className="space-y-4">
                  <SectionCard
                    icon={Wind}
                    title="Nose & Sinus Examination"
                    description="Nasal airway, discharge, obstruction and sinus assessment"
                    tone="purple"
                  >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
                        onChange={(v) => updateField("allergic_rhinitis", v)}
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
                      <FieldLabel>Nose & Sinus Comments</FieldLabel>

                      <Textarea
                        value={form.nose_sinus_comments}
                        onChange={(e) =>
                          updateField("nose_sinus_comments", e.target.value)
                        }
                        placeholder="Enter nose and sinus findings..."
                        rows={4}
                      />
                    </div>
                  </SectionCard>
                  <AssessmentCard
                    // onChange={handleAssessmentChange}
                    // form={assessmentForm}
                    data={getSelectedStudentScreeningData}
                    studentOptions={assessmentStudentOptions}
                    studentValue={studentSelectValue}
                    // isScreeningLoading={studentsLoading}
                    // isScreeningError={studentsError}
                    isScreening={false}
                    schoolName={schoolName}
                    onStudentChange={handleAssessmentStudentChange}
                     authUser={authUser}
                    // onSave={handleSaveAssessment}
                    // onCancel={handleCancelAssessment}
                  />
                  {/* =====================================================
            REFERRAL
        ===================================================== */}
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

                        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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

                          <div className="md:col-span-2 lg:col-span-3">
                            <FieldLabel>Referral Reason</FieldLabel>

                            <Textarea
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
                        <FieldLabel>Summary Remarks</FieldLabel>

                        <Textarea
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
                </div>
              </FramerCard>

              
                <article className="space-y-5">
                  {/* =====================================================
            EAR EXAMINATION
        ===================================================== */}
<FramerCard>
                  <SectionCard
                    icon={Ear}
                    title="Ear Examination"
                    description="External ear, tympanic membrane and hearing assessment"
                    tone="blue"
                  >
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
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
                      <FieldLabel>Ear Comments</FieldLabel>

                      <Textarea
                        value={form.ear_comments}
                        onChange={(e) =>
                          updateField("ear_comments", e.target.value)
                        }
                        placeholder="Enter overall ear examination findings..."
                        rows={4}
                      />
                    </div>
                  </SectionCard>
</FramerCard>
                  {/* <div className="gird gird-rows-1 md:grid-rows-2 gap-4 space-y-4"> */}
                  {/* =====================================================
            RISK ASSESSMENT
        ===================================================== */}
<FramerCard>
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
                          checked={form.risk_frequent_ear_infections}
                          onChange={(v) =>
                            updateField("risk_frequent_ear_infections", v)
                          }
                        />

                        <RiskToggle
                          label="Allergic Rhinitis"
                          checked={form.risk_allergic_rhinitis}
                          onChange={(v) =>
                            updateField("risk_allergic_rhinitis", v)
                          }
                        />

                        <RiskToggle
                          label="Speech Delay"
                          checked={form.risk_speech_delay}
                          onChange={(v) => updateField("risk_speech_delay", v)}
                        />

                        <RiskToggle
                          label="Hearing Difficulty"
                          checked={form.risk_hearing_difficulty}
                          onChange={(v) =>
                            updateField("risk_hearing_difficulty", v)
                          }
                        />

                        <RiskToggle
                          label="Tonsil / Adenoid Problems"
                          checked={form.risk_tonsil_adenoid_problems}
                          onChange={(v) =>
                            updateField("risk_tonsil_adenoid_problems", v)
                          }
                        />

                        <RiskToggle
                          label="Nasal Obstruction"
                          checked={form.risk_nasal_obstruction}
                          onChange={(v) =>
                            updateField("risk_nasal_obstruction", v)
                          }
                        />

                        <RiskToggle
                          label="Chronic Cough"
                          checked={form.risk_chronic_cough}
                          onChange={(v) => updateField("risk_chronic_cough", v)}
                        />
                      </div>

                      <div className="mt-4">
                        <FieldLabel>Other Risk Factors</FieldLabel>

                        <Input
                          value={form.risk_others}
                          onChange={(e) =>
                            updateField("risk_others", e.target.value)
                          }
                          placeholder="Enter other risk factors..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                    </FramerCard>
                  {/* =====================================================
            HEAD / NECK / SPEECH
        ===================================================== */}
<FramerCard>
                  <SectionCard
                    icon={Headphones}
                    title="Head, Neck & Speech"
                    description="Lymph nodes, neck, speech and other clinical findings"
                    tone="green"
                  >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                      <ClinicalSelect
                        label="Head / Neck Lymph Nodes"
                        value={form.head_neck_lymph_nodes}
                        onChange={(v) =>
                          updateField("head_neck_lymph_nodes", v)
                        }
                      />

                      <ClinicalSelect
                        label="Neck Swelling"
                        value={form.neck_swelling}
                        onChange={(v) => updateField("neck_swelling", v)}
                      />

                      <ClinicalSelect
                        label="Speech"
                        value={form.speech}
                        onChange={(v) => updateField("speech", v)}
                      />

                      <ClinicalSelect
                        label="Speech Clarity"
                        value={form.speech_clarity}
                        onChange={(v) => updateField("speech_clarity", v)}
                      />
                    </div>

                    <div className="mt-5">
                      <FieldLabel>Other Findings</FieldLabel>

                      <Textarea
                        value={form.any_other_findings}
                        onChange={(e) =>
                          updateField("any_other_findings", e.target.value)
                        }
                        placeholder="Enter any other clinical findings..."
                        rows={4}
                      />
                    </div>
                  </SectionCard>
              </FramerCard>
                  {/* </div> */}
                </article>

              <div className="space-y-4">
                {/* =====================================================
            THROAT
        ===================================================== */}
                <FramerCard>
                  <SectionCard
                    icon={Stethoscope}
                    title="Throat & Oropharynx"
                    description="Oropharynx, tonsils, pharyngeal wall and voice assessment"
                    tone="orange"
                  >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
                        onChange={(v) => updateField("redness_congestion", v)}
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
                      <FieldLabel>Throat Comments</FieldLabel>

                      <Textarea
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

                {/* =====================================================
            RESPIRATORY / SLEEP
        ===================================================== */}
                
<FramerCard>
                <SectionCard
                  icon={Moon}
                  title="Respiratory & Sleep"
                  description="Sleep-related breathing and respiratory symptoms"
                  tone="cyan"
                >
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
                      onChange={(v) => updateField("sleep_disturbance", v)}
                    />

                    <ClinicalSelect
                      label="Daytime Sleepiness"
                      value={form.daytime_sleepiness}
                      onChange={(v) => updateField("daytime_sleepiness", v)}
                    />

                    <ClinicalSelect
                      label="Chronic Cough"
                      value={form.chronic_cough}
                      onChange={(v) => updateField("chronic_cough", v)}
                    />
                  </div>

                  <div className="mt-5">
                    <FieldLabel>Respiratory / Sleep Comments</FieldLabel>

                    <Textarea
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

              {/* =====================================================
            FOOTER
        ===================================================== */}

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" className="gap-2">
                  <RefreshCcw className="size-4" />
                  Reset
                </Button>

                <Button type="submit" className="gap-2">
                  <CheckCircle2 className="size-4" />
                  Save ENT Screening
                </Button>
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

        {/* <StudentHeader student={student} /> */}

        {/* =====================================================
            QUICK STATUS
        ===================================================== */}

        {/* <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        </div> */}
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
              {student.name || student.student_name || "Student"}
            </p>

            <p className="text-xs text-muted-foreground">
              {student.studentId ||
                student.student_id ||
                "Student ID not available"}
            </p>
          </div>

          {student.grade && (
            <Badge variant="outline" className="ml-auto">
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
            <CardTitle className="text-base">{title}</CardTitle>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="text-xs font-medium text-muted-foreground">
      {children}
    </label>
  );
}
