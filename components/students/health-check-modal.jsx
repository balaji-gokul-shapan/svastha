"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { IdCard, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/hooks";
import HealthIdCard, { HealthCardSheet } from "@/components/healthCard/Page";
import { buildHealthCardData } from "@/components/healthCard/card-data";
import { useScreeningRecord } from "./getScreeningRecord";

/* ==========================================================================
   HEALTH CARD MODAL
   ==========================================================================
   The dialog body IS the ID card: a lanyard badge you can drag and flip, with
   the student's identity on the front and the five screening domains on the
   back. It replaced the old A4 report layout — that report still exists as
   app/report/components/HealthCheckContent.jsx.

   The card's slots come from buildHealthCardData() (see card-data.js); this
   component only owns the trigger, the dialog chrome, the queries and the PDF.
   ========================================================================== */

/* A4 portrait geometry for the exported sheet: the raster is fitted inside a
   10 mm margin and centred horizontally, so the two faces cannot spill over a
   page edge whatever card size the design ends up using. */
function fitInside(width, height, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / width, maxHeight / height);

  return { width: width * scale, height: height * scale };
}

export default function HealthCheckModal({ student }) {
  const [open, setOpen] = useState(false);
  // While true, the flat front+back sheet is mounted off-screen for html2canvas.
  const [exporting, setExporting] = useState(false);
  const sheetRef = useRef(null);

  const studentName = student?.name ?? student?.student_name ?? "Student";

  // Use the real student identifier from the record — the URL slug is
  // lowercased by getStudentSlug(), which breaks backend lookups.
  const studentIdentifier = String(
    student?.student_id ??
      student?.id ??
      student?.studentId ??
      student?.cus_id ??
      "",
  ).trim();

  // Settings → Report still decides which domains the card carries.
  const reportSettings = useAppSelector((state) => state.reportSettings);
  const reportSection = reportSettings?.reportSection ?? {};
  const showLetterhead = reportSettings?.schoolHead ?? false;

  const {
    generalScreeningRecord,
    hearingScreeningRecord,
    dentalScreeningRecord,
    visionScreeningRecord,
    isLoading: screeningLoading,
  } = useScreeningRecord({ getId: studentIdentifier });

  const cardData = buildHealthCardData({
    student,
    records: {
      general: generalScreeningRecord,
      vision: visionScreeningRecord,
      hearing: hearingScreeningRecord,
      dental: dentalScreeningRecord,
    },
    sections: {
      vitals: reportSection.vitals ?? true,
      vision: reportSection.vision ?? true,
      hearing: reportSection.hearing ?? true,
      dental: reportSection.dental ?? true,
      immunization: reportSection.immunization ?? true,
    },
  });

  const handleDownloadPDF = async () => {
    setExporting(true);

    try {
      // Two frames: one for React to mount the sheet, one for the browser to
      // lay it out — html2canvas measures the live element.
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      const element = sheetRef.current;
      if (!element) throw new Error("Health card sheet did not mount");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const fitted = fitInside(
        canvas.width,
        canvas.height,
        pageWidth - margin * 2,
        pageHeight - margin * 2,
      );

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        (pageWidth - fitted.width) / 2,
        margin,
        fitted.width,
        fitted.height,
      );

      pdf.save(`${studentName || "student"}-health-card.pdf`);
    } catch (error) {
      console.error("Health card PDF generation failed:", error);
    } finally {
      setExporting(false);
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
          <div className="relative max-h-[90vh] w-[95vw] max-w-auto overflow-y-auto overscroll-contain rounded-xl border border-border bg-card p-0 shadow-xl">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10"
              aria-label="Close health card modal"
            >
              <X className="size-4" />
            </Button>

            <div className="border-b px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-3 p-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Health Card
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {`Academic Year: ${student?.academic_year ?? "2026-2027"}`}
                    {screeningLoading ? " · loading screening records…" : ""}
                  </p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  {showLetterhead ? (
                    <div className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                      {student?.school_name ?? "SchoolName"}
                    </div>
                  ) : null}
                  {/* <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDownloadPDF}
                    disabled={exporting}
                    className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary"
                  >
                    {exporting ? "Preparing…" : "Download PDF"}
                  </Button> */}
                </div>
              </div>
            </div>

            {/* The stage height lives here, not on the card: the compact variant
                fills whatever box its parent gives it (see lanyard.css). 660px
                is the compact assembly — strap + clip + the 350px card — plus
                room for the Flip button underneath. */}
            <div className="h-[660px]">
              <HealthIdCard data={cardData} size="compact" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Off-screen mount of the export sheet. html2canvas has to measure a
          laid-out element, so it is parked outside the viewport instead of
          hidden — display:none / visibility:hidden rasterise as nothing. */}
      {exporting ? (
        <div
          ref={sheetRef}
          aria-hidden="true"
          className="pointer-events-none fixed left-[-10000px] top-0"
        >
          <HealthCardSheet data={cardData} />
        </div>
      ) : null}
    </>
  );
}

