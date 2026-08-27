// "use client";

// import {
//   Activity,
//   Baby,
//   CalendarDays,
//   CheckCircle2,
//   ChevronLeft,
//   Download,
//   Ear,
//   Eye,
//   FileText,
//   HeartPulse,
//   Printer,
//   ShieldCheck,
//   Syringe,
//   UserRound,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";

// /* =========================================================
//    COMPLETE STUDENT HEALTH PROFILE DATA
// ========================================================= */

// const healthProfile = {
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
//   return (
//     <div className="min-h-screen bg-[#080d1a] text-slate-200">

//       {/* HEADER */}
//       <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#0b1120]/95 backdrop-blur">
//         <div className="mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">

//           <div className="flex items-center gap-3">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="text-slate-400 hover:bg-slate-800 hover:text-white"
//             >
//               <ChevronLeft className="h-5 w-5" />
//             </Button>

//             <div>
//               <div className="flex items-center gap-2">
//                 <FileText className="h-5 w-5 text-sky-400" />

//                 <h1 className="text-lg font-semibold text-white">
//                   Health Check Overview
//                 </h1>
//               </div>

//               <p className="text-xs text-slate-500">
//                 Complete student health assessment
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-2 sm:flex-nowrap">
//             <Button
//               variant="outline"
//               className="border-slate-700 bg-slate-900 text-slate-300"
//             >
//               <Printer className="mr-2 h-4 w-4" />
//               Print
//             </Button>

//             <Button className="bg-sky-600 hover:bg-sky-700">
//               <Download className="mr-2 h-4 w-4" />
//               Download
//             </Button>
//           </div>

//         </div>
//       </header>

//       <main className="mx-auto max-w-[1500px] space-y-5 px-4 py-5 lg:px-6">

//         {/* STUDENT PROFILE */}
//         <Card className="border-slate-800 bg-[#0e1525]">
//           <CardContent className="p-5">

//             <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">

//               <div className="flex gap-4">

//                 <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-sky-500/10">
//                   <UserRound className="h-8 w-8 text-sky-400" />
//                 </div>

//                 <div>

//                   <div className="flex items-center gap-2">
//                     <h2 className="text-xl font-semibold text-white">
//                       {healthProfile.student.name}
//                     </h2>

//                     <Badge className="bg-emerald-500/10 text-emerald-400">
//                       {healthProfile.overall.status}
//                     </Badge>
//                   </div>

//                   <p className="mt-1 text-sm text-slate-400">
//                     {healthProfile.student.id} • Class{" "}
//                     {healthProfile.student.class} •{" "}
//                     {healthProfile.student.school}
//                   </p>

//                   <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
//                     <span>
//                       DOB: {healthProfile.student.dateOfBirth}
//                     </span>

//                     <span>
//                       Age: {healthProfile.student.age}
//                     </span>

//                     <span>
//                       Gender: {healthProfile.student.gender}
//                     </span>

//                     <span>
//                       Blood Group: {healthProfile.student.bloodGroup}
//                     </span>
//                   </div>

//                 </div>

//               </div>

//               {/* SCORE */}
//               <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4">
//                 <p className="text-xs text-slate-500">
//                   Health Score
//                 </p>

//                 <div className="flex items-end gap-2">
//                   <span className="text-3xl font-bold text-emerald-400">
//                     {healthProfile.overall.score}
//                   </span>

//                   <span className="pb-1 text-sm text-slate-500">
//                     /100
//                   </span>
//                 </div>

//                 <p className="text-xs text-emerald-400">
//                   {healthProfile.overall.summary}
//                 </p>
//               </div>

//             </div>

//           </CardContent>
//         </Card>

//         {/* ASSESSMENT DETAILS */}
//         <Card className="border-slate-800 bg-[#0e1525]">
//           <CardHeader>
//             <CardTitle className="text-base text-white">
//               Assessment Details
//             </CardTitle>
//           </CardHeader>

//           <CardContent>
//             <div className="grid grid-cols-2 gap-5 md:grid-cols-5">

//               <Result
//                 label="Assessment Date"
//                 value={healthProfile.assessment.date}
//               />

//               <Result
//                 label="Location"
//                 value={healthProfile.assessment.location}
//               />

//               <Result
//                 label="Examiner"
//                 value={healthProfile.assessment.examiner}
//               />

//               <Result
//                 label="Assistant"
//                 value={healthProfile.assessment.assistant}
//               />

//               <Result
//                 label="Designation"
//                 value={healthProfile.assessment.designation}
//               />

//             </div>
//           </CardContent>
//         </Card>

//         {/* VITALS */}
//         <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

//           <StatCard
//             icon={<Activity />}
//             label="Height"
//             value={healthProfile.vitals.height.value}
//             status={healthProfile.vitals.height.status}
//             color="blue"
//           />

//           <StatCard
//             icon={<HeartPulse />}
//             label="Weight"
//             value={healthProfile.vitals.weight.value}
//             status={healthProfile.vitals.weight.status}
//             color="green"
//           />

//           <StatCard
//             icon={<Baby />}
//             label="BMI"
//             value={healthProfile.vitals.bmi.value}
//             status={healthProfile.vitals.bmi.status}
//             color="purple"
//           />

//           <StatCard
//             icon={<ShieldCheck />}
//             label="Immunization"
//             value={healthProfile.immunization.status}
//             status="Complete"
//             color="cyan"
//           />

//         </section>

//         {/* MORE VITALS */}
//         <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

//           <StatCard
//             icon={<HeartPulse />}
//             label="Blood Pressure"
//             value={healthProfile.vitals.bloodPressure.value}
//             status={healthProfile.vitals.bloodPressure.status}
//             color="red"
//           />

//           <StatCard
//             icon={<Activity />}
//             label="Pulse"
//             value={healthProfile.vitals.pulse.value}
//             status={healthProfile.vitals.pulse.status}
//             color="blue"
//           />

