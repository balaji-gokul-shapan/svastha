"use client";

import { useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Ear,
  Eye,
  HeartPulse,
  IdCard,
  Syringe,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useScreeningRecord } from "./getScreeningRecord";
import { usePathname } from "next/navigation";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

function Info({ label, value }) {
  return (
    <div>
      <h6 className="text-[11px] text-muted-foreground">{label}</h6>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function StatusCard({ icon: Icon, title, status, toneClass }) {
  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="text-xs font-medium">{title}</p>
      <p className="mt-0.5 text-xs opacity-85">{status}</p>
    </div>
  );
}

function ReportRow({ area, finding, remark, pdfClass = "" }) {
  return (
    <tr data-pdf-section="report-header" data-pdf-row={pdfClass}>
      <td className="px-4 py-3 text-foreground">{area}</td>

      <td className="px-4 py-3 font-medium text-foreground">{finding}</td>

      <td className="px-4 py-3 text-muted-foreground">{remark}</td>
    </tr>
  );
}

function MobileReportCard({ area, finding, remark }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{area}</p>
        <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
          {finding}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{remark}</p>
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
  console.log(student, "student");

  // Use the real student identifier from the record — the URL slug is
  // lowercased by getStudentSlug(), which breaks backend lookups.
  const studentIdentifier = String(
    student?.cus_id ??
      student?.id ??
      student?.studentId ??
      student?.student_id ??
      "",
  ).trim();

  const {
    generalScreeningRecord,
    hearingScreeningRecord,
    isLoading: screeningLoading,
  } = useScreeningRecord({ getId: studentIdentifier });

  console.log(
    generalScreeningRecord,
    hearingScreeningRecord,
    "generalScreeningRecord",
  );
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
            recommendations
              .querySelectorAll("p, li, span")
              .forEach((child) => {
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
            <div className="border-b px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Health Check Report
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Academic Year: 2024-25
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                    {student?.school_name ?? "School"}
                  </div>
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
              className=" space-y-6 px-5 py-5 sm:px-7"
            >
              <section className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
                <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                  <Info label="Student Name" value={studentName} />
                  <Info label="Date of Birth" value={dobValue} />
                  <Info label="Admission No" value={admissionNo} />
                  <Info label="Gender" value={student?.gender ?? "--"} />
                  <Info
                    label="Class / Section"
                    value={`${classValue}-${sectionValue}`}
                  />
                  <Info
                    label="Health Check Date"
                    value={student?.updated_at ?? student?.updatedAt ?? "--"}
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
                        No Photo
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <StatusCard
                  icon={Activity}
                  title="Physical Health"
                  status="Normal"
                  toneClass="bg-success/10 text-success border-success/30"
                />
                <StatusCard
                  icon={Eye}
                  title="Vision"
                  status="Normal"
                  toneClass="bg-info/10 text-info border-info/30"
                />
                <StatusCard
                  icon={Ear}
                  title="Hearing"
                  status="Normal"
                  toneClass="bg-primary/10 text-primary border-primary/30"
                />
                <StatusCard
                  icon={HeartPulse}
                  title="Oral Health"
                  status="Good"
                  toneClass="bg-warning/10 text-warning border-warning/30"
                />
                <StatusCard
                  icon={Syringe}
                  title="Immunization"
                  status="Up to Date"
                  toneClass="bg-cyan-100 text-cyan-700 border-cyan-200"
                />
              </section>

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
                        <th className="px-4 py-3 font-semibold">Remarks</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      <ReportRow
                        area="Physical Examination"
                        finding="Normal"
                        remark="No significant abnormalities"
                        pdfClass="physical"
                      />

                      <ReportRow
                        area="Vision Screening"
                        finding="Normal"
                        remark="6/6 in both eyes"
                        pdfClass="vision"
                      />

                      <ReportRow
                        area="Hearing Screening"
                        finding="Normal"
                        remark="Hearing normal in both ears"
                        pdfClass="hearing"
                      />

                      <ReportRow
                        area="Dental Check-up"
                        finding="Good"
                        remark="Mild plaque deposits. No caries."
                        pdfClass="dental"
                      />

                      <ReportRow
                        area="Immunization"
                        finding="Up to Date"
                        remark="All recommended vaccines completed"
                        pdfClass="immunization"
                      />
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 sm:hidden">
                  <MobileReportCard
                    area="Physical Examination"
                    finding="Normal"
                    remark="No significant abnormalities"
                  />
                  <MobileReportCard
                    area="Vision Screening"
                    finding="Normal"
                    remark="6/6 in both eyes"
                  />
                  <MobileReportCard
                    area="Hearing Screening"
                    finding="Normal"
                    remark="Hearing normal in both ears"
                  />
                  <MobileReportCard
                    area="Dental Check-up"
                    finding="Good"
                    remark="Mild plaque deposits. No caries."
                  />
                  <MobileReportCard
                    area="Immunization"
                    finding="Up to Date"
                    remark="All recommended vaccines completed"
                  />
                </div>
              </section>

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
