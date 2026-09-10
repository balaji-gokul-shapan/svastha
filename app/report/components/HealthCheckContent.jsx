"use client";

import { useRef } from "react";
import {
  Activity,
  CheckCircle2,
  Ear,
  Eye,
  HeartPulse,
  Syringe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useScreeningRecord } from "@/components/students/getScreeningRecord";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import ToothIcon from "@/app/health-checks/dental-screening/asset/toothIcon";
import { useAppSelector } from "@/lib/hooks";

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

function Info({ label, value }) {
  return (
    <div>
      <h6 className="text-[11px] text-muted-foreground">{label}</h6>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function StatusCard({ icon: Icon, title, status, toneClass, iconClass }) {
  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full ${iconClass}`}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="text-xs font-medium">{title}</p>
      <p className="mt-0.5 text-xs opacity-85">{status}</p>
    </div>
  );
}

function ReportRow({
  area,
  finding,
  remark,
  pdfClass = "",
  showRemarks = true,
  padClass = "py-3",
}) {
  return (
    <tr data-pdf-section="report-header" data-pdf-row={pdfClass}>
      <td className={`px-4 ${padClass} text-foreground`}>{area}</td>
      <td className={`px-4 ${padClass} font-medium text-foreground`}>
        {finding}
      </td>
      {showRemarks ? (
        <td className={`px-4 ${padClass} text-muted-foreground`}>{remark}</td>
      ) : null}
    </tr>
  );
}

function MobileReportCard({ area, finding, remark, showRemarks = true }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{area}</p>
        <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
          {finding}
        </span>
      </div>
      {showRemarks ? (
        <p className="mt-2 text-xs text-muted-foreground">{remark}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDateTime(date) {
  if (!date) return "--";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function calculateAge(dob) {
  if (!dob) return "--";
  const birthDate = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years} Years ${months} Months`;
}

/* -------------------------------------------------------------------------- */
/* Main component — page-level (no modal wrapper)                             */
/* -------------------------------------------------------------------------- */

export default function HealthCheckContent({ student }) {
  const reportRef = useRef(null);

  const studentName = student?.name ?? student?.student_name ?? "Student";
  const studentPhoto =
    student?.profileImage ??
    student?.profile_image ??
    student?.student_image ??
    student?.image ??
    student?.photo ??
    "";

  const classValue = student?.class ?? student?.Class ?? "--";
  const sectionValue = student?.sec ?? student?.section ?? "--";
  const admissionNo = student?.admission_number ?? "--";
  const dobValue = student?.dob ?? "--";

  const studentIdentifier = String(
    student?.student_id ??
      student?.id ??
      student?.studentId ??
      student?.cus_id ??
      "",
  ).trim();
   

  const reportSettings = useAppSelector((state) => state.reportSettings);
  const reportSection = reportSettings?.reportSection ?? {};

  const showStudentInfo = reportSection.student_info ?? true;
  const showVitals = reportSection.vitals ?? true;
  const showVision = reportSection.vision ?? true;
  const showHearing = reportSection.hearing ?? true;
  const showDental = reportSection.dental ?? true;
  const showImmunization = reportSection.immunization ?? true;
  const showRecommendations = reportSection.recommendations ?? true;
  const getGridCount = [showVision, showHearing, showDental, showVitals, showImmunization].filter(Boolean);
  console.log(getGridCount,"getGridCount");
  

  const reportTemplate = reportSettings?.reportTemplate ?? "detailed";
  const showStatusCards = reportTemplate !== "summary";
  const showRemarks = reportTemplate !== "compact";

  const tableDensity = reportSettings?.tableDensity ?? "comfortable";
  const rowPadClass = tableDensity === "compact" ? "py-1.5" : "py-3";

  const showLetterhead = reportSettings?.schoolHead ?? false;

  const {
    generalScreeningRecord,
    hearingScreeningRecord,
    dentalScreeningRecord,
    visionScreeningRecord,
    isLoading: screeningLoading,
  } = useScreeningRecord({ getId: studentIdentifier });

  console.log({generalScreeningRecord}, "dddddd");
  console.log({visionScreeningRecord}, "ssssss");
  

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc
            .querySelectorAll("[data-pdf-hide]")
            .forEach((el) => el.style.setProperty("display", "none", "important"));

          const reportRoot = clonedDoc.querySelector("[data-pdf-report]");
          if (reportRoot) {
            reportRoot
              .querySelectorAll("h1, h2, h3, h4, h5, h6")
              .forEach((h) => h.style.setProperty("color", "#00a4e3", "important"));
            reportRoot
              .querySelectorAll("p, li, span")
              .forEach((el) => el.style.setProperty("color", "#000000", "important"));
          }

          const reportHeader = clonedDoc.querySelector('[data-pdf-section="report-header"]');
          if (reportHeader) {
            reportHeader.style.setProperty("background-color", "#f3f4f6", "important");
            reportHeader.style.setProperty("color", "#000000", "important");
            reportHeader.querySelectorAll("th").forEach((th) => {
              th.style.setProperty("background-color", "#f3f4f6", "important");
              th.style.setProperty("color", "#000000", "important");
              th.style.setProperty("border-color", "#d1d5db", "important");
            });
          }

          const pdfColors = {
            physical: { background: "#ffffff", text: "#222222", border: "#e5e7eb" },
            vision: { background: "#ffffff", text: "#222222", border: "#e5e7eb" },
            hearing: { background: "#ffffff", text: "#222222", border: "#e5e7eb" },
            dental: { background: "#ffffff", text: "#222222", border: "#e5e7eb" },
            immunization: { background: "#ffffff", text: "#222222", border: "#e5e7eb" },
          };

          Object.entries(pdfColors).forEach(([type, colors]) => {
            const rows = clonedDoc.querySelectorAll(`[data-pdf-row="${type}"]`);
            rows.forEach((row) => {
              row.querySelectorAll("td").forEach((cell) => {
                cell.style.setProperty("background-color", colors.background, "important");
                cell.style.setProperty("color", colors.text, "important");
                cell.style.setProperty("border-color", colors.border, "important");
              });
            });
          });

          const recommendations = clonedDoc.querySelector('[data-pdf-section="recommendations"]');
          if (recommendations) {
            recommendations.style.setProperty("background-color", "#ffffff", "important");
            recommendations.style.setProperty("color", "#000000", "important");
            recommendations.style.setProperty("border-color", "#e5e7eb", "important");
            recommendations
              .querySelectorAll("*")
              .forEach((child) => child.style.setProperty("background-color", "transparent", "important"));
            recommendations
              .querySelectorAll("h1, h2, h3, h4, h5, h6")
              .forEach((h) => h.style.setProperty("color", "#00a4e3", "important"));
            recommendations
              .querySelectorAll("p, li, span")
              .forEach((el) => el.style.setProperty("color", "#000000", "important"));
            recommendations
              .querySelectorAll("svg")
              .forEach((icon) => icon.style.setProperty("color", "#16a34a", "important"));
          }

          if (reportRoot) {
            reportRoot.style.setProperty("background-color", "#ffffff", "important");
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Equal left/right margin: 6mm each side
      const marginX = 6;
      const imgWidth = pageWidth - marginX * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;
      pdf.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 12;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${studentName || "student"}-health-report.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-5 px-2">
      {/* <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sf text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Health Check Report
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Academic Year: {student?.academic_year ?? "2026-2027"}
          </p>
        </div>
        <div className="flex flex-row gap-2">
          {showLetterhead ? (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
              {student?.school_name ?? "SchoolName"}
            </div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadPDF}
            className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary"
          >
            Download PDF
          </Button>
        </div>
      </div> */}

      <div ref={reportRef} data-pdf-report className="space-y-6 py-2">
        {showStudentInfo ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              <Info label="Student Name" value={studentName} />
              <Info label="Date of Birth" value={dobValue} />
              <Info label="Age" value={calculateAge(dobValue)} />
              <Info label="Admission No" value={admissionNo} />
              <Info label="Gender" value={student?.gender ?? "--"} />
              <Info label="Class / Section" value={`${classValue}-${sectionValue}`} />
              <Info
                label="Health Check Date"
                value={formatDateTime(student?.updated_at ?? student?.updatedAt)}
              />
            </div>
            <div className="flex justify-start sm:justify-end">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {studentPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={studentPhoto} alt="Student" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Paste Photo here</span>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {showStatusCards ? (
          <section className={`grid grid-cols-2 gap-3 sm:grid-cols-${getGridCount.length}`}>
            {showVitals ? (
              <StatusCard
                iconClass="text-success bg-success/50"
                icon={Activity}
                title="Physical Health"
                status="Normal"
                toneClass="bg-success/10 text-success border-success/30"
              />
            ) : null}
            {showVision ? (
              <StatusCard
                iconClass="text-info bg-info/50"
                icon={Eye}
                title="Vision"
                status="Normal"
                toneClass="bg-info/10 text-info border-info/30"
              />
            ) : null}
            {showHearing ? (
              <StatusCard
                iconClass="text-primary bg-primary/50"
                icon={Ear}
                title="Hearing"
                status="Normal"
                toneClass="bg-primary/10 text-primary border-primary/30"
              />
            ) : null}
            {showDental ? (
              <StatusCard
                iconClass="text-warning bg-warning/50"
                icon={ToothIcon}
                title="Oral Health"
                status="Good"
                toneClass="bg-warning/10 text-warning border-warning/30"
              />
            ) : null}
            {showImmunization ? (
              <StatusCard
                iconClass="text-destructive bg-destructive/50"
                icon={Syringe}
                title="Immunization"
                status="Up to Date"
                toneClass="bg-destructive/10 text-destructive border-destructive/30"
              />
            ) : null}
          </section>
        ) : null}

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Summary</h3>
          <div className="hidden overflow-hidden rounded-lg border sm:block">
            <table className="w-full text-sm">
              <thead data-pdf-section="report-header" className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Findings</th>
                  {showRemarks ? <th className="px-4 py-3 font-semibold">Remarks</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y">
                {showVitals ? (
                  <ReportRow area="Physical Examination" finding="Normal" remark="No significant abnormalities" pdfClass="physical" showRemarks={showRemarks} padClass={rowPadClass} />
                ) : null}
                {showVision ? (
                  <ReportRow area="Vision Screening" finding="Normal" remark="6/6 in both eyes" pdfClass="vision" showRemarks={showRemarks} padClass={rowPadClass} />
                ) : null}
                {showHearing ? (
                  <ReportRow area="Hearing Screening" finding="Normal" remark="Hearing normal in both ears" pdfClass="hearing" showRemarks={showRemarks} padClass={rowPadClass} />
                ) : null}
                {showDental ? (
                  <ReportRow area="Dental Check-up" finding="Good" remark="Mild plaque deposits. No caries." pdfClass="dental" showRemarks={showRemarks} padClass={rowPadClass} />
                ) : null}
                {showImmunization ? (
                  <ReportRow area="Immunization" finding="Up to Date" remark="All recommended vaccines completed" pdfClass="immunization" showRemarks={showRemarks} padClass={rowPadClass} />
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 sm:hidden">
            {showVitals ? <MobileReportCard area="Physical Examination" finding="Normal" remark="No significant abnormalities" showRemarks={showRemarks} /> : null}
            {showVision ? <MobileReportCard area="Vision Screening" finding="Normal" remark="6/6 in both eyes" showRemarks={showRemarks} /> : null}
            {showHearing ? <MobileReportCard area="Hearing Screening" finding="Normal" remark="Hearing normal in both ears" showRemarks={showRemarks} /> : null}
            {showDental ? <MobileReportCard area="Dental Check-up" finding="Good" remark="Mild plaque deposits. No caries." showRemarks={showRemarks} /> : null}
            {showImmunization ? <MobileReportCard area="Immunization" finding="Up to Date" remark="All recommended vaccines completed" showRemarks={showRemarks} /> : null}
          </div>
        </section>

        {showRecommendations ? (
          <>
            <section data-pdf-section="recommendations" className="rounded-lg border bg-muted/40 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Recommendations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Maintain balanced diet and regular exercise.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Continue good oral hygiene practices.
                </li>
              </ul>
            </section>

            <section className="flex flex-col items-end p-4">
              <div className="flex justify-start sm:justify-end">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-dotted border bg-muted">
                  {studentPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={studentPhoto} alt="Student" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No signature Photo</span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-semibold text-foreground">Dr. Aravind</h3>
                <h6 className="text-[11px] text-muted-foreground">MBBS FRCS</h6>
              </div>
              <p className="text-xs text-muted-foreground">School Health Officer</p>
              <p className="text-xs text-muted-foreground">Svastha Health Services</p>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