//           <StatCard
//             icon={<Activity />}
//             label="Temperature"
//             value={healthProfile.vitals.temperature.value}
//             status={healthProfile.vitals.temperature.status}
//             color="orange"
//           />

//           <StatCard
//             icon={<ShieldCheck />}
//             label="SpO₂"
//             value={healthProfile.vitals.oxygen.value}
//             status={healthProfile.vitals.oxygen.status}
//             color="cyan"
//           />

//         </section>

//         {/* MAIN CONTENT */}
//         <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">

//           <div className="space-y-5">

//             {/* GROWTH */}
//             <Card className="border-slate-800 bg-[#0e1525]">

//               <CardHeader>
//                 <SectionTitle
//                   icon={<Activity />}
//                   title="Growth & BMI"
//                   subtitle="Physical measurements and growth assessment"
//                   badge="Normal"
//                 />
//               </CardHeader>

//               <CardContent className="space-y-4">

//                 <div className="grid gap-4 md:grid-cols-2">

//                   <Measurement
//                     title="Height"
//                     value="145"
//                     unit="cm"
//                     standard="Average"
//                   />

//                   <Measurement
//                     title="Weight"
//                     value="38"
//                     unit="kg"
//                     standard="Average"
//                   />

//                 </div>

//                 <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-5">

//                   <div className="flex justify-between">

//                     <div>
//                       <p className="text-sm font-semibold text-white">
//                         Body Mass Index
//                       </p>

//                       <p className="text-xs text-slate-500">
//                         Calculated from height and weight
//                       </p>
//                     </div>

//                     <Badge className="bg-emerald-500/10 text-emerald-400">
//                       Normal
//                     </Badge>

//                   </div>

//                   <div className="py-8 text-center">

//                     <p className="text-5xl font-bold text-white">
//                       {healthProfile.vitals.bmi.value}
//                     </p>

//                     <p className="mt-2 text-xs text-slate-500">
//                       BMI • {healthProfile.vitals.bmi.percentile}
//                     </p>

//                   </div>

//                 </div>

//               </CardContent>
//             </Card>

//             {/* VISION */}
//             <Card className="border-slate-800 bg-[#0e1525]">

//               <CardHeader>
//                 <SectionTitle
//                   icon={<Eye />}
//                   title="Vision Screening"
//                   subtitle="Visual acuity and eye health"
//                   badge={healthProfile.vision.status}
//                 />
//               </CardHeader>

//               <CardContent className="space-y-4">

//                 <div className="grid gap-4 md:grid-cols-2">

//                   <VisionCard
//                     eye="Right Eye (OD)"
//                     acuity={healthProfile.vision.rightEye.acuity}
//                     corrected={healthProfile.vision.rightEye.corrected}
//                   />

//                   <VisionCard
//                     eye="Left Eye (OS)"
//                     acuity={healthProfile.vision.leftEye.acuity}
//                     corrected={healthProfile.vision.leftEye.corrected}
//                   />

//                 </div>

//                 <div className="grid gap-4 rounded-xl border border-slate-800 bg-[#080e1b] p-4 sm:grid-cols-3">

//                   <Result
//                     label="Color Vision"
//                     value={healthProfile.vision.colorVision}
//                   />

//                   <Result
//                     label="Strabismus"
//                     value={healthProfile.vision.strabismus}
//                   />

//                   <Result
//                     label="Uses Correction"
//                     value={healthProfile.vision.usesCorrection}
//                   />

//                 </div>

//                 <Note text={healthProfile.vision.remarks} />

//               </CardContent>
//             </Card>

//             {/* HEARING */}
//             <Card className="border-slate-800 bg-[#0e1525]">

//               <CardHeader>
//                 <SectionTitle
//                   icon={<Ear />}
//                   title="Hearing Screening"
//                   subtitle="Audiological assessment and hearing health"
//                   badge={healthProfile.hearing.status}
//                 />
//               </CardHeader>

//               <CardContent className="space-y-4">

//                 <div className="grid gap-4 md:grid-cols-2">

//                   <ScreeningResult
//                     title="Right Ear"
//                     value={healthProfile.hearing.rightEar.status}
//                     description={
//                       healthProfile.hearing.rightEar.findings
//                     }
//                   />

//                   <ScreeningResult
//                     title="Left Ear"
//                     value={healthProfile.hearing.leftEar.status}
//                     description={
//                       healthProfile.hearing.leftEar.findings
//                     }
//                   />

//                 </div>

//                 <div className="grid gap-4 md:grid-cols-2">

//                   <InfoCard title="Whisper Test">

//                     <div className="grid grid-cols-2 gap-4">
//                       <Result
//                         label="Right Ear"
//                         value={healthProfile.hearing.whisperTest.right}
//                       />

//                       <Result
//                         label="Left Ear"
//                         value={healthProfile.hearing.whisperTest.left}
//                       />
//                     </div>

//                     <p className="mt-4 text-xs text-slate-500">
//                       Distance:{" "}
//                       {healthProfile.hearing.whisperTest.distance}
//                     </p>

//                   </InfoCard>

//                   <InfoCard title="Speech Assessment">

//                     <div className="grid grid-cols-2 gap-4">

//                       <Result
//                         label="Right"
//                         value={healthProfile.hearing.speech.right}
//                       />

//                       <Result
//                         label="Left"
//                         value={healthProfile.hearing.speech.left}
//                       />

//                       <Result
//                         label="SRT Right"
//                         value={healthProfile.hearing.speech.srtRight}
//                       />

//                       <Result
//                         label="SRT Left"
//                         value={healthProfile.hearing.speech.srtLeft}
//                       />

//                     </div>

//                   </InfoCard>

//                 </div>

//                 <InfoCard title="Tympanometry">

//                   <div className="grid grid-cols-2 gap-4">

//                     <Result
//                       label="Right Ear"
//                       value={healthProfile.hearing.tympanometry.right}
//                     />

//                     <Result
//                       label="Left Ear"
//                       value={healthProfile.hearing.tympanometry.left}
//                     />

//                   </div>

//                 </InfoCard>

