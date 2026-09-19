"use client";

import { isValidElement, useRef, useState } from "react";
import Image from "next/image";
import {
  Activity,
  CalendarCheck,
  Check,
  CheckCircle2,
  Copy,
  Ear,
  Eye,
  HeartPulse,
  IdCard,
  IdCardLanyard,
  School,
  Syringe,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScreeningRecord } from "./getScreeningRecord";
import { usePathname } from "next/navigation";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import ToothIcon from "@/app/health-checks/dental-screening/asset/toothIcon";
import { useAppSelector } from "@/lib/hooks";

function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/* Status text → badge variant only. Card background stays domain-owned so
   dental/vision/hearing colors always match the global theme tokens. */
const STATUS_VARIANT = {
  good: "good",
  normal: "normal",
  warning: "warning",
  bad: "bad",
  severe: "severe",
  critical: "severe",
  uptodate: "good",
  abnormal: "bad",
  poor: "bad",
};

function StatusBadge({ status }) {
  const variant = STATUS_VARIANT[normalizeKey(status)] ?? "outline";
  return (
    <Badge variant={variant} className="mt-0.5 text-xs opacity-85">
      {status}
    </Badge>
  );
}

/* Per-domain gradient card tones — every color comes from the global tokens
   (--domain-*, --domain-*-soft/border/foreground in app/globals.css). */
const DOMAIN_TONE = {
  physical: {
    toneClass:
      "border-domain-physical-border bg-gradient-to-br from-domain-physical/25 via-domain-physical-soft to-domain-physical/[0.03] text-domain-physical-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-physical to-domain-physical/60 text-white shadow-sm",
  },
  vision: {
    toneClass:
      "border-domain-vision-border bg-gradient-to-br from-domain-vision/25 via-domain-vision-soft to-domain-vision/[0.03] text-domain-vision-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-vision to-domain-vision/60 text-white shadow-sm",
  },
  hearing: {
    toneClass:
      "border-domain-hearing-border bg-gradient-to-br from-domain-hearing/25 via-domain-hearing-soft to-domain-hearing/[0.03] text-domain-hearing-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-hearing to-domain-hearing/60 text-white shadow-sm",
  },
  oral: {
    toneClass:
      "border-domain-oral-border bg-gradient-to-br from-domain-oral/25 via-domain-oral-soft to-domain-oral/[0.03] text-domain-oral-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-oral to-domain-oral/60 text-white shadow-sm",
  },
  dental: {
    toneClass:
      "border-domain-oral-border bg-gradient-to-br from-domain-oral/25 via-domain-oral-soft to-domain-oral/[0.03] text-domain-oral-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-oral to-domain-oral/60 text-white shadow-sm",
  },
  immunization: {
    toneClass:
      "border-domain-immunization-border bg-gradient-to-br from-domain-immunization/25 via-domain-immunization-soft to-domain-immunization/[0.03] text-domain-immunization-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-immunization to-domain-immunization/60 text-white shadow-sm",
  },
};

function resolveDomainTone(toneOrTitle) {
  const key = normalizeKey(toneOrTitle);
  if (DOMAIN_TONE[key]) return DOMAIN_TONE[key];
  if (key.includes("physical") || key.includes("vital")) return DOMAIN_TONE.physical;
  if (key.includes("vision") || key.includes("eye")) return DOMAIN_TONE.vision;
  if (key.includes("hear")) return DOMAIN_TONE.hearing;
  if (
    key.includes("oral") ||
    key.includes("dental") ||
    key.includes("tooth")
  )
    return DOMAIN_TONE.oral;
  if (key.includes("immun")) return DOMAIN_TONE.immunization;
  return null;
}

