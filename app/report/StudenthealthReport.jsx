
"use client";

import {
  Activity,
  Baby,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CircleDot,
  Cross,
  Download,
  Ear,
  Eye,
  FileText,
  HeartPulse,
  Loader2,
  Printer,
  Search,
  ShieldCheck,
  Syringe,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// import { useState } from "react";
import { fadeUp, FramerCard } from "@/util/FramerCard";
import StudentFilter from "../health-checks/utilities/studentFilter";
import useStudentFilter from "../report/utilities/useStudentFilter";
import { useMemo, useRef, useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { EmptyState } from "@/components/ui/empty-state";
import { selectAuthUser } from "@/lib/features/auth-slice";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { toast } from "sonner";

/* =========================================================
   COMPLETE STUDENT HEALTH PROFILE DATA
========================================================= */

const HEALTH_PROFILE_TEMPLATE = {
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

export default function StudenthealthReport() {
  // PDF export — ref points at the report body, html2canvas-pro captures it
  // and jsPDF paginates the render into a downloadable A4 document.
  const reportRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const {
    filterProps,
    selectedStudent,
    selectedCamp,
    schoolName,
    students,
    campStudentMap,
    assignedEvents,
  } = useStudentFilter();

  const authUser = useAppSelector(selectAuthUser);
  console.log(selectedStudent, "selectedStudent");

  // Real identity from the selected student //.
  const healthProfile = useMemo(() => {
    if (!selectedStudent) return HEALTH_PROFILE_TEMPLATE;
    const s = selectedStudent;

    // The filter's selected school + the camp linked to it via assigned
    // events (same live resolution the general-screening AssessmentCard
    // uses). Prefer these over the student row — /students/filter rows often
    // don't carry school/camp names, and there must be NO mock fallback.
    const filterSchool =
      selectedCamp?.schoolName && selectedCamp.schoolName !== "all"
        ? selectedCamp.schoolName
        : schoolName && schoolName !== "all"
          ? schoolName
          : "";
    const filterCamp =
      selectedCamp?.name && selectedCamp.name !== "all"
        ? selectedCamp.name
        : "";

    // Report-only fallback: unlike general screening (where students come
    // from a per-camp roster, so a camp is always in context), here a
    // student can be picked while the school filter is still "all". Match
    // the student's own camp_id against the assigned events so camp/school
    // still resolve.
    const studentCampId = String(
      s.camp_id ?? s.campId ?? s.event_id ?? s.eventId ?? "",
    ).trim();
    const studentCampEvent =
      studentCampId && Array.isArray(assignedEvents)
        ? assignedEvents.find(
            (event) => String(event?.id ?? "") === studentCampId,
          )
        : null;
    const studentCampName = String(studentCampEvent?.name ?? "").trim();
    const studentCampSchool = String(
      studentCampEvent?.school?.school_name ??
        studentCampEvent?.school?.name ??
        studentCampEvent?.school_name ??
        studentCampEvent?.schoolName ??
        "",
    ).trim();

    // Final fallback: look the student up in the assigned camps' rosters
    // (campStudentMap). Covers students picked while the school filter is
    // still "all" and non-doctor users who can't open the School select.
    const studentLookupKeys = [
      s.id,
      s.studentId,
      s.student_id,
      s.cus_id,
      s.school_registration_number,
      s.admission_number,
    ]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean);
    let rosterCamp = null;
    for (const key of studentLookupKeys) {
      if (campStudentMap?.[key]) {
        rosterCamp = campStudentMap[key];
        break;
      }
    }
    const rosterCampName = String(rosterCamp?.campName ?? "").trim();
    const rosterCampSchool = String(rosterCamp?.schoolName ?? "").trim();

    const resolvedSchool =
      filterSchool ||
      studentCampSchool ||
      rosterCampSchool ||
      s.school_name ||
      s.schoolName ||
      s.school ||
      "--";
    const resolvedCamp =
      filterCamp ||
      studentCampName ||
      rosterCampName ||
      s.camp_name ||
      s.campName ||
      s.camp ||
      "--";

    return {
      ...HEALTH_PROFILE_TEMPLATE,
      // Assessment details (Camp + Location) resolve live from the filter,
      // exactly like the general-screening AssessmentCard.
      assessment: {
        ...HEALTH_PROFILE_TEMPLATE.assessment,
        location: resolvedSchool,
        camp: resolvedCamp,
      },
      student: {
        ...HEALTH_PROFILE_TEMPLATE.student,
        name: s.name ?? s.student_name ?? HEALTH_PROFILE_TEMPLATE.student.name,
        id:
          s.school_registration_number ??
          s.admission_number ??
          s.cus_id ??
          s.id ??
          HEALTH_PROFILE_TEMPLATE.student.id,
        class:
          s.Class ??
          s.class ??
          s.grade ??
          HEALTH_PROFILE_TEMPLATE.student.class,
        school: resolvedSchool,
        campName: resolvedCamp,
        dateOfBirth:
          s.dob ??
          s.date_of_birth ??
          HEALTH_PROFILE_TEMPLATE.student.dateOfBirth,
        age: s.age ?? HEALTH_PROFILE_TEMPLATE.student.age,
        gender: s.gender ?? s.Gender ?? HEALTH_PROFILE_TEMPLATE.student.gender,
        bloodGroup:
          s.blood_group ??
          s.bloodGroup ??
          HEALTH_PROFILE_TEMPLATE.student.bloodGroup,
      },
    };
  }, [selectedStudent, schoolName, selectedCamp, assignedEvents]);

  // ADDITION: numeric scores per system, derived from the same status
  // strings already in healthProfile — feeds the new radar chart below.
  // Purely additive; doesn't change healthProfile or anything upstream.
  const radarValues = useMemo(
    () => ({
      growth: statusToScore(healthProfile.vitals.bmi.status),
      vision: statusToScore(healthProfile.vision.status),
      hearing: statusToScore(healthProfile.hearing.status),
      dental: statusToScore(healthProfile.dental.status),
      ent: statusToScore(healthProfile.ent.status),
      immunization: statusToScore(healthProfile.immunization.status),
    }),
    [healthProfile],
  );

  // Export the rendered report as a paginated A4 PDF.
  //
  // Robustness (why section-by-section):
  // 1. Each top-level section is captured on its own — if a section trips
  //    html2canvas (e.g. an SVG-heavy block), it is skipped with a warning
  //    instead of failing the whole export.
  // 2. SVG colors in the app are Tailwind classes (fill-primary,
  //    stroke-border…). A serialized SVG loses the page stylesheet, so the
  //    computed fill/stroke/color are stamped onto the clone — otherwise the
  //    radar chart, gauge and icons render unstyled in the PDF.
  const handleDownloadPdf = async () => {
    const node = reportRef.current;
    if (!node || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      // Paint the page behind the transparent report body so the PDF has no
      // transparent gaps — body already carries the theme's bg-background.
      const nodeBg = window.getComputedStyle(node).backgroundColor;
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const backgroundColor =
        nodeBg && nodeBg !== "rgba(0, 0, 0, 0)" ? nodeBg : bodyBg || "#ffffff";

      const sections = Array.from(node.children);
      const captured = [];
      const skipped = [];

      for (let index = 0; index < sections.length; index += 1) {
        const section = sections[index];
        try {
          const canvas = await html2canvas(section, {
            scale: 2,
            useCORS: true,
            backgroundColor,
            logging: false,
            onclone: (clonedDoc, clonedSection) => {
              if (!clonedSection) return;
              const originals = section.querySelectorAll("svg, svg *");
              const clones = clonedSection.querySelectorAll("svg, svg *");
              clones.forEach((cloneEl, svgIndex) => {
                const originalEl = originals[svgIndex];
                if (!originalEl) return;
                const computed = window.getComputedStyle(originalEl);
                // Resolved token colors as concrete attributes — these survive
                // SVG serialization, class-based fills do not.
                cloneEl.setAttribute("fill", computed.fill);
                cloneEl.setAttribute("stroke", computed.stroke);
                cloneEl.setAttribute("color", computed.color);
              });
            },
          });
          captured.push({
            imgData: canvas.toDataURL("image/png"),
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
          });
        } catch (sectionError) {
          console.error(
            `PDF export: section ${index + 1} failed — skipped`,
            sectionError
          );
          skipped.push(index + 1);
        }
      }

      if (captured.length === 0) {
        throw new Error("No report sections could be rendered");
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const gap = 4;

      let pageStarted = false;
      let cursorY = margin;
      const startPage = () => {
        if (pageStarted) pdf.addPage();
        pageStarted = true;
        cursorY = margin;
      };

      for (const { imgData, canvasWidth, canvasHeight } of captured) {
        const imageHeight = (canvasHeight * contentWidth) / canvasWidth;
        if (imageHeight <= contentHeight) {
          // Section fits on a single page — flow it, breaking first if needed.
          if (!pageStarted || cursorY + imageHeight > pageHeight - margin) {
            startPage();
          }
          pdf.addImage(imgData, "PNG", margin, cursorY, contentWidth, imageHeight);
          cursorY += imageHeight + gap;
        } else {
          // Section taller than one page — slice it across pages.
          let rendered = 0;
          while (rendered < imageHeight) {
            startPage();
            pdf.addImage(imgData, "PNG", margin, margin - rendered, contentWidth, imageHeight);
            rendered += contentHeight;
          }
          cursorY = margin;
        }
      }

      const studentName = healthProfile?.student?.name || "student";
      pdf.save(
        `health-report-${studentName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`
      );

      if (skipped.length > 0) {
        toast.warning(
          `Report downloaded, but ${skipped.length} section(s) could not be rendered`
        );
      } else {
        toast.success("Report downloaded");
      }
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 py-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary aspect-square">
              <Cross className="size-6" />
            </div>

            <div>
              {/* <h1 className="text-2xl font-semibold tracking-tight">
              Report
              </h1>

              <p className="text-sm text-muted-foreground">
                General health screening and assessment
              </p> */}
              <div>
                <h1 className="font-sf text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  Health Check Overview
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                  Comprehensive student health assessment · 17 Aug 2026
                </p>
              </div>

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
          {/* <CampStudentSelectorDrawer
            open={isCaDrawerOpen}
            onOpenChange={setIsCaDrawerOpen}
            studentsLoading={studentsLoading}
            studentsError={studentsError}
            campsLoading={getData.campsLoading}
            campsQueryError={getData.campsQueryError}
            studentCampLoading={getData.studentCampLoading}
            studentCampQueryError={getData.studentCampQueryError}
            selectedCampId={selectedCampId}
            onCampChange={(value) => {
              setSelectedCampId(value);
              setAcademicYear("");
              setSelectedClassFilter("all");
              setSelectedSectionFilter("all");
              setStudentId("");
            }}
            campOptions={campOptions}
            academicYears={academicYears}
            activeAcademicYear={activeAcademicYear}
            onAcademicYearChange={(value) => {
              setAcademicYear(value);
              setSelectedClassFilter("all");
              setSelectedSectionFilter("all");
              setStudentId("");
            }}
            classOptions={classOptions}
            selectedClassFilter={selectedClassFilter}
            onClassChange={(value) => {
              setSelectedClassFilter(value);
              setSelectedSectionFilter("all");
              setStudentId("");
            }}
            sectionOptions={sectionOptions}
            selectedSectionFilter={selectedSectionFilter}
            onSectionChange={(value) => {
              setSelectedSectionFilter(value);
              setStudentId("");
            }}
            studentSelectValue={studentSelectValue}
            onStudentChange={(value) => {
              const selectedFromList = filteredStudents.find(
                (student) => String(student.id ?? student.studentId) === String(value),
              );

              if (selectedFromList) {
                const selectedKeys = getStudentKeys(selectedFromList);
                const screeningRecord = findScreeningRecordByKeys(selectedKeys);
                applyScreeningRecordToForm(screeningRecord);
              }

              setStudentId(value);
              setIsCaDrawerOpen(false);
            }}
            filteredStudents={filteredStudents}
            normalizedCampStudents={normalizedCampStudents}
          /> */}

          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf || !selectedStudent}
          >
            {isExportingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExportingPdf ? "Preparing PDF…" : "Download PDF"}
          </Button>

          <Button type="button" variant="outline">
            Save & Exit
          </Button>

          <Button type="button">
            {/* <Save className="size-4" /> */}
            Save Report
          </Button>
        </div>
      </div>
      <div className="py-5">
        <StudentFilter {...filterProps} />
      </div>
      {/* HEADER */}
      {/* <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />

                <h1 className="text-lg font-semibold text-foreground">
                  Health Check Overview
                </h1>
              </div>

              <p className="text-xs text-muted-foreground">
                Complete student health assessment
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <Button
              variant="outline"
              className="border-border bg-card text-muted-foreground"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>

            <Button className="bg-primary hover:bg-primary/90">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

        </div>
      </header> */}
      {selectedStudent ? (
        <main ref={reportRef} className="space-y-5">
          {/* STUDENT PROFILE */}
          <FramerCard asCard className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                    <UserRound className="h-8 w-8 text-primary" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-foreground">
                        {healthProfile.student.name}
                      </h2>

                      <Badge className="bg-success/10 text-success">
                        {healthProfile.overall.status}
                      </Badge>
                    </div>

                    <div className="my-2 flex items-start gap-2 ">
                      <CircleDot
                        size={15}
                        className="bg-success/10 text-success"
                      />
                      {/* <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> */}
                      <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-success">
                        Assessment Complete
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {healthProfile.student.id} • Class{" "}
                      {healthProfile.student.class}
                    </p>

                    {healthProfile.student.school ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          School:
                        </span>{" "}
                        {healthProfile.student.school}
                        {healthProfile.student.campName &&
                          healthProfile.student.campName !== "--" && (
                            <>
                              {" "}
                              •{" "}
                              <span className="font-medium text-foreground">
                                Camp:
                              </span>{" "}
                              {healthProfile.student.campName}
                            </>
                          )}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>DOB: {healthProfile.student.dateOfBirth}</span>

                      <span>Age: {healthProfile.student.age}</span>

                      <span>Gender: {healthProfile.student.gender}</span>

                      <span>
                        Blood Group: {healthProfile.student.bloodGroup}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SCORE — ADDITION: HealthScoreRing added alongside the
                    existing text block, nothing original removed */}
                <div className="flex items-center gap-4 rounded-xl border border-success/20 bg-success/5 px-6 py-4">
                  <HealthScoreRing score={healthProfile.overall.score} />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Health Score
                    </p>

                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-success">
                        {healthProfile.overall.score}
                      </span>

                      <span className="pb-1 text-sm text-muted-foreground">
                        /100
                      </span>
                    </div>

                    <p className="text-xs text-success">
                      {healthProfile.overall.summary}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </FramerCard>

          {/* ASSESSMENT DETAILS */}
          <FramerCard asCard className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-foreground">
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
                  label="Camp"
                  value={healthProfile.assessment.camp || "--"}
                />

                <Result
                  label="Location"
                  value={healthProfile.assessment.location || "--"}
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
          </FramerCard>

          {/* VITALS */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={Activity}
              label="Height"
              value={healthProfile.vitals.height.value}
              status={healthProfile.vitals.height.status}
              color="blue"
            />

            <StatCard
              icon={HeartPulse}
              label="Weight"
              value={healthProfile.vitals.weight.value}
              status={healthProfile.vitals.weight.status}
              color="green"
            />

            <StatCard
              icon={Baby}
              label="BMI"
              value={healthProfile.vitals.bmi.value}
              status={healthProfile.vitals.bmi.status}
              color="purple"
            />

            <StatCard
              icon={ShieldCheck}
              label="Immunization"
              value={healthProfile.immunization.status}
              status="Complete"
              color="cyan"
            />
          </section>

          {/* MORE VITALS */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={HeartPulse}
              label="Blood Pressure"
              value={healthProfile.vitals.bloodPressure.value}
              status={healthProfile.vitals.bloodPressure.status}
              color="red"
            />

            <StatCard
              icon={Activity}
              label="Pulse"
              value={healthProfile.vitals.pulse.value}
              status={healthProfile.vitals.pulse.status}
              color="blue"
            />

            <StatCard
              icon={Activity}
              label="Temperature"
              value={healthProfile.vitals.temperature.value}
              status={healthProfile.vitals.temperature.status}
              color="orange"
            />

            <StatCard
              icon={ShieldCheck}
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
              <FramerCard asCard className="border-border bg-card">
                <CardHeader>
                  <SectionTitle
                    icon={Activity}
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

                  <div className="rounded-xl border border-border bg-muted/40 p-5">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Body Mass Index
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Calculated from height and weight
                        </p>
                      </div>

                      <Badge className="bg-success/10 text-success">
                        Normal
                      </Badge>
                    </div>

                    {/* ADDITION: BmiMiniGauge added alongside the existing
                        number block — the original centered number stays
                        exactly as it was */}
                    <div className="flex flex-col items-center gap-2 py-6 sm:flex-row sm:justify-center sm:gap-8">
                      <BmiMiniGauge bmi={healthProfile.vitals.bmi.value} />
                      <div className="text-center">
                        <p className="text-5xl font-bold text-foreground">
                          {healthProfile.vitals.bmi.value}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                          BMI • {healthProfile.vitals.bmi.percentile}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </FramerCard>

              {/* VISION */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader>
                  <SectionTitle
                    icon={Eye}
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

                  <div className="grid gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-3">
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
              </FramerCard>

              {/* HEARING */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader>
                  <SectionTitle
                    icon={Ear}
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
                      description={healthProfile.hearing.rightEar.findings}
                    />

                    <ScreeningResult
                      title="Left Ear"
                      value={healthProfile.hearing.leftEar.status}
                      description={healthProfile.hearing.leftEar.findings}
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

                      <p className="mt-4 text-xs text-muted-foreground">
                        Distance: {healthProfile.hearing.whisperTest.distance}
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
              </FramerCard>

              {/* DENTAL */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader>
                  <SectionTitle
                    icon={HeartPulse}
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

                  <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
                    <p className="text-xs text-muted-foreground">
                      Current Tooth
                    </p>

                    <h3 className="mt-1 font-semibold text-foreground">
                      Tooth {healthProfile.dental.currentTooth.number}{" "}
                      <span className="font-normal text-muted-foreground">
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
              </FramerCard>

              {/* ENT */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader>
                  <SectionTitle
                    icon={Activity}
                    title="ENT Screening"
                    subtitle="Ear, nose and throat assessment"
                    badge={healthProfile.ent.status}
                  />
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Result label="Nose" value={healthProfile.ent.nose} />

                    <Result label="Throat" value={healthProfile.ent.throat} />

                    <Result label="Tonsils" value={healthProfile.ent.tonsils} />

                    <Result
                      label="Lymph Nodes"
                      value={healthProfile.ent.lymphNodes}
                    />
                  </div>

                  <Note text={healthProfile.ent.remarks} />
                </CardContent>
              </FramerCard>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="space-y-5">
              {/* BLOOD GROUP */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">
                    Blood Group
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 text-xl font-bold text-destructive">
                      {healthProfile.student.bloodGroup}
                    </div>

                    <div>
                      <p className="font-medium text-foreground">
                        {healthProfile.student.bloodGroup}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Blood group recorded
                      </p>
                    </div>
                  </div>
                </CardContent>
              </FramerCard>

              {/* IMMUNIZATION */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader>
                  <SectionTitle
                    icon={Syringe}
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
              </FramerCard>

              {/* HEALTH HISTORY */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">
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
              </FramerCard>

              {/* RISK FACTORS */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">
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
              </FramerCard>

              {/* REFERRAL */}
              <FramerCard asCard className="border-warning/30 bg-card">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">
                    Referral & Follow-up
                  </CardTitle>
                  <Badge className="bg-warning/10 text-warning">
                    {healthProfile.referral.priority}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  

                  <Result label="Type" value={healthProfile.referral.type} />

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
              </FramerCard>

              {/* NOTES */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">
                    Clinical Notes
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                    {healthProfile.clinicalNotes}
                  </p>
                </CardContent>
              </FramerCard>
            </aside>
          </div>

          {/* FINAL ASSESSMENT */}
          <FramerCard asCard className="border-border bg-card">
            <CardHeader>
              <SectionTitle
                icon={CheckCircle2}
                title="Overall Assessment"
                subtitle="Summary of complete health screening"
                badge="Healthy"
              />
            </CardHeader>

            <CardContent>
              {/* ADDITION: radar chart summarizing all six systems at a
                  glance, placed above the existing grid — the grid below
                  is completely unchanged */}
              <div className="mb-6 flex justify-center">
                <SystemsRadarChart values={radarValues} />
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                <OverallItem title="Growth" value="Normal" />
                <OverallItem title="Vision" value="Normal" />
                <OverallItem title="Hearing" value="Normal" />
                <OverallItem title="Dental" value="Good" />
                <OverallItem title="ENT" value="Normal" />
                <OverallItem title="Immunization" value="Up to date" />
              </div>

              <Separator className="my-5 bg-muted" />

              <h3 className="text-sm font-semibold text-foreground">
                Recommendations
              </h3>

              <ul className="mt-3 grid gap-3 md:grid-cols-2">
                {healthProfile.recommendations.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex justify-between border-t border-border pt-5">
                <div>
                  <p className="text-xs text-muted-foreground">Examined by</p>

                  <p className="mt-1 font-medium text-foreground">
                    {healthProfile.assessment.examiner}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {healthProfile.assessment.designation}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-serif text-2xl italic text-primary">
                    Priya Sharma
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {healthProfile.assessment.date}
                  </p>
                </div>
              </div>
            </CardContent>
          </FramerCard>
        </main>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-6">
          <EmptyState
            title="No Report Data"
            description="Select a Student to get the Report"
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCaDrawerOpen(true)}
              >
                <Search className="size-4" />
                Select Student
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function StatCard({ icon: Icon, label, value, status, color }) {
  const styles = {
    blue: "bg-primary/10 text-primary",
    green: "bg-success/10 text-success",
    purple: "bg-primary/10 text-primary",
    cyan: "bg-info/10 text-info",
    red: "bg-destructive/10 text-destructive",
    orange: "bg-warning/10 text-warning",
  };

  return (
    <FramerCard asCard className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles[color]}`}
          >
            {Icon ? <Icon className="size-5" /> : null}
          </div>

          <span className="text-xs text-success">{status}</span>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{label}</p>

        <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </FramerCard>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, badge }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {Icon ? <Icon className="size-5" /> : null}
        </div>

        <div>
          <CardTitle className="text-base text-foreground">{title}</CardTitle>

          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {badge && <Badge className="bg-success/10 text-success">{badge}</Badge>}
    </div>
  );
}

function Measurement({ title, value, unit, standard }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-xs text-muted-foreground">{title}</p>

      <p className="mt-2 text-2xl font-semibold text-foreground">
        {value} <span className="text-sm text-muted-foreground">{unit}</span>
      </p>

      <div className="mt-4 flex justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">Standard</span>

        <span className="text-xs text-success">{standard}</span>
      </div>
    </div>
  );
}

function VisionCard({ eye, acuity, corrected }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {/* ADDITION: small colored eye status badge, classified from the
              acuity value — text content below is completely unchanged */}
          <EyeStatusBadge acuity={acuity} />
          <p className="text-sm font-medium text-foreground">{eye}</p>
        </div>

        <Badge className="bg-success/10 text-success">Normal</Badge>
      </div>

      <div className="mt-5 flex justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Visual Acuity</p>

          <p className="text-3xl font-bold text-foreground">{acuity}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">Corrected</p>

          <p className="text-sm text-muted-foreground">{corrected}</p>
        </div>
      </div>
    </div>
  );
}

function ScreeningResult({ title, value, description }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>

        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <Badge className="bg-success/10 text-success">{value}</Badge>
    </div>
  );
}

function Result({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="mb-4 text-sm font-semibold text-foreground">{title}</p>

      {children}
    </div>
  );
}

function Note({ text }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs text-muted-foreground">Remarks</p>

      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function StatusLine({ label, value }) {
  return (
    <div className="flex justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>

      <span className="text-xs text-success">{value}</span>
    </div>
  );
}

function HistoryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      <div className="mt-1 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function SummaryValue({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function OverallItem({ title, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>

        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>

      <CheckCircle2 className="h-5 w-5 text-success" />
    </div>
  );
}

/* =========================================================
   NEW: SVG VISUALIZATION COMPONENTS
   All additive — nothing above this line was removed to make room
   for these; they're purely new components wired in at four spots.
========================================================= */

// Maps a status word to a 0-100 score, used only for the radar chart's
// visual scale — doesn't touch or replace the original status strings
// anywhere else in the report.
function statusToScore(status) {
  const s = (status ?? "").toString().toLowerCase();
  if (
    [
      "normal",
      "good",
      "up to date",
      "healthy",
      "complete",
      "completed",
    ].includes(s)
  )
    return 100;
  if (["mild", "fair"].includes(s)) return 75;
  if (["moderate"].includes(s)) return 55;
  if (!s) return 40;
  return 35;
}

// Circular progress ring for the overall health score (0–100).
function HealthScoreRing({ score, size = 96 }) {
  const clamped = Math.min(Math.max(Number(score) || 0, 0), 100);
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);

  const tone =
    clamped >= 80 ? "success" : clamped >= 50 ? "warning" : "destructive";
  const strokeClass = {
    success: "stroke-success",
    warning: "stroke-warning",
    destructive: "stroke-destructive",
  }[tone];
  const fillClass = {
    success: "fill-success",
    warning: "fill-warning",
    destructive: "fill-destructive",
  }[tone];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-muted"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className={strokeClass}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        dominantBaseline="middle"
        className={`${fillClass} font-bold`}
        style={{ fontSize: size * 0.26 }}
      >
        {clamped}
      </text>
      <text
        x="50%"
        y="68%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground"
        style={{ fontSize: size * 0.1 }}
      >
        / 100
      </text>
    </svg>
  );
}

// Semicircle BMI gauge — value range 10–35, colored by clinical band.
function BmiMiniGauge({ bmi, size = 150 }) {
  const value = parseFloat(bmi);
  const min = 10;
  const max = 35;
  const hasValue = !Number.isNaN(value);
  const clamped = hasValue ? Math.min(Math.max(value, min), max) : min;
  const angle = ((clamped - min) / (max - min)) * 180;

  const cx = size / 2;
  const cy = size * 0.6;
  const r = size * 0.42;
  const strokeWidth = size * 0.07;

  function polarToCartesian(a) {
    const rad = ((a - 180) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const start = polarToCartesian(0);
  const end = polarToCartesian(180);
  const needleTip = polarToCartesian(angle);

  const tone = !hasValue
    ? "muted"
    : value < 18.5
      ? "info"
      : value < 25
        ? "success"
        : value < 30
          ? "warning"
          : "destructive";
  const toneStroke = {
    muted: "stroke-muted-foreground",
    info: "stroke-info",
    success: "stroke-success",
    warning: "stroke-warning",
    destructive: "stroke-destructive",
  }[tone];
  const toneFill = {
    muted: "fill-muted-foreground",
    info: "fill-info",
    success: "fill-success",
    warning: "fill-warning",
    destructive: "fill-destructive",
  }[tone];

  return (
    <svg
      width={size}
      height={size * 0.65}
      viewBox={`0 0 ${size} ${size * 0.65}`}
      className="shrink-0"
    >
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
        fill="none"
        className="stroke-muted"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {hasValue && (
        <>
          <line
            x1={cx}
            y1={cy}
            x2={needleTip.x}
            y2={needleTip.y}
            className={toneStroke}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={4} className={toneFill} />
        </>
      )}
    </svg>
  );
}

// Six-axis radar chart summarizing Growth / Vision / Hearing / Dental /
// ENT / Immunization at a glance.
const RADAR_AXES = [
  { key: "growth", label: "Growth" },
  { key: "vision", label: "Vision" },
  { key: "hearing", label: "Hearing" },
  { key: "dental", label: "Dental" },
  { key: "ent", label: "ENT" },
  { key: "immunization", label: "Immun." },
];

function SystemsRadarChart({ values, size = 260 }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 34;
  const n = RADAR_AXES.length;
  const angleStep = (Math.PI * 2) / n;

  function pointAt(index, fraction) {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = fraction * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const ringLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = RADAR_AXES.map((axis, i) =>
    pointAt(i, (values[axis.key] ?? 0) / 100),
  );
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {ringLevels.map((level) => {
        const ringPoints = RADAR_AXES.map((_, i) => {
          const p = pointAt(i, level);
          return `${p.x},${p.y}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={ringPoints}
            fill="none"
            className="stroke-border"
            strokeWidth={1}
          />
        );
      })}

      {RADAR_AXES.map((axis, i) => {
        const edge = pointAt(i, 1);
        return (
          <line
            key={axis.key}
            x1={cx}
            y1={cy}
            x2={edge.x}
            y2={edge.y}
            className="stroke-border"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={polygonPoints}
        className="fill-primary/15 stroke-primary"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle
          key={RADAR_AXES[i].key}
          cx={p.x}
          cy={p.y}
          r={3.5}
          className="fill-primary"
        />
      ))}

      {RADAR_AXES.map((axis, i) => {
        const label = pointAt(i, 1.18);
        return (
          <text
            key={axis.key}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 11, fontWeight: 500 }}
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}

// Small colored eye glyph, classified from a Snellen-style acuity string
// (e.g. "6/6", "6/18") — purely decorative, sits next to the eye label.
function EyeStatusBadge({ acuity, size = 26 }) {
  const match = /^6\/(\d+)/.exec((acuity ?? "").trim());
  const ratio = match ? Number(match[1]) / 6 : null;
  const tone =
    ratio == null
      ? "muted"
      : ratio <= 1.2
        ? "success"
        : ratio <= 2
          ? "info"
          : ratio <= 4
            ? "warning"
            : "destructive";
  const toneClass = {
    muted: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success",
    info: "bg-info/15 text-info",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/15 text-destructive",
  }[tone];

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${toneClass}`}
      style={{ width: size, height: size }}
    >
      <Eye
        style={{ width: size * 0.55, height: size * 0.55 }}
        strokeWidth={2.25}
      />
    </span>
  );
}