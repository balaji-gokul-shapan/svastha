// "use client";

// import {
//   Activity,
//   Baby,
//   CalendarDays,
//   CheckCircle2,
//   ChevronLeft,
//   CircleDot,
//   Cross,
//   Download,
//   DownloadIcon,
//   Ear,
//   Eye,
//   FileText,
//   HeartPulse,
//   Printer,
//   PrinterIcon,
//   Search,
//   ShieldCheck,
//   Syringe,
//   UserRound,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// // import { useState } from "react";
// import { fadeUp, FramerCard } from "@/util/FramerCard";
// import StudentFilter from "../health-checks/utilities/studentFilter";
// import { getFilterStudent } from "@/lib/features/getFilterStudent";
// import { useCallback, useMemo, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useAppDispatch } from "@/lib/hooks";
// import { EmptyState } from "@/components/ui/empty-state";

// /* =========================================================
//    COMPLETE STUDENT HEALTH PROFILE DATA
// ========================================================= */

// const HEALTH_PROFILE_TEMPLATE = {
//   student: {
//     name: "Arjun Kumar",
//     id: "SCH-104-001",
//     class: "5-A",
//     school: "Sunshine Public School",
//     age: 10,
//     gender: "Male",
//     dateOfBirth: "12 March 2016",
//     bloodGroup: "A+",
//   },

//   assessment: {
//     date: "17 Aug 2026",
//     examiner: "Dr. Priya Sharma",
//     designation: "Medical Officer",
//     assistant: "Riya Nair",
//     location: "Sunshine Public School",
//   },

//   overall: {
//     score: 92,
//     status: "Healthy",
//     summary: "Good overall health",
//   },

//   vitals: {
//     height: {
//       value: "145 cm",
//       status: "Normal",
//     },
//     weight: {
//       value: "38 kg",
//       status: "Normal",
//     },
//     bmi: {
//       value: "18.1",
//       status: "Normal",
//       percentile: "65th percentile",
//     },
//     bloodPressure: {
//       value: "108/68 mmHg",
//       status: "Normal",
//     },
//     pulse: {
//       value: "82 bpm",
//       status: "Normal",
//     },
//     temperature: {
//       value: "98.4 °F",
//       status: "Normal",
//     },
//     oxygen: {
//       value: "99%",
//       status: "Normal",
//     },
//   },

//   vision: {
//     status: "Normal",
//     rightEye: {
//       acuity: "6/6",
//       corrected: "6/6",
//     },
//     leftEye: {
//       acuity: "6/6",
//       corrected: "6/6",
//     },
//     colorVision: "Normal",
//     strabismus: "Absent",
//     usesCorrection: "No",
//     remarks:
//       "No abnormal visual findings detected. Visual acuity is normal in both eyes.",
//   },

//   hearing: {
//     status: "Normal",

//     rightEar: {
//       status: "Normal",
//       threshold: "≤ 20 dB",
//       findings: "No abnormality detected",
//     },

//     leftEar: {
//       status: "Normal",
//       threshold: "≤ 20 dB",
//       findings: "No abnormality detected",
//     },

//     whisperTest: {
//       right: "Pass",
//       left: "Pass",
//       distance: "2 feet",
//     },

//     speech: {
//       right: "100%",
//       left: "100%",
//       srtRight: "10 dB",
//       srtLeft: "10 dB",
//     },

//     tympanometry: {
//       right: "Type A",
//       left: "Type A",
//     },

//     remarks: "Hearing within normal range in both ears.",
//   },

//   dental: {
//     status: "Good",
//     oralHygiene: "Good",
//     gingivalHealth: "Healthy",
//     plaque: "Mild",
//     caries: 2,
//     otherIssues: 1,
//     healthyTeeth: 25,
//     missingTeeth: 0,

//     currentTooth: {
//       number: 16,
//       name: "Upper Right First Molar",
//       status: "Caries",
//       surface: "Occlusal",
//       severity: "Moderate",
//       treatment: "Restoration",
//     },

//     referral: {
//       action: "Routine dental follow-up",
//       reason: "Minor dental caries",
//       followUp: "6 months",
//     },

//     instructions: "Brush twice daily and floss regularly.",
//     notes: "Overall good oral health",
//   },

//   ent: {
//     status: "Normal",
//     nose: "Normal",
//     throat: "Normal",
//     tonsils: "Normal",
//     lymphNodes: "No abnormality",
//     remarks: "No significant ENT findings.",
//   },

//   immunization: {
//     status: "Up to date",
//     vaccines: "Completed",
//     nextReview: "As scheduled",
//   },

//   history: {
//     allergies: "None",
//     chronicDisease: "None",
//     previousCondition: "None reported",
//     surgeries: "None",
//     medications: "None",
//     familyHistory: "No significant history",
//   },

//   riskFactors: {
//     earInfections: "No",
//     speechDelay: "No",
//     learningDifficulty: "No",
//     familyHistory: "No",
//     noiseExposure: "No",
//     otherRisks: "None",
//   },

//   referral: {
//     required: true,
//     type: "Dental",
//     priority: "Routine",
//     referredTo: "Dental Clinic",
//     reason: "Minor dental caries",
//     followUp: "6 months",
//   },

//   recommendations: [
//     "Maintain a balanced diet and regular physical activity.",
//     "Continue regular oral hygiene practices.",
//     "Continue routine annual health screening.",
//     "Keep immunizations up to date.",
//     "Follow up with a dentist within 6 months.",
//   ],

//   clinicalNotes:
//     "Student is generally healthy. Growth parameters are within the expected range. Vision and hearing screenings show no significant concerns. Mild dental findings noted and routine dental follow-up is recommended.",
// };

// /* =========================================================
//    MAIN PAGE
// ========================================================= */

// export default function HealthOverviewReport() {
//   const dispatch = useAppDispatch();
//   const [academicYear, setAcademicYear] = useState("2026-2027");
//   const [schoolName, setSchoolName] = useState("all");
//   const [classFilter, setClassFilter] = useState("all");
//   const [sectionFilter, setSectionFilter] = useState("all");
//   const [studentFilter, setStudentFilter] = useState("all");
//   const [studentId, setStudentId] = useState("");

//   const resetDependentFilters = useCallback(() => {
//     setClassFilter("all");
//     setSectionFilter("all");
//     setStudentFilter("all");
//     setStudentId("");
//   }, []);

//   const handleSchoolFilterChange = useCallback(
//     (value) => {
//       setSchoolName(value);
//       resetDependentFilters();
//     },
//     [resetDependentFilters],
//   );

//   const handleAcademicYearFilterChange = useCallback(
//     (value) => {
//       setAcademicYear(value);
//       resetDependentFilters();
//     },
//     [resetDependentFilters],
//   );

//   const handleClassFilterChange = useCallback((value) => {
//     setClassFilter(value);
//     setSectionFilter("all");
//     setStudentFilter("all");
//     setStudentId("");
//   }, []);

//   const handleSectionFilterChange = useCallback((value) => {
//     setSectionFilter(value);
//     setStudentFilter("all");
//     setStudentId("");
//   }, []);

//   const handleStudentFilterChange = useCallback((value) => {
//     setStudentFilter(value);
//     setStudentId(value === "all" ? "" : value);
//   }, []);

//   const { data: filterPayload, isLoading } = useQuery({
//     queryKey: ["filter-student", schoolName, academicYear, "options"],
//     queryFn: () =>
//       dispatch(
//         getFilterStudent({
//           all: true,
//           status: "all",
//           schoolName,
//           academicYear,
//           sortBy: "name",
//           sortOrder: "asc",
//           search: "",
//         }),
//       ).unwrap(),
//     staleTime: 0,
//     refetchOnWindowFocus: true,
//   });

//   // Students for the dropdown + the one currently selected//
//   const students = useMemo(
//     () => (Array.isArray(filterPayload?.items) ? filterPayload.items : []),
//     [filterPayload],
//   );

//   const selectedStudent = useMemo(() => {
//     if (!studentId) return null;
//     return (
//       students.find((student) => {
//         const ids = [
//           student?.id,
//           student?.studentId,
//           student?.cus_id,
//           student?.school_registration_number,
//           student?.admission_number,
//         ]
//           .map((value) => String(value ?? "").trim())
//           .filter(Boolean);
//         return ids.includes(String(studentId).trim());
//       }) ?? null
//     );
//   }, [students, studentId]);
//   console.log(selectedStudent, "selectedStudent");