function Info({ label, value }) {
  return (
    <div>
      <h6 className="text-[11px] text-muted-foreground">{label}</h6>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

/* Small pill card: icon + muted label on top, bold value below, and a
   click-to-copy icon button on the right when `hasCopy` is true.
   `icon` accepts EITHER a lucide component (icon={IdCard}) or a ready-made
   React node (icon={<Image src="/logo.svg" width={16} height={16} alt="" />}). */
function CopyableInfo({
  label,
  value,
  valueClass = "text-foreground",
  hasCopy = true,
  icon,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = String(value ?? "").trim();
    if (!text || text === "--") {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied`, { description: text });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(`Could not copy ${label}`);
    }
  };

  const IconNode = isValidElement(icon) ? icon : null;
  const LabelIcon = IconNode ? null : icon;

  return (
    <div className="flex w-fit items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <div>
        <h6 className="flex items-center gap-1 text-[11px] text-muted-foreground">
          {LabelIcon ? <LabelIcon className="size-4" /> : null}
          {IconNode ? <span className="inline-flex">{IconNode}</span> : null}
          {label}
        </h6>
        <p className={`text-sm font-bold ${valueClass}`}>{value}</p>
      </div>
      {hasCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          data-pdf-hide
        >
          {copied ? (
            <Check className="size-3.5 text-success" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      ) : null}
    </div>
  );
}

function StatusCard({ icon: Icon, title, status, tone, toneClass, iconClass }) {
  const domainTone = resolveDomainTone(tone ?? title);
  const resolvedTone = toneClass ?? domainTone?.toneClass ?? "";
  const resolvedIconBg = iconClass ?? domainTone?.iconClass ?? "";
  return (
    <div className={`rounded-lg border p-3 ${resolvedTone}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full ${resolvedIconBg}`}
        >
          <Icon className="size-4" />
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="text-xs font-bold">{title}</p>
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

export default function HealthCheckModal({ student }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const studentSlug = decodeURIComponent(
    pathname.split("/").filter(Boolean).at(-1) ?? "",
  );
  const reportRef = useRef(null);
  const studentName = student?.name ?? student?.student_name ?? "Student";
  const studentPhoto =
    student?.image_path ??
    student?.profile_image ??
    student?.student_image ??
    student?.image ??
    student?.photo ??
    "";

  const classValue = student?.class ?? student?.Class ?? "--";
  const sectionValue = student?.sec ?? student?.section ?? "--";
  const admissionNo = student?.admission_number ?? "--";
  const dobValue = student?.dob ?? "--";
  const uhid = student?.uhid ?? "--";
  const svasthaId = student?.svastha_id;

  // Use the real student identifier from the record — the URL slug is
  // lowercased by getStudentSlug(), which breaks backend lookups.
  const studentIdentifier = String(
    student?.student_id ??
      student?.id ??
      student?.studentId ??
      student?.cus_id ??
      "",
  ).trim();

  // Report customisation from Redux (Settings → Report) — controls which
  // sections render, table density, template detail and the letterhead.
  const reportSettings = useAppSelector((state) => state.reportSettings);
  const reportSection = reportSettings?.reportSection ?? {};

  const showStudentInfo = reportSection.student_info ?? true;
  const showVitals = reportSection.vitals ?? true;
  const showVision = reportSection.vision ?? true;
  const showHearing = reportSection.hearing ?? true;
  const showDental = reportSection.dental ?? true;
  const showImmunization = reportSection.immunization ?? true;
  const showRecommendations = reportSection.recommendations ?? true;
   const getGridCount = [
    showVision,
    showHearing,
    showDental,
    showVitals,
    showImmunization,
  ].filter(Boolean);


  // Number of visible status cards. Tailwind can't build a class from a
  // runtime value (e.g. `sm:grid-cols-${n}`), so map the count to explicit,
  // build-time-detectable class literals.
  const statusCardCount = getGridCount.length;
  const statusGridCols =
    {
      1: "sm:grid-cols-1",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-4",
      5: "sm:grid-cols-5",
    }[statusCardCount] ?? "sm:grid-cols-2";


  const reportTemplate = reportSettings?.reportTemplate ?? "detailed";
  // "summary" drops the quick-glance status cards; "compact" drops remarks.
  const showStatusCards = reportTemplate !== "summary";
  const showRemarks = reportTemplate !== "compact";

  const tableDensity = reportSettings?.tableDensity ?? "comfortable";
  const rowPadClass = tableDensity === "compact" ? "py-1.5" : "py-3";

  const showLetterhead = reportSettings?.schoolHead ?? false;
  const formatDateTime = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return "--";

    const birthDate = new Date(dob);
    const today = new Date();
    // let age = today.getFullYear() - birthDate.getFullYear();
    // if (!hasBirthdayPassed) {
    //     age--;
    //   }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
   

    if (today.getDate() < birthDate.getDate()) {
      months--;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} Years ${months} Months`;
  };
  const {
    generalScreeningRecord,
    hearingScreeningRecord,
    dentalScreeningRecord,
    visionScreeningRecord,
    isLoading: screeningLoading,
  } = useScreeningRecord({ getId: studentIdentifier });

  const handleDownloadPDF = async () => {
    const element = reportRef.current;

    if (!element) {
      console.error("Report element not found");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,

        onclone: (clonedDoc) => {
          // ==================================================
          // HIDE FROM PDF
          // ==================================================

          clonedDoc.querySelectorAll("[data-pdf-hide]").forEach((element) => {
            element.style.setProperty("display", "none", "important");
          });

          // ==================================================
          // ALL HEADINGS + P TAGS BLACK
          // ==================================================

          const reportRoot = clonedDoc.querySelector("[data-pdf-report]");

          if (reportRoot) {
            // Headings → blue
            reportRoot
              .querySelectorAll("h1, h2, h3, h4, h5, h6")
              .forEach((child) => {
                child.style.setProperty("color", "#00a4e3", "important");
              });

            // Paragraphs, list items, spans → black
            reportRoot.querySelectorAll("p, li, span").forEach((child) => {
              child.style.setProperty("color", "#000000", "important");
            });
          }

          // ==================================================
          // TABLE HEADER
          // ==================================================

          const reportHeader = clonedDoc.querySelector(
            '[data-pdf-section="report-header"]',
          );

          if (reportHeader) {
            reportHeader.style.setProperty(
              "background-color",
              "#f3f4f6",
              "important",
            );

            reportHeader.style.setProperty("color", "#000000", "important");

            reportHeader.querySelectorAll("th").forEach((th) => {
              th.style.setProperty("background-color", "#f3f4f6", "important");

              th.style.setProperty("color", "#000000", "important");

              th.style.setProperty("border-color", "#d1d5db", "important");
            });
          }

          // ==================================================
          // TABLE BODY
          // ==================================================

          const pdfColors = {
            physical: {
              background: "#ffffff",
              text: "#222222",
              border: "#e5e7eb",
            },

            vision: {
              background: "#ffffff",
              text: "#222222",
              border: "#e5e7eb",
            },

            hearing: {
              background: "#ffffff",
              text: "#222222",
              border: "#e5e7eb",
            },

            dental: {
              background: "#ffffff",
              text: "#222222",
              border: "#e5e7eb",
            },

            immunization: {
              background: "#ffffff",
              text: "#222222",
              border: "#e5e7eb",
            },
          };

          Object.entries(pdfColors).forEach(([type, colors]) => {
            const rows = clonedDoc.querySelectorAll(`[data-pdf-row="${type}"]`);

            rows.forEach((row) => {
              row.querySelectorAll("td").forEach((cell) => {
                cell.style.setProperty(
                  "background-color",
                  colors.background,
                  "important",
                );

                cell.style.setProperty("color", colors.text, "important");

                cell.style.setProperty(
                  "border-color",
                  colors.border,
                  "important",
                );
              });
            });
          });

          // ==================================================
          // RECOMMENDATIONS
          // ==================================================

          const recommendations = clonedDoc.querySelector(
            '[data-pdf-section="recommendations"]',
          );

          if (recommendations) {
            recommendations.style.setProperty(
              "background-color",
              "#ffffff",
              "important",
            );

            recommendations.style.setProperty("color", "#000000", "important");

            recommendations.style.setProperty(
              "border-color",
              "#e5e7eb",
              "important",
            );

            recommendations.querySelectorAll("*").forEach((child) => {
              child.style.setProperty(
                "background-color",
                "transparent",
                "important",
              );
            });

            recommendations
              .querySelectorAll("h1, h2, h3, h4, h5, h6")
              .forEach((child) => {
                child.style.setProperty("color", "#00a4e3", "important");
              });
            recommendations.querySelectorAll("p, li, span").forEach((child) => {
              child.style.setProperty("color", "#000000", "important");
            });

            recommendations.querySelectorAll("svg").forEach((icon) => {
              icon.style.setProperty("color", "#16a34a", "important");
            });
          }

          // ==================================================
          // REPORT BACKGROUND
          // ==================================================

          if (reportRoot) {
            reportRoot.style.setProperty(
              "background-color",
              "#ffffff",
              "important",
            );
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;

        pdf.addPage();

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

        heightLeft -= pageHeight;
      }

      pdf.save(`${studentName || "student"}-health-report.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="py-4"
        onClick={() => setOpen(true)}
      >
        <IdCard className="icon-lg" /> View Health Card
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-[95vw] max-h-[90vh] max-w-4xl overflow-y-auto rounded-xl border border-border bg-card p-0 shadow-xl">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10"
              aria-label="Close health check modal"
            >
              <X className="size-4" />
            </Button>
            <div className="border-b px-5 py-4 sm:px-7 ">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Health Check Report
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Academic Year: {student.academic_year ?? "2026-2027"}
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
                    // size="icon"
                    variant="ghost"
                    onClick={handleDownloadPDF}
                    className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>

            <div
              ref={reportRef}
              data-pdf-report
              className="report-surface mx-auto w-full max-w-full space-y-6 rounded-lg border border-border bg-white px-5 py-5 text-foreground shadow-md sm:px-7 md:max-w-[90%] lg:max-w-[210mm] print:border-0 print:shadow-none"
            >
              {showStudentInfo ? (
                <section className="space-y-4">
                  <div className="flex flex-col w-full">
                    <div className="flex flex-row gap-5">
                      <div className="flex justify-start sm:justify-end">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                          {studentPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={studentPhoto}
                              alt="Student"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Paste Photo here
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-col gap-1 w-full">
                        <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <h2 className="min-w-0 flex-1 basis-48 wrap-break-word font-bold leading-snug text-foreground">
                            {studentName}
                          </h2>
                        </div>
                        <div className="flex flex-row flex-wrap gap-2 pb-1">
                          <Badge variant="success" className="w-fit">
                            <span className="text-muted-foreground flex gap-1">
                              <School size={14} className="text-primary" />
                              Class {classValue}-{sectionValue}
                            </span>
                          </Badge>
                          <Badge variant="outline" className="w-fit">
                            <span className="text-muted-foreground font-bold">
                              {student?.gender ?? "--"}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex flex-row gap-3">
                          <Badge
                            variant="special"
                            className="bg-secondary border-secondary"
                          >
                            <span className="text-muted-foreground font-bold">
                              {calculateAge(dobValue)}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-stretch gap-3">
                      <CopyableInfo
                        label="Admission No"
                        value={admissionNo}
                        icon={IdCard}
                      />
                      <CopyableInfo
                        label="UHID No"
                        value={uhid}
                        icon={IdCardLanyard}
                      />
                      {svasthaId ? (
                        <CopyableInfo
                          label="SvasthaID No"
                          value={svasthaId}
                          valueClass="text-primary font-bold"
                          icon={
                            <Image
                              src="/logo.svg"
                              width={16}
                              height={16}
                              alt="svastha-id"
                            />
                          }
                        />
                      ) : null}
                      <CopyableInfo
                        label="Date of Birth"
                        value={dobValue}
                        icon={CalendarCheck}
                      />
                    </div>
                  </div>
                </section>
              ) : null}

              {showStatusCards ? (
          <section className={`grid grid-cols-2 gap-3 ${statusGridCols}`}>
                  {showVitals ? (
                    <StatusCard
                      icon={Activity}
                      title="Physical Health"
                      status="Normal"
                      tone="physical"
                    />
                  ) : null}
                  {showVision ? (
                    <StatusCard
                      icon={Eye}
                      title="Vision"
                      status="Normal"
                      tone="vision"
                    />
                  ) : null}
                  {showHearing ? (
                    <StatusCard
                      icon={Ear}
                      title="Hearing"
                      status="Normal"
                      tone="hearing"
                    />
                  ) : null}
                  {showDental ? (
                    <StatusCard
                      icon={ToothIcon}
                      title="Oral Health"
                      status="Good"
                      tone="oral"
                    />
                  ) : null}
                  {showImmunization ? (
                    <StatusCard
                      icon={Syringe}
                      title="Immunization"
                      status="Up to Date"
                      tone="immunization"
                    />
                  ) : null}
                </section>
              ) : null}

              <section>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Summary
                </h3>

                <div className="hidden overflow-hidden rounded-lg border sm:block">
                  <table className="w-full text-sm">
                    <thead
                      data-pdf-section="report-header"
                      className="bg-muted/40 text-left"
                    >
                      <tr>
                        <th className="px-4 py-3 font-semibold">Area</th>
                        <th className="px-4 py-3 font-semibold">Findings</th>
                        {showRemarks ? (
                          <th className="px-4 py-3 font-semibold">Remarks</th>
                        ) : null}
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {showVitals ? (
                        <ReportRow
                          area="Physical Examination"
                          finding="Normal"
                          remark="No significant abnormalities"
                          pdfClass="physical"
                          showRemarks={showRemarks}
                          padClass={rowPadClass}
                        />
                      ) : null}

                      {showVision ? (
                        <ReportRow
                          area="Vision Screening"
                          finding="Normal"
                          remark="6/6 in both eyes"
                          pdfClass="vision"
                          showRemarks={showRemarks}
                          padClass={rowPadClass}
                        />
                      ) : null}

                      {showHearing ? (
                        <ReportRow
                          area="Hearing Screening"
                          finding="Normal"
                          remark="Hearing normal in both ears"
                          pdfClass="hearing"
                          showRemarks={showRemarks}
                          padClass={rowPadClass}
                        />
                      ) : null}

                      {showDental ? (
                        <ReportRow
                          area="Dental Check-up"
                          finding="Good"
                          remark="Mild plaque deposits. No caries."
                          pdfClass="dental"
                          showRemarks={showRemarks}
                          padClass={rowPadClass}
                        />
                      ) : null}

                      {showImmunization ? (
                        <ReportRow
                          area="Immunization"
                          finding="Up to Date"
                          remark="All recommended vaccines completed"
                          pdfClass="immunization"
                          showRemarks={showRemarks}
                          padClass={rowPadClass}
                        />
                      ) : null}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 sm:hidden">
                  {showVitals ? (
                    <MobileReportCard
                      area="Physical Examination"
                      finding="Normal"
                      remark="No significant abnormalities"
                      showRemarks={showRemarks}
                    />
                  ) : null}
                  {showVision ? (
                    <MobileReportCard
                      area="Vision Screening"
                      finding="Normal"
                      remark="6/6 in both eyes"
                      showRemarks={showRemarks}
                    />
                  ) : null}
                  {showHearing ? (
                    <MobileReportCard
                      area="Hearing Screening"
                      finding="Normal"
                      remark="Hearing normal in both ears"
                      showRemarks={showRemarks}
                    />
                  ) : null}
                  {showDental ? (
                    <MobileReportCard
                      area="Dental Check-up"
                      finding="Good"
                      remark="Mild plaque deposits. No caries."
                      showRemarks={showRemarks}
                    />
                  ) : null}
                  {showImmunization ? (
                    <MobileReportCard
                      area="Immunization"
                      finding="Up to Date"
                      remark="All recommended vaccines completed"
                      showRemarks={showRemarks}
                    />
                  ) : null}
                </div>
              </section>

              {showRecommendations ? (
                <>
                  <section
                    data-pdf-section="recommendations"
                    className="rounded-lg border bg-muted/40 p-4"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-foreground">
                      Recommendations
                    </h3>

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
                          <img
                            src={studentPhoto}
                            alt="Student"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No signaure Photo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        Dr. Aravind
                      </h3>
                      <h6 className="text-[11px] text-muted-foreground">
                        MBBS FRCS
                      </h6>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      School Health Officer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Svastha Health Services
                    </p>
                  </section>
                </>
              ) : null}

              <div data-pdf-hide className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-4" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
