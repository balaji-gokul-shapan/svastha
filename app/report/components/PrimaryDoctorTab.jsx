"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CalendarDays,
  CircleX,
  ClipboardCheck,
  Ear,
  Eye,
  FilePenLine,
  Heart,
  Info,
  RotateCcw,
  SaveAll,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { useAllScreeningReport } from "@/components/healthChecks/getScreeningReport";
import { DataTable } from "@/components/ui/data-table";
import ToothIcon from "@/app/health-checks/dental-screening/asset/toothIcon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextareaField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/lib/hooks";
import { fetchWithAuth } from "@/lib/auth-utils";
import { updateInitialScreening } from "@/lib/features/registerGeneralScreening";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  formatCampDate,
  getCampDate,
  getCampDoctorIds,
  getCampName,
  getCampPrimaryDoctorId,
  getScreeningKeys,
  isScreeningKeyAssigned,
} from "@/lib/camp-utils";
import useScreeningIdMap from "@/lib/useScreeningIdMap";
import {
  DETAIL_LABEL_OVERRIDES,
  SCREENING_DETAIL_SECTIONS,
  SCREENING_DOMAIN_CLASSES,
} from "../datas/data";
import { updateEntScreening } from "@/lib/features/registerEntScreening";
import { markEventComplete } from "@/lib/features/getEventAssignSlice";
import { getCampId } from "@/lib/camp-utils";
import { updateHearingScreening } from "@/lib/features/registerHearingScreening";
import { updateDentalScreening } from "@/lib/features/registerDentalScreening";
import { updateVisionScreening } from "@/lib/features/registerVisionScreening";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import ReusableSelect from "@/components/ui/reusable-select";


/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getStudentName = (student) => {
  if (!student) return "";

  if (typeof student === "string") {
    return student.trim();
  }

  return String(
    student.student_name ?? student.name ?? student.studentName ?? "",
  ).trim();
};

const getRecordStudentName = (record) => {
  const student = record?.student;

  if (Array.isArray(student)) {
    return student.map(getStudentName).find(Boolean) ?? "";
  }

  return getStudentName(student);
};
const getRecordStudentClass = (record) => {
  const student = record?.student;
  console.log(student, "recordwwwwww");

  if (Array.isArray(student)) {
    return (
      student.map((s) => s.class ?? s.class_name ?? "").find(Boolean) ?? ""
    );
  }

  return student?.class ?? student?.class_name ?? "";
};
const getRecordStudentSection = (record) => {
  const student = record?.student;

  if (Array.isArray(student)) {
    return (
      student
        .map((s) => s.sec ?? s.section ?? s.section_name ?? "")
        .find(Boolean) ?? ""
    );
  }

  return student?.sec ?? student?.section ?? student?.section_name ?? "";
};

const normalizeFilterValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const isFilterActive = (value) => {
  const normalized = normalizeFilterValue(value);
  return Boolean(normalized) && normalized !== "all";
};

const matchesStudentFilter = (record, classFilter, sectionFilter) => {
  const classActive = isFilterActive(classFilter);
  const sectionActive = isFilterActive(sectionFilter);

  // Nothing selected — every row passes (no need to read the record).
  if (!classActive && !sectionActive) {
    return true;
  }

  const rawClass = String(getRecordStudentClass(record) ?? "").trim();
  const rawSection = String(getRecordStudentSection(record) ?? "").trim();

  const combinedMatch = !rawSection
    ? /^(.*)-([A-Za-z]\d*)$/.exec(rawClass)
    : null;

  const classValue = normalizeFilterValue(combinedMatch?.[1] ?? rawClass);
  const sectionValue = normalizeFilterValue(combinedMatch?.[2] ?? rawSection);

  const classMatches =
    !classActive || classValue === normalizeFilterValue(classFilter);
  const sectionMatches =
    !sectionActive || sectionValue === normalizeFilterValue(sectionFilter);

  return classMatches && sectionMatches;
};
// const getRecordStudentName = (record) => {
//   const student = record?.student;

//   if (Array.isArray(student)) {
//     return student.map(getStudentName).find(Boolean) ?? "";
//   }

//   return getStudentName(student);
// };

const getRecordStudentId = (record) =>
  [
    record?.student?.cus_id,
    record?.student?.student_cus_id,
    record?.student?.studentId,
    record?.student?.student_id,
    record?.student?.school_registration_number,
    record?.student?.admission_number,
    record?.student_cus_id,
    record?.cus_id,
    record?.school_registration_number,
    record?.admission_number,
    record?.studentId,
    record?.student_id,
  ]
    .map((value) => String(value ?? "").trim())
    .find(Boolean) ?? "";

const getStudentDedupeKey = (record) => {
  const nestedStudent = record?.student;
  const stableStudentIdentity = [
    nestedStudent?.cus_id,
    nestedStudent?.student_cus_id,
    nestedStudent?.student_id,
    nestedStudent?.studentId,
    nestedStudent?.id,
    record?.student_cus_id,
    record?.cus_id,
    record?.school_registration_number,
    record?.admission_number,
    nestedStudent?.school_registration_number,
    nestedStudent?.admission_number,
  ]
    .map((value) => String(value ?? "").trim())
    .find(Boolean);

  if (stableStudentIdentity) {
    return `id:${stableStudentIdentity.toLowerCase()}`;
  }

  const fallbackIdentity = [
    getRecordStudentName(record),
    getRecordStudentClass(record),
    getRecordStudentSection(record),
  ]
    .map((value) => normalizeFilterValue(value))
    .filter(Boolean)
    .join("|");

  return fallbackIdentity ? `profile:${fallbackIdentity}` : "";
};

const getScreenedTimeStamp = (record) =>
  record?.created_at ??
  record?.createdAt ??
  record?.report?.created_at ??
  record?.report?.createdAt ??
  "";

const toDetailLabel = (key) =>
  String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDetailValue = (value) => {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

const HANDLED_DETAIL_KEYS = new Set([
  "student",
  "student_id",
  "studentId",
  "student_cus_id",
  "cus_id",
  "id",
  "record_id",
  "created_at",
  "createdAt",
]);

/* -------------------------------------------------------------------------- */
/* Per-screening detail fields                                                */
/* -------------------------------------------------------------------------- */

const SCREENING_DETAIL_FIELDS = Object.fromEntries(
  Object.entries(SCREENING_DETAIL_SECTIONS).map(([type, sections]) => [
    type,
    sections.flatMap((section) => section.fields),
  ]),
);

/* Header icon per screening type — mirrors the icons used by the Detailed-mode
   screening categories. */
const SCREENING_TYPE_ICONS = {
  general: Activity,
  vision: Eye,
  dental: ToothIcon,
  hearing: Ear,
  ent: Heart,
  immunization: ClipboardCheck,
};

const SIDE_FIELD_PATTERN =
  /^(whisper_test|ear_exam|speech_recognition|tympanometry|overall_status|hearing_whisper|ear_wax|discharge|perforation|foreign_body|infection|tympanic_membrane|system_examination)_(re|le)$/;

const getDetailLabel = (key) => {
  if (DETAIL_LABEL_OVERRIDES[key]) {
    return DETAIL_LABEL_OVERRIDES[key];
  }

  const sideMatch = SIDE_FIELD_PATTERN.exec(key);

  if (sideMatch) {
    return `${toDetailLabel(sideMatch[1])} (${
      sideMatch[2] === "re" ? "Right" : "Left"
    })`;
  }

  const eyeMatch = /^(od|os|ou)_(distance|near)_(with|without)$/.exec(key);

  if (eyeMatch) {
    const side = { od: "Right Eye", os: "Left Eye", ou: "Both Eyes" }[
      eyeMatch[1]
    ];
    const range = eyeMatch[2] === "distance" ? "Distance" : "Near";
    const lens = eyeMatch[3] === "with" ? "With Glasses" : "Without Glasses";

    return `${side} ${range} (${lens})`;
  }

  const eyeRemarksMatch = /^(od|os|ou)_remarks$/.exec(key);

  if (eyeRemarksMatch) {
    const side = { od: "Right Eye", os: "Left Eye", ou: "Both Eyes" }[
      eyeRemarksMatch[1]
    ];

    return `${side} Remarks`;
  }

  const ptaMatch = /^pta_(\d+)hz_(re|le)$/.exec(key);

  if (ptaMatch) {
    return `PTA ${ptaMatch[1]} Hz (${ptaMatch[2] === "re" ? "Right" : "Left"})`;
  }

  return toDetailLabel(key);
};

const resolveFieldValue = (record, key) => {
  const candidates = [record?.[key], record?.report?.[key], record?.screening?.[key]];

  return (
    candidates.find(
      (value) => value !== null && value !== undefined && String(value).trim() !== "",
    ) ?? ""
  );
};

const REFERRAL_EDIT_FIELD = {
  general: "remarks",
  vision: "remarks",
  dental: "remarks",
  hearing: "remarks",
  ent: "remarks",
};


const REFERRAL_UPDATE_PATH = {
  vision: "vision-test",
  dental: "dental-test",
  hearing: "hear-test",
  ent: "ent-assessment",
};

/* -------------------------------------------------------------------------- */
/* Table Columns                                                              */
/* -------------------------------------------------------------------------- */

const columns = [
  {
    id: "studentId",
    header: "Student ID",
    accessorFn: getRecordStudentId,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() || "-"} </span>
    ),
  },
  {
    id: "student",
    header: "Student",
    accessorFn: getRecordStudentName,
    cell: ({ getValue }) => (
      <span className="font-medium text-foreground">{getValue() || "-"} </span>
    ),
  },

  {
    id: "class",
    header: "Class",
    accessorFn: getRecordStudentClass,
    cell: ({ getValue }) => (
      <span className="font-medium text-foreground">{getValue() || "-"} </span>
    ),
  },

  {
    id: "section",
    header: "Section",
    accessorFn: getRecordStudentSection,
    cell: ({ getValue }) => (
      <span className="font-medium text-foreground">{getValue() || "-"} </span>
    ),
  },
  {
    id: "recordId",
    header: "Record ID",
    accessorFn: (row) => String(row?.id ?? row?.record_id ?? "").trim(),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() || "-"} </span>
    ),
  },

  {
    id: "screenedAt",
    header: "Screened At",
    accessorFn: getScreenedTimeStamp,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {formatCampDate(getValue()) || "-"}{" "}
      </span>
    ),
  },
];