//   // Real identity from the selected student //.
//   const healthProfile = useMemo(() => {
//     if (!selectedStudent) return HEALTH_PROFILE_TEMPLATE;
//     const s = selectedStudent;
//     return {
//       ...HEALTH_PROFILE_TEMPLATE,
//       student: {
//         ...HEALTH_PROFILE_TEMPLATE.student,
//         name: s.name ?? s.student_name ?? HEALTH_PROFILE_TEMPLATE.student.name,
//         id:
//           s.school_registration_number ??
//           s.admission_number ??
//           s.cus_id ??
//           s.id ??
//           HEALTH_PROFILE_TEMPLATE.student.id,
//         class:
//           s.Class ??
//           s.class ??
//           s.grade ??
//           HEALTH_PROFILE_TEMPLATE.student.class,
//         school:
//           s.school_name ??
//           s.schoolName ??
//           HEALTH_PROFILE_TEMPLATE.student.school,
//         dateOfBirth:
//           s.dob ??
//           s.date_of_birth ??
//           HEALTH_PROFILE_TEMPLATE.student.dateOfBirth,
//         age: s.age ?? HEALTH_PROFILE_TEMPLATE.student.age,
//         gender: s.gender ?? s.Gender ?? HEALTH_PROFILE_TEMPLATE.student.gender,
//         bloodGroup:
//           s.blood_group ??
//           s.bloodGroup ??
//           HEALTH_PROFILE_TEMPLATE.student.bloodGroup,
//       },
//     };
//   }, [selectedStudent]);

//   return (
//     <div className="min-h-screen">
//       <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
//         <div>
//           <div className="flex items-center gap-2 py-3">
//             <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary aspect-square">
//               <Cross className="size-6" />
//             </div>

//             <div>
//               {/* <h1 className="text-2xl font-semibold tracking-tight">
//               Report
//               </h1>

//               <p className="text-sm text-muted-foreground">
//                 General health screening and assessment
//               </p> */}
//               <div>
//                 <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
//                   Health Check Overview
//                 </h1>

//                 <p className="mt-2 text-sm text-slate-500">
//                   Comprehensive student health assessment · 17 Aug 2026
//                 </p>
//               </div>

//               {/* <p className="text-xs text-muted-foreground">
//                   {studentsLoading
//                     ? "Loading students..."
//                     : studentsError
//                       ? "Unable to load students"
//                       : selectedStudent?.name
//                         ? `Student: ${selectedStudent.name}`
//                         : ""}
//                 </p> */}
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-2 md:flex-nowrap">
//           {/* <CampStudentSelectorDrawer
//             open={isCaDrawerOpen}
//             onOpenChange={setIsCaDrawerOpen}
//             studentsLoading={studentsLoading}
//             studentsError={studentsError}
//             campsLoading={getData.campsLoading}
//             campsQueryError={getData.campsQueryError}
//             studentCampLoading={getData.studentCampLoading}
//             studentCampQueryError={getData.studentCampQueryError}
//             selectedCampId={selectedCampId}
//             onCampChange={(value) => {
//               setSelectedCampId(value);
//               setAcademicYear("");
//               setSelectedClassFilter("all");
//               setSelectedSectionFilter("all");
//               setStudentId("");
//             }}
//             campOptions={campOptions}
//             academicYears={academicYears}
//             activeAcademicYear={activeAcademicYear}
//             onAcademicYearChange={(value) => {
//               setAcademicYear(value);
//               setSelectedClassFilter("all");
//               setSelectedSectionFilter("all");
//               setStudentId("");
//             }}
//             classOptions={classOptions}
//             selectedClassFilter={selectedClassFilter}
//             onClassChange={(value) => {
//               setSelectedClassFilter(value);
//               setSelectedSectionFilter("all");
//               setStudentId("");
//             }}
//             sectionOptions={sectionOptions}
//             selectedSectionFilter={selectedSectionFilter}
//             onSectionChange={(value) => {
//               setSelectedSectionFilter(value);
//               setStudentId("");
//             }}
//             studentSelectValue={studentSelectValue}
//             onStudentChange={(value) => {
//               const selectedFromList = filteredStudents.find(
//                 (student) => String(student.id ?? student.studentId) === String(value),
//               );

//               if (selectedFromList) {
//                 const selectedKeys = getStudentKeys(selectedFromList);
//                 const screeningRecord = findScreeningRecordByKeys(selectedKeys);
//                 applyScreeningRecordToForm(screeningRecord);
//               }

//               setStudentId(value);
//               setIsCaDrawerOpen(false);
//             }}
//             filteredStudents={filteredStudents}
//             normalizedCampStudents={normalizedCampStudents}
//           /> */}

//           <Button type="button" variant="outline">
//             <PrinterIcon className="size-4" />
//             Print
//           </Button>

//           <Button type="button">
//             <DownloadIcon className="size-4" />
//             Download PDF
//           </Button>
//         </div>
//       </div>
//       <div className="py-5">
//         <StudentFilter
//           filterPayload={filterPayload}
//           isLoading={isLoading}
//           schoolName={schoolName}
//           academicYear={academicYear}
//           classFilter={classFilter}
//           sectionFilter={sectionFilter}
//           studentFilter={studentFilter}
//           onSchoolNameChange={handleSchoolFilterChange}
//           onAcademicYearChange={handleAcademicYearFilterChange}
//           onClassFilterChange={handleClassFilterChange}
//           onSectionFilterChange={handleSectionFilterChange}
//           onStudentFilterChange={handleStudentFilterChange}
//         />
//       </div>
//       {/* HEADER */}
//       {/* <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
//         <div className="mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">

//           <div className="flex items-center gap-3">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="text-muted-foreground hover:bg-muted hover:text-foreground"
//             >
//               <ChevronLeft className="h-5 w-5" />
//             </Button>

//             <div>
//               <div className="flex items-center gap-2">
//                 <FileText className="h-5 w-5 text-primary" />

//                 <h1 className="text-lg font-semibold text-foreground">
//                   Health Check Overview
//                 </h1>
//               </div>

//               <p className="text-xs text-muted-foreground">
//                 Complete student health assessment
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-2 sm:flex-nowrap">
//             <Button
//               variant="outline"
//               className="border-border bg-card text-muted-foreground"
//             >
//               <Printer className="mr-2 h-4 w-4" />
//               Print
//             </Button>

//             <Button className="bg-primary hover:bg-primary/90">
//               <Download className="mr-2 h-4 w-4" />
//               Download
//             </Button>
//           </div>

//         </div>
//       </header> */}
//       {selectedStudent ? (
//         <main className="space-y-5">
//           {/* STUDENT PROFILE */}
//           <FramerCard asCard className="border-border bg-card">
//             <CardContent className="p-5">
//               <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
//                 <div className="flex gap-4">
//                   <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
//                     <UserRound className="h-8 w-8 text-primary" />
//                   </div>

//                   <div>
//                     <div className="flex items-center gap-2">
//                       <h2 className="text-xl font-semibold text-foreground">
//                         {healthProfile.student.name}
//                       </h2>

//                       <Badge className="bg-success/10 text-success">
//                         {healthProfile.overall.status}
//                       </Badge>
//                     </div>

//                     <div className="my-2 flex items-start gap-2 ">
//                       <CircleDot size={15} className="bg-success/10 text-success" />
//                       {/* <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> */}
//                       <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-success">
//                         Assessment Complete
//                       </p>
//                     </div>

//                     <p className="mt-1 text-sm text-muted-foreground">
//                       {healthProfile.student.id} • Class{" "}
//                       {healthProfile.student.class} •{" "}
//                       {healthProfile.student.school}
//                     </p>

//                     <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
//                       <span>DOB: {healthProfile.student.dateOfBirth}</span>

//                       <span>Age: {healthProfile.student.age}</span>

//                       <span>Gender: {healthProfile.student.gender}</span>

//                       <span>
//                         Blood Group: {healthProfile.student.bloodGroup}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* SCORE */}
//                 <div className="rounded-xl border border-success/20 bg-success/5 px-6 py-4">
//                   <p className="text-xs text-muted-foreground">Health Score</p>

//                   <div className="flex items-end gap-2">
//                     <span className="text-3xl font-bold text-success">
//                       {healthProfile.overall.score}
//                     </span>

//                     <span className="pb-1 text-sm text-muted-foreground">
//                       /100
//                     </span>
//                   </div>

//                   <p className="text-xs text-success">
//                     {healthProfile.overall.summary}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </FramerCard>

//           {/* ASSESSMENT DETAILS */}
//           <FramerCard asCard className="border-border bg-card">
//             <CardHeader>
//               <CardTitle className="text-base text-foreground">
//                 Assessment Details
//               </CardTitle>
//             </CardHeader>

//             <CardContent>
//               <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
//                 <Result
//                   label="Assessment Date"
//                   value={healthProfile.assessment.date}
//                 />

//                 <Result
//                   label="Location"
//                   value={healthProfile.assessment.location}
//                 />

//                 <Result
//                   label="Examiner"
//                   value={healthProfile.assessment.examiner}
//                 />

//                 <Result
//                   label="Assistant"
//                   value={healthProfile.assessment.assistant}
//                 />

//                 <Result
//                   label="Designation"
//                   value={healthProfile.assessment.designation}
//                 />
//               </div>
//             </CardContent>
//           </FramerCard>

//           {/* VITALS */}
//           <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
//             <StatCard
//               icon={<Activity />}
//               label="Height"
//               value={healthProfile.vitals.height.value}
//               status={healthProfile.vitals.height.status}
//               color="blue"
//             />

//             <StatCard
//               icon={<HeartPulse />}
//               label="Weight"
//               value={healthProfile.vitals.weight.value}
//               status={healthProfile.vitals.weight.status}
//               color="green"
//             />