//               </CardContent>
//             </Card>

//             {/* DENTAL */}
//             <Card className="border-slate-800 bg-[#0e1525]">

//               <CardHeader>
//                 <SectionTitle
//                   icon={<HeartPulse />}
//                   title="Dental Screening"
//                   subtitle="Oral and dental examination"
//                   badge={healthProfile.dental.status}
//                 />
//               </CardHeader>

//               <CardContent className="space-y-4">

//                 <div className="grid gap-4 md:grid-cols-3">

//                   <ScreeningResult
//                     title="Oral Hygiene"
//                     value={healthProfile.dental.oralHygiene}
//                     description="Overall oral hygiene"
//                   />

//                   <ScreeningResult
//                     title="Gingival Health"
//                     value={healthProfile.dental.gingivalHealth}
//                     description="Gum health"
//                   />

//                   <ScreeningResult
//                     title="Plaque"
//                     value={healthProfile.dental.plaque}
//                     description="Plaque assessment"
//                   />

//                 </div>

//                 <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

//                   <SummaryValue
//                     label="Caries"
//                     value={healthProfile.dental.caries}
//                   />

//                   <SummaryValue
//                     label="Other Issues"
//                     value={healthProfile.dental.otherIssues}
//                   />

//                   <SummaryValue
//                     label="Healthy"
//                     value={healthProfile.dental.healthyTeeth}
//                   />

//                   <SummaryValue
//                     label="Missing"
//                     value={healthProfile.dental.missingTeeth}
//                   />

//                 </div>

//                 <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">

//                   <p className="text-xs text-slate-500">
//                     Current Tooth
//                   </p>

//                   <h3 className="mt-1 font-semibold text-white">
//                     Tooth {healthProfile.dental.currentTooth.number}{" "}
//                     <span className="font-normal text-slate-400">
//                       ({healthProfile.dental.currentTooth.name})
//                     </span>
//                   </h3>

//                   <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">

//                     <Result
//                       label="Status"
//                       value={healthProfile.dental.currentTooth.status}
//                     />

//                     <Result
//                       label="Surface"
//                       value={healthProfile.dental.currentTooth.surface}
//                     />

//                     <Result
//                       label="Severity"
//                       value={healthProfile.dental.currentTooth.severity}
//                     />

//                     <Result
//                       label="Treatment"
//                       value={healthProfile.dental.currentTooth.treatment}
//                     />

//                   </div>

//                 </div>

//                 <InfoCard title="Dental Referral">

//                   <div className="grid gap-4 md:grid-cols-3">

//                     <Result
//                       label="Recommended Action"
//                       value={healthProfile.dental.referral.action}
//                     />

//                     <Result
//                       label="Reason"
//                       value={healthProfile.dental.referral.reason}
//                     />

//                     <Result
//                       label="Follow-up"
//                       value={healthProfile.dental.referral.followUp}
//                     />

//                   </div>

//                 </InfoCard>

//               </CardContent>
//             </Card>

//             {/* ENT */}
//             <Card className="border-slate-800 bg-[#0e1525]">

//               <CardHeader>
//                 <SectionTitle
//                   icon={<Activity />}
//                   title="ENT Screening"
//                   subtitle="Ear, nose and throat assessment"
//                   badge={healthProfile.ent.status}
//                 />
//               </CardHeader>

//               <CardContent>

//                 <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

//                   <Result
//                     label="Nose"
//                     value={healthProfile.ent.nose}
//                   />

//                   <Result
//                     label="Throat"
//                     value={healthProfile.ent.throat}
//                   />

//                   <Result
//                     label="Tonsils"
//                     value={healthProfile.ent.tonsils}
//                   />

//                   <Result
//                     label="Lymph Nodes"
//                     value={healthProfile.ent.lymphNodes}
//                   />

//                 </div>

//                 <Note text={healthProfile.ent.remarks} />

//               </CardContent>
//             </Card>

//           </div>

//           {/* RIGHT SIDEBAR */}
//           <aside className="space-y-5">

//             {/* BLOOD GROUP */}
//             <Card className="border-slate-800 bg-[#0e1525]">

//               <CardHeader>
//                 <CardTitle className="text-base text-white">
//                   Blood Group
//                 </CardTitle>
//               </CardHeader>

//               <CardContent>

//                 <div className="flex items-center gap-4">

//                   <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 text-xl font-bold text-red-400">
//                     {healthProfile.student.bloodGroup}
//                   </div>

//                   <div>
//                     <p className="font-medium text-white">
//                       {healthProfile.student.bloodGroup}
//                     </p>

//                     <p className="text-xs text-slate-500">
//                       Blood group recorded
//                     </p>
//                   </div>

//                 </div>

//               </CardContent>
//             </Card>

//             {/* IMMUNIZATION */}
//             <Card className="border-slate-800 bg-[#0e1525]">

//               <CardHeader>
//                 <SectionTitle
//                   icon={<Syringe />}
//                   title="Immunization"
//                   subtitle="Vaccination status"
//                   badge={healthProfile.immunization.status}
//                 />
//               </CardHeader>

//               <CardContent className="space-y-4">

//                 <StatusLine
//                   label="Recommended vaccines"
//                   value={healthProfile.immunization.vaccines}
//                 />

//                 <StatusLine
//                   label="Vaccination status"
//                   value={healthProfile.immunization.status}
//                 />

//                 <StatusLine
//                   label="Next review"
//                   value={healthProfile.immunization.nextReview}
//                 />

//               </CardContent>
//             </Card>

//             {/* HEALTH HISTORY */}
//             <Card className="border-slate-800 bg-[#0e1525]">

//               <CardHeader>
//                 <CardTitle className="text-base text-white">
//                   Health History
//                 </CardTitle>
//               </CardHeader>

//               <CardContent className="space-y-3">

//                 <HistoryItem
//                   label="Allergies"
//                   value={healthProfile.history.allergies}
//                 />

//                 <HistoryItem
//                   label="Chronic Disease"
//                   value={healthProfile.history.chronicDisease}
//                 />