/* -------------------------------------------------------------------------- */
/* Reusable Components                                                        */
/* -------------------------------------------------------------------------- */

function InfoTile({ icon: Icon, label, children }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-3")}>
      {" "}
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}{" "}
      </dt>
      <dd className="mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

/*
 * Identity tiles shared by the flat and sectioned modal layouts — Student,
 * IDs and screening timestamp, formatted like the table columns.
 */
function getIdentityRows(record) {
  if (!record) {
    return [];
  }

  const rows = [];

  const pushRow = (label, value) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    rows.push({ label, value: formatDetailValue(value) });
  };

  pushRow("Student", getRecordStudentName(record));
  pushRow("Student ID", getRecordStudentId(record));
  pushRow("Admission No.", record?.admission_number);
  pushRow("Registration No.", record?.school_registration_number);
  pushRow("Record ID", record?.id ?? record?.record_id);
  pushRow(
    "Screened At",
    formatCampDate(getScreenedTimeStamp(record)) ||
      getScreenedTimeStamp(record),
  );

  return rows;
}

const UPDATE_THUNKS = {
  general: updateInitialScreening,
  vision: updateVisionScreening,
  dental: updateDentalScreening,
  ent: updateEntScreening,
  hearing: updateHearingScreening,
  // hearing has no update thunk yet - will fall back to fetch
};

/* --------------------------------------------------------------------------
   LastStudentContext
   --------------------------------------------------------------------------
   The referral editor lives ~4 levels below the student list
   (DetailedStudentScreeningView -> StudentResultsPopup -> ScreeningTable ->
   ScreeningDetailModal -> ScreeningReferralField), so threading "is this the
   last student?" down as props would mean touching every level. A context
   keeps the knowledge local to the list that actually owns the ordering.

   Defaults to "not the last student", so the clinical / ReferralDesk paths
   (which have no such list) never trigger the completion prompt.           */
const LastStudentContext = createContext({
  isLastStudent: false,
  eventId: null,
  eventLabel: "",
});

const useLastStudent = () => useContext(LastStudentContext);