//             <StatCard
//               icon={<Baby />}
//               label="BMI"
//               value={healthProfile.vitals.bmi.value}
//               status={healthProfile.vitals.bmi.status}
//               color="purple"
//             />

//             <StatCard
//               icon={<ShieldCheck />}
//               label="Immunization"
//               value={healthProfile.immunization.status}
//               status="Complete"
//               color="cyan"
//             />
//           </section>

//           {/* MORE VITALS */}
//           <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
//             <StatCard
//               icon={<HeartPulse />}
//               label="Blood Pressure"
//               value={healthProfile.vitals.bloodPressure.value}
//               status={healthProfile.vitals.bloodPressure.status}
//               color="red"
//             />

//             <StatCard
//               icon={<Activity />}
//               label="Pulse"
//               value={healthProfile.vitals.pulse.value}
//               status={healthProfile.vitals.pulse.status}
//               color="blue"
//             />

//             <StatCard
//               icon={<Activity />}
//               label="Temperature"
//               value={healthProfile.vitals.temperature.value}
//               status={healthProfile.vitals.temperature.status}
//               color="orange"
//             />

//             <StatCard
//               icon={<ShieldCheck />}
//               label="SpO₂"
//               value={healthProfile.vitals.oxygen.value}
//               status={healthProfile.vitals.oxygen.status}
//               color="cyan"
//             />
//           </section>

//           {/* MAIN CONTENT */}
//           <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
//             <div className="space-y-5">
//               {/* GROWTH */}
//               <FramerCard asCard className="border-border bg-card">
//                 <CardHeader>
//                   <SectionTitle
//                     icon={<Activity />}
//                     title="Growth & BMI"
//                     subtitle="Physical measurements and growth assessment"
//                     badge="Normal"
//                   />
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <div className="grid gap-4 md:grid-cols-2">
//                     <Measurement
//                       title="Height"
//                       value="145"
//                       unit="cm"
//                       standard="Average"
//                     />

//                     <Measurement
//                       title="Weight"
//                       value="38"
//                       unit="kg"
//                       standard="Average"
//                     />
//                   </div>

//                   <div className="rounded-xl border border-border bg-muted/40 p-5">
//                     <div className="flex justify-between">
//                       <div>
//                         <p className="text-sm font-semibold text-foreground">
//                           Body Mass Index
//                         </p>

//                         <p className="text-xs text-muted-foreground">
//                           Calculated from height and weight
//                         </p>
//                       </div>

//                       <Badge className="bg-success/10 text-success">
//                         Normal
//                       </Badge>
//                     </div>

//                     <div className="py-8 text-center">
//                       <p className="text-5xl font-bold text-foreground">
//                         {healthProfile.vitals.bmi.value}
//                       </p>

//                       <p className="mt-2 text-xs text-muted-foreground">
//                         BMI • {healthProfile.vitals.bmi.percentile}
//                       </p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </FramerCard>

//               {/* VISION */}
//               <FramerCard asCard className="border-border bg-card">
//                 <CardHeader>
//                   <SectionTitle
//                     icon={<Eye />}
//                     title="Vision Screening"
//                     subtitle="Visual acuity and eye health"
//                     badge={healthProfile.vision.status}
//                   />
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <div className="grid gap-4 md:grid-cols-2">
//                     <VisionCard
//                       eye="Right Eye (OD)"
//                       acuity={healthProfile.vision.rightEye.acuity}
//                       corrected={healthProfile.vision.rightEye.corrected}
//                     />

//                     <VisionCard
//                       eye="Left Eye (OS)"
//                       acuity={healthProfile.vision.leftEye.acuity}
//                       corrected={healthProfile.vision.leftEye.corrected}
//                     />
//                   </div>

//                   <div className="grid gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-3">
//                     <Result
//                       label="Color Vision"
//                       value={healthProfile.vision.colorVision}
//                     />

//                     <Result
//                       label="Strabismus"
//                       value={healthProfile.vision.strabismus}
//                     />

//                     <Result
//                       label="Uses Correction"
//                       value={healthProfile.vision.usesCorrection}
//                     />
//                   </div>

//                   <Note text={healthProfile.vision.remarks} />
//                 </CardContent>
//               </FramerCard>

//               {/* HEARING */}
//               <FramerCard asCard className="border-border bg-card">
//                 <CardHeader>
//                   <SectionTitle
//                     icon={<Ear />}
//                     title="Hearing Screening"
//                     subtitle="Audiological assessment and hearing health"
//                     badge={healthProfile.hearing.status}
//                   />
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <div className="grid gap-4 md:grid-cols-2">
//                     <ScreeningResult
//                       title="Right Ear"
//                       value={healthProfile.hearing.rightEar.status}
//                       description={healthProfile.hearing.rightEar.findings}
//                     />

//                     <ScreeningResult
//                       title="Left Ear"
//                       value={healthProfile.hearing.leftEar.status}
//                       description={healthProfile.hearing.leftEar.findings}
//                     />
//                   </div>

//                   <div className="grid gap-4 md:grid-cols-2">
//                     <InfoCard title="Whisper Test">
//                       <div className="grid grid-cols-2 gap-4">
//                         <Result
//                           label="Right Ear"
//                           value={healthProfile.hearing.whisperTest.right}
//                         />

//                         <Result
//                           label="Left Ear"
//                           value={healthProfile.hearing.whisperTest.left}
//                         />
//                       </div>

//                       <p className="mt-4 text-xs text-muted-foreground">
//                         Distance: {healthProfile.hearing.whisperTest.distance}
//                       </p>
//                     </InfoCard>

//                     <InfoCard title="Speech Assessment">
//                       <div className="grid grid-cols-2 gap-4">
//                         <Result
//                           label="Right"
//                           value={healthProfile.hearing.speech.right}
//                         />

//                         <Result
//                           label="Left"
//                           value={healthProfile.hearing.speech.left}
//                         />

//                         <Result
//                           label="SRT Right"
//                           value={healthProfile.hearing.speech.srtRight}
//                         />

//                         <Result
//                           label="SRT Left"
//                           value={healthProfile.hearing.speech.srtLeft}
//                         />
//                       </div>
//                     </InfoCard>
//                   </div>

//                   <InfoCard title="Tympanometry">
//                     <div className="grid grid-cols-2 gap-4">
//                       <Result
//                         label="Right Ear"
//                         value={healthProfile.hearing.tympanometry.right}
//                       />

//                       <Result
//                         label="Left Ear"
//                         value={healthProfile.hearing.tympanometry.left}
//                       />
//                     </div>
//                   </InfoCard>
//                 </CardContent>
//               </FramerCard>

//               {/* DENTAL */}
//               <FramerCard asCard className="border-border bg-card">
//                 <CardHeader>
//                   <SectionTitle
//                     icon={<HeartPulse />}
//                     title="Dental Screening"
//                     subtitle="Oral and dental examination"
//                     badge={healthProfile.dental.status}
//                   />
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <div className="grid gap-4 md:grid-cols-3">
//                     <ScreeningResult
//                       title="Oral Hygiene"
//                       value={healthProfile.dental.oralHygiene}
//                       description="Overall oral hygiene"
//                     />

//                     <ScreeningResult
//                       title="Gingival Health"
//                       value={healthProfile.dental.gingivalHealth}
//                       description="Gum health"
//                     />

//                     <ScreeningResult
//                       title="Plaque"
//                       value={healthProfile.dental.plaque}
//                       description="Plaque assessment"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
//                     <SummaryValue
//                       label="Caries"
//                       value={healthProfile.dental.caries}
//                     />

//                     <SummaryValue
//                       label="Other Issues"
//                       value={healthProfile.dental.otherIssues}
//                     />

//                     <SummaryValue
//                       label="Healthy"
//                       value={healthProfile.dental.healthyTeeth}
//                     />

//                     <SummaryValue
//                       label="Missing"
//                       value={healthProfile.dental.missingTeeth}
//                     />
//                   </div>

//                   <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
//                     <p className="text-xs text-muted-foreground">
//                       Current Tooth
//                     </p>

//                     <h3 className="mt-1 font-semibold text-foreground">
//                       Tooth {healthProfile.dental.currentTooth.number}{" "}
//                       <span className="font-normal text-muted-foreground">
//                         ({healthProfile.dental.currentTooth.name})
//                       </span>
//                     </h3>

//                     <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
//                       <Result
//                         label="Status"
//                         value={healthProfile.dental.currentTooth.status}
//                       />

//                       <Result
//                         label="Surface"
//                         value={healthProfile.dental.currentTooth.surface}
//                       />

//                       <Result
//                         label="Severity"
//                         value={healthProfile.dental.currentTooth.severity}
//                       />

//                       <Result
//                         label="Treatment"
//                         value={healthProfile.dental.currentTooth.treatment}
//                       />
//                     </div>
//                   </div>

//                   <InfoCard title="Dental Referral">
//                     <div className="grid gap-4 md:grid-cols-3">
//                       <Result
//                         label="Recommended Action"
//                         value={healthProfile.dental.referral.action}
//                       />

//                       <Result
//                         label="Reason"
//                         value={healthProfile.dental.referral.reason}
//                       />

