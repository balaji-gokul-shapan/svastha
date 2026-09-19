"use client";

import { isValidElement, useRef, useState } from "react";
import Image from "next/image";
import { useAppDispatch } from "@/lib/hooks";

import {
  Activity,
  BadgeCent,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  Copy,
  Ear,
  Eye,
  FileText,
  Hash,
  HeartPulse,
  IdCard,
  IdCardLanyard,
  School,
  Syringe,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useScreeningRecord } from "@/components/students/getScreeningRecord";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import ToothIcon from "@/app/health-checks/dental-screening/asset/toothIcon";
import { useAppSelector } from "@/lib/hooks";
import { Badge } from "@/components/ui/badge";

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

/* Small pill card: icon + muted label on top, bold value below, and a
   click-to-copy icon button on the right when `hasCopy` is true.
   `icon` accepts EITHER a lucide component (icon={Hash}) or a ready-made
   React node (icon={<Image src="/logo.svg" width={16} height={16} alt="" />}).
   `valueClass` lets IDs like SvasthaID keep their brand-green highlight.
   `data-pdf-hide` keeps the copy chrome out of the exported PDF. */
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

  // icon can be either a component (lucide's Hash/FileText — which are
  // forwardRef objects, not plain functions, so check isValidElement instead)
  // or a ready-made element node like <Image src="/logo.svg" ... />.
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

/* Card tones per health domain — colors come from the global domain tokens
   (--domain-*, --domain-*-soft/border/foreground in globals.css), so the
   report cards always match the app theme (dental = oral amber, vision = sky
   blue, ...). Pass `tone="oral"` etc.; `status` still drives the Badge. */
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

/* Status only decides the Badge variant — card background stays domain-owned. */
const STATUS_TONE = {
  good: { variant: "good" },
  normal: { variant: "normal" },
  warning: { variant: "warning" },
  bad: { variant: "bad" },
  severe: { variant: "severe" },
  critical: { variant: "severe" },
  uptodate: { variant: "good" },
  abnormal: { variant: "bad" },
  poor: { variant: "bad" },
};

function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function resolveTone(status) {
  return STATUS_TONE[normalizeKey(status)] ?? null;
}

function resolveDomain(toneOrTitle) {
  const key = normalizeKey(toneOrTitle);
  if (DOMAIN_TONE[key]) return DOMAIN_TONE[key];
  // Fallback so titles like "Physical Health" / "Oral Health" still match
  // their domain when no explicit `tone` prop is passed.
  const found = Object.keys(DOMAIN_TONE).find((k) => key.includes(k));
  return found ? DOMAIN_TONE[found] : null;
}