function ScreeningReferralField({
  record,
  screeningKey,
  onSaved,
  onClose,
  wrapperClassName = "mt-4 border-t border-border pt-4",
}) {
  const dispatch = useAppDispatch();

  const fieldKey = REFERRAL_EDIT_FIELD[screeningKey];
  const recordId =
    record?.id ??
    record?.record_id ??
    record?.screening_id ??
    record?.screeningId ??
    record?.report?.id ??
    record?.report?.record_id ??
    record?.screening?.id ??
    null;

  const savedValue = String(
    (fieldKey ? resolveFieldValue(record, fieldKey) : "") ?? "",
  );

  const [draft, setDraft] = useState(savedValue);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  // Post-save "this was the last student — complete the event?" step. Kept
  // separate from showConfirmation so saving the referral never gets blocked
  // on the completion decision.
  const [showCompletePrompt, setShowCompletePrompt] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState("");

  const { isLastStudent, eventId, eventLabel } = useLastStudent();

  const canPersist = Boolean(fieldKey && recordId);
  const hasChanges = draft !== savedValue;

  const hasDraftValue = String(draft ?? "").trim().length > 0;
  const canSave =
    canPersist && !isSaving && (hasChanges || hasDraftValue || hasInteracted);

  const handleSave = async () => {
    if (!canSave) {
      return;
    }
    setShowConfirmation(true);
    setPendingSave(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmation(false);

    // Guard against double-submit while a request is already running.
    if (!pendingSave || isSaving) {
      return;
    }

    setPendingSave(false);
    setIsSaving(true);
    setSaveError("");
    onClose?.();

    const studentId =
      record?.student_id ??
      record?.studentId ??
      record?.student_cus_id ??
      record?.cus_id ??
      record?.student?.cus_id ??
      record?.student?.id ??
      "";

    try {
      const thunk = UPDATE_THUNKS[screeningKey];
      if (thunk) {
        await dispatch(
          thunk({
            id: recordId,
            student_id: studentId,
            [fieldKey]: draft,
          }),
        ).unwrap();
      } else {
        // Fallback to manual fetch if no update thunk is available for this screening type.
        const base = REFERRAL_UPDATE_PATH[screeningKey];

        if (!base) {
          throw new Error("Referral editing is not wired for this type yet.");
        }

        const { response } = await fetchWithAuth(
          `/api/${base}/${encodeURIComponent(String(recordId))}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [fieldKey]: draft }),
          },
          dispatch,
        );

        if (!response.ok) {
          const text = await response.text();
          let detail = text;

          try {
            const parsed = text ? JSON.parse(text) : null;
            detail = parsed?.message ?? parsed?.error ?? parsed?.detail ?? text;
          } catch {
            // keep raw text
          }

          throw new Error(detail || "Unable to save referral.");
        }
      }

      toast.success("Referral saved successfully.");
      onSaved?.({ ...record, [fieldKey]: draft });

      // Only the last student in the list offers to close out the event, and
      // only once the referral itself has actually saved — if the save above
      // threw we never reach here, so we can't complete an event whose final
      // record was never persisted.
      if (isLastStudent && eventId) {
        setCompleteError("");
        setShowCompletePrompt(true);
      }
    } catch (error) {
      const message = error?.message || "Unable to save referral.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  /* Marks the camp/event complete via the PATCH endpoint. Runs after the
     referral save, so a failure here leaves the saved referral intact. */
  const handleConfirmComplete = async () => {
    if (isCompleting || !eventId) {
      return;
    }

    setIsCompleting(true);
    setCompleteError("");

    try {
      await dispatch(markEventComplete({ eventId, status: "complete" })).unwrap();
      setShowCompletePrompt(false);
      toast.success(
        eventLabel
          ? `Event "${eventLabel}" marked as complete.`
          : "Event marked as complete.",
      );
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.message || "Unable to complete the event.";
      setCompleteError(message);
      toast.error(message);
    } finally {
      setIsCompleting(false);
    }
  };

  if (!fieldKey) {
    return null;
  }

  return (
    <div className={wrapperClassName}>
      <TextareaField
        label="Referral remarks (optional)"
        value={draft}
        placeholder="Enter referral details…"
        rows={3}
        onChange={(event) => {
          setDraft(event.target.value);
          setSaveError("");
          setHasInteracted(true);
        }}
        onFocus={() => setHasInteracted(true)}
        disabled={isSaving}
        textareaClassName="resize-none bg-background text-sm"
      />

      {saveError ? (
        <p className="mt-1.5 text-xs text-destructive">{saveError}</p>
      ) : null}

      <div className="mt-2 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!canSave}
        >
          <div className="flex items-center gap-2">
            <ClipboardCheck />
            {isSaving ? "Saving…" : "Save Referral"}
          </div>
        </Button>

        {!canPersist ? (
          <p className="text-xs text-muted-foreground">
            Referral can be saved once the record has an id.
          </p>
        ) : null}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="w-full max-w-full sm:max-w-1/2">
            <DialogHeader>
              <DialogTitle>
                <ClipboardCheck size={18} className="inline-block mr-1" />
                Confirm Save Referral
                <span className="group relative inline-flex items-center align-middle ml-4">
                  <Info size={14} className="text-warning cursor-help" />
                  <span className="pointer-events-none absolute bottom-full  mb-2 w-max max-w-96 rounded-md border border-border bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    Once you save, the referral details will be recorded in
                    Report.
                  </span>
                </span>
                {/* <FilePenLine size={18} /> */}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to save these referral details?
                {draft.trim() === "" && (
                  <span className="block mt-2 text-warning">
                    Warning: You are about to save empty remarks.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  setPendingSave(false);
                }}
              >
                <RotateCcw />
                Continue Editing
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  setPendingSave(false);
                }}
              >
                <CircleX />
                Cancel
              </Button>
              <Button onClick={handleConfirmSave} disabled={isSaving}>
                <SaveAll /> {isSaving ? "Saving..." : "Confirm Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Last student in the list — offer to close out the event. Shown only
            after the referral above has actually saved. */}
        <Dialog open={showCompletePrompt} onOpenChange={setShowCompletePrompt}>
          <DialogContent className="w-full max-w-full sm:max-w-1/2">
            <DialogHeader>
              <DialogTitle>
                <ClipboardCheck size={18} className="inline-block mr-1" />
                Last Student Saved
              </DialogTitle>
              <DialogDescription>
                {eventLabel
                  ? `This was the last student for "${eventLabel}". Mark the event as complete now?`
                  : "This was the last student for this event. Mark the event as complete now?"}
              </DialogDescription>
            </DialogHeader>

            {completeError ? (
              <p className="text-sm text-destructive">{completeError}</p>
            ) : null}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCompletePrompt(false)}
                disabled={isCompleting}
              >
                <CircleX />
                Not Yet
              </Button>
              <Button onClick={handleConfirmComplete} disabled={isCompleting}>
                <SaveAll /> {isCompleting ? "Completing..." : "Mark Event Complete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* REFERRAL DESK                                                             */
/*                                                                            */
/* A student can have Vision + Dental + Hearing + ENT records at once. Rather  */
/* than stacking a textarea per screening, this lets the doctor PICK a         */
/* screening and write remarks for that one only. Each chip shows whether that   */
/* screening already has remarks, and the header counts how many are done.      */
/*                                                                            */
/* Saving is not re-implemented here — the selected screening is handed to the   */
/* same <ScreeningReferralField /> clinical mode uses, so behaviour matches.    */
/* -------------------------------------------------------------------------- */

function ReferralDesk({ screenings, onRecordUpdated }) {

  const [localSaved, setLocalSaved] = useState({});

  const eligible = useMemo(
    () =>
      (Array.isArray(screenings) ? screenings : []).filter(
        (screening) =>
          (screening?.data?.length ?? 0) > 0 && REFERRAL_EDIT_FIELD[screening.value],
      ),
    [screenings],
  );

  const [activeValue, setActiveValue] = useState("");
  const [activeRecordIndex, setActiveRecordIndex] = useState(0);

  const active = useMemo(
    () =>
      eligible.find((screening) => screening.value === activeValue) ??
      eligible[0],
    [eligible, activeValue],
  );

  const records = active?.data ?? [];
  const record =
    records[Math.min(activeRecordIndex, Math.max(records.length - 1, 0))];

  const readRemarks = useCallback(
    (screeningValue, row) => {
      const rowId = row?.id ?? row?.record_id ?? "";
      const overlay = localSaved[`${screeningValue}::${rowId}`];

      if (typeof overlay === "string") {
        return overlay;
      }

      return String(
        resolveFieldValue(row, REFERRAL_EDIT_FIELD[screeningValue]) ?? "",
      );
    },
    [localSaved],
  );

  const isFilled = useCallback(
    (screening) =>
      (screening?.data ?? []).some(
        (row) => readRemarks(screening.value, row).trim().length > 0,
      ),
    [readRemarks],
  );

  const filledCount = useMemo(
    () => eligible.filter(isFilled).length,
    [eligible, isFilled],
  );

  if (eligible.length === 0 || !active) {
    return null;
  }

  const domainClasses =
    SCREENING_DOMAIN_CLASSES[active.value] ?? SCREENING_DOMAIN_CLASSES.general;
  const ActiveIcon = active.icon;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm",
        domainClasses.border,
      )}
    >
      <header
        className={cn(
          "flex flex-wrap items-center gap-3 px-4 py-3 text-white",
          domainClasses.solid,
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-inset ring-white/35 backdrop-blur-sm">
          <Stethoscope className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold sm:text-base">
            Referral Desk
          </h3>
          <p className="text-[11px] text-white/85">
            Pick a screening, then add referral remarks for it
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ring-white/25">
          {filledCount}/{eligible.length} added
        </span>
      </header>

      <div className="space-y-3 bg-card/60 p-3 sm:p-4">
        {/* Screening selector — horizontally scrollable on phones so the row
            never wraps into an unreadable stack. */}
        <div className="appearance-rail -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {eligible.map((screening) => {
            const ChipIcon = screening.icon;
            const isActive = screening.value === active.value;
            const filled = isFilled(screening);
            const chipDomain =
              SCREENING_DOMAIN_CLASSES[screening.value] ??
              SCREENING_DOMAIN_CLASSES.general;

            return (
              <button
                key={screening.value}
                type="button"
                onClick={() => {
                  setActiveValue(screening.value);
                  setActiveRecordIndex(0);
                }}
                aria-pressed={isActive}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition",
                  isActive
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/70 bg-background/60 hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-white",
                    chipDomain.solid,
                  )}
                >
                  <ChipIcon className="size-4" aria-hidden="true" />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {screening.label}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {screening.data.length} record
                    {screening.data.length === 1 ? "" : "s"}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  title={filled ? "Referral added" : "No referral yet"}
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    filled ? "bg-success" : "bg-muted-foreground/30",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Record picker — only when the chosen screening has more than one. */}
        {records.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Record
            </span>

            {records.map((row, index) => {
              const filled = readRemarks(active.value, row).trim().length > 0;
              const isActiveRow = index === activeRecordIndex;

              return (
                <button
                  key={row?.id ?? row?.record_id ?? index}
                  type="button"
                  onClick={() => setActiveRecordIndex(index)}
                  aria-pressed={isActiveRow}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                    isActiveRow
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  Record {index + 1}
                  {filled ? (
                    <span className="ml-1.5 text-success">•</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* The textarea seeds its draft from the record, so hand it one that
            already reflects the local overlay — otherwise a value saved seconds
            ago wouldn't appear until the popup is reopened. */}
        {record ? (
          <div className="rounded-xl border border-border/70 bg-background/60 p-3">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg text-white",
                  domainClasses.solid,
                )}
              >
                <ActiveIcon className="size-4" aria-hidden="true" />
              </span>

              <p className="text-xs font-semibold text-foreground">
                {active.label}
                <span className="ml-1.5 font-normal text-muted-foreground">
                  referral remarks
                </span>
              </p>

              <span className="ml-auto rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                ID {record?.id ?? record?.record_id ?? "-"}
              </span>
            </div>

            <ScreeningReferralField

              key={`${active.value}-${record?.id ?? record?.record_id ?? activeRecordIndex}`}
              record={record}
              screeningKey={active.value}
              wrapperClassName=""
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ScreeningNotesField({ record, screeningKey, type }) {
  const dispatch = useAppDispatch();
  const recordId = record?.id ?? record?.record_id;
  const savedNotes = resolveFieldValue(record, "general_notes") ?? "";
  const [notesDraft, setNotesDraft] = useState(savedNotes);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const canPersistNotes = screeningKey === "general" && Boolean(recordId);
  const hasChanges = notesDraft !== savedNotes;
  const handleSaveNotes = async () => {
    if (!canPersistNotes) {
      return;
    }
    setIsSavingNotes(true);
    try {
      await dispatch(
        updateInitialScreening({
          id: recordId,
          payload: { general_notes: notesDraft },
        }),
      ).unwrap();

      toast.success("Notes saved successfully.");
    } catch (error) {
      toast.error(error?.message || "Unable to save notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <TextareaField
        label="General Notes"
        value={notesDraft}
        placeholder="Add notes for this screening record…"
        onChange={(event) => setNotesDraft(event.target.value)}
        disabled={isSavingNotes}
        textareaClassName="resize-none bg-background text-sm"
      />

      <div className="mt-2 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleSaveNotes}
          disabled={!hasChanges || isSavingNotes || !canPersistNotes}
        >
          {isSavingNotes ? "Saving…" : "Save Notes"}
        </Button>

        {!canPersistNotes ? (
          <p className="text-xs text-muted-foreground">
            {`Notes saving is wired for ${type} screening only for now.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ScreeningDetailModal({
  record,
  type,
  campEvent,
  onClose,
  activeTab,
  onRecordUpdated,
}) {
  const isOpen = Boolean(record);
  const campName = getCampName(campEvent);
  const studentName = record ? getRecordStudentName(record) : "";
  const screeningKey = String(type ?? activeTab ?? "").toLowerCase();

  const referralFieldKey = REFERRAL_EDIT_FIELD[screeningKey];
  const domainClasses =
    SCREENING_DOMAIN_CLASSES[screeningKey] ?? SCREENING_DOMAIN_CLASSES.general;
  const ScreeningTypeIcon = SCREENING_TYPE_ICONS[screeningKey] ?? Stethoscope;
  const recordDisplayId = record?.id ?? record?.record_id;
  const detailRows = useMemo(() => {
    if (!record) {
      return [];
    }

    const rows = [];
    const seenLabels = new Set();

    const pushRow = (label, value) => {
      if (value === null || value === undefined || value === "") {
        return;
      }

      if (typeof value === "function") {
        return;
      }

      if (typeof value === "object") {
        // Arrays of scalar values (e.g. advice suggestions) render as a
        // readable list; other objects are skipped.
        if (!Array.isArray(value)) {
          return;
        }

        const scalarItems = value.filter(
          (item) =>
            item !== null &&
            item !== undefined &&
            typeof item !== "object" &&
            typeof item !== "function",
        );

        if (scalarItems.length !== value.length) {
          return;
        }

        value = scalarItems.join(", ");
      }

      const dedupeKey = label.toLowerCase();

      if (seenLabels.has(dedupeKey)) {
        return;
      }

      seenLabels.add(dedupeKey);
      rows.push({ label, value: formatDetailValue(value) });
    };

    // Identity fields, using the same formatting as the table columns.
    rows.push(...getIdentityRows(record));

    const flattenObject = (obj, prefix = "") => {
      Object.entries(obj ?? {}).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          return;
        }

        // The `student` object is already covered by the identity helpers.
        if (prefix === "" && HANDLED_DETAIL_KEYS.has(key)) {
          return;
        }

        const label = prefix
          ? `${prefix} ${getDetailLabel(key)}`
          : getDetailLabel(key);

        if (typeof value === "object" && !Array.isArray(value)) {
          flattenObject(value, label);
          return;
        }

        pushRow(label, value);
      });
    };

    const sections = SCREENING_DETAIL_SECTIONS[screeningKey];
    const fieldKeys = SCREENING_DETAIL_FIELDS[screeningKey];

    if (Array.isArray(sections)) {

    } else if (Array.isArray(fieldKeys)) {
      console.log(fieldKeys, "fieldKeys");

      // Flat per-type view (types without a sections config).
      fieldKeys.forEach((key) =>
        pushRow(getDetailLabel(key), resolveFieldValue(record, key)),
      );
    } else {
      // Type without a config (e.g. "other") — fall back to every field.
      flattenObject(record);
    }

    if (!referralFieldKey) {
      return rows;
    }

    const referralLabel = getDetailLabel(referralFieldKey).toLowerCase();

    return rows.filter((row) => row.label.toLowerCase() !== referralLabel);
  }, [record, screeningKey, referralFieldKey]);

  // Identity tiles, shown above the sectioned layout.
  const identityRows = useMemo(() => getIdentityRows(record), [record]);

  const sections = SCREENING_DETAIL_SECTIONS[screeningKey];
  const hasSections = Array.isArray(sections);

  const sectionsWithRows = useMemo(() => {
    if (!record || !Array.isArray(sections)) {
      return [];
    }

    const seenLabels = new Set();

    return sections
      .map((section) => {
        const rows = section.fields
          .map((key) => {
    
            if (key === referralFieldKey) {
              return null;
            }

            const value = resolveFieldValue(record, key);

            if (
              value === null ||
              value === undefined ||
              value === "" ||
              typeof value === "object" ||
              typeof value === "function"
            ) {
              return null;
            }

            const label = getDetailLabel(key);
            const dedupeKey = label.toLowerCase();

            if (seenLabels.has(dedupeKey)) {
              return null;
            }

            seenLabels.add(dedupeKey);

            return { key, label, value: formatDetailValue(value) };
          })
          .filter(Boolean);

        return { title: section.title, rows };
      })
      .filter((section) => section.rows.length > 0);
  }, [record, sections, referralFieldKey]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
      }}
    >
      <DialogContent className="student-screening-results max-h-[92vh] w-full max-w-full overflow-y-auto sm:max-w-2/3">
    
        <DialogHeader className="student-screening-results-header sticky -top-5 z-20 -mx-5 -mt-5 flex-row items-center gap-3 px-4 pb-4 pr-12 pt-5 sm:gap-4 sm:px-6 sm:pr-14">
          {/* Domain accent strip — same as the Detailed-mode popup */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 top-0 h-1 rounded-t-lg",
              domainClasses.solid,
            )}
          />
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md",
              domainClasses.solid,
            )}
          >
            <ScreeningTypeIcon className="size-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-lg font-semibold sm:text-xl">
              {type} Screening Details
            </DialogTitle>

            <DialogDescription className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="student-screening-chip">
                {studentName || "Screening record"}
              </span>
              {campName ? (
                <span className="student-screening-chip">{campName}</span>
              ) : null}
              {recordDisplayId ? (
                <span className="student-screening-chip">
                  ID {recordDisplayId}
                </span>
              ) : null}
            </DialogDescription>
          </div>
        </DialogHeader>

        {hasSections && sectionsWithRows.length > 0 ? (
          <div className="mt-4 space-y-4">
            {/* Identity band */}
            {identityRows.length > 0 ? (
              <dl
                className={cn(
                  "grid grid-cols-1 gap-2 rounded-lg p-2 sm:grid-cols-2 lg:grid-cols-4",
                  domainClasses?.soft,
                )}
              >
                {identityRows.map((row) => (
                  <div
                    key={row.label}
                    className={cn(
                      "rounded-lg border p-3 bg-card",
                      domainClasses?.border,
                    )}
                  >
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {row.label}
                    </dt>

                    <dd className="mt-1 break-words text-sm font-medium text-foreground">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {/* One structured card per screening section */}
            {sectionsWithRows.map((section) => (
              <section
                key={section.title}
                className={cn(
                  "rounded-xl border p-3",
                  domainClasses?.border,
                  domainClasses?.soft,
                )}
              >
                <h4
                  className={cn("text-sm font-semibold", domainClasses?.text)}
                >
                  {section.title}
                </h4>

                <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {section.rows.map((row) => (
                    <div
                      key={row.key}
                      className={cn(
                        "rounded-lg border bg-card p-3",
                        domainClasses?.chip,
                        domainClasses?.border,
                      )}
                    >
                      <dt
                        className={cn(
                          "text-xs font-medium uppercase tracking-wide",
                          domainClasses?.text ?? "text-muted-foreground",
                        )}
                      >
                        {row.label}
                      </dt>

                      <dd className="mt-1 break-words text-sm text-foreground">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        ) : detailRows.length > 0 ? (
          <div className="mt-4">
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="rounded-lg border border-border p-3"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {row.label}
                  </dt>

                  <dd className="mt-1 break-words text-sm text-foreground">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No additional details available for this record.
          </p>
        )}

        {/* Referral-only editing for the primary doctor. */}
        {record ? (
          <ScreeningReferralField
            key={`referral-${String(record?.id ?? record?.record_id ?? "record")}`}
            record={record}
            screeningKey={screeningKey}
            onSaved={(updated) => {
              onRecordUpdated?.(updated);
              onClose?.();
            }}
            onClose={onClose}
          />
        ) : null}

        {/* {record ? (
          <ScreeningNotesField
            key={String(record?.id ?? record?.record_id ?? "record")}
            record={record}
            type={type}
            screeningKey={screeningKey}
          />
        ) : null} */}
      </DialogContent>
    </Dialog>
  );
}

function ScreeningTable({
  data,
  campEvent,
  type,
  pagination,
  isLoading,
  pageSize,
  onPageChange,
  onPageSizeChange,
  activeTab,
  screeningTabs = [],
  onScreeningTabChange,
  filterActive = false,
  activeFilterLabel = "",
}) {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleRecordUpdated = (updatedRecord) => {
    setSelectedRecord((prev) => {
      if (!prev) return prev;

      const prevId = prev?.id ?? prev?.record_id;
      const nextId = updatedRecord?.id ?? updatedRecord?.record_id;

      if (prevId !== nextId) return prev;

      return { ...prev, ...updatedRecord };
    });
  };

  const campId = campEvent?.id ?? campEvent?.campId ?? "all-camps";
  const screeningName = type.toLowerCase();
  const domainClasses = SCREENING_DOMAIN_CLASSES[activeTab];
  const pageSizeChoices = Array.from(
    new Set(
      [10, 30, 50, 100, Number(pagination?.pageSize)].filter(
        (size) => Number(size) > 0,
      ),
    ),
  ).sort((a, b) => a - b);

  return (
    <div
      className={cn(
        "mt-3 w-full min-w-0 overflow-hidden border-t-2 pt-3",
        domainClasses?.border,
      )}
    >
      <DataTable
        key={`${campId}-${type}`}
        columns={columns}
        data={data}
        enableSorting
        pageSizeOptions={pageSizeChoices}
        serverPagination={{
          page: pagination?.page ?? 1,
          pageSize: pagination?.pageSize || pageSize,
          totalRows: pagination?.totalRows || data.length,
          totalPages: pagination?.totalPages || 1,
          isLoading,
          onPageChange,
          onPageSizeChange,
        }}
        emptyMessage={
          filterActive
            ? `No ${screeningName} screening records match ${activeFilterLabel || "the selected filters"} at this camp.`
            : campEvent
              ? `No ${screeningName} screening records for this camp yet.`
              : "Select a camp to load its screening records."
        }
        onRowClick={(record) => setSelectedRecord(record)}
        className="w-full min-w-0"
        // Phones keep readable column widths and scroll the table itself
        // (inside the card); from `md` up the table fits the card again.
        tableClassName="min-w-[640px] md:min-w-0"
      />
      <ScreeningDetailModal
        record={selectedRecord}
        type={type}
        campEvent={campEvent}
        onClose={() => setSelectedRecord(null)}
        activeTab={activeTab}
        onRecordUpdated={handleRecordUpdated}
      />
    </div>
  );
}

function getClinicalScreeningSections(record, screeningKey) {
  const sections = SCREENING_DETAIL_SECTIONS[String(screeningKey).toLowerCase()];
  const seenLabels = new Set();

  if (!Array.isArray(sections)) {
    return [];
  }

  return sections
    .map((section) => ({
      title: section.title,
      rows: section.fields
        .map((key) => {
          const value = resolveFieldValue(record, key);

          if (
            value === null ||
            value === undefined ||
            value === "" ||
            typeof value === "object" ||
            typeof value === "function"
          ) {
            return null;
          }

          const label = getDetailLabel(key);
          const dedupeKey = label.toLowerCase();

          if (seenLabels.has(dedupeKey)) {
            return null;
          }

          seenLabels.add(dedupeKey);

          return { key, label, value: formatDetailValue(value) };
        })
        .filter(Boolean),
    }))
    .filter((section) => section.rows.length > 0);
}

function StudentResultsPopup({
  student,
  campEvent,
  filterActive,
  activeFilterLabel,
  onClose,
}) {
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const stickyHeaderRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(
    student?.screenings?.[0]?.value ?? null,
  );

  const scrollToCategory = (value) => {
    const container = scrollRef.current;
    const target = sectionRefs.current[value];

    if (!container || !target) {
      return;
    }

    // Keep the target clear of the pinned header block.
    const stickyOffset = stickyHeaderRef.current?.offsetHeight ?? 0;
    const offset =
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      stickyOffset -
      8;

    container.scrollTo({ top: Math.max(offset, 0), behavior: "smooth" });
    setActiveCategory(value);
  };

  const handleScroll = () => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    const stickyOffset = (stickyHeaderRef.current?.offsetHeight ?? 0) + 8;
    let current = null;

    Object.entries(sectionRefs.current).forEach(([value, node]) => {
      if (node && node.getBoundingClientRect().top - containerTop <= stickyOffset) {
        current = value;
      }
    });

    setActiveCategory((prev) => (prev === current ? prev : current));
  };

  const getClinicalSections = (record, screeningKey) => {
    const sections = getClinicalScreeningSections(record, screeningKey);
    const referralKey = REFERRAL_EDIT_FIELD[screeningKey];
    const referralValue = referralKey
      ? resolveFieldValue(record, referralKey)
      : null;

    if (
      referralValue !== null &&
      referralValue !== undefined &&
      referralValue !== "" &&
      typeof referralValue !== "object" &&
      typeof referralValue !== "function" &&
      !sections.some((section) =>
        section.rows.some((row) => row.key === referralKey),
      )
    ) {
      sections.push({
        title: "Referral & Remarks",
        rows: [
          {
            key: referralKey,
            label: getDetailLabel(referralKey),
            value: formatDetailValue(referralValue),
          },
        ],
      });
    }

    return sections;
  };

  if (!student) return null;

  const screenings = student.screenings ?? [];
  const totalRecords = screenings.reduce(
    (sum, screening) => sum + (screening.data?.length ?? 0),
    0,
  );
  const screeningsWithResults = screenings.filter(
    (screening) => (screening.data?.length ?? 0) > 0,
  ).length;
  const initials =
    String(student.name ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent
        ref={scrollRef}
        onScroll={handleScroll}
        className="student-screening-results max-h-[92vh] w-full overflow-y-auto sm:max-w-4xl"
      >
        {/* `-m-5` cancels the popup's default padding so the hero band and the
            sticky category bar can bleed edge-to-edge. */}
        <div className="-m-5 flex min-w-0 flex-col">
          {/* Student summary + category bar stay pinned while results scroll */}
          <div
            ref={stickyHeaderRef}
            className="sticky -top-5 z-20 flex flex-col"
          >
          <DialogHeader className="student-screening-results-header gap-0 px-4 pb-4 pr-12 pt-5 text-left sm:px-6 sm:pr-14">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-cyan-500 text-base font-bold tracking-wide text-white shadow-lg shadow-primary/25">
                {initials}
              </span>

              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-lg font-semibold sm:text-xl">
                  {student.name}
                </DialogTitle>

                <DialogDescription className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="student-screening-chip">
                    ID {student.studentId || "Not provided"}
                  </span>
                  {student.className ? (
                    <span className="student-screening-chip">
                      Class {student.className}
                    </span>
                  ) : null}
                  {student.sectionName ? (
                    <span className="student-screening-chip">
                      Section {student.sectionName}
                    </span>
                  ) : null}
                </DialogDescription>
              </div>

              <dl className="grid shrink-0 grid-cols-2 gap-2">
                <div className="student-screening-stat">
                  <dt>Screenings</dt>
                  <dd>
                    {screeningsWithResults}
                    <span className="text-xs font-semibold text-muted-foreground">
                      /{screenings.length}
                    </span>
                  </dd>
                </div>
                <div className="student-screening-stat">
                  <dt>Records</dt>
                  <dd>{totalRecords}</dd>
                </div>
              </dl>
            </div>

            {filterActive ? (
              <p className="student-screening-filter-note">
                <Info className="size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Showing records matching{" "}
                  {activeFilterLabel || "the selected filters"}.
                </span>
              </p>
            ) : null}
          </DialogHeader>

          {/* Sticky category bar - jumps to the matching result block. */}
          <nav
            aria-label="Screening categories"
            className="student-screening-nav flex gap-2 overflow-x-auto border-b px-4 py-2.5 sm:px-6"
          >
            {screenings.map((screening) => {
              const Icon = screening.icon;
              const domainClasses =
                SCREENING_DOMAIN_CLASSES[screening.value] ??
                SCREENING_DOMAIN_CLASSES.general;
              const isActive = activeCategory === screening.value;

              return (
                <button
                  key={screening.value}
                  type="button"
                  onClick={() => scrollToCategory(screening.value)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring/60",
                    domainClasses.border,
                    isActive
                      ? cn("text-white shadow-sm", domainClasses.solid)
                      : "bg-card/70 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">
                    {screening.label.replace(/\s*screening$/i, "")}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] font-semibold",
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {screening.data.length}
                  </span>
                </button>
              );
            })}
          </nav>
          </div>

          <div className="space-y-5 px-3 py-4 sm:px-5 sm:py-5">
            {/* Referral Desk — pick a screening, add remarks for that one only. */}
            <ReferralDesk screenings={screenings} />

            {screenings.map((screening, sectionIndex) => {
              const Icon = screening.icon;
              const domainClasses =
                SCREENING_DOMAIN_CLASSES[screening.value] ??
                SCREENING_DOMAIN_CLASSES.general;

              return (
                <section
                  key={screening.value}
                  ref={(node) => {
                    sectionRefs.current[screening.value] = node;
                  }}
                  className={cn(
                    "student-screening-result-category overflow-hidden rounded-2xl border shadow-sm",
                    domainClasses.border,
                  )}
                >
                  <header
                    className={cn(
                      "flex flex-wrap items-center gap-3 px-4 py-3 text-white",
                      domainClasses.solid,
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-inset ring-white/35 backdrop-blur-sm">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold sm:text-base">
                        {screening.label}
                      </h3>
                      <p className="text-[11px] text-white/85">
                        Step {sectionIndex + 1} of {screenings.length} ·{" "}
                        {screening.data.length} record
                        {screening.data.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <span className="ml-auto shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ring-white/25">
                      {screening.data.length} record
                      {screening.data.length === 1 ? "" : "s"}
                    </span>
                  </header>

                  <div className="space-y-3 bg-card/60 p-3 sm:p-4">
                    {screening.data.length ? (
                      screening.data.map((record, recordIndex) => {
                        const clinicalSections = getClinicalSections(
                          record,
                          screening.value,
                        );
                        const identityRows = getIdentityRows(record);

                        return (
                          <article
                            key={
                              record?.id ??
                              record?.record_id ??
                              `${screening.value}-${recordIndex}`
                            }
                            className={cn(
                              "student-screening-result-record space-y-3 rounded-2xl border p-3 sm:p-4",
                              domainClasses.soft,
                              domainClasses.border,
                            )}
                          >
                            {screening.data.length > 1 ? (
                              <div
                                className={cn(
                                  "flex flex-wrap items-center gap-2 border-b pb-2",
                                  domainClasses.border,
                                )}
                              >
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                    domainClasses.chip,
                                    domainClasses.text,
                                  )}
                                >
                                  Record {recordIndex + 1}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ID: {record?.id ?? record?.record_id ?? "-"}
                                </span>
                              </div>
                            ) : null}

                            {identityRows.length > 0 ? (
                              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                                {identityRows.map((row) => (
                                  <div
                                    key={row.label}
                                    className={cn(
                                      "rounded-xl border bg-card/80 p-2.5",
                                      domainClasses.border,
                                    )}
                                  >
                                    <dt
                                      className={cn(
                                        "text-[10px] font-semibold uppercase tracking-wide",
                                        domainClasses.text,
                                      )}
                                    >
                                      {row.label}
                                    </dt>
                                    <dd className="mt-1 break-words text-sm font-medium text-foreground">
                                      {row.value}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            ) : null}

                            {clinicalSections.length > 0 ? (
                              clinicalSections.map((section) => (
                                <section
                                  key={section.title}
                                  className={cn(
                                    "student-screening-result-section overflow-hidden rounded-xl border bg-card/85",
                                    domainClasses.border,
                                  )}
                                >
                                  <h4
                                    className={cn(
                                      "flex items-center gap-2 border-b px-3 py-2 text-xs font-semibold uppercase tracking-wide",
                                      domainClasses.soft,
                                      domainClasses.text,
                                      domainClasses.border,
                                    )}
                                  >
                                    <span
                                      aria-hidden="true"
                                      className={cn(
                                        "size-1.5 shrink-0 rounded-full",
                                        domainClasses.solid,
                                      )}
                                    />
                                    {section.title}
                                  </h4>

                                  <dl className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {section.rows.map((row) => (
                                      <div
                                        key={row.key}
                                        className={cn(
                                          "rounded-lg border bg-background/70 p-2.5",
                                          domainClasses.border,
                                        )}
                                      >
                                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                          {row.label}
                                        </dt>
                                        <dd className="mt-1 break-words text-sm text-foreground">
                                          {row.value}
                                        </dd>
                                      </div>
                                    ))}
                                  </dl>
                                </section>
                              ))
                            ) : (
                              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
                                No screening result fields are available for this
                                record.
                              </p>
                            )}
                          </article>
                        );
                      })
                    ) : (
                      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                        No {screening.label.toLowerCase()} records available.
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailedStudentScreeningView({
  isLoading,
  students,
  campEvent,
  filterActive,
  activeFilterLabel,
}) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Text search across name / id / class / section. The class + section
  // filters already arrive pre-applied via `students`, so this only narrows
  // further — same idea as the search box in the clinical tables.
  const searchedStudents = useMemo(() => {
    const query = String(search ?? "").trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) =>
      [student?.name, student?.studentId, student?.className, student?.sectionName]
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(query)),
    );
  }, [students, search]);

  const totalPages = Math.max(1, Math.ceil(searchedStudents.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const visibleStudents = useMemo(
    () =>
      searchedStudents.slice(
        (safePage - 1) * pageSize,
        (safePage - 1) * pageSize + pageSize,
      ),
    [searchedStudents, safePage, pageSize],
  );

  const totalRows = searchedStudents.length;
  const firstRow = totalRows === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastRow = Math.min(totalRows, safePage * pageSize);

  /* Which student, if any, is "the last one". This list is the source of
     truth for the ordering, so it also owns the flag the referral editor
     reads. Deliberately based on `searchedStudents` (the full filtered set)
     rather than `visibleStudents` (the current page) — otherwise paging to
     an earlier page and saving its final row would falsely offer to complete
     the event. */
  const lastStudentKey = useMemo(() => {
    if (searchedStudents.length === 0) {
      return null;
    }
    const last = searchedStudents[searchedStudents.length - 1];
    return last?.key ?? null;
  }, [searchedStudents]);

  const selectedStudentKey = selectedStudent?.key ?? null;
  const isSelectedStudentLast =
    lastStudentKey != null && selectedStudentKey === lastStudentKey;

  const lastStudentContextValue = useMemo(
    () => ({
      isLastStudent: isSelectedStudentLast,
      eventId: getCampId(campEvent) || null,
      eventLabel: getCampName(campEvent) || "",
    }),
    [isSelectedStudentLast, campEvent],
  );
  const pageSizeChoices = useMemo(
    () =>
      Array.from(
        new Set([10, 30, 50, 100, pageSize].filter((size) => Number(size) > 0)),
      ).sort((a, b) => a - b),
    [pageSize],
  );

  if (isLoading) {
    return (
      <div className="mt-4 flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">
          Loading all screening records…
        </p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="mt-4 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-blue-300 bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-5 py-10 text-center dark:border-blue-800/70 dark:from-blue-950/30 dark:via-background dark:to-cyan-950/20">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
          <FilePenLine className="size-6" />
        </div>
        <h4 className="mt-4 text-base font-semibold text-foreground">
          No student screening data
        </h4>
        <p className="mt-2 max-w-2/3 text-sm leading-6 text-muted-foreground">
          {filterActive
            ? `No records match ${activeFilterLabel || "the selected filters"} at this camp.`
            : "Student-wise screening records will appear here when records are available."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Search — mirrors the clinical tables' per-tab filtering */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-2/3">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              
              setPage(1);
            }}
            placeholder="Search by name, ID, class or section…"
            aria-label="Search students"
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {filterActive ? (
          <p className="break-words text-xs text-muted-foreground sm:text-right">
            {activeFilterLabel} — showing {searchedStudents.length} of{" "}
            {students.length} students
          </p>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-[minmax(0,1fr)_5rem_5.5rem_2.5rem] gap-3 border-b bg-muted/50 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-4">
        <span>Student</span>
        <span>Class</span>
        <span>Section</span>
        <span className="sr-only">Open</span>
      </div>

      <div className="divide-y divide-border">
        {visibleStudents.length ? (
          visibleStudents.map((student) => (
          <button
            key={student.key}
            type="button"
            onClick={() => setSelectedStudent(student)}
            className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_5rem_5.5rem_2.5rem] items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {student.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {student.studentId || "Student ID not provided"}
              </span>
            </span>
            <span className="truncate text-sm text-foreground">
              {student.className}
            </span>
            <span className="truncate text-sm text-foreground">
              {student.sectionName}
            </span>
            <span className="flex justify-end text-muted-foreground">
              <ChevronRight className="size-4" />
            </span>
          </button>
          ))
        ) : (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No students match “{search}”.
          </p>
        )}
        </div>
      </div>

      {/* Footer — same summary + rows-per-page + pager as the clinical tables */}
      {totalRows > 0 ? (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {firstRow}–{lastRow} of {totalRows}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <ReusableSelect
              value={String(pageSize)}
              options={pageSizeChoices.map((size) => ({
                label: String(size),
                value: String(size),
              }))}
              onChange={(value) => {
                setPageSize(Number(value) || 10);
                setPage(1);
              }}
              className="w-24"
              withPortal
            />

            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={setPage}
              showSummary={false}
            />
          </div>
        </div>
      ) : null}

      {selectedStudent ? (
        <LastStudentContext.Provider value={lastStudentContextValue}>
          <StudentResultsPopup
            student={selectedStudent}
            campEvent={campEvent}
            filterActive={filterActive}
            activeFilterLabel={activeFilterLabel}
            onClose={() => setSelectedStudent(null)}
          />
        </LastStudentContext.Provider>
      ) : null}
    </>
  );
}

/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function PrimaryDoctorTab({
  event,
  camp,
  classFilter = "all",
  sectionFilter = "all",
  assignedScreeningKeys = [],
  assignedScreeningIds = [],
  activeEvent,
}) {
  const [screeningViewMode, setScreeningViewMode] = useState("clinical");
  const [screeningTab, setScreeningTab] = useState("general");
  const campEvent = event ?? camp ?? null;
  const campId =
    String(campEvent?.id ?? campEvent?.campId ?? "") ??
    campEvent?.campId ??
    "";

  // Register the backend's real screening-type ids before translating.
  useScreeningIdMap();

  // Join into a string so the memo keys off the VALUE, not the array identity —
  // the parent rebuilds these arrays on every render.
  const assignedScreeningKeysKey = Array.isArray(assignedScreeningKeys)
    ? assignedScreeningKeys.filter(Boolean).join(",")
    : "";
  const assignedScreeningIdsKey = Array.isArray(assignedScreeningIds)
    ? assignedScreeningIds.filter(Boolean).join(",")
    : "";
console.log();

  const activeScreeningKeys = useMemo(() => {
    if (assignedScreeningKeysKey) {
      return assignedScreeningKeysKey.split(",").filter(Boolean);
    }

    // The parent passes the camp's raw ids, so resolve those before falling
    // back to the event itself.
    if (assignedScreeningIdsKey) {
      return getScreeningKeys({
        screening_type_ids: assignedScreeningIdsKey.split(","),
      });
    }

    return getScreeningKeys(campEvent);
  }, [assignedScreeningKeysKey, assignedScreeningIdsKey, campEvent]);

  // Keep the selected tab valid when the camp only allows a subset. Derived
  // rather than synced with an effect: a camp change must not need a second
  // render pass to correct the tab, and setState-in-effect cascades renders.
  const effectiveScreeningTab =
    activeScreeningKeys.length && !activeScreeningKeys.includes(screeningTab)
      ? activeScreeningKeys[0]
      : screeningTab;

  const {
    campScreeningRecords = [],
    campVisionScreeningRecords = [],
    campDentalScreeningRecords = [],
    campHearingScreeningRecords = [],
    campEntScreeningRecords = [],

    isLoading: generalLoading,
    visionLoading,
    dentalLoading,
    hearingLoading,
    entLoading,

    screeningPagination,
    screeningPageSize,
    goToScreeningPage,
    setScreeningPageSize,
  } = useAllScreeningReport({
    campId,
    classFilter,
    sectionFilter,
  });

  console.log(campDentalScreeningRecords, "campDentalScreeningRecords");

  /* ------------------------------------------------------------------------ */
  /* Camp Information                                                         */
  /* ------------------------------------------------------------------------ */

  const primaryDoctorId = getCampPrimaryDoctorId(campEvent);
  const doctorIds = getCampDoctorIds(campEvent);
  const campName = getCampName(campEvent) || "No camp selected";
  const campDateLabel = formatCampDate(getCampDate(campEvent));

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  const isLoading =
    generalLoading ||
    visionLoading ||
    dentalLoading ||
    hearingLoading ||
    entLoading;

  const filterActive =
    isFilterActive(classFilter) || isFilterActive(sectionFilter);

  const screenings = useMemo(() => {
    const applyStudentFilter = (rows) => {
      const list = Array.isArray(rows) ? rows : [];
      if (!filterActive) {
        return list;
      }

      return list.filter((record) =>
        matchesStudentFilter(record, classFilter, sectionFilter),
      );
    };

    const filteredPagination = (pagination, visibleCount) => {
      if (!filterActive) {
        return pagination;
      }

      const pageSize = Number(pagination?.pageSize) || screeningPageSize;

      return {
        ...pagination,
        totalRows: visibleCount,
        totalPages: Math.max(1, Math.ceil(visibleCount / pageSize)),
      };
    };

    const filteredGeneral = applyStudentFilter(campScreeningRecords);
    const filteredVision = applyStudentFilter(campVisionScreeningRecords);
    const filteredDental = applyStudentFilter(campDentalScreeningRecords);
    const filteredHearing = applyStudentFilter(campHearingScreeningRecords);
    const filteredEnt = applyStudentFilter(campEntScreeningRecords);

    console.log(filteredGeneral, "filteredGeneral");
    console.log(campScreeningRecords, "campScreeningRecords");

    return [
      {
        value: "general",
        label: "General Screening",
        type: "General",
        icon: Activity,
        data: filteredGeneral,
        pagination: filteredPagination(
          screeningPagination?.general,
          filteredGeneral.length,
        ),
        loading: generalLoading,
      },
      {
        value: "vision",
        label: "Vision Screening",
        type: "Vision",
        icon: Eye,
        data: filteredVision,
        pagination: filteredPagination(
          screeningPagination?.vision,
          filteredVision.length,
        ),
        loading: visionLoading,
      },
      {
        value: "dental",
        label: "Dental Screening",
        type: "Dental",
        icon: ToothIcon,
        data: filteredDental,
        pagination: filteredPagination(
          screeningPagination?.dental,
          filteredDental.length,
        ),
        loading: dentalLoading,
      },
      {
        value: "hearing",
        label: "Hearing Screening",
        type: "Hearing",
        icon: Ear,
        data: filteredHearing,
        pagination: filteredPagination(
          screeningPagination?.hearing,
          filteredHearing.length,
        ),
        loading: hearingLoading,
      },
      {
        value: "ent",
        label: "ENT Screening",
        type: "ENT",
        icon: Heart,
        data: filteredEnt,
        pagination: filteredPagination(
          screeningPagination?.ent,
          filteredEnt.length,
        ),
        loading: entLoading,
      },
    ].filter((screening) =>
      isScreeningKeyAssigned(activeScreeningKeys, screening.value),
    );
  }, [
    campScreeningRecords,
    campVisionScreeningRecords,
    campDentalScreeningRecords,
    campHearingScreeningRecords,
    campEntScreeningRecords,
    screeningPagination,
    screeningPageSize,
    generalLoading,
    visionLoading,
    dentalLoading,
    hearingLoading,
    entLoading,
    filterActive,
    classFilter,
    sectionFilter,
    activeScreeningKeys,
  ]);

  const uniqueStudents = useMemo(() => {
    const studentsByKey = new Map();

    screenings.forEach((screening) => {
      screening.data.forEach((record) => {
        const studentName = getRecordStudentName(record);
        const className = getRecordStudentClass(record);
        const sectionName = getRecordStudentSection(record);
        const profileKey = [
          studentName,
          className,
          sectionName,
        ]
          .map((value) => normalizeFilterValue(value))
          .filter(Boolean)
          .join("|");
        const key = profileKey
          ? `profile:${profileKey}`
          : getStudentDedupeKey(record);

        if (!key) return;

        const existing = studentsByKey.get(key);

        if (existing) {
          if (!existing.studentId) {
            existing.studentId = getRecordStudentId(record);
          }

          const existingScreening = existing.screenings.find(
            (item) => item.value === screening.value,
          );

          if (existingScreening) {
            existingScreening.data.push(record);
          } else {
            existing.screenings.push({
              value: screening.value,
              label: screening.label,
              type: screening.type,
              icon: screening.icon,
              data: [record],
            });
          }
          return;
        }

        studentsByKey.set(key, {
          key,
          studentId: getRecordStudentId(record),
          name: studentName || "Unnamed student",
          className: className || "—",
          sectionName: sectionName || "—",
          screenings: [
            {
              value: screening.value,
              label: screening.label,
              type: screening.type,
              icon: screening.icon,
              data: [record],
            },
          ],
        });
      });
    });

    return Array.from(studentsByKey.values()).sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }, [screenings]);

  /* ------------------------------------------------------------------------ */
  /* Filter summary (shown next to the section heading)                        */
  /* ------------------------------------------------------------------------ */

  const loadedRecordCount =
    (campScreeningRecords?.length ?? 0) +
    (campVisionScreeningRecords?.length ?? 0) +
    (campDentalScreeningRecords?.length ?? 0) +
    (campHearingScreeningRecords?.length ?? 0) +
    (campEntScreeningRecords?.length ?? 0);

  const visibleRecordCount = screenings.reduce(
    (total, item) => total + (item.data?.length ?? 0),
    0,
  );

  const activeFilterLabel = [
    isFilterActive(classFilter) ? `Class ${classFilter}` : null,
    isFilterActive(sectionFilter) ? `Section ${sectionFilter}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Primary Doctor */}
      <section className="w-full min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4 md:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-10">
            <Stethoscope className="size-4 sm:size-5" />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground sm:text-base">
              Primary Doctor
            </h2>

            <p className="mt-0.5 break-words text-xs text-muted-foreground sm:text-sm">
              {campName}
              {campDateLabel && ` - ${campDateLabel}`}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid w-full grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2">
          <InfoTile icon={UserRound} label="Primary Doctor ID">
            {primaryDoctorId ?? (
              <span className="text-muted-foreground">Not assigned</span>
            )}
          </InfoTile>

          <InfoTile icon={CalendarDays} label="Assigned Doctors">
            {doctorIds.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {doctorIds.map((id) => (
                  <span
                    key={id}
                    className="max-w-full break-all rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-primary"
                  >
                    {id}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-muted-foreground">Not assigned</span>
            )}
          </InfoTile>
        </dl>
      </section>

      {/* Screening Records */}
      <section className="w-full min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4 md:p-5">
        {/* Header */}
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="min-w-0 text-sm font-semibold text-foreground">
            Screening Records at This Camp
          </h3>

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            {filterActive ? (
              <p className="break-words text-xs text-muted-foreground lg:text-right">
                {activeFilterLabel} — showing {visibleRecordCount} of{" "}
                {loadedRecordCount} loaded
              </p>
            ) : null}

            <div
              className="inline-flex w-fit items-center gap-1 rounded-xl border border-border bg-muted/60 p-1"
              role="tablist"
              aria-label="Screening record view mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={screeningViewMode === "clinical"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  screeningViewMode === "clinical"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setScreeningViewMode("clinical")}
              >
                <Stethoscope className="size-3.5" />
                Clinical mode
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={screeningViewMode === "detailed"}
                // className={cn(
                //   "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                //   screeningViewMode === "detailed"
                //     ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20"
                //     : "text-muted-foreground hover:text-foreground",
                // )}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  screeningViewMode === "detailed"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setScreeningViewMode("detailed")}
              >
                <FilePenLine className="size-3.5" />
                Detailed mode
              </button>
            </div>
          </div>
        </div>

        {screeningViewMode === "detailed" ? (
          <DetailedStudentScreeningView
            isLoading={isLoading}
            students={uniqueStudents}
            campEvent={campEvent}
            filterActive={filterActive}
            activeFilterLabel={activeFilterLabel}
          />
        ) : (
          <>
        {isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Loading screening records…
          </p>
        ) : (
          <Tabs
            value={effectiveScreeningTab}
            onValueChange={setScreeningTab}
            className="mt-3 w-full min-w-0"
          >
            {/* Tabs */}
            {/* No scroll container here: overflow used to render the global
                styled scrollbar as a stray bar under the tabs. The tabs now
                share the available width instead of overflowing. */}
            <div className="w-full min-w-0">
              <TabsList
                className="flex h-auto w-full gap-1 p-1 sm:grid sm:grid-cols-3 lg:grid-cols-5"
              >
                {screenings.map(({ value, label, icon: Icon, data }) => {
                  const tabDomainClasses = SCREENING_DOMAIN_CLASSES[value];

                  return (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className={cn(
                        `flex min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden px-1.5 py-2 text-xs sm:gap-2 sm:px-3 sm:text-sm`,
                        effectiveScreeningTab === value && tabDomainClasses?.soft,
                        effectiveScreeningTab === value && tabDomainClasses?.text,
                      )}
                    >
                      <Icon className="size-3.5 shrink-0 sm:size-4" />
                      <span className="min-w-0 truncate hidden md:inline">
                        {label}
                      </span>
                      <span
                        className={cn(
                          `shrink-0 rounded-full px-1 py-0.5 text-[10px] font-semibold sm:px-2 sm:text-xs`,
                          tabDomainClasses?.chip ?? "bg-muted text-primary",
                        )}
                      >
                        {data.length}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Tab Content */}
            {screenings.map(({ value, type, data, pagination, loading }) => (
              <TabsContent
                key={value}
                value={value}
                className="mt-3 w-full min-w-0 max-w-full overflow-hidden"
              >
          
                <div className="w-full min-w-0 max-w-full">
                  <ScreeningTable
                    data={data}
                    campEvent={campEvent}
                    type={type}
                    pagination={pagination}
                    isLoading={loading}
                    pageSize={screeningPageSize}
                    onPageSizeChange={setScreeningPageSize}
                    onPageChange={(page) => goToScreeningPage(value, page)}
                    activeTab={effectiveScreeningTab}
                    filterActive={filterActive}
                    activeFilterLabel={activeFilterLabel}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
          </>
        )}
      </section>
    </div>
  );
}