//                 <HistoryItem
//                   label="Previous Condition"
//                   value={healthProfile.history.previousCondition}
//                 />

//                 <HistoryItem
//                   label="Surgeries"
//                   value={healthProfile.history.surgeries}
//                 />

//                 <HistoryItem
//                   label="Medications"
//                   value={healthProfile.history.medications}
//                 />

//               </CardContent>
//             </Card>

//             {/* RISK FACTORS */}
//             <Card className="border-slate-800 bg-[#0e1525]">

//               <CardHeader>
//                 <CardTitle className="text-base text-white">
//                   Risk Factors
//                 </CardTitle>
//               </CardHeader>

//               <CardContent className="space-y-3">

//                 <StatusLine
//                   label="Frequent Ear Infections"
//                   value={healthProfile.riskFactors.earInfections}
//                 />

//                 <StatusLine
//                   label="Speech Delay"
//                   value={healthProfile.riskFactors.speechDelay}
//                 />

//                 <StatusLine
//                   label="Learning Difficulty"
//                   value={healthProfile.riskFactors.learningDifficulty}
//                 />

//                 <StatusLine
//                   label="Family History"
//                   value={healthProfile.riskFactors.familyHistory}
//                 />

//                 <StatusLine
//                   label="Noise Exposure"
//                   value={healthProfile.riskFactors.noiseExposure}
//                 />

//               </CardContent>
//             </Card>

//             {/* REFERRAL */}
//             <Card className="border-amber-500/30 bg-[#0e1525]">

//               <CardHeader>
//                 <CardTitle className="text-base text-white">
//                   Referral & Follow-up
//                 </CardTitle>
//               </CardHeader>

//               <CardContent className="space-y-4">

//                 <Badge className="bg-amber-500/10 text-amber-400">
//                   {healthProfile.referral.priority}
//                 </Badge>

//                 <Result
//                   label="Type"
//                   value={healthProfile.referral.type}
//                 />

//                 <Result
//                   label="Referred To"
//                   value={healthProfile.referral.referredTo}
//                 />

//                 <Result
//                   label="Reason"
//                   value={healthProfile.referral.reason}
//                 />

//                 <Result
//                   label="Follow-up"
//                   value={healthProfile.referral.followUp}
//                 />

//               </CardContent>
//             </Card>

//             {/* NOTES */}
//             <Card className="border-slate-800 bg-[#0e1525]">

//               <CardHeader>
//                 <CardTitle className="text-base text-white">
//                   Clinical Notes
//                 </CardTitle>
//               </CardHeader>

//               <CardContent>
//                 <p className="rounded-lg border border-slate-800 bg-[#080e1b] p-4 text-sm leading-6 text-slate-400">
//                   {healthProfile.clinicalNotes}
//                 </p>
//               </CardContent>
//             </Card>

//           </aside>

//         </div>

//         {/* FINAL ASSESSMENT */}
//         <Card className="border-slate-800 bg-[#0e1525]">

//           <CardHeader>

//             <SectionTitle
//               icon={<CheckCircle2 />}
//               title="Overall Assessment"
//               subtitle="Summary of complete health screening"
//               badge="Healthy"
//             />

//           </CardHeader>

//           <CardContent>

//             <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">

//               <OverallItem title="Growth" value="Normal" />
//               <OverallItem title="Vision" value="Normal" />
//               <OverallItem title="Hearing" value="Normal" />
//               <OverallItem title="Dental" value="Good" />
//               <OverallItem title="ENT" value="Normal" />
//               <OverallItem title="Immunization" value="Up to date" />

//             </div>

//             <Separator className="my-5 bg-slate-800" />

//             <h3 className="text-sm font-semibold text-white">
//               Recommendations
//             </h3>

//             <ul className="mt-3 grid gap-3 md:grid-cols-2">

//               {healthProfile.recommendations.map((item) => (
//                 <li
//                   key={item}
//                   className="flex gap-2 text-sm text-slate-400"
//                 >
//                   <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
//                   {item}
//                 </li>
//               ))}

//             </ul>

//             <div className="mt-7 flex justify-between border-t border-slate-800 pt-5">

//               <div>
//                 <p className="text-xs text-slate-500">
//                   Examined by
//                 </p>

//                 <p className="mt-1 font-medium text-white">
//                   {healthProfile.assessment.examiner}
//                 </p>

//                 <p className="text-xs text-slate-500">
//                   {healthProfile.assessment.designation}
//                 </p>
//               </div>

//               <div className="text-right">

//                 <p className="font-serif text-2xl italic text-sky-400">
//                   Priya Sharma
//                 </p>

//                 <p className="text-xs text-slate-500">
//                   {healthProfile.assessment.date}
//                 </p>

//               </div>

//             </div>

//           </CardContent>
//         </Card>

//       </main>
//     </div>
//   );
// }

// /* =========================================================
//    REUSABLE COMPONENTS
// ========================================================= */

// function StatCard({
//   icon,
//   label,
//   value,
//   status,
//   color,
// }) {
//   const styles = {
//     blue: "bg-sky-500/10 text-sky-400",
//     green: "bg-emerald-500/10 text-emerald-400",
//     purple: "bg-purple-500/10 text-purple-400",
//     cyan: "bg-cyan-500/10 text-cyan-400",
//     red: "bg-red-500/10 text-red-400",
//     orange: "bg-orange-500/10 text-orange-400",
//   };

//   return (
//     <Card className="border-slate-800 bg-[#0e1525]">
//       <CardContent className="p-4">

//         <div className="flex justify-between">

//           <div
//             className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles[color]}`}
//           >
//             {icon}
//           </div>

//           <span className="text-xs text-emerald-400">
//             {status}
//           </span>

//         </div>

//         <p className="mt-4 text-xs text-slate-500">
//           {label}
//         </p>

//         <p className="mt-1 text-xl font-semibold text-white">
//           {value}
//         </p>

//       </CardContent>
//     </Card>
//   );
// }