function StatusCard({ icon: Icon, title, status, tone, toneClass, iconClass }) {
  const badgeTone = resolveTone(status);
  const domainTone = resolveDomain(tone ?? title);
  const resolvedTone = toneClass ?? domainTone?.toneClass ?? "";
  const resolvedIconBg = iconClass ?? domainTone?.iconClass ?? "";
  const resolvedVariant = badgeTone?.variant ?? "outline";

  return (
    <div className={`rounded-lg border p-3 ${resolvedTone}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full ${resolvedIconBg}`}
        >
          <Icon className="size-4" />
        </div>
        <Badge variant={resolvedVariant} className="mt-0.5 text-xs opacity-85">{status}</Badge>
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

export default function HealthCheckContent({
  selectUser,
  student,
  branch: branchProp,
  camp,
}) {
  const reportRef = useRef(null);
  console.log(camp,"campcamp");
  

  const studentName = student?.name ?? student?.student_name ?? "Student";
  const studentPhoto =
    student?.image_path ??
    student?.profile_image ??
    student?.student_image ??
    student?.image ??
    student?.photo ??
    "";
  // The selected branch is supplied by the School Name dropdown. Fall back to
  // the signed-in account only when a branch has not been selected yet.
  const selectedSchool = branchProp ?? selectUser?.branch ?? selectUser;
  console.log(selectUser, "selectedSchool");

  const schoolName =
    selectedSchool?.label ??
    selectedSchool?.branch_name ??
    selectedSchool?.name ??
    selectedSchool?.school_name ??
    "--";

  // School / branch address — same field conventions as the branch-options
  // `toOption` mapping, read from the selected School Name option.
  const schoolAddress = {
    address_line_1:
      String(
        selectedSchool?.address_line_1 ?? selectedSchool?.address_line1 ?? "",
      ).trim() || null,
    address_line_2:
      String(
        selectedSchool?.address_line_2 ?? selectedSchool?.address_line2 ?? "",
      ).trim() || null,
    area: String(selectedSchool?.area ?? "").trim() || null,
    city: String(selectedSchool?.city ?? "").trim() || null,
    state: String(selectedSchool?.state ?? "").trim() || null,
    country: String(selectedSchool?.country ?? "").trim() || null,
    pincode:
      String(
        selectedSchool?.pincode ??
          selectedSchool?.pin_code ??
          selectedSchool?.zip ??
          "",
      ).trim() || null,
    registration_number:
      String(
        selectedSchool?.registration_number ?? selectedSchool?.reg_no ?? "",
      ).trim() || null,
  };
  const schoolAddressText = [
    schoolAddress.address_line_1,
    schoolAddress.address_line_2,
    schoolAddress.area,
    schoolAddress.city,
    schoolAddress.state,
    schoolAddress.country,
    schoolAddress.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const classValue = student?.class ?? student?.Class ?? "--";
  const sectionValue = student?.sec ?? student?.section ?? "--";
  const admissionNo = student?.admission_number ?? "--";
  const dobValue = student?.dob ?? "--";
  const uhid = student?.uhid ?? "--";
  const svasthaId = student?.svastha_id;
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

  const getGridCount = [
    showVision,
    showHearing,
    showDental,
    showVitals,
    showImmunization,
  ].filter(Boolean);
  console.log(getGridCount, "getGridCount");

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
  } = useScreeningRecord({
    getId: studentIdentifier,
    campId: camp?.id ?? camp?.campId ?? "",
  });

  console.log({ generalScreeningRecord }, "dddddd");
  console.log({ visionScreeningRecord }, "ssssss");

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
            .forEach((el) =>
              el.style.setProperty("display", "none", "important"),
            );

          const reportRoot = clonedDoc.querySelector("[data-pdf-report]");
          if (reportRoot) {
            reportRoot
              .querySelectorAll("h1, h2, h3, h4, h5, h6")
              .forEach((h) =>
                h.style.setProperty("color", "#00a4e3", "important"),
              );
            reportRoot
              .querySelectorAll("p, li, span")
              .forEach((el) =>
                el.style.setProperty("color", "#000000", "important"),
              );
          }

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
            recommendations
              .querySelectorAll("*")
              .forEach((child) =>
                child.style.setProperty(
                  "background-color",
                  "transparent",
                  "important",
                ),
              );
            recommendations
              .querySelectorAll("h1, h2, h3, h4, h5, h6")
              .forEach((h) =>
                h.style.setProperty("color", "#00a4e3", "important"),
              );
            recommendations
              .querySelectorAll("p, li, span")
              .forEach((el) =>
                el.style.setProperty("color", "#000000", "important"),
              );
            recommendations
              .querySelectorAll("svg")
              .forEach((icon) =>
                icon.style.setProperty("color", "#16a34a", "important"),
              );
          }

          if (reportRoot) {
            reportRoot.style.setProperty(
              "background-color",
              "#ffffff",
              "important",
            );

            // The Summary table uses responsive show/hide (hidden sm:block vs
            // sm:hidden). html2canvas re-renders the clone in its own iframe where
            // the sm: breakpoint can resolve differently — if BOTH blocks end up
            // hidden you get a big blank gap before Recommendations. Force the
            // desktop summary table visible and the mobile block hidden in the PDF.
            reportRoot
              .querySelectorAll("[data-pdf-force-block]")
              .forEach((el) =>
                el.style.setProperty("display", "block", "important"),
              );
            reportRoot
              .querySelectorAll("[data-pdf-hide]")
              .forEach((el) =>
                el.style.setProperty("display", "none", "important"),
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

      <div
        ref={reportRef}
        data-pdf-report
        className="report-surface mx-auto w-full max-w-full space-y-6 rounded-lg border border-border px-4 py-8 text-foreground shadow-md sm:px-8 sm:py-10 md:max-w-[90%] md:px-10 lg:max-w-[210mm] lg:px-12 lg:py-12 print:shadow-none print:border-0"
      >
        {showStudentInfo ? (
          <section className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-center text-foreground">
                {schoolName}
              </h2>
              {schoolAddressText ? (
                <p className="-mt-4 mb-2 text-center text-xs text-muted-foreground">
                  {schoolAddressText || ""}
                </p>
              ) : (
                null
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <h6 className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5 shrink-0 text-primary" />
                <span className="whitespace-nowrap">
                  Academic Session: {student?.academic_year ?? "--"}
                </span>
              </h6>
              {/* <h2 className="text-center text-foreground">{schoolName || "dpokokw[ejrije[wrjiwrwr"}</h2>
              {schoolAddressText ? (
                <p className="-mt-4 mb-2 text-center text-xs text-muted-foreground">
                  {schoolAddressText || ""}
                </p>
              ) : null */}
            </div>
            {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
              <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                <Info label="Student Name" value={studentName} />
                <Info label="Age" value={} />
                <Info label="Gender" value={student?.gender ?? "--"} />
                <Info
                  label="Class / Section"
                  value={`${classValue}-${sectionValue}`}
                />
                <Info
                  label="Health Check Date"
                  value={formatDateTime(
                    student?.updated_at ?? student?.updatedAt,
                  )}
                />
              </div>
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
            </div> */}
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
                  <div className="flex flex-row gap-2 pb-1">
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
                status="poor"
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
          <div
            className="hidden overflow-hidden rounded-lg border sm:block"
            data-pdf-force-block
          >
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
          <div className="space-y-3 sm:hidden" data-pdf-hide>
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
                      No signature Photo
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Dr. Aravind
                </h3>
                <h6 className="text-[11px] text-muted-foreground">MBBS FRCS</h6>
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
      </div>
    </div>
  );
}