//                       <Result
//                         label="Follow-up"
//                         value={healthProfile.dental.referral.followUp}
//                       />
//                     </div>
//                   </InfoCard>
//                 </CardContent>
//               </FramerCard>

//               {/* ENT */}
//               <FramerCard asCard className="border-border bg-card">
//                 <CardHeader>
//                   <SectionTitle
//                     icon={<Activity />}
//                     title="ENT Screening"
//                     subtitle="Ear, nose and throat assessment"
//                     badge={healthProfile.ent.status}
//                   />
//                 </CardHeader>

//                 <CardContent>
//                   <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
//                     <Result label="Nose" value={healthProfile.ent.nose} />

//                     <Result label="Throat" value={healthProfile.ent.throat} />

//                     <Result label="Tonsils" value={healthProfile.ent.tonsils} />

//                     <Result
//                       label="Lymph Nodes"
//                       value={healthProfile.ent.lymphNodes}
//                     />
//                   </div>

//                   <Note text={healthProfile.ent.remarks} />
//                 </CardContent>
//               </FramerCard>
//             </div>

//             {/* RIGHT SIDEBAR */}
//             <aside className="space-y-5">
//               {/* BLOOD GROUP */}
//               <FramerCard asCard className="border-border bg-card">
//                 <CardHeader>
//                   <CardTitle className="text-base text-foreground">
//                     Blood Group
//                   </CardTitle>
//                 </CardHeader>

//                 <CardContent>
//                   <div className="flex items-center gap-4">
//                     <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 text-xl font-bold text-destructive">
//                       {healthProfile.student.bloodGroup}
//                     </div>

//                     <div>
//                       <p className="font-medium text-foreground">
//                         {healthProfile.student.bloodGroup}
//                       </p>

//                       <p className="text-xs text-muted-foreground">
//                         Blood group recorded
//                       </p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </FramerCard>

//               {/* IMMUNIZATION */}
//               <FramerCard asCard className="border-border bg-card">
//                 <CardHeader>
//                   <SectionTitle
//                     icon={<Syringe />}
//                     title="Immunization"
//                     subtitle="Vaccination status"
//                     badge={healthProfile.immunization.status}
//                   />
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <StatusLine
//                     label="Recommended vaccines"
//                     value={healthProfile.immunization.vaccines}
//                   />

//                   <StatusLine
//                     label="Vaccination status"
//                     value={healthProfile.immunization.status}
//                   />

//                   <StatusLine
//                     label="Next review"
//                     value={healthProfile.immunization.nextReview}
//                   />
//                 </CardContent>
//               </FramerCard>

//               {/* HEALTH HISTORY */}
//               <FramerCard asCard className="border-border bg-card">
//                 <CardHeader>
//                   <CardTitle className="text-base text-foreground">
//                     Health History
//                   </CardTitle>
//                 </CardHeader>

//                 <CardContent className="space-y-3">
//                   <HistoryItem
//                     label="Allergies"
//                     value={healthProfile.history.allergies}
//                   />

//                   <HistoryItem
//                     label="Chronic Disease"
//                     value={healthProfile.history.chronicDisease}
//                   />

//                   <HistoryItem
//                     label="Previous Condition"
//                     value={healthProfile.history.previousCondition}
//                   />

//                   <HistoryItem
//                     label="Surgeries"
//                     value={healthProfile.history.surgeries}
//                   />

//                   <HistoryItem
//                     label="Medications"
//                     value={healthProfile.history.medications}
//                   />
//                 </CardContent>
//               </FramerCard>

//               {/* RISK FACTORS */}
//               <FramerCard asCard className="border-border bg-card">
//                 <CardHeader>
//                   <CardTitle className="text-base text-foreground">
//                     Risk Factors
//                   </CardTitle>
//                 </CardHeader>

//                 <CardContent className="space-y-3">
//                   <StatusLine
//                     label="Frequent Ear Infections"
//                     value={healthProfile.riskFactors.earInfections}
//                   />

//                   <StatusLine
//                     label="Speech Delay"
//                     value={healthProfile.riskFactors.speechDelay}
//                   />

//                   <StatusLine
//                     label="Learning Difficulty"
//                     value={healthProfile.riskFactors.learningDifficulty}
//                   />

//                   <StatusLine
//                     label="Family History"
//                     value={healthProfile.riskFactors.familyHistory}
//                   />

//                   <StatusLine
//                     label="Noise Exposure"
//                     value={healthProfile.riskFactors.noiseExposure}
//                   />
//                 </CardContent>
//               </FramerCard>

//               {/* REFERRAL */}
//               <FramerCard asCard className="border-warning/30 bg-card">
//                 <CardHeader>
//                   <CardTitle className="text-base text-foreground">
//                     Referral & Follow-up
//                   </CardTitle>
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <Badge className="bg-warning/10 text-warning">
//                     {healthProfile.referral.priority}
//                   </Badge>

//                   <Result label="Type" value={healthProfile.referral.type} />

//                   <Result
//                     label="Referred To"
//                     value={healthProfile.referral.referredTo}
//                   />

//                   <Result
//                     label="Reason"
//                     value={healthProfile.referral.reason}
//                   />

//                   <Result
//                     label="Follow-up"
//                     value={healthProfile.referral.followUp}
//                   />
//                 </CardContent>
//               </FramerCard>

//               {/* NOTES */}
//               <FramerCard asCard className="border-border bg-card">
//                 <CardHeader>
//                   <CardTitle className="text-base text-foreground">
//                     Clinical Notes
//                   </CardTitle>
//                 </CardHeader>

//                 <CardContent>
//                   <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
//                     {healthProfile.clinicalNotes}
//                   </p>
//                 </CardContent>
//               </FramerCard>
//             </aside>
//           </div>

//           {/* FINAL ASSESSMENT */}
//           <FramerCard asCard className="border-border bg-card">
//             <CardHeader>
//               <SectionTitle
//                 icon={<CheckCircle2 />}
//                 title="Overall Assessment"
//                 subtitle="Summary of complete health screening"
//                 badge="Healthy"
//               />
//             </CardHeader>

//             <CardContent>
//               <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
//                 <OverallItem title="Growth" value="Normal" />
//                 <OverallItem title="Vision" value="Normal" />
//                 <OverallItem title="Hearing" value="Normal" />
//                 <OverallItem title="Dental" value="Good" />
//                 <OverallItem title="ENT" value="Normal" />
//                 <OverallItem title="Immunization" value="Up to date" />
//               </div>

//               <Separator className="my-5 bg-muted" />

//               <h3 className="text-sm font-semibold text-foreground">
//                 Recommendations
//               </h3>

//               <ul className="mt-3 grid gap-3 md:grid-cols-2">
//                 {healthProfile.recommendations.map((item) => (
//                   <li
//                     key={item}
//                     className="flex gap-2 text-sm text-muted-foreground"
//                   >
//                     <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
//                     {item}
//                   </li>
//                 ))}
//               </ul>

//               <div className="mt-7 flex justify-between border-t border-border pt-5">
//                 <div>
//                   <p className="text-xs text-muted-foreground">Examined by</p>

//                   <p className="mt-1 font-medium text-foreground">
//                     {healthProfile.assessment.examiner}
//                   </p>

//                   <p className="text-xs text-muted-foreground">
//                     {healthProfile.assessment.designation}
//                   </p>
//                 </div>

//                 <div className="text-right">
//                   <p className="font-serif text-2xl italic text-primary">
//                     Priya Sharma
//                   </p>

//                   <p className="text-xs text-muted-foreground">
//                     {healthProfile.assessment.date}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </FramerCard>
//         </main>
//       ) : (
//         <div className="rounded-xl border border-dashed border-border bg-card p-6">
//           <EmptyState
//             title="No Report Data"
//             description="Select a Student to get the Report"
//             action={
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setIsCaDrawerOpen(true)}
//               >
//                 <Search className="size-4" />
//                 Select Student
//               </Button>
//             }
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// /* =========================================================
//    REUSABLE COMPONENTS
// ========================================================= */

// function StatCard({ icon, label, value, status, color }) {
//   const styles = {
//     blue: "bg-primary/10 text-primary",
//     green: "bg-success/10 text-success",
//     purple: "bg-primary/10 text-primary",
//     cyan: "bg-info/10 text-info",
//     red: "bg-destructive/10 text-destructive",
//     orange: "bg-warning/10 text-warning",
//   };

//   return (
//     <FramerCard asCard className="border-border bg-card">
//       <CardContent className="p-4">
//         <div className="flex justify-between">
//           <div
//             className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles[color]}`}
//           >
//             {icon}
//           </div>

//           <span className="text-xs text-success">{status}</span>
//         </div>

//         <p className="mt-4 text-xs text-muted-foreground">{label}</p>

//         <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
//       </CardContent>
//     </FramerCard>
//   );
// }

// function SectionTitle({ icon, title, subtitle, badge }) {
//   return (
//     <div className="flex items-start justify-between gap-3">
//       <div className="flex gap-3">
//         <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
//           {icon}
//         </div>

//         <div>
//           <CardTitle className="text-base text-foreground">{title}</CardTitle>

//           <p className="text-xs text-muted-foreground">{subtitle}</p>
//         </div>
//       </div>

//       {badge && <Badge className="bg-success/10 text-success">{badge}</Badge>}
//     </div>
//   );
// }

// function Measurement({ title, value, unit, standard }) {
//   return (
//     <div className="rounded-xl border border-border bg-muted/40 p-4">
//       <p className="text-xs text-muted-foreground">{title}</p>

//       <p className="mt-2 text-2xl font-semibold text-foreground">
//         {value} <span className="text-sm text-muted-foreground">{unit}</span>
//       </p>

//       <div className="mt-4 flex justify-between border-t border-border pt-3">
//         <span className="text-xs text-muted-foreground">Standard</span>

//         <span className="text-xs text-success">{standard}</span>
//       </div>
//     </div>
//   );
// }

// function VisionCard({ eye, acuity, corrected }) {
//   return (
//     <div className="rounded-xl border border-border bg-muted/40 p-4">
//       <div className="flex justify-between">
//         <p className="text-sm font-medium text-foreground">{eye}</p>

//         <Badge className="bg-success/10 text-success">Normal</Badge>
//       </div>

//       <div className="mt-5 flex justify-between">
//         <div>
//           <p className="text-xs text-muted-foreground">Visual Acuity</p>

//           <p className="text-3xl font-bold text-foreground">{acuity}</p>
//         </div>

//         <div className="text-right">
//           <p className="text-xs text-muted-foreground">Corrected</p>

//           <p className="text-sm text-muted-foreground">{corrected}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ScreeningResult({ title, value, description }) {
//   return (
//     <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
//       <div>
//         <p className="text-sm font-medium text-foreground">{title}</p>

//         <p className="text-xs text-muted-foreground">{description}</p>
//       </div>

//       <Badge className="bg-success/10 text-success">{value}</Badge>
//     </div>
//   );
// }

// function Result({ label, value }) {
//   return (
//     <div>
//       <p className="text-xs text-muted-foreground">{label}</p>

//       <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
//     </div>
//   );
// }

// function InfoCard({ title, children }) {
//   return (
//     <div className="rounded-xl border border-border bg-muted/40 p-4">
//       <p className="mb-4 text-sm font-semibold text-foreground">{title}</p>

//       {children}
//     </div>
//   );
// }

// function Note({ text }) {
//   return (
//     <div className="rounded-xl border border-border p-4">
//       <p className="text-xs text-muted-foreground">Remarks</p>

//       <p className="mt-1 text-sm text-muted-foreground">{text}</p>
//     </div>
//   );
// }

// function StatusLine({ label, value }) {
//   return (
//     <div className="flex justify-between border-b border-border pb-3 last:border-0 last:pb-0">
//       <span className="text-xs text-muted-foreground">{label}</span>

//       <span className="text-xs text-success">{value}</span>
//     </div>
//   );
// }

// function HistoryItem({ label, value }) {
//   return (
//     <div>
//       <p className="text-xs text-muted-foreground">{label}</p>

//       <div className="mt-1 rounded-lg border border-border bg-muted/40 px-3 py-2">
//         <p className="text-sm text-muted-foreground">{value}</p>
//       </div>
//     </div>
//   );
// }

// function SummaryValue({ label, value }) {
//   return (
//     <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
//       <p className="text-xs text-muted-foreground">{label}</p>

//       <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
//     </div>
//   );
// }

// function OverallItem({ title, value }) {
//   return (
//     <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
//       <div>
//         <p className="text-xs text-muted-foreground">{title}</p>

//         <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
//       </div>

//       <CheckCircle2 className="h-5 w-5 text-success" />
//     </div>
//   );
// }
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
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { EmptyState } from "@/components/ui/empty-state";
import { selectAuthUser } from "@/lib/features/auth-slice";
import useAssignedEvents, { findSelectedCamp } from "@/lib/useAssignedEvents";
import { getStudentByEvent } from "@/lib/features/getEventAssignSlice";
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

export default function HealthOverviewReport() {
  const dispatch = useAppDispatch();
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [schoolName, setSchoolName] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [studentId, setStudentId] = useState("");
  // PDF export — ref points at the report body, html2canvas-pro captures it
  // and jsPDF paginates the render into a downloadable A4 document.
  const reportRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const authUser = useAppSelector(selectAuthUser);
  const { assignedEvents, assignEventLoading, assignEventError } =
    useAssignedEvents();
  // Resolve the camp linked to the currently selected school filter. The
  // shared helper returns { id, name, schoolName } (name/schoolName are "all"
  // when no specific camp/school is selected).
  const selectedCamp = useMemo(
    () => findSelectedCamp(assignedEvents, schoolName),
    [assignedEvents, schoolName],
  );

  // Reverse lookup for the report: general screening knows a student's camp
  // because its roster comes FROM the camp (getStudentByEvent). Here students
  // are listed across all camps, so fetch every assigned camp's roster and
  // index it by each student identifier. Any selected student then resolves
  // to its camp + school even when the school filter is still "all" — the
  // /students/filter rows don't carry camp/school fields.
  const assignedEventIds = useMemo(
    () =>
      (Array.isArray(assignedEvents) ? assignedEvents : [])
        .map((event) => String(event?.id ?? "").trim())
        .filter(Boolean)
        .sort(),
    [assignedEvents],
  );

  const { data: campStudentMap } = useQuery({
    queryKey: ["report-camp-rosters", assignedEventIds],
    queryFn: async () => {
      const map = {};
      for (const event of Array.isArray(assignedEvents) ? assignedEvents : []) {
        const eventId = String(event?.id ?? "").trim();
        if (!eventId) continue;
        try {
          const rows = await dispatch(getStudentByEvent({ eventId })).unwrap();
          const campName = String(event?.name ?? "").trim();
          const campSchool = String(
            event?.school?.school_name ??
              event?.school?.name ??
              event?.school_name ??
              event?.schoolName ??
              "",
          ).trim();
          for (const row of Array.isArray(rows) ? rows : []) {
            const keys = [
              row?.id,
              row?.studentId,
              row?.student_id,
              row?.cus_id,
              row?.school_registration_number,
              row?.admission_number,
            ]
              .map((value) => String(value ?? "").trim())
              .filter(Boolean);
            for (const key of keys) {
              if (!map[key]) {
                map[key] = { campId: eventId, campName, schoolName: campSchool };
              }
            }
          }
        } catch {
          // One failed roster must not break the remaining camps.
        }
      }
      return map;
    },
    enabled: assignedEventIds.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const resetDependentFilters = useCallback(() => {
    setClassFilter("all");
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleSchoolFilterChange = useCallback(
    (value) => {
      setSchoolName(value);
      resetDependentFilters();
    },
    [resetDependentFilters],
  );

  const handleAcademicYearFilterChange = useCallback(
    (value) => {
      setAcademicYear(value);
      resetDependentFilters();
    },
    [resetDependentFilters],
  );

  const handleClassFilterChange = useCallback((value) => {
    setClassFilter(value);
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleSectionFilterChange = useCallback((value) => {
    setSectionFilter(value);
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleStudentFilterChange = useCallback((value) => {
    setStudentFilter(value);
    setStudentId(value === "all" ? "" : value);
  }, []);

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

  // Students for the dropdown + the one currently selected//
  const students = useMemo(
    () => (Array.isArray(filterPayload?.items) ? filterPayload.items : []),
    [filterPayload],
  );

  const selectedStudent = useMemo(() => {
    if (!studentId) return null;
    return (
      students.find((student) => {
        const ids = [
          student?.id,
          student?.studentId,
          student?.cus_id,
          student?.school_registration_number,
          student?.admission_number,
        ]
          .map((value) => String(value ?? "").trim())
          .filter(Boolean);
        return ids.includes(String(studentId).trim());
      }) ?? null
    );
  }, [students, studentId]);
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
            Save & Next
          </Button>
        </div>
      </div>
      <div className="py-5">
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
// "use client"

// import {
//   Activity,
//   ArrowLeft,
//   Bell,
//   CalendarDays,
//   CheckCircle2,
//   ChevronRight,
//   CircleUserRound,
//   Droplets,
//   Ear,
//   Eye,
//   FileDown,
//   HeartPulse,
//   History,
//   LayoutDashboard,
//   Menu,
//   MoreHorizontal,
//   Printer,
//   Search,
//   ShieldCheck,
//   Smile,
//   Stethoscope,
//   Syringe,
//   Users,
//   X,
//   Zap,
// } from "lucide-react";
// import { motion } from "framer-motion";
// import { useState } from "react";
// import { fadeUp, FramerCard } from "@/util/FramerCard";

// const stagger = {
//   hidden: {},
//   show: {
//     transition: {
//       staggerChildren: 0.07,
//     },
//   },
// };

// function Status({
//   children,
//   color = "green",
// }) {
//   const colors = {
//     green: "bg-emerald-400/10 text-emerald-400 border-emerald-400/10",
//     amber: "bg-amber-400/10 text-amber-400 border-amber-400/10",
//     blue: "bg-cyan-400/10 text-cyan-400 border-cyan-400/10",
//   };

//   return (
//     <span
//       className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${colors[color]}`}
//     >
//       {children}
//     </span>
//   );
// }

// function Metric({
//   icon: Icon,
//   title,
//   value,
//   unit,
//   status,
//   color = "cyan",
// }) {
//   return (
//     <FramerCard className="group relative overflow-hidden p-5">
//       <div
//         className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-${color}-400/5 blur-2xl transition-all duration-500 group-hover:scale-150`}
//       />

//       <div className="relative flex items-start justify-between">
//         <div
//           className={`flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400`}
//         >
//           <Icon size={19} />
//         </div>
//         <Status>{status}</Status>
//       </div>

//       <p className="mt-5 text-xs text-slate-500">{title}</p>

//       <div className="mt-1 flex items-end gap-1">
//         <span className="text-2xl font-semibold tracking-tight text-white">
//           {value}
//         </span>
//         {unit && <span className="pb-1 text-xs text-slate-500">{unit}</span>}
//       </div>
//     </FramerCard>
//   );
// }

// function SectionHeader({
//   icon: Icon,
//   title,
//   subtitle,
// }) {
//   return (
//     <div className="mb-5 flex items-center justify-between">
//       <div className="flex items-center gap-3">
//         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
//           <Icon size={19} />
//         </div>
//         <div>
//           <h2 className="font-semibold text-white">{title}</h2>
//           <p className="text-xs text-slate-500">{subtitle}</p>
//         </div>
//       </div>

//       <Status>Normal</Status>
//     </div>
//   );
// }

// function ProgressBar({
//   value,
//   color = "cyan",
// }) {
//   const colors = {
//     cyan: "from-cyan-400 to-blue-500",
//     green: "from-emerald-400 to-teal-500",
//     purple: "from-violet-400 to-fuchsia-500",
//   };

//   return (
//     <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
//       <motion.div
//         initial={{ width: 0 }}
//         animate={{ width: `${value}%` }}
//         transition={{ duration: 1.2, ease: "easeOut" }}
//         className={`h-full rounded-full bg-gradient-to-r ${colors[color]}`}
//       />
//     </div>
//   );
// }

// export default function HealthCheckOverview() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="min-h-screen overflow-x-hidden bg-[#070c16] text-slate-200">
//       {/* Ambient background */}
//       {/* <div className="pointer-events-none fixed inset-0 overflow-hidden">
//         <div className="absolute left-[20%] top-[-20%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.035] blur-[120px]" />
//         <div className="absolute bottom-[-20%] right-[-5%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.035] blur-[120px]" />
//       </div> */}

//       {/* Mobile overlay */}
//       {/* {sidebarOpen && (
//         <div
//           onClick={() => setSidebarOpen(false)}
//           className="fixed inset-0 z-40 bg-black/60 lg:hidden"
//         />
//       )} */}

//       {/* Sidebar */}
//       {/* <aside
//         className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col border-r border-white/[0.06] bg-[#0a101c]/95 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <div className="flex h-20 items-center justify-between border-b border-white/[0.06] px-6">
//           <div className="flex items-center gap-3">
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
//               <HeartPulse size={19} className="text-white" />
//             </div>

//             <div>
//               <p className="font-bold tracking-tight text-white">Svastha</p>
//               <p className="text-[9px] uppercase tracking-widest text-cyan-400">
//                 Health Platform
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="text-slate-500 lg:hidden"
//           >
//             <X size={19} />
//           </button>
//         </div>

//         <div className="px-4 py-6">
//           <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-600">
//             Workspace
//           </p>

//           <nav className="space-y-1">
//             {[
//               [LayoutDashboard, "Dashboard"],
//               [Users, "Students"],
//               [Stethoscope, "Health Checks"],
//             ].map(([Icon, name], index) => (
//               <button
//                 key={String(name)}
//                 className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
//                   index === 2
//                     ? "bg-cyan-400/10 text-cyan-400"
//                     : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
//                 }`}
//               >
//                 <Icon size={17} />
//                 <span>{name}</span>
//                 {index === 2 && (
//                   <ChevronRight size={14} className="ml-auto opacity-60" />
//                 )}
//               </button>
//             ))}
//           </nav>

//           <div className="ml-5 mt-1 space-y-1 border-l border-white/[0.06] pl-4">
//             {["General Screening", "Vision Screening", "Hearing Screening", "ENT Screening", "Dental Screening", "Immunization"].map(
//               (item, index) => (
//                 <button
//                   key={item}
//                   className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs transition ${
//                     index === 0
//                       ? "text-cyan-400"
//                       : "text-slate-600 hover:text-slate-300"
//                   }`}
//                 >
//                   {item}
//                 </button>
//               )
//             )}
//           </div>
//         </div>

//         <div className="mt-auto border-t border-white/[0.06] p-5">
//           <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/[0.04]">
//             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-400">
//               <CircleUserRound size={18} />
//             </div>
//             <div>
//               <p className="text-xs font-medium text-white">Dr. Priya Sharma</p>
//               <p className="text-[10px] text-slate-600">Medical Officer</p>
//             </div>
//           </button>
//         </div>
//       </aside> */}

//       {/* Main */}
//       <main className="relative">
//         {/* Header */}
//         {/* <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070c16]/80 backdrop-blur-xl">
//           <div className="flex h-20 items-center gap-4 px-5 lg:px-8">
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="rounded-lg border border-white/[0.07] p-2 text-slate-400 lg:hidden"
//             >
//               <Menu size={19} />
//             </button>

//             <div className="hidden items-center gap-2 text-xs text-slate-600 md:flex">
//               <span>Health Checks</span>
//               <ChevronRight size={13} />
//               <span className="text-slate-300">Overview</span>
//             </div>

//             <div className="ml-auto flex items-center gap-3">
//               <div className="hidden items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 md:flex">
//                 <Search size={15} className="text-slate-600" />
//                 <input
//                   placeholder="Search students..."
//                   className="w-36 bg-transparent text-xs outline-none placeholder:text-slate-600"
//                 />
//               </div>

//               <button className="relative rounded-xl border border-white/[0.06] p-2.5 text-slate-500 hover:text-white">
//                 <Bell size={17} />
//                 <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
//               </button>

//               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-[10px] font-bold text-white">
//                 DP
//               </div>
//             </div>
//           </div>
//         </header> */}

//         <motion.div
//           variants={stagger}
//           initial="hidden"
//           animate="show"
//           className=""
//         >
//           {/* Breadcrumb / title */}
//           <motion.div variants={fadeUp} className="mb-7">
//             {/* <div className="mb-5 flex items-center gap-2 text-xs text-slate-600">
//               <ArrowLeft size={14} />
//               <span>Back to Health Checks</span>
//             </div> */}

//             <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
//               <div>
//                 <div className="mb-2 flex items-center gap-2">
//                   <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
//                   <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-emerald-400">
//                     Assessment Complete
//                   </span>
//                 </div>

//                 <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
//                   Health Check Overview
//                 </h1>

//                 <p className="mt-2 text-sm text-slate-500">
//                   Comprehensive student health assessment · 17 Aug 2026
//                 </p>
//               </div>

//               <div className="flex gap-2">
//                 <button className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-white">
//                   <Printer size={15} />
//                   Print
//                 </button>

//                 <button className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400">
//                   <FileDown size={15} />
//                   Download
//                 </button>
//               </div>
//             </div>
//           </motion.div>

//           {/* Student Hero */}
//           <motion.div
//             variants={fadeUp}
//             className="relative mb-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#111d2f] to-[#0c1421] p-6"
//           >
//             <div className="absolute right-[-50px] top-[-100px] h-[300px] w-[300px] rounded-full bg-cyan-400/[0.06] blur-3xl" />

//             <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
//               <div className="flex items-center gap-4">
//                 <div className="relative">
//                   <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-lg font-bold text-cyan-400 ring-1 ring-cyan-400/20">
//                     AK
//                   </div>
//                   <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#101a2a] bg-emerald-400" />
//                 </div>

//                 <div>
//                   <div className="flex items-center gap-2">
//                     <h2 className="text-xl font-semibold text-white">
//                       Arjun Kumar
//                     </h2>
//                     <Status>Healthy</Status>
//                   </div>

//                   <p className="mt-1 text-xs text-slate-500">
//                     SCH-104-001 · Class 6-A · Sunshine Public School
//                   </p>

//                   <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-600">
//                     <span>DOB · 12 Mar 2016</span>
//                     <span>Age · 10</span>
//                     <span>Gender · Male</span>
//                     <span>Blood Group · A+</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="ml-auto flex items-center gap-5">
//                 <div className="hidden text-right sm:block">
//                   <p className="text-[10px] uppercase tracking-widest text-slate-600">
//                     Overall health
//                   </p>
//                   <p className="mt-1 text-xs text-slate-400">
//                     Excellent condition
//                   </p>
//                 </div>

//                 <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.04]">
//                   <motion.div
//                     initial={{ rotate: -90, pathLength: 0 }}
//                     animate={{ rotate: -90, pathLength: 0.92 }}
//                     transition={{ duration: 1.5, ease: "easeOut" }}
//                     className="absolute inset-1 rounded-full border-[3px] border-cyan-400 border-l-transparent border-b-transparent"
//                   />
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-cyan-400">92</div>
//                     <div className="text-[8px] text-slate-600">/100 SCORE</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {/* Assessment info */}
//           <motion.div
//             variants={fadeUp}
//             className="mb-6 grid gap-3 rounded-2xl border border-white/[0.06] bg-[#0d1523]/80 p-5 sm:grid-cols-2 lg:grid-cols-5"
//           >
//             {[
//               ["Assessment Date", "17 Aug 2026"],
//               ["Location", "Sunshine Public School"],
//               ["Examiner", "Dr. Priya Sharma"],
//               ["Assistant", "Riya Nair"],
//               ["Designation", "Medical Officer"],
//             ].map(([label, value]) => (
//               <div key={label}>
//                 <p className="text-[10px] uppercase tracking-wider text-slate-600">
//                   {label}
//                 </p>
//                 <p className="mt-1 text-xs font-medium text-slate-300">
//                   {value}
//                 </p>
//               </div>
//             ))}
//           </motion.div>

//           {/* Metrics */}
//           <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
//             <Metric
//               icon={Activity}
//               title="Height"
//               value="145"
//               unit="cm"
//               status="Normal"
//             />
//             <Metric
//               icon={Zap}
//               title="Weight"
//               value="38"
//               unit="kg"
//               status="Normal"
//             />
//             <Metric
//               icon={HeartPulse}
//               title="BMI"
//               value="18.1"
//               status="Normal"
//             />
//             <Metric
//               icon={Syringe}
//               title="Immunization"
//               value="Up to date"
//               status="Complete"
//             />

//             <Metric
//               icon={HeartPulse}
//               title="Blood Pressure"
//               value="108/68"
//               unit="mmHg"
//               status="Normal"
//             />
//             <Metric
//               icon={Activity}
//               title="Pulse"
//               value="82"
//               unit="bpm"
//               status="Normal"
//             />
//             <Metric
//               icon={Activity}
//               title="Temperature"
//               value="98.4"
//               unit="°F"
//               status="Normal"
//             />
//             <Metric
//               icon={Droplets}
//               title="SpO₂"
//               value="99"
//               unit="%"
//               status="Normal"
//             />
//           </div>

//           <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
//             {/* Main column */}
//             <div className="space-y-6">
//               {/* Growth */}
//               <FramerCard className="p-6">
//                 <SectionHeader
//                   icon={Activity}
//                   title="Growth & BMI"
//                   subtitle="Physical measurements and growth assessment"
//                 />

//                 <div className="grid gap-3 md:grid-cols-2">
//                   {[
//                     ["Height", "145", "cm", 68],
//                     ["Weight", "38", "kg", 61],
//                   ].map(([label, value, unit, progress]) => (
//                     <div
//                       key={String(label)}
//                       className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-5"
//                     >
//                       <div className="flex justify-between">
//                         <span className="text-xs text-slate-500">
//                           {label}
//                         </span>
//                         <span className="text-[10px] text-emerald-400">
//                           Average
//                         </span>
//                       </div>

//                       <div className="mt-3 text-2xl font-semibold text-white">
//                         {value}
//                         <span className="ml-1 text-xs text-slate-600">
//                           {unit}
//                         </span>
//                       </div>

//                       <div className="mt-4">
//                         <ProgressBar value={Number(progress)} color="green" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-3 rounded-xl border border-white/[0.05] bg-[#0b1320] p-5">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-xs text-slate-500">Body Mass Index</p>
//                       <p className="mt-1 text-[10px] text-slate-700">
//                         Calculated from height and weight
//                       </p>
//                     </div>
//                     <Status>Normal</Status>
//                   </div>

//                   <div className="mt-5 flex items-end gap-2">
//                     <span className="text-5xl font-semibold tracking-tighter text-white">
//                       18.1
//                     </span>
//                     <span className="mb-2 text-xs text-slate-600">
//                       BMI · 65th percentile
//                     </span>
//                   </div>

//                   <div className="mt-5">
//                     <ProgressBar value={65} color="cyan" />
//                   </div>
//                 </div>
//               </FramerCard>

//               {/* Vision */}
//               <FramerCard className="p-6">
//                 <SectionHeader
//                   icon={Eye}
//                   title="Vision Screening"
//                   subtitle="Visual acuity and eye health"
//                 />

//                 <div className="grid gap-3 md:grid-cols-2">
//                   {[
//                     ["Right Eye (OD)", "6/6"],
//                     ["Left Eye (OS)", "6/6"],
//                   ].map(([eye, value]) => (
//                     <div
//                       key={eye}
//                       className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-5"
//                     >
//                       <div className="flex justify-between">
//                         <span className="text-xs text-slate-500">{eye}</span>
//                         <Status>Normal</Status>
//                       </div>
//                       <p className="mt-5 text-3xl font-semibold text-white">
//                         {value}
//                       </p>
//                       <p className="mt-1 text-[10px] text-emerald-400">
//                         Corrected · 6/6
//                       </p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-3 grid grid-cols-3 gap-2">
//                   {[
//                     ["Color Vision", "Normal"],
//                     ["Strabismus", "Absent"],
//                     ["Ocular Condition", "No"],
//                   ].map(([a, b]) => (
//                     <div
//                       key={a}
//                       className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-4"
//                     >
//                       <p className="text-[10px] text-slate-600">{a}</p>
//                       <p className="mt-1 text-xs text-slate-300">{b}</p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-3 rounded-xl border border-white/[0.05] bg-[#0b1320] p-4">
//                   <p className="text-[10px] text-slate-600">Remarks</p>
//                   <p className="mt-2 text-xs leading-5 text-slate-400">
//                     No abnormal visual findings detected. Visual acuity is
//                     normal in both eyes.
//                   </p>
//                 </div>
//               </FramerCard>

//               {/* Hearing */}
//               <FramerCard className="p-6">
//                 <SectionHeader
//                   icon={Ear}
//                   title="Hearing Screening"
//                   subtitle="Audiological assessment and hearing health"
//                 />

//                 <div className="grid gap-3 md:grid-cols-2">
//                   {["Right Ear", "Left Ear"].map((ear) => (
//                     <div
//                       key={ear}
//                       className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-5"
//                     >
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs text-slate-400">{ear}</span>
//                         <Status>Normal</Status>
//                       </div>
//                       <p className="mt-4 text-xs text-emerald-400">
//                         No abnormality detected
//                       </p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-3 grid gap-3 md:grid-cols-2">
//                   <div className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-5">
//                     <p className="mb-4 text-xs font-medium text-white">
//                       Whisper Test
//                     </p>

//                     <div className="grid grid-cols-2 gap-5 text-xs">
//                       <div>
//                         <p className="text-[10px] text-slate-600">Right Ear</p>
//                         <p className="mt-1 text-emerald-400">Pass</p>
//                       </div>
//                       <div>
//                         <p className="text-[10px] text-slate-600">Left Ear</p>
//                         <p className="mt-1 text-emerald-400">Pass</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-5">
//                     <p className="mb-4 text-xs font-medium text-white">
//                       Speech Assessment
//                     </p>

//                     <div className="grid grid-cols-2 gap-5 text-xs">
//                       <div>
//                         <p className="text-[10px] text-slate-600">Right</p>
//                         <p className="mt-1 text-emerald-400">100%</p>
//                       </div>
//                       <div>
//                         <p className="text-[10px] text-slate-600">Left</p>
//                         <p className="mt-1 text-emerald-400">100%</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-3 rounded-xl border border-white/[0.05] bg-[#0b1320] p-5">
//                   <p className="text-[10px] text-slate-600">Tympanometry</p>
//                   <div className="mt-2 flex gap-10 text-xs">
//                     <span>
//                       Right Ear <b className="ml-2 text-white">Type A</b>
//                     </span>
//                     <span>
//                       Left Ear <b className="ml-2 text-white">Type A</b>
//                     </span>
//                   </div>
//                 </div>
//               </FramerCard>

//               {/* Dental */}
//               <FramerCard className="p-6">
//                 <SectionHeader
//                   icon={Smile}
//                   title="Dental Screening"
//                   subtitle="Oral health and dental examination"
//                 />

//                 <div className="grid grid-cols-3 gap-3">
//                   {[
//                     ["Oral Hygiene", "Good"],
//                     ["Gingival Health", "Healthy"],
//                     ["Plaque", "Mild"],
//                   ].map(([a, b]) => (
//                     <div
//                       key={a}
//                       className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-4"
//                     >
//                       <p className="text-[10px] text-slate-600">{a}</p>
//                       <p className="mt-2 text-xs font-medium text-emerald-400">
//                         {b}
//                       </p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-3 grid grid-cols-4 gap-2">
//                   {[
//                     ["Caries", "2"],
//                     ["Other Issues", "1"],
//                     ["Healthy", "25"],
//                     ["Missing", "0"],
//                   ].map(([a, b]) => (
//                     <div
//                       key={a}
//                       className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-4 text-center"
//                     >
//                       <p className="text-[10px] text-slate-600">{a}</p>
//                       <p className="mt-2 text-lg font-semibold text-white">
//                         {b}
//                       </p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.035] p-5">
//                   <div className="flex flex-col justify-between gap-5 md:flex-row">
//                     <div>
//                       <p className="text-[10px] text-slate-600">Current Tooth</p>
//                       <p className="mt-1 text-lg font-semibold text-white">
//                         Tooth 16{" "}
//                         <span className="text-xs font-normal text-slate-500">
//                           (Upper Right First Molar)
//                         </span>
//                       </p>
//                     </div>

//                     <div className="flex gap-8">
//                       <div>
//                         <p className="text-[10px] text-slate-600">Status</p>
//                         <p className="mt-1 text-xs text-amber-400">Caries</p>
//                       </div>
//                       <div>
//                         <p className="text-[10px] text-slate-600">Severity</p>
//                         <p className="mt-1 text-xs text-white">Moderate</p>
//                       </div>
//                       <div>
//                         <p className="text-[10px] text-slate-600">Treatment</p>
//                         <p className="mt-1 text-xs text-white">Restoration</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </FramerCard>

//               {/* ENT */}
//               <FramerCard className="p-6">
//                 <SectionHeader
//                   icon={Stethoscope}
//                   title="ENT Screening"
//                   subtitle="Ear, nose and throat assessment"
//                 />

//                 <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
//                   {[
//                     ["Nose", "Normal"],
//                     ["Throat", "Normal"],
//                     ["Tonsils", "Normal"],
//                     ["Lymph Nodes", "No abnormality"],
//                   ].map(([a, b]) => (
//                     <div
//                       key={a}
//                       className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-4"
//                     >
//                       <p className="text-[10px] text-slate-600">{a}</p>
//                       <p className="mt-2 text-xs text-emerald-400">{b}</p>
//                     </div>
//                   ))}
//                 </div>
//               </FramerCard>
//             </div>

//             {/* Right sidebar */}
//             <aside className="space-y-5">
//               {/* Blood */}
//               <FramerCard className="p-5">
//                 <p className="text-xs font-semibold text-white">Blood Group</p>

//                 <div className="mt-4 flex items-center gap-3">
//                   <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-400/10 text-sm font-bold text-rose-400">
//                     A+
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-white">A+</p>
//                     <p className="text-[10px] text-slate-600">
//                       Blood group recorded
//                     </p>
//                   </div>
//                 </div>
//               </FramerCard>

//               {/* Immunization */}
//               <FramerCard className="p-5">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
//                       <Syringe size={16} />
//                     </div>
//                     <p className="text-xs font-semibold text-white">
//                       Immunization
//                     </p>
//                   </div>
//                   <Status>Up to date</Status>
//                 </div>

//                 <div className="mt-5 space-y-4">
//                   {[
//                     ["Recommended vaccines", "Completed"],
//                     ["Vaccination status", "Up to date"],
//                     ["Next review", "As scheduled"],
//                   ].map(([a, b]) => (
//                     <div key={a} className="flex justify-between">
//                       <span className="text-[10px] text-slate-600">{a}</span>
//                       <span className="text-[10px] text-emerald-400">{b}</span>
//                     </div>
//                   ))}
//                 </div>
//               </FramerCard>

//               {/* History */}
//               <FramerCard className="p-5">
//                 <div className="flex items-center gap-2">
//                   <History size={15} className="text-cyan-400" />
//                   <p className="text-xs font-semibold text-white">
//                     Health History
//                   </p>
//                 </div>

//                 <div className="mt-5 space-y-3">
//                   {[
//                     ["Allergies", "None"],
//                     ["Chronic Disease", "None"],
//                     ["Previous Condition", "None reported"],
//                     ["Surgeries", "None"],
//                     ["Medications", "None"],
//                   ].map(([a, b]) => (
//                     <div key={a}>
//                       <p className="mb-1 text-[9px] text-slate-600">{a}</p>
//                       <div className="rounded-lg border border-white/[0.05] bg-[#0b1320] px-3 py-2 text-[10px] text-slate-400">
//                         {b}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </FramerCard>

//               {/* Risk */}
//               <FramerCard className="p-5">
//                 <p className="text-xs font-semibold text-white">Risk Factors</p>

//                 <div className="mt-5 space-y-3">
//                   {[
//                     ["Frequent Ear Infections", "No"],
//                     ["Speech Delay", "No"],
//                     ["Learning Difficulty", "No"],
//                     ["Family History", "No"],
//                     ["Noise Exposure", "No"],
//                   ].map(([a, b]) => (
//                     <div key={a} className="flex justify-between text-[10px]">
//                       <span className="text-slate-600">{a}</span>
//                       <span className="text-emerald-400">{b}</span>
//                     </div>
//                   ))}
//                 </div>
//               </FramerCard>

//               {/* Referral */}
//               <FramerCard className="border-amber-400/20 bg-gradient-to-br from-amber-400/[0.06] to-[#101827] p-5">
//                 <div className="flex items-center justify-between">
//                   <p className="text-xs font-semibold text-white">
//                     Referral & Follow-up
//                   </p>
//                   <Status color="amber">Routine</Status>
//                 </div>

//                 <div className="mt-5 space-y-4 text-xs">
//                   <div>
//                     <p className="text-[9px] text-slate-600">Type</p>
//                     <p className="mt-1 text-slate-300">Dental</p>
//                   </div>
//                   <div>
//                     <p className="text-[9px] text-slate-600">Referred To</p>
//                     <p className="mt-1 text-slate-300">Dental Clinic</p>
//                   </div>
//                   <div>
//                     <p className="text-[9px] text-slate-600">Reason</p>
//                     <p className="mt-1 text-slate-300">Minor dental caries</p>
//                   </div>
//                   <div>
//                     <p className="text-[9px] text-slate-600">Follow-up</p>
//                     <p className="mt-1 text-cyan-400">6 months</p>
//                   </div>
//                 </div>
//               </FramerCard>

//               {/* Notes */}
//               <FramerCard className="p-5">
//                 <p className="text-xs font-semibold text-white">
//                   Clinical Notes
//                 </p>

//                 <div className="mt-4 rounded-xl border border-white/[0.05] bg-[#0b1320] p-4">
//                   <p className="text-xs leading-5 text-slate-400">
//                     Student is generally healthy. Growth parameters are within
//                     the expected range. Vision and hearing screenings show no
//                     significant concerns. Mild dental findings noted and
//                     routine dental follow-up is recommended.
//                   </p>
//                 </div>
//               </FramerCard>
//             </aside>
//           </div>

//           {/* Overall assessment */}
//           <FramerCard className="mt-6 overflow-hidden p-6">
//             <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
//                   <ShieldCheck size={20} />
//                 </div>

//                 <div>
//                   <h2 className="font-semibold text-white">
//                     Overall Assessment
//                   </h2>
//                   <p className="text-xs text-slate-500">
//                     Summary of comprehensive health screening
//                   </p>
//                 </div>
//               </div>

//               <Status>Healthy</Status>
//             </div>

//             <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
//               {[
//                 ["Growth", "Normal"],
//                 ["Vision", "Normal"],
//                 ["Hearing", "Normal"],
//                 ["Dental", "Good"],
//                 ["ENT", "Normal"],
//                 ["Immunization", "Up to date"],
//               ].map(([a, b]) => (
//                 <div
//                   key={a}
//                   className="group rounded-xl border border-white/[0.05] bg-[#0b1320] p-4 transition hover:border-cyan-400/20"
//                 >
//                   <div className="flex items-center justify-between">
//                     <p className="text-[10px] text-slate-600">{a}</p>
//                     <CheckCircle2
//                       size={13}
//                       className="text-emerald-400 opacity-60"
//                     />
//                   </div>
//                   <p className="mt-2 text-xs font-medium text-slate-300">
//                     {b}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-6 border-t border-white/[0.06] pt-6">
//               <p className="text-xs font-semibold text-white">
//                 Recommendations
//               </p>

//               <div className="mt-4 grid gap-3 md:grid-cols-2">
//                 {[
//                   "Maintain a balanced diet and regular physical activity.",
//                   "Continue routine dental hygiene practices.",
//                   "Follow up with a dentist in 6 months.",
//                   "Continue regular health screening.",
//                   "Keep immunizations up to date.",
//                 ].map((item) => (
//                   <div
//                     key={item}
//                     className="flex items-center gap-3 text-xs text-slate-400"
//                   >
//                     <CheckCircle2 size={14} className="text-emerald-400" />
//                     {item}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="mt-7 flex flex-col justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-end">
//               <div>
//                 <p className="text-[9px] uppercase tracking-widest text-slate-600">
//                   Examined by
//                 </p>
//                 <p className="mt-1 text-sm font-medium text-white">
//                   Dr. Priya Sharma
//                 </p>
//                 <p className="text-[10px] text-slate-600">Medical Officer</p>
//               </div>

//               <div className="font-serif text-xl italic text-cyan-400">
//                 Priya Sharma
//               </div>
//             </div>
//           </FramerCard>

//           <footer className="py-8 text-center text-[10px] text-slate-700">
//             Svastha Health Platform · Confidential Student Health Record
//           </footer>
//         </motion.div>
//       </main>
//     </div>
//   );
// }