// function SectionTitle({
//   icon,
//   title,
//   subtitle,
//   badge,
// }) {
//   return (
//     <div className="flex items-start justify-between gap-3">

//       <div className="flex gap-3">

//         <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
//           {icon}
//         </div>

//         <div>

//           <CardTitle className="text-base text-white">
//             {title}
//           </CardTitle>

//           <p className="text-xs text-slate-500">
//             {subtitle}
//           </p>

//         </div>

//       </div>

//       {badge && (
//         <Badge className="bg-emerald-500/10 text-emerald-400">
//           {badge}
//         </Badge>
//       )}

//     </div>
//   );
// }

// function Measurement({
//   title,
//   value,
//   unit,
//   standard,
// }) {
//   return (
//     <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-4">

//       <p className="text-xs text-slate-500">
//         {title}
//       </p>

//       <p className="mt-2 text-2xl font-semibold text-white">
//         {value}{" "}
//         <span className="text-sm text-slate-400">
//           {unit}
//         </span>
//       </p>

//       <div className="mt-4 flex justify-between border-t border-slate-800 pt-3">

//         <span className="text-xs text-slate-500">
//           Standard
//         </span>

//         <span className="text-xs text-emerald-400">
//           {standard}
//         </span>

//       </div>

//     </div>
//   );
// }

// function VisionCard({
//   eye,
//   acuity,
//   corrected,
// }) {
//   return (
//     <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-4">

//       <div className="flex justify-between">

//         <p className="text-sm font-medium text-white">
//           {eye}
//         </p>

//         <Badge className="bg-emerald-500/10 text-emerald-400">
//           Normal
//         </Badge>

//       </div>

//       <div className="mt-5 flex justify-between">

//         <div>
//           <p className="text-xs text-slate-500">
//             Visual Acuity
//           </p>

//           <p className="text-3xl font-bold text-white">
//             {acuity}
//           </p>
//         </div>

//         <div className="text-right">
//           <p className="text-xs text-slate-500">
//             Corrected
//           </p>

//           <p className="text-sm text-slate-300">
//             {corrected}
//           </p>
//         </div>

//       </div>

//     </div>
//   );
// }

// function ScreeningResult({
//   title,
//   value,
//   description,
// }) {
//   return (
//     <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#080e1b] p-4">

//       <div>
//         <p className="text-sm font-medium text-white">
//           {title}
//         </p>

//         <p className="text-xs text-slate-500">
//           {description}
//         </p>
//       </div>

//       <Badge className="bg-emerald-500/10 text-emerald-400">
//         {value}
//       </Badge>

//     </div>
//   );
// }

// function Result({
//   label,
//   value,
// }) {
//   return (
//     <div>

//       <p className="text-xs text-slate-500">
//         {label}
//       </p>

//       <p className="mt-1 text-sm font-medium text-white">
//         {value}
//       </p>

//     </div>
//   );
// }

// function InfoCard({
//   title,
//   children,
// }) {
//   return (
//     <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-4">

//       <p className="mb-4 text-sm font-semibold text-white">
//         {title}
//       </p>

//       {children}

//     </div>
//   );
// }

// function Note({ text  }) {
//   return (
//     <div className="rounded-xl border border-slate-800 p-4">

//       <p className="text-xs text-slate-500">
//         Remarks
//       </p>

//       <p className="mt-1 text-sm text-slate-300">
//         {text}
//       </p>

//     </div>
//   );
// }

// function StatusLine({
//   label,
//   value,
// }) {
//   return (
//     <div className="flex justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">

//       <span className="text-xs text-slate-500">
//         {label}
//       </span>

//       <span className="text-xs text-emerald-400">
//         {value}
//       </span>

//     </div>
//   );
// }

// function HistoryItem({
//   label,
//   value,
// }) {
//   return (
//     <div>

//       <p className="text-xs text-slate-500">
//         {label}
//       </p>

//       <div className="mt-1 rounded-lg border border-slate-800 bg-[#080e1b] px-3 py-2">
//         <p className="text-sm text-slate-300">
//           {value}
//         </p>
//       </div>

//     </div>
//   );
// }

// function SummaryValue({
//   label,
//   value,
// }) {
//   return (
//     <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-4 text-center">

//       <p className="text-xs text-slate-500">
//         {label}
//       </p>

//       <p className="mt-1 text-lg font-semibold text-white">
//         {value}
//       </p>

//     </div>
//   );
// }

// function OverallItem({
//   title,
//   value,
// }) {
//   return (
//     <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#080e1b] p-4">

//       <div>
//         <p className="text-xs text-slate-500">
//           {title}
//         </p>

//         <p className="mt-1 text-sm font-medium text-white">
//           {value}
//         </p>
//       </div>

//       <CheckCircle2 className="h-5 w-5 text-emerald-400" />

//     </div>
//   );
// }
"use client";

import {
  Activity,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Droplets,
  Ear,
  Eye,
  FileDown,
  HeartPulse,
  History,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Printer,
  Search,
  ShieldCheck,
  Smile,
  Stethoscope,
  Syringe,
  Users,
  X,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

function Card({
  children,
  className = "",
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border border-white/[0.07] bg-[#101827]/80 shadow-[0_15px_50px_rgba(0,0,0,.18)] backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Status({
  children,
  color = "green",
}) {
  const colors = {
    green: "bg-emerald-400/10 text-emerald-400 border-emerald-400/10",
    amber: "bg-amber-400/10 text-amber-400 border-amber-400/10",
    blue: "bg-cyan-400/10 text-cyan-400 border-cyan-400/10",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function Metric({
  icon: Icon,
  title,
  value,
  unit,
  status,
  color = "cyan",
}) {
  return (
    <Card className="group relative overflow-hidden p-5">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-${color}-400/5 blur-2xl transition-all duration-500 group-hover:scale-150`}
      />

      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400`}
        >
          <Icon size={19} />
        </div>
        <Status>{status}</Status>
      </div>

      <p className="mt-5 text-xs text-slate-500">{title}</p>

      <div className="mt-1 flex items-end gap-1">
        <span className="text-2xl font-semibold tracking-tight text-white">
          {value}
        </span>
        {unit && <span className="pb-1 text-xs text-slate-500">{unit}</span>}
      </div>
    </Card>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
          <Icon size={19} />
        </div>
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      <Status>Normal</Status>
    </div>
  );
}

function ProgressBar({
  value,
  color = "cyan",
}) {
  const colors = {
    cyan: "from-cyan-400 to-blue-500",
    green: "from-emerald-400 to-teal-500",
    purple: "from-violet-400 to-fuchsia-500",
  };

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${colors[color]}`}
      />
    </div>
  );
}

export default function HealthCheckOverview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070c16] text-slate-200">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[-20%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.035] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-5%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.035] blur-[120px]" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col border-r border-white/[0.06] bg-[#0a101c]/95 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/[0.06] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <HeartPulse size={19} className="text-white" />
            </div>

            <div>
              <p className="font-bold tracking-tight text-white">Svastha</p>
              <p className="text-[9px] uppercase tracking-widest text-cyan-400">
                Health Platform
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-500 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-600">
            Workspace
          </p>

          <nav className="space-y-1">
            {[
              [LayoutDashboard, "Dashboard"],
              [Users, "Students"],
              [Stethoscope, "Health Checks"],
            ].map(([Icon, name], index) => (
              <button
                key={String(name)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  index === 2
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                <Icon size={17} />
                <span>{name}</span>
                {index === 2 && (
                  <ChevronRight size={14} className="ml-auto opacity-60" />
                )}
              </button>
            ))}
          </nav>

          <div className="ml-5 mt-1 space-y-1 border-l border-white/[0.06] pl-4">
            {["General Screening", "Vision Screening", "Hearing Screening", "ENT Screening", "Dental Screening", "Immunization"].map(
              (item, index) => (
                <button
                  key={item}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs transition ${
                    index === 0
                      ? "text-cyan-400"
                      : "text-slate-600 hover:text-slate-300"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-auto border-t border-white/[0.06] p-5">
          <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/[0.04]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-400">
              <CircleUserRound size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Dr. Priya Sharma</p>
              <p className="text-[10px] text-slate-600">Medical Officer</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="relative min-h-screen lg:pl-[250px]">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070c16]/80 backdrop-blur-xl">
          <div className="flex h-20 items-center gap-4 px-5 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-white/[0.07] p-2 text-slate-400 lg:hidden"
            >
              <Menu size={19} />
            </button>

            <div className="hidden items-center gap-2 text-xs text-slate-600 md:flex">
              <span>Health Checks</span>
              <ChevronRight size={13} />
              <span className="text-slate-300">Overview</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 md:flex">
                <Search size={15} className="text-slate-600" />
                <input
                  placeholder="Search students..."
                  className="w-36 bg-transparent text-xs outline-none placeholder:text-slate-600"
                />
              </div>

              <button className="relative rounded-xl border border-white/[0.06] p-2.5 text-slate-500 hover:text-white">
                <Bell size={17} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-[10px] font-bold text-white">
                DP
              </div>
            </div>
          </div>
        </header>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8"
        >
          {/* Breadcrumb / title */}
          <motion.div variants={fadeUp} className="mb-7">
            <div className="mb-5 flex items-center gap-2 text-xs text-slate-600">
              <ArrowLeft size={14} />
              <span>Back to Health Checks</span>
            </div>

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-emerald-400">
                    Assessment Complete
                  </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                  Health Check Overview
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Comprehensive student health assessment · 17 Aug 2026
                </p>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-white">
                  <Printer size={15} />
                  Print
                </button>

                <button className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400">
                  <FileDown size={15} />
                  Download
                </button>
              </div>
            </div>
          </motion.div>

          {/* Student Hero */}
          <motion.div
            variants={fadeUp}
            className="relative mb-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#111d2f] to-[#0c1421] p-6"
          >
            <div className="absolute right-[-50px] top-[-100px] h-[300px] w-[300px] rounded-full bg-cyan-400/[0.06] blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-lg font-bold text-cyan-400 ring-1 ring-cyan-400/20">
                    AK
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#101a2a] bg-emerald-400" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-white">
                      Arjun Kumar
                    </h2>
                    <Status>Healthy</Status>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    SCH-104-001 · Class 6-A · Sunshine Public School
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-600">
                    <span>DOB · 12 Mar 2016</span>
                    <span>Age · 10</span>
                    <span>Gender · Male</span>
                    <span>Blood Group · A+</span>
                  </div>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-5">
                <div className="hidden text-right sm:block">
                  <p className="text-[10px] uppercase tracking-widest text-slate-600">
                    Overall health
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Excellent condition
                  </p>
                </div>

                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.04]">
                  <motion.div
                    initial={{ rotate: -90, pathLength: 0 }}
                    animate={{ rotate: -90, pathLength: 0.92 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-1 rounded-full border-[3px] border-cyan-400 border-l-transparent border-b-transparent"
                  />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">92</div>
                    <div className="text-[8px] text-slate-600">/100 SCORE</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Assessment info */}
          <motion.div
            variants={fadeUp}
            className="mb-6 grid gap-3 rounded-2xl border border-white/[0.06] bg-[#0d1523]/80 p-5 sm:grid-cols-2 lg:grid-cols-5"
          >
            {[
              ["Assessment Date", "17 Aug 2026"],
              ["Location", "Sunshine Public School"],
              ["Examiner", "Dr. Priya Sharma"],
              ["Assistant", "Riya Nair"],
              ["Designation", "Medical Officer"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  {label}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-300">
                  {value}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Metrics */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={Activity}
              title="Height"
              value="145"
              unit="cm"
              status="Normal"
            />
            <Metric
              icon={Zap}
              title="Weight"
              value="38"
              unit="kg"
              status="Normal"
            />
            <Metric
              icon={HeartPulse}
              title="BMI"
              value="18.1"
              status="Normal"
            />
            <Metric
              icon={Syringe}
              title="Immunization"
              value="Up to date"
              status="Complete"
            />

            <Metric
              icon={HeartPulse}
              title="Blood Pressure"
              value="108/68"
              unit="mmHg"
              status="Normal"
            />
            <Metric
              icon={Activity}
              title="Pulse"
              value="82"
              unit="bpm"
              status="Normal"
            />
            <Metric
              icon={Activity}
              title="Temperature"
              value="98.4"
              unit="°F"
              status="Normal"
            />
            <Metric
              icon={Droplets}
              title="SpO₂"
              value="99"
              unit="%"
              status="Normal"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            {/* Main column */}
            <div className="space-y-6">
              {/* Growth */}
              <Card className="p-6">
                <SectionHeader
                  icon={Activity}
                  title="Growth & BMI"
                  subtitle="Physical measurements and growth assessment"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["Height", "145", "cm", 68],
                    ["Weight", "38", "kg", 61],
                  ].map(([label, value, unit, progress]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-5"
                    >
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">
                          {label}
                        </span>
                        <span className="text-[10px] text-emerald-400">
                          Average
                        </span>
                      </div>

                      <div className="mt-3 text-2xl font-semibold text-white">
                        {value}
                        <span className="ml-1 text-xs text-slate-600">
                          {unit}
                        </span>
                      </div>

                      <div className="mt-4">
                        <ProgressBar value={Number(progress)} color="green" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border border-white/[0.05] bg-[#0b1320] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Body Mass Index</p>
                      <p className="mt-1 text-[10px] text-slate-700">
                        Calculated from height and weight
                      </p>
                    </div>
                    <Status>Normal</Status>
                  </div>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-tighter text-white">
                      18.1
                    </span>
                    <span className="mb-2 text-xs text-slate-600">
                      BMI · 65th percentile
                    </span>
                  </div>

                  <div className="mt-5">
                    <ProgressBar value={65} color="cyan" />
                  </div>
                </div>
              </Card>

              {/* Vision */}
              <Card className="p-6">
                <SectionHeader
                  icon={Eye}
                  title="Vision Screening"
                  subtitle="Visual acuity and eye health"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["Right Eye (OD)", "6/6"],
                    ["Left Eye (OS)", "6/6"],
                  ].map(([eye, value]) => (
                    <div
                      key={eye}
                      className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-5"
                    >
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">{eye}</span>
                        <Status>Normal</Status>
                      </div>
                      <p className="mt-5 text-3xl font-semibold text-white">
                        {value}
                      </p>
                      <p className="mt-1 text-[10px] text-emerald-400">
                        Corrected · 6/6
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ["Color Vision", "Normal"],
                    ["Strabismus", "Absent"],
                    ["Ocular Condition", "No"],
                  ].map(([a, b]) => (
                    <div
                      key={a}
                      className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-4"
                    >
                      <p className="text-[10px] text-slate-600">{a}</p>
                      <p className="mt-1 text-xs text-slate-300">{b}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border border-white/[0.05] bg-[#0b1320] p-4">
                  <p className="text-[10px] text-slate-600">Remarks</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    No abnormal visual findings detected. Visual acuity is
                    normal in both eyes.
                  </p>
                </div>
              </Card>

              {/* Hearing */}
              <Card className="p-6">
                <SectionHeader
                  icon={Ear}
                  title="Hearing Screening"
                  subtitle="Audiological assessment and hearing health"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  {["Right Ear", "Left Ear"].map((ear) => (
                    <div
                      key={ear}
                      className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{ear}</span>
                        <Status>Normal</Status>
                      </div>
                      <p className="mt-4 text-xs text-emerald-400">
                        No abnormality detected
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-5">
                    <p className="mb-4 text-xs font-medium text-white">
                      Whisper Test
                    </p>

                    <div className="grid grid-cols-2 gap-5 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-600">Right Ear</p>
                        <p className="mt-1 text-emerald-400">Pass</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600">Left Ear</p>
                        <p className="mt-1 text-emerald-400">Pass</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-5">
                    <p className="mb-4 text-xs font-medium text-white">
                      Speech Assessment
                    </p>

                    <div className="grid grid-cols-2 gap-5 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-600">Right</p>
                        <p className="mt-1 text-emerald-400">100%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600">Left</p>
                        <p className="mt-1 text-emerald-400">100%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/[0.05] bg-[#0b1320] p-5">
                  <p className="text-[10px] text-slate-600">Tympanometry</p>
                  <div className="mt-2 flex gap-10 text-xs">
                    <span>
                      Right Ear <b className="ml-2 text-white">Type A</b>
                    </span>
                    <span>
                      Left Ear <b className="ml-2 text-white">Type A</b>
                    </span>
                  </div>
                </div>
              </Card>

              {/* Dental */}
              <Card className="p-6">
                <SectionHeader
                  icon={Smile}
                  title="Dental Screening"
                  subtitle="Oral health and dental examination"
                />

                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Oral Hygiene", "Good"],
                    ["Gingival Health", "Healthy"],
                    ["Plaque", "Mild"],
                  ].map(([a, b]) => (
                    <div
                      key={a}
                      className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-4"
                    >
                      <p className="text-[10px] text-slate-600">{a}</p>
                      <p className="mt-2 text-xs font-medium text-emerald-400">
                        {b}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[
                    ["Caries", "2"],
                    ["Other Issues", "1"],
                    ["Healthy", "25"],
                    ["Missing", "0"],
                  ].map(([a, b]) => (
                    <div
                      key={a}
                      className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-4 text-center"
                    >
                      <p className="text-[10px] text-slate-600">{a}</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {b}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.035] p-5">
                  <div className="flex flex-col justify-between gap-5 md:flex-row">
                    <div>
                      <p className="text-[10px] text-slate-600">Current Tooth</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        Tooth 16{" "}
                        <span className="text-xs font-normal text-slate-500">
                          (Upper Right First Molar)
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] text-slate-600">Status</p>
                        <p className="mt-1 text-xs text-amber-400">Caries</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600">Severity</p>
                        <p className="mt-1 text-xs text-white">Moderate</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600">Treatment</p>
                        <p className="mt-1 text-xs text-white">Restoration</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ENT */}
              <Card className="p-6">
                <SectionHeader
                  icon={Stethoscope}
                  title="ENT Screening"
                  subtitle="Ear, nose and throat assessment"
                />

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ["Nose", "Normal"],
                    ["Throat", "Normal"],
                    ["Tonsils", "Normal"],
                    ["Lymph Nodes", "No abnormality"],
                  ].map(([a, b]) => (
                    <div
                      key={a}
                      className="rounded-xl border border-white/[0.05] bg-[#0b1320] p-4"
                    >
                      <p className="text-[10px] text-slate-600">{a}</p>
                      <p className="mt-2 text-xs text-emerald-400">{b}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right sidebar */}
            <aside className="space-y-5">
              {/* Blood */}
              <Card className="p-5">
                <p className="text-xs font-semibold text-white">Blood Group</p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-400/10 text-sm font-bold text-rose-400">
                    A+
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">A+</p>
                    <p className="text-[10px] text-slate-600">
                      Blood group recorded
                    </p>
                  </div>
                </div>
              </Card>

              {/* Immunization */}
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                      <Syringe size={16} />
                    </div>
                    <p className="text-xs font-semibold text-white">
                      Immunization
                    </p>
                  </div>
                  <Status>Up to date</Status>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    ["Recommended vaccines", "Completed"],
                    ["Vaccination status", "Up to date"],
                    ["Next review", "As scheduled"],
                  ].map(([a, b]) => (
                    <div key={a} className="flex justify-between">
                      <span className="text-[10px] text-slate-600">{a}</span>
                      <span className="text-[10px] text-emerald-400">{b}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* History */}
              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <History size={15} className="text-cyan-400" />
                  <p className="text-xs font-semibold text-white">
                    Health History
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["Allergies", "None"],
                    ["Chronic Disease", "None"],
                    ["Previous Condition", "None reported"],
                    ["Surgeries", "None"],
                    ["Medications", "None"],
                  ].map(([a, b]) => (
                    <div key={a}>
                      <p className="mb-1 text-[9px] text-slate-600">{a}</p>
                      <div className="rounded-lg border border-white/[0.05] bg-[#0b1320] px-3 py-2 text-[10px] text-slate-400">
                        {b}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Risk */}
              <Card className="p-5">
                <p className="text-xs font-semibold text-white">Risk Factors</p>

                <div className="mt-5 space-y-3">
                  {[
                    ["Frequent Ear Infections", "No"],
                    ["Speech Delay", "No"],
                    ["Learning Difficulty", "No"],
                    ["Family History", "No"],
                    ["Noise Exposure", "No"],
                  ].map(([a, b]) => (
                    <div key={a} className="flex justify-between text-[10px]">
                      <span className="text-slate-600">{a}</span>
                      <span className="text-emerald-400">{b}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Referral */}
              <Card className="border-amber-400/20 bg-gradient-to-br from-amber-400/[0.06] to-[#101827] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">
                    Referral & Follow-up
                  </p>
                  <Status color="amber">Routine</Status>
                </div>

                <div className="mt-5 space-y-4 text-xs">
                  <div>
                    <p className="text-[9px] text-slate-600">Type</p>
                    <p className="mt-1 text-slate-300">Dental</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600">Referred To</p>
                    <p className="mt-1 text-slate-300">Dental Clinic</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600">Reason</p>
                    <p className="mt-1 text-slate-300">Minor dental caries</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600">Follow-up</p>
                    <p className="mt-1 text-cyan-400">6 months</p>
                  </div>
                </div>
              </Card>

              {/* Notes */}
              <Card className="p-5">
                <p className="text-xs font-semibold text-white">
                  Clinical Notes
                </p>

                <div className="mt-4 rounded-xl border border-white/[0.05] bg-[#0b1320] p-4">
                  <p className="text-xs leading-5 text-slate-400">
                    Student is generally healthy. Growth parameters are within
                    the expected range. Vision and hearing screenings show no
                    significant concerns. Mild dental findings noted and
                    routine dental follow-up is recommended.
                  </p>
                </div>
              </Card>
            </aside>
          </div>

          {/* Overall assessment */}
          <Card className="mt-6 overflow-hidden p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Overall Assessment
                  </h2>
                  <p className="text-xs text-slate-500">
                    Summary of comprehensive health screening
                  </p>
                </div>
              </div>

              <Status>Healthy</Status>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
              {[
                ["Growth", "Normal"],
                ["Vision", "Normal"],
                ["Hearing", "Normal"],
                ["Dental", "Good"],
                ["ENT", "Normal"],
                ["Immunization", "Up to date"],
              ].map(([a, b]) => (
                <div
                  key={a}
                  className="group rounded-xl border border-white/[0.05] bg-[#0b1320] p-4 transition hover:border-cyan-400/20"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-600">{a}</p>
                    <CheckCircle2
                      size={13}
                      className="text-emerald-400 opacity-60"
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-300">
                    {b}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <p className="text-xs font-semibold text-white">
                Recommendations
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  "Maintain a balanced diet and regular physical activity.",
                  "Continue routine dental hygiene practices.",
                  "Follow up with a dentist in 6 months.",
                  "Continue regular health screening.",
                  "Keep immunizations up to date.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-xs text-slate-400"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-col justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-600">
                  Examined by
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  Dr. Priya Sharma
                </p>
                <p className="text-[10px] text-slate-600">Medical Officer</p>
              </div>

              <div className="font-serif text-xl italic text-cyan-400">
                Priya Sharma
              </div>
            </div>
          </Card>

          <footer className="py-8 text-center text-[10px] text-slate-700">
            Svastha Health Platform · Confidential Student Health Record
          </footer>
        </motion.div>
      </main>
    </div>
  );
}