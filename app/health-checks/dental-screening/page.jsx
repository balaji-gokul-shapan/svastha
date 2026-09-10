"use client";
import * as React from "react";
import dynamic from "next/dynamic";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronDown,
  Circle,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldAlert,
  Summary,
  TriangleAlert,
  X,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getDentalScreening } from "@/lib/features/getDentalScreening";
import { createDentalScreening } from "@/lib/features/registerDentalScreening";
import CampStudentSelectorDrawer from "@/components/health-checks/camp-student-selector-drawer";
import { ToothChartSvg, ToothDetailGraphic } from "./asset/tooth-chart-svg";
import {
  assistantOptions,
  examinerOptions,
  gingivalHealthOptions,
  getToothName,
  initialToothChart,
  locationOptions,
  oralHygieneOptions,
  otherFindingsOptions,
  plaqueOptions,
  toothChartLegend,
  PRIMARY_TEETH_UPPER,
  PRIMARY_TEETH_LOWER,
} from "./datas/dental-screening-data";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useStudentData from "@/components/health-checks/getStudentData";
import AssessmentCard from "@/app/ui/AssessmentCard";
import { ScoreMeter } from "./utilities/scoreMeter";
import { EmptyState } from "@/components/ui/empty-state";
import ToothIcon from "./asset/toothIcon";
import StudentProfileCard from "@/app/students/utilities/studentProfileCard";
import { cn } from "@/lib/utils";
import StudentFilter from "../utilities/studentFilter";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import { dentalScreeningSchema } from "./datas/dental-screening-schema";
import { FramerCard } from "@/util/FramerCard";
import { getMasterData } from "@/util/masterData";
import { getAllMasterScreening } from "@/lib/features/masterScreeningSlice";
import { getAssignEvent } from "@/lib/features/getEventAssignSlice";
import { selectAuthUser } from "@/lib/features/auth-slice";
import ScreeningStepper from "@/components/ScreeningStepper";
import ReusableSelect from "@/components/ui/reusable-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getDentalCodingScreening } from "@/lib/features/getDentalCodingsSlice";
import { getDentalConditionsScreening } from "@/lib/features/getDentalConditions";
import { TextField } from "@/components/ui/text-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DentalSectionLoading = () => (
  <div className="min-h-24 rounded-xl border border-border bg-card p-4" />
);

const QuickFindingSummary = dynamic(
  () => import("./components/QuickFindingSummary"),
  { loading: DentalSectionLoading },
);
const OralHygenic = dynamic(() => import("./components/OralHygenic"), {
  loading: DentalSectionLoading,
});
const RiskSeverity = dynamic(() => import("./components/RiskSeverity"), {
  loading: DentalSectionLoading,
});
const OtherFindings = dynamic(() => import("./components/OtherFindings"), {
  loading: DentalSectionLoading,
});
const Notes = dynamic(() => import("./components/Notes"), {
  loading: DentalSectionLoading,
});
const Review = dynamic(() => import("./components/Review"), {
  loading: DentalSectionLoading,
});

const DENTAL_STEPS = [
  { value: "chart", label: "Tooth Chart", shortLabel: "Chart" },
  { value: "hygiene", label: "Oral Hygiene", shortLabel: "Hygiene" },
  { value: "findings", label: "Dental Findings", shortLabel: "Findings" },
  // { value: "notes", label: "Notes", shortLabel: "Notes" },
  { value: "Review", label: "Review & Submit", shortLabel: "Review" },
];

function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-xs text-muted-foreground">
      {children}
    </label>
  );
}

function SelectField({ label, options, value, onChange, icon: Icon }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {Icon ? (
          <Icon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        ) : (
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

const SUMMARY_ICONS = {
  caries: { icon: ShieldAlert, tone: "text-destructive bg-destructive/10" },
  other: { icon: TriangleAlert, tone: "text-warning bg-warning/10" },
  healthy: { icon: Circle, tone: "text-success bg-success/10" },
  missing: { icon: Circle, tone: "text-muted-foreground bg-muted" },
};

function formatDate(iso) {
  if (!iso) return "--";
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime())
    ? "--"
    : parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

const TOOTH_STATUS_SET = new Set([
  "healthy",
  "caries",
  "filled",
  "missing",
  "sealant",
  "other",
]);
const DEFAULT_ACADEMIC_YEAR = "2026-2027";

function mapDentalCodingOptions(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      value: String(item?.code ?? item?.name ?? "").trim(),
      label: String(item?.name ?? item?.code ?? "").trim(),
    }))
    .filter((option) => option.value.length > 0);
}

function normalizeToothStatus(value) {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();
  return TOOTH_STATUS_SET.has(status) ? status : null;
}

// Maps a dental condition (master-list name) to a tooth-chart status so the
// chart paints itself from the coding entries the user saves. Anything not
// listed falls back to "other" (amber) — Mobility, Abscess, Spacing, etc.
const CONDITION_TO_STATUS = {
  "no abnormality detected": "healthy",
  "na - not applicable": "healthy",
  "dental caries": "caries",
  caries: "caries",
  missing: "missing",
  filled: "filled",
  restoration: "filled",
  sealant: "sealant",
};

function mapConditionToStatus(conditionLabel) {
  const key = String(conditionLabel ?? "")
    .trim()
    .toLowerCase();
  return CONDITION_TO_STATUS[key] ?? "other";
}
// Extracts an FDI tooth number from the tail of a coding string, e.g.
// "K02.83" or "83" → 83 (the user's convention: coding ends with the tooth).
// Returns null when the tail isn't a plausible tooth number (must be two
// digits within adult 11-48 or primary 51-85) so the caller can fall back
// to the currently selected tooth instead of painting a bogus cell.
function extractToothFromCoding(coding) {
  const tail = String(coding ?? "")
    .trim()
    .slice(-2);
  if (!/^\d{2}$/.test(tail)) {
    return null;
  }
  const number = Number(tail);
  const isAdult = number >= 11 && number <= 48;
  const isPrimary = number >= 51 && number <= 85;
  return isAdult || isPrimary ? number : null;
}

function parseToothArrayCandidate(value) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (parsed && Array.isArray(parsed.teeth)) {
        return parsed.teeth;
      }
    } catch {
      return null;
    }
  }

  if (typeof value === "object" && Array.isArray(value.teeth)) {
    return value.teeth;
  }

  return null;
}

function buildChartFromRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const chartSource =
    parseToothArrayCandidate(record?.tooth_chart) ??
    parseToothArrayCandidate(record?.toothChart) ??
    parseToothArrayCandidate(record?.chart) ??
    parseToothArrayCandidate(record?.teeth) ??
    parseToothArrayCandidate(record?.tooth_details);

  if (!Array.isArray(chartSource) || !chartSource.length) {
    return null;
  }

  const byNumber = new Map(
    initialToothChart.map((tooth) => [tooth.number, { ...tooth }]),
  );

  chartSource.forEach((item) => {
    const number = Number(
      item?.number ?? item?.toothNumber ?? item?.tooth_number ?? item?.id,
    );

    if (!Number.isFinite(number) || !byNumber.has(number)) {
      return;
    }

    const existing = byNumber.get(number);
    const normalizedStatus = normalizeToothStatus(
      item?.status ?? item?.tooth_status ?? item?.condition ?? item?.state,
    );

    byNumber.set(number, {
      ...existing,
      ...item,
      number,
      status: normalizedStatus ?? existing.status,
    });
  });

  return Array.from(byNumber.values());
}

function buildChartFromCounts(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const toCount = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  };

  const counts = {
    missing: toCount(record?.missing_count),
    caries: toCount(record?.caries_count),
    other: toCount(record?.other_issues_count ?? record?.other_count),
  };

  if (!counts.missing && !counts.caries && !counts.other) {
    return null;
  }

  const nextChart = initialToothChart.map((tooth) => ({
    ...tooth,
    status: "healthy",
    surface: "-",
    severity: "-",
    treatment: "No treatment needed",
  }));

  const assignStatus = (status, count) => {
    let assigned = 0;
    for (
      let index = 0;
      index < nextChart.length && assigned < count;
      index += 1
    ) {
      if (nextChart[index].status === "healthy") {
        nextChart[index].status = status;
        assigned += 1;
      }
    }
  };

  assignStatus("missing", counts.missing);
  assignStatus("caries", counts.caries);
  assignStatus("other", counts.other);

  return nextChart;
}

export default function DentalAssessmentPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [assessmentDate, setAssessmentDate] = useState("2025-08-05");
  const [location, setLocation] = useState(locationOptions[0]);
  const [examiner, setExaminer] = useState(examinerOptions[0]);
  const [assistant, setAssistant] = useState(assistantOptions[0]);

  const [chart, setChart] = useState(initialToothChart);

  const {
    data: masterScreeningData = {},
    isLoading: masterScreeningDataLoading,
    error: masterScreeningQueryError,
  } = useQuery({
    queryKey: ["Ent-screening"],
    queryFn: () => dispatch(getAllMasterScreening()).unwrap(),
    // Master data doesn't normally need to be
    // requested again immediately.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Slice state for pagination metadata (loadingMore, codingPage, codingTotal).
  const dentalCodingMeta = useAppSelector((state) => state.getDentalCoding);
  const getDentalCoding = dentalCodingMeta?.dentalCodingData ?? [];
  const getDentalCodingLoading = dentalCodingMeta?.loading ?? false;
  const getDentalCodingLoadingMore = dentalCodingMeta?.loadingMore;

  useEffect(() => {
    if (!dentalCodingMeta?.codingPage) {
      dispatch(getDentalCodingScreening({ page: 1, perPage: 50 }));
    }
  }, [dispatch, dentalCodingMeta?.codingPage]);

  const {
    data: getDentalCondition = [],
    isLoading: getDentalConditionLoading,
    error: getDentalConditionError,
  } = useQuery({
    queryKey: ["dental-Condition"],
    queryFn: async () => {
      const result = await dispatch(getDentalConditionsScreening()).unwrap();

      return result?.[0]?.data ?? [];
    },
    refetchOnWindowFocus: false,
  });
  console.log(getDentalCondition, "getDentalCondition");

  const requiredMasterData = React.useMemo(
    () =>
      getMasterData(masterScreeningData, [
        "dental-conditions",
        "dental-treatments",
        "oral-hygiene-statuses",
        "plaque-scores",
      ]),
    [masterScreeningData],
  );
  const OralHygieneMasterData =
    requiredMasterData["oral-hygiene-statuses"] ?? [];
  const PlaqueScoreMasterData = requiredMasterData["plaque-scores"] ?? [];
  const DentalConditionsMasterData =
    requiredMasterData["dental-conditions"] ?? [];
  const DentalTreatmentsMasterData =
    requiredMasterData["dental-treatments"] ?? [];

  // Dental treatments master data → option names for the Treatment select.
  const DentalTreatmentOptionData = (
    Array.isArray(DentalTreatmentsMasterData) ? DentalTreatmentsMasterData : []
  )
    .map((item) => String(item?.name ?? "").trim())
    .filter(Boolean);

  // Map a treatment display name → the matching dental-treatments master id
  // (the dental_codings payload stores foreign keys, not the display label).
 const getDentalTreatmentId = (treatmentName) =>
  String(
    (Array.isArray(DentalTreatmentsMasterData)
      ? DentalTreatmentsMasterData
      : []
    ).find(
      (t) =>
        String(t?.name ?? "").trim() ===
        String(treatmentName ?? "").trim()
    )?.id ?? ""
  );


  // Coding dropdown: show the human-readable name, store the code as the
  // payload value. Falls back to name if code is missing.
  const getDentalCodingOptions = mapDentalCodingOptions(getDentalCoding);

  const getDentalCondtionOptions = (
    Array.isArray(getDentalCondition) ? getDentalCondition : []
  ).map((item) => String(item?.name ?? "").trim());

  // Plaque scores → plaque toggle options ({value, label, tone}); falls
  // back to the built-in list while master data loads.
  const plaqueToggleOptions =
    Array.isArray(PlaqueScoreMasterData) && PlaqueScoreMasterData.length > 0
      ? PlaqueScoreMasterData.map((item) => {
          const label = String(item?.name ?? "").trim();
          const value = label.toLowerCase();
          const tone =
            value.includes("none") ||
            value.includes("healthy") ||
            value.includes("good")
              ? "good"
              : value.includes("severe") ||
                  value.includes("heavy") ||
                  value.includes("bad")
                ? "bad"
                : "warn";
          return { value, label, tone };
        })
      : plaqueOptions;

 
  const gingivalHealthSource =
    Array.isArray(getDentalCondition) && getDentalCondition.length > 0
      ? getDentalCondition
      : Array.isArray(DentalConditionsMasterData)
        ? DentalConditionsMasterData
        : [];

const gingivalHealthToggleOptions = gingivalHealthOptions
  .map((item) => {
    const label = String(item?.label ?? "").trim();
    const value = String(item?.value ?? "").trim().toLowerCase();
    const severity = String(item?.severity ?? "").trim().toLowerCase();

    let tone = "neutral";

    if (severity.includes("high")) {
      tone = "bad";
    } else if (severity.includes("medium")) {
      tone = "warn";
    } else if (
      severity.includes("low") ||
      severity.includes("none")
    ) {
      tone = "good";
    } else if (value === "good" || label.toLowerCase() === "good") {
      tone = "good";
    } else if (value === "fair" || label.toLowerCase() === "fair") {
      tone = "warn";
    } else if (value === "poor" || label.toLowerCase() === "poor") {
      tone = "bad";
    }

    return {
      value,
      label,
      tone,
    };
  })
  .filter((option) => option.value);

console.log(
  gingivalHealthToggleOptions,
  "gingivalHealthToggleOptions"
);

  // Map master-data oral hygiene records to toggle options ({value, label,
  // tone}) and append them after the built-in ones (deduped by value).
  const oralHygieneToggleOptions = [
    ...oralHygieneOptions,
    ...(Array.isArray(OralHygieneMasterData) ? OralHygieneMasterData : [])
      .map((item) => {
        const label = String(item?.name ?? "").trim();
        const value = label.toLowerCase();
        const tone =
          value.includes("good") || value.includes("excellent")
            ? "good"
            : value.includes("poor") || value.includes("bad")
              ? "bad"
              : "warn";
        return { value, label, tone };
      })
      .filter(
        (option) =>
          option.value &&
          !oralHygieneOptions.some(
            (existing) => existing.value === option.value,
          ),
      ),
  ];

  const [oralHygiene, setOralHygiene] = useState("");
  const [gingivalHealth, setGingivalHealth] = useState("na");
  const [plaque, setPlaque] = useState("mild");
  const [otherFindings, setOtherFindings] = useState({});
  const [notes, setNotes] = useState("");
  const [referralAction, setReferralAction] = useState("");
  const [referralReason, setReferralReason] = useState("");
  const [followUpValue, setFollowUpValue] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [sidebarNotes, setSidebarNotes] = useState("");

  // Separate tooth selection for each tab
  const [selectedPrimaryTooth, setSelectedPrimaryTooth] = useState(null);
  const [selectedAdultTooth, setSelectedAdultTooth] = useState(null);
  const [activeToothTab, setActiveToothTab] = useState("primary");
  // const [getDentalCodingValue, setDentalCodingValue] = useState("");
  // const [DentalConditionValue, setDentalConditionValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
   const isSavingRef = useRef(false);
  const [dentalFindingEntries, setDentalFindingEntries] = useState([]);
  const [dentalCodingEntries, setDentalCodingEntries] = useState([]);
  const [isCodingPopupOpen, setIsCodingPopupOpen] = useState(false);
  const [popupCodingValue, setPopupCodingValue] = useState("");
  const [popupConditionValue, setPopupConditionValue] = useState("");
  const [popupTreatmentValue, setPopupTreatmentValue] = useState("");
  const [popupSurfaceValue, setPopupSurfaceValue] = useState("");
   // Tracks the last successfully saved student (create-only flow): once a
  // student is saved, further save clicks for the SAME student are blocked;
  // selecting a different student changes the key and unblocks saving.
  const savedStudentKeyRef = useRef(null);
  // State mirror of savedStudentKeyRef so the Save button can disable itself
  // after the current student is saved (refs don't trigger re-renders).
  const [savedStudentKey, setSavedStudentKey] = useState(null);

  // When set, the popup is editing an existing entry (chip click); null = add mode.
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [codingSearchTerm, setCodingSearchTerm] = useState("");
  const [codingSearchOptions, setCodingSearchOptions] = useState(null);
  const [selectedTeeth, setSelectedTeeth] = useState({
    number: 0,
    status: 0,
    surface: 0,
    severity: 0,
    treatment: "",
    condition: "",
    risk: "",
  });

  // Get the current selected tooth based on active tab
  const selectedTooth =
    activeToothTab === "primary" ? selectedPrimaryTooth : selectedAdultTooth;
  const handlePrimaryToothSelect = (number) => {
    setSelectedPrimaryTooth(number);
    setActiveToothTab("primary");
  };

  const handleAdultToothSelect = (number) => {
    setSelectedAdultTooth(number);
    setActiveToothTab("adult");
  };

  // const handleToothTabChange = (tab) => {
  //   setActiveToothTab(tab);

  //   // Preserve selected tooth per tab
  //   if (tab === "primary") {
  //     setSelectedPrimaryTooth(
  //       (current) => current ?? PRIMARY_TEETH_UPPER[0] ?? null,
  //     );
  //     return;
  //   }

  //   setSelectedAdultTooth(
  //     (current) => current ?? initialToothChart[0]?.number ?? null,
  //   );
  // };
  const handleToothTabChange = (tab) => {
    // Switching primary ↔ adult resets the assessment for the new arch:
    // drop any added coding entries and restore the chart to healthy so the
    // other dentition starts clean. (The chips in "Dental Information" and the
    // painted teeth both derive from these two states.)
    setDentalCodingEntries([]);
    setChart(initialToothChart.map((tooth) => ({ ...tooth })));

    if (tab === "primary") {
      setSelectedPrimaryTooth(PRIMARY_TEETH_UPPER[0] ?? null);
      setActiveToothTab("primary");
      return;
    }

    setSelectedAdultTooth(initialToothChart[0]?.number ?? null);
    setActiveToothTab("adult");
  };

  const handleToothSelect = (number) => {
    if (activeToothTab === "primary") {
      handlePrimaryToothSelect(number);
      return;
    }

    handleAdultToothSelect(number);
  };

  const authUser = useAppSelector(selectAuthUser);

  // { fieldName: "message" } — populated when zod validation fails.
  const [formErrors, setFormErrors] = useState(null);

  // When true, the auto-apply effect (line ~1009) skips re-populating the
  // form — set right before a post-save reset so the refetched record can't
  // restore the values we just cleared.
  const resetAfterSaveRef = useRef(false);

  const clearFormError = (field) =>
    setFormErrors((prev) =>
      prev && prev[field] ? { ...prev, [field]: undefined } : prev,
    );

  const handleNotesChange = (value) => {
    setNotes(value);
    clearFormError("notes");
  };
  const [isCaDrawerOpen, setIsCaDrawerOpen] = useState(false);
  const [selectedCampId, setSelectedCampId] = useState("1");
  const [studentId, setStudentId] = useState("");
  const [activeDentalStep, setActiveDentalStep] = useState("chart");
  const [academicYear, setAcademicYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("all");
  const [schoolName, setSchoolName] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [getStudentDataByEvent, setGetStudentDataByEvent] = useState([]);

  // const { data: filterPayload, isLoading } = useQuery({
  //   queryKey: ["filter-student", schoolName, academicYear, "options"],
  //   queryFn: () =>
  //     dispatch(
  //       getFilterStudent({
  //         all: true,
  //         status: "all",
  //         schoolName,
  //         academicYear,
  //         sortBy: "name",
  //         sortOrder: "asc",
  //         search: "",
  //       }),
  //     ).unwrap(),
  //   staleTime: 0,
  //   refetchOnWindowFocus: true,
  // });
  const studentsArray = useMemo(() => {
    if (Array.isArray(getStudentDataByEvent?.students?.data)) {
      return getStudentDataByEvent.students.data;
    }
    if (Array.isArray(getStudentDataByEvent?.students)) {
      return getStudentDataByEvent.students;
    }
    if (Array.isArray(getStudentDataByEvent?.data)) {
      return getStudentDataByEvent.data;
    }
    if (Array.isArray(getStudentDataByEvent)) {
      return getStudentDataByEvent;
    }
    return [];
  }, [getStudentDataByEvent]);
  const {
    data: assignedEvents,
    isLoading: assignEventLoading,
    error: assignEventError,
  } = useQuery({
    queryKey: ["get-event", authUser?.id ?? authUser?.Id ?? null],
    queryFn: () => {
      const userId = authUser?.id ?? authUser?.Id;
      if (!userId) {
        throw new Error("Signed-in user not available yet");
      }
      return dispatch(getAssignEvent({ id: userId })).unwrap();
    },
    enabled: Boolean(authUser?.id ?? authUser?.Id),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const {
    data: dentalScreeningData = [],
    isLoading: dentalScreeningLoading,
    error: dentalScreeningQueryError,
  } = useQuery({
    queryKey: ["dental-screening", studentId],
    queryFn: () => dispatch(getDentalScreening({ studentId })).unwrap(),
    enabled: Boolean(String(studentId).trim()),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Create a map for quick tooth lookup including primary teeth
  const toothMap = useMemo(() => {
    const map = new Map();
    // Add adult teeth from chart
    chart.forEach((t) => map.set(t.number, t));
    // Add primary teeth with default values if not present
    const allPrimaryTeeth = [
      ...(PRIMARY_TEETH_UPPER || []),
      ...(PRIMARY_TEETH_LOWER || []),
    ];
    allPrimaryTeeth.forEach((number) => {
      if (!map.has(number)) {
        map.set(number, {
          number,
          status: "healthy",
          surface: "",
          severity: "",
          treatment: "No treatment needed",
          risk: "",
          condtion: "",
        });
      }
    });
    setSelectedTeeth(allPrimaryTeeth);
    return map;
  }, [chart]);

  const currentTooth = useMemo(
    () => toothMap.get(selectedTooth) || null,
    [toothMap, selectedTooth],
  );
  console.log(currentTooth, "selectedTeeth");

  console.log(popupCodingValue, popupConditionValue, "popupCodingValue");

  // const hasDentalRecords = dentalScreeningData.length > 0;

  // const getData = useStudentData(selectedCampId);

  // const camps = useMemo(
  //   () => (Array.isArray(getData.campsData) ? getData.campsData : []),
  //   [getData.campsData],
  // );

  // const campOptions = useMemo(() => {
  //   return camps
  //     .map((item) => {
  //       const value = String(item.id ?? item.campId ?? item.camp_id ?? "");
  //       const label =
  //         item.name ??
  //         item.camp_name ??
  //         item.title ??
  //         item.doctor_name ??
  //         (value ? `Camp ${value}` : "");

  //       return { value, label: String(label) };
  //     })
  //     .filter((item) => item.value && item.label);
  // }, [camps]);

  // const campStudents = useMemo(() => {
  //   if (!getData.filteredCampRows.length) {
  //     return [];
  //   }

  //   return getData.filteredCampRows.flatMap((row) => {
  //     if (Array.isArray(row?.students)) {
  //       return row.students;
  //     }

  //     if (Array.isArray(row?.student)) {
  //       return row.student;
  //     }

  //     if (row?.student && typeof row.student === "object") {
  //       return [row.student];
  //     }

  //     if (
  //       row &&
  //       typeof row === "object" &&
  //       (row.student_id || row.studentId || row.school_registration_number)
  //     ) {
  //       return [row];
  //     }

  //     return [];
  //   });
  // }, [getData.filteredCampRows]);

  // const academicYears = useMemo(() => {
  //   const yearSet = new Set();

  //   campStudents.forEach((student) => {
  //     const year = student?.academic_year ?? student?.academicYear ?? "";
  //     if (String(year).trim()) {
  //       yearSet.add(String(year).trim());
  //     }
  //   });

  //   return Array.from(yearSet).sort((a, b) =>
  //     a.localeCompare(b, undefined, { numeric: true }),
  //   );
  // }, [campStudents]);

  // const activeAcademicYear = useMemo(() => {
  //   if (!selectedCampId) {
  //     return "";
  //   }

  //   if (academicYears.includes(academicYear)) {
  //     return academicYear;
  //   }

  //   return academicYears[0] ?? "";
  // }, [academicYear, academicYears, selectedCampId]);

  // const classOptions = useMemo(() => {
  //   if (!selectedCampId) {
  //     return ["all"];
  //   }

  //   const classSet = new Set();

  //   campStudents.forEach((student) => {
  //     const year = String(
  //       student?.academic_year ?? student?.academicYear ?? "",
  //     ).trim();
  //     if (activeAcademicYear && year && year !== activeAcademicYear) {
  //       return;
  //     }

  //     const classValue = String(
  //       student?.Class ?? student?.class ?? student?.grade ?? "",
  //     )
  //       .split("-")[0]
  //       .trim();

  //     if (classValue) {
  //       classSet.add(classValue);
  //     }
  //   });

  //   return [
  //     "all",
  //     ...Array.from(classSet).sort((a, b) =>
  //       a.localeCompare(b, undefined, { numeric: true }),
  //     ),
  //   ];
  // }, [activeAcademicYear, campStudents, selectedCampId]);

  // const sectionOptions = useMemo(() => {
  //   if (!selectedCampId) {
  //     return ["all"];
  //   }

  //   const sectionSet = new Set();

  //   campStudents.forEach((student) => {
  //     const year = String(
  //       student?.academic_year ?? student?.academicYear ?? "",
  //     ).trim();
  //     if (activeAcademicYear && year && year !== activeAcademicYear) {
  //       return;
  //     }

  //     const classValue = String(
  //       student?.Class ?? student?.class ?? student?.grade ?? "",
  //     )
  //       .split("-")[0]
  //       .trim();
  //     if (selectedClassFilter !== "all" && classValue !== selectedClassFilter) {
  //       return;
  //     }

  //     const sectionValue =
  //       String(student?.sec ?? student?.section ?? student?.grade ?? "")
  //         .split("-")[1]
  //         ?.trim() || String(student?.sec ?? student?.section ?? "").trim();

  //     if (sectionValue) {
  //       sectionSet.add(sectionValue);
  //     }
  //   });

  //   return [
  //     "all",
  //     ...Array.from(sectionSet).sort((a, b) =>
  //       a.localeCompare(b, undefined, { numeric: true }),
  //     ),
  //   ];
  // }, [activeAcademicYear, campStudents, selectedCampId, selectedClassFilter]);

  // const normalizedCampStudents = useMemo(() => {
  //   const uniqueStudents = new Map();

  //   campStudents.forEach((student) => {
  //     const rawId =
  //       student?.id ??
  //       student?.studentId ??
  //       student?.student_id ??
  //       student?.school_registration_number ??
  //       student?.admission_number;

  //     if (
  //       rawId === undefined ||
  //       rawId === null ||
  //       String(rawId).trim() === ""
  //     ) {
  //       return;
  //     }

  //     const id = String(rawId).trim();
  //     const classValue = String(
  //       student?.Class ?? student?.class ?? student?.grade ?? "",
  //     )
  //       .split("-")[0]
  //       .trim();
  //     const sectionValue =
  //       String(student?.sec ?? student?.section ?? student?.grade ?? "")
  //         .split("-")[1]
  //         ?.trim() || String(student?.sec ?? student?.section ?? "").trim();

  //     uniqueStudents.set(id, {
  //       ...student,
  //       id,
  //       studentId:
  //         student?.studentId ??
  //         student?.student_id ??
  //         student?.school_registration_number ??
  //         student?.admission_number ??
  //         id,
  //       name:
  //         student?.name ?? student?.student_name ?? student?.studentName ?? "",
  //       Class: classValue,
  //       sec: sectionValue,
  //     });
  //   });

  //   return Array.from(uniqueStudents.values());
  // }, [campStudents]);

  // const filteredStudents = useMemo(() => {
  //   if (!selectedCampId) {
  //     return [];
  //   }

  //   return normalizedCampStudents.filter((student) => {
  //     const year = String(
  //       student?.academic_year ?? student?.academicYear ?? "",
  //     ).trim();
  //     const classValue = String(
  //       student?.Class ?? student?.class ?? student?.grade ?? "",
  //     )
  //       .split("-")[0]
  //       .trim();
  //     const sectionValue =
  //       String(student?.sec ?? student?.section ?? student?.grade ?? "")
  //         .split("-")[1]
  //         ?.trim() || String(student?.sec ?? student?.section ?? "").trim();

  //     const yearMatch =
  //       !activeAcademicYear || !year || year === activeAcademicYear;
  //     const classMatch =
  //       selectedClassFilter === "all" || classValue === selectedClassFilter;
  //     const sectionMatch =
  //       selectedSectionFilter === "all" ||
  //       sectionValue === selectedSectionFilter;

  //     return yearMatch && classMatch && sectionMatch;
  //   });
  // }, [
  //   activeAcademicYear,
  //   normalizedCampStudents,
  //   selectedCampId,
  //   selectedClassFilter,
  //   selectedSectionFilter,
  // ]);

  // const getStudentKeys = (student) =>
  //   new Set(
  //     [
  //       student?.id,
  //       student?.studentId,
  //       student?.student_id,
  //       student?.school_registration_number,
  //       student?.admission_number,
  //     ]
  //       .map((value) => String(value ?? "").trim())
  //       .filter(Boolean),
  //   );

  const findScreeningRecordByKeys = useCallback(
    (keys) =>
      dentalScreeningData.find((record) => {
        const recordKeys = [
          record?.id,
          record?.studentId,
          record?.student_id,
          record?.school_registration_number,
          record?.admission_number,
        ]
          .map((value) => String(value ?? "").trim())
          .filter(Boolean);

        return recordKeys.some((key) => keys.has(key));
      }),
    [dentalScreeningData],
  );

  const applyScreeningRecordToForm = useCallback((screeningRecord) => {
    const record = screeningRecord ?? {};

    setAssessmentDate(
      String(record?.assessmentDate ?? record?.assessment_date ?? "2025-08-05"),
    );
    setLocation(String(record?.location ?? locationOptions[0]));
    setExaminer(String(record?.examiner ?? examinerOptions[0]));
    setAssistant(String(record?.assistant ?? assistantOptions[0]));
    setOralHygiene(
      String(record?.oral_hygiene ?? oralHygieneOptions[0]?.value ?? "fair"),
    );
    setGingivalHealth(String(record?.gingival_health ?? "gingivitis"));
    setPlaque(
      String(
        record?.plaque ??
          plaqueToggleOptions[0]?.value ??
          plaqueOptions[0]?.value ??
          "mild",
      ),
    );
    setNotes(String(record?.notes ?? record?.remark ?? record?.remarks ?? ""));
    setReferralAction(
      String(
        record?.referral_action ??
          record?.recommended_to ??
          record?.recommendation_type ??
          "No action required",
      ),
    );
    setReferralReason(String(record?.referral_reason ?? "No specific reason"));
    setFollowUpValue(String(record?.follow_up ?? "As needed"));
    setCareInstructions(String(record?.care_instructions ?? ""));
    setSidebarNotes(String(record?.sidebar_notes ?? record?.notes ?? ""));
  }, []);

  const syncChartForStudentRecord = useCallback((screeningRecord) => {
    const recordChart = buildChartFromRecord(screeningRecord);
    if (recordChart) {
      setChart(recordChart);
      setSelectedAdultTooth((prev) =>
        recordChart.some((tooth) => tooth.number === prev)
          ? prev
          : (recordChart[0]?.number ?? 16),
      );
      return;
    }

    const countChart = buildChartFromCounts(screeningRecord);
    if (countChart) {
      setChart(countChart);
      setSelectedAdultTooth((prev) =>
        countChart.some((tooth) => tooth.number === prev)
          ? prev
          : (countChart[0]?.number ?? 16),
      );
      return;
    }

    setChart(initialToothChart.map((tooth) => ({ ...tooth })));
    setSelectedAdultTooth(16);
  }, []);

  // const selectedStudent = useMemo(() => {
  //   const activeStudentId = studentFilter !== "all" ? studentFilter : studentId;
  //   const selectedFromFilter = Array.isArray(filterPayload?.items)
  //     ? filterPayload.items.find(
  //       (student) =>
  //         String(student?.id ?? student?.studentId ?? student?.cus_id) ===
  //         String(activeStudentId),
  //     )
  //     : null;

  //   if (selectedFromFilter) {
  //     return selectedFromFilter;
  //   }

  //   if (!filteredStudents.length) {
  //     return null;
  //   }

  //   const explicitSelection = filteredStudents.find(
  //     (student) =>
  //       String(student.id ?? student.studentId) === String(studentId),
  //   );

  //   return explicitSelection ?? filteredStudents[0];
  // }, [filterPayload?.items, filteredStudents, studentFilter, studentId]);
  const selectedStudentFromFilter = useMemo(() => {
    const activeId = studentFilter !== "all" ? studentFilter : studentId;
    if (!activeId) return null;
    const roster = Array.isArray(studentsArray) ? studentsArray : [];
    const found = roster.find(
      (student) =>
        String(student?.id ?? student?.studentId ?? student?.cus_id) ===
        String(activeId),
    );
    if (found) return found;
    return null;
  }, [studentsArray, studentFilter, studentId]);

  // Fallback roster from the Redux slice (source of truth for the camp's students).
  const eventRoster =
    useAppSelector((state) => state.eventAssign?.students) || [];

  const selectedStudent = useMemo(() => {
    if (selectedStudentFromFilter) {
      return selectedStudentFromFilter;
    }

    const activeId = studentFilter !== "all" ? studentFilter : studentId;
    if (!activeId) return null;

    // Primary lookup in studentsArray (from API response)
    if (Array.isArray(studentsArray) && studentsArray.length > 0) {
      const match = studentsArray.find(
        (student) =>
          String(student?.id ?? student?.studentId ?? student?.cus_id) ===
          String(activeId),
      );
      if (match) return match;
    }

    // Fallback: look in the Redux slice roster (handles pagination where the
    // student may be on a later page not yet in studentsArray)
    if (Array.isArray(eventRoster) && eventRoster.length > 0) {
      const match = eventRoster.find(
        (student) =>
          String(student?.id ?? student?.studentId ?? student?.cus_id) ===
          String(activeId),
      );
      if (match) return match;
    }

    return null;
  }, [
    studentsArray,
    selectedStudentFromFilter,
    studentFilter,
    studentId,
    eventRoster,
  ]);

  const selectedStudentKey = String(
    selectedStudent?.id ?? selectedStudent?.studentId ?? "",
  );
  const studentSelectValue = selectedStudentKey || "";
  console.log(studentSelectValue, "studentSelectValue");

  const selectedStudentKeys = useMemo(() => {
    return new Set(
      [
        selectedStudent?.id,
        selectedStudent?.studentId,
        selectedStudent?.student_id,
        selectedStudent?.school_registration_number,
        selectedStudent?.admission_number,
      ]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    );

    return new Set(
      [studentSelectValue, studentId]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    );
  }, [selectedStudent, studentId, studentSelectValue]);

  const getSelectedStudentScreeningData = useMemo(() => {
    if (!studentId || !Array.isArray(dentalScreeningData)) {
      return null;
    }

    // The API endpoint is already scoped to /dental-test/student/{studentId}.
    return dentalScreeningData[0] ?? null;
  }, [dentalScreeningData, studentId]);

  useEffect(() => {
    // After a save we reset the form; skip re-applying the just-saved record
    // when the query invalidates/refetches and this memo gets a new identity.
    if (resetAfterSaveRef.current) {
      resetAfterSaveRef.current = false;
      return;
    }

    if (!studentId || dentalScreeningLoading) {
      return;
    }

    applyScreeningRecordToForm(getSelectedStudentScreeningData);
    syncChartForStudentRecord(getSelectedStudentScreeningData);
  }, [
    dentalScreeningLoading,
    getSelectedStudentScreeningData,
    studentId,
    applyScreeningRecordToForm,
    syncChartForStudentRecord,
  ]);

  const updatedAtValue =
    getSelectedStudentScreeningData?.updated_at ??
    getSelectedStudentScreeningData?.updatedAt;

  // Count only the teeth belonging to the active tab's dentition.
  // toothMap (not chart) is the source of truth here: chart only holds teeth
  // that were explicitly painted, whereas toothMap also seeds every primary
  // tooth (FDI 51-85) with a default "healthy" status so the primary tab shows
  // its full 20-tooth complement instead of 0.
  // Adult = FDI 11-48, Primary = FDI 51-85.
  const summary = useMemo(() => {
    const counts = {
      caries: 0,
      other: 0,
      healthy: 0,
      missing: 0,
      filled: 0,
      sealant: 0,
    };
    const isPrimary = activeToothTab === "primary";
    toothMap.forEach((t) => {
      const n = Number(t.number);
      const inRange = isPrimary ? n >= 51 && n <= 85 : n >= 11 && n <= 48;
      if (inRange && counts[t.status] !== undefined) counts[t.status] += 1;
    });
    return counts;
  }, [toothMap, activeToothTab]);

  const quickFindings = useMemo(
    () => ({
      caries: summary.caries,
      other: summary.other,
      healthy: summary.healthy,
      missing: summary.missing,
      filled: summary.filled,
      sealant: summary.sealant,
    }),
    [summary, activeToothTab],
  );

  const calculatedRiskScore = useMemo(() => {
    let score = 0;

    if (oralHygiene === "fair") score += 1;
    if (oralHygiene === "poor") score += 2;

    if (gingivalHealth === "gingivitis") score += 1;
    if (gingivalHealth === "periodontitis") score += 2;

    if (plaque === "mild") score += 1;
    if (plaque === "moderate") score += 2;
    if (plaque === "heavy") score += 3;

    const activeOtherFindings =
      Object.values(otherFindings).filter(Boolean).length;
    score += Math.min(2, activeOtherFindings);

    return Math.max(0, Math.min(5, score));
  }, [gingivalHealth, oralHygiene, otherFindings, plaque]);

  const calculatedSeverityScore = useMemo(() => {
    const weighted =
      quickFindings.caries * 2 +
      quickFindings.missing * 2 +
      quickFindings.other;

    if (weighted <= 0) return 0;
    if (weighted <= 2) return 1;
    if (weighted <= 5) return 2;
    if (weighted <= 8) return 3;
    if (weighted <= 12) return 4;
    return 5;
  }, [quickFindings]);

  const riskScoreValue = useMemo(() => {
    const value = Number(getSelectedStudentScreeningData?.risk_score);
    if (Number.isFinite(value)) {
      return Math.max(0, Math.min(5, value));
    }

    return calculatedRiskScore;
  }, [calculatedRiskScore, getSelectedStudentScreeningData]);

  const severityScoreValue = useMemo(() => {
    const value = Number(getSelectedStudentScreeningData?.severity_score);
    if (Number.isFinite(value)) {
      return Math.max(0, Math.min(5, value));
    }

    return calculatedSeverityScore;
  }, [calculatedSeverityScore, getSelectedStudentScreeningData]);

  function toggleFinding(id) {
    setOtherFindings((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const updateSelectedTooth = (update) => {
    setChart((prev) => {
      const existing = prev.find((tooth) => tooth.number === selectedTooth);
      const baseTooth = existing ??
        toothMap.get(selectedTooth) ?? {
          number: selectedTooth,
          status: "healthy",
          surface: "",
          severity: "",
          treatment: "No treatment needed",
        };
      const nextTooth = { ...baseTooth, ...update };

      return existing
        ? prev.map((tooth) =>
            tooth.number === selectedTooth ? nextTooth : tooth,
          )
        : [...prev, nextTooth];
    });
  };

  const handleSelectedToothStatusChange = (value) => {
    const toothNumber = selectedTooth;
    if (toothNumber == null) return;

    // Snapshot the tooth's status BEFORE the update so we can tell a real
    // user change apart from a re-render sync. When the tab switches, the
    // detail panel re-runs against the new selected tooth; Radix only fires
    // onValueChange on a real click, but this guard guarantees a tab switch
    // can never wipe coding entries for teeth the user didn't touch.
    const currentStatus = toothMap.get(toothNumber)?.status;

    updateSelectedTooth({ status: value });

    // No actual change → the handler was synchronised, not user-driven.
    if (currentStatus === value) return;

    // Manual override: the user changed this tooth's status by hand, so any
    // coding entries pinned to it (which had painted the old status) no longer
    // apply — drop them so the Dental Information chips stay in sync with the
    // chart. Entries for other teeth are untouched.
    setDentalCodingEntries((prev) => {
      const removed = prev.some((entry) => entry.tooth === toothNumber);
      if (removed) {
        toast.info(
          `Coding entry removed for tooth ${toothNumber} (status changed manually)`,
        );
      }
      return prev.filter((entry) => entry.tooth !== toothNumber);
    });
  };

  const handleSelectedToothOtherNoteChange = (value) => {
    updateSelectedTooth({ otherNote: value });
  };

  const handleSelectedToothTreatmentChange = (value) => {
    updateSelectedTooth({ treatment: value });
  };

  const handleSurfaceChange = (value) => {
    updateSelectedTooth({ surface: value });
  };
  const handleConditionChange = (value) => {
    // Look up the condition master record so severity / risk ride along onto
    // the tooth — otherwise the read-only fields display them from the master
    // but the payload (which reads the tooth object) gets nothing.
    const conditionRecord = (
      Array.isArray(getDentalCondition) ? getDentalCondition : []
    ).find(
      (item) =>
        String(item?.name ?? "").trim().toLowerCase() ===
        String(value ?? "").trim().toLowerCase(),
    );

    updateSelectedTooth({
      condition: value,
      severity: String(conditionRecord?.severity ?? "").trim(),
      riskScore: String(conditionRecord?.risk_score ?? "").trim(),
    });
  };

  function getBackendErrorMessage(error) {
    let payload = error;

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        return /<!doctype html|<html[\s>]/i.test(payload) ||
          payload.length > 240
          ? "Unable to save screening. Please try again."
          : payload;
      }
    }

    if (!payload || typeof payload !== "object") {
      return "Something went wrong. Please try again.";
    }

    const fieldMessages = Object.values(payload.errors ?? {})
      .flatMap((messages) => (Array.isArray(messages) ? messages : [messages]))
      .filter(Boolean);

    const message =
      fieldMessages[0] ??
      payload.message ??
      payload.error ??
      payload.detail ??
      "Something went wrong. Please try again.";
    return /<!doctype html|<html[\s>]/i.test(String(message)) ||
      String(message).length > 240
      ? "Unable to save screening. Please try again."
      : String(message);
  }
  const assessmentStudentOptions = useMemo(
    () =>
      (studentsArray ?? []).map((student) => {
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
    [studentsArray],
  );
const getDentalConditionValue = (
  Array.isArray(getDentalCondition) ? getDentalCondition : []
).find(
  (item) =>
    String(item?.name ?? "").trim().toLowerCase() ===
    String(currentTooth?.condition ?? "").trim().toLowerCase()
);

console.log("current condition:", currentTooth?.condition);
console.log("conditions:", getDentalCondition);
console.log("selectedeee:", getDentalConditionValue);

  
  const handleSaveAssessment = () => {

      if (isSavingRef.current) {
      return;
    }

    const rawStudentId =
      selectedStudent?.id ??
      selectedStudent?.cus_id ??
      selectedStudent?.student_id ??
      selectedStudent?.studentId ??
      studentId;

    // --- Validate editable fields with zod
    const formValues = {
      notes,
      referralAction,
      referralReason,
      followUpValue,
      oralHygiene,
      gingivalHealth,
      plaque,
    };

    const result = dentalScreeningSchema.safeParse(formValues);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      // Reduce to { fieldName: firstMessage } for inline display.
      const firstPerField = Object.fromEntries(
        Object.entries(errors)
          .map(([field, messages]) => [field, messages?.[0]])
          .filter(([, message]) => Boolean(message)),
      );

      setFormErrors(firstPerField);

      const firstError = Object.values(firstPerField).find(Boolean);
      toast.error(firstError || "Please fill all required fields.");

      return;
    }

    setFormErrors(null);

    if (!String(rawStudentId ?? "").trim()) {
      toast.error("Select a student before saving the dental screening.");
      return;
    }
    if (savedStudentKeyRef.current === String(rawStudentId)) {
          toast.error(
            "This student's screening has already been saved. Select another student to continue.",
          );
          return;
    }

    const payload = {
      student_id: Number(rawStudentId) || 0,
      camp_id:
        Number(selectedCampId) ||
        Number(selectedStudent?.camp_id ?? selectedStudent?.campId) ||
        0,
      caries_count: quickFindings.caries,
      other_issues_count: quickFindings.other,
      healthy_count: quickFindings.healthy,
      missing_count: quickFindings.missing,
      oral_hygiene: oralHygiene,
      gingival_health: gingivalHealth,
      plaque,
      dental_fluorosis: otherFindings.fluorosis ? "present" : "absent",
      malocclusion: otherFindings.malocclusion ? "present" : "absent",
      tooth_wear: otherFindings.toothWear ? "present" : "absent",
      oral_ulcer: otherFindings.oralUlcer ? "present" : "absent",
      trauma: otherFindings.trauma ? "present" : "absent",
      dental_findings: dentalFindingEntries.map((entry) => ({
        tooth_number: String(entry.tooth_number),
        dental_condition_id: entry.dental_condition_id,
        surface: entry.surface ?? "",
        risk: entry.risk ?? "",
        severity: entry.severity ?? "",
        treatment_id: getDentalTreatmentId(String(entry.treatment)),
        treatment: String(entry.treatment ?? ""),
      })),

      
      dental_codings: dentalCodingEntries.map((entry) => ({
        code: entry.coding,
        name: entry.condition,
        tooth_number: String(entry.tooth),
        dental_condition_id: entry.dentalConditionId,
        risk: entry.conditionRiskScore || entry?.risk || "",

        severity: entry.conditionSeverity,
        treatment_id: getDentalTreatmentId(String(entry.treatment)),
        surface: entry.surface,
        treatment: String(entry.treatment ?? ""),
      })),
      other_findings: otherFindingsOptions
        .filter(({ id }) => otherFindings[id])
        .map(({ label }) => label)
        .join(", "),
      notes,
      referral_action: referralAction,
      referral_reason: referralReason,
      follow_up: followUpValue,
      care_instructions: careInstructions,
      sidebar_notes: sidebarNotes,
      preventive_cleaning: "",
      preventive_fluoride: "",
      preventive_education: "",
      tooth_chart: chart.map((tooth) => ({
        tooth_number: String(tooth.number),
        status: String(tooth.status ?? "healthy"),
        surface: String(tooth.surface ?? ""),
        severity: String(tooth.severity ?? ""),
        treatment: String(tooth.treatment ?? ""),
      })),
    };
    console.log(payload,"payload");
    

    setIsSaving(true);
    isSavingRef.current = true;

    dispatch(createDentalScreening(payload))
      .unwrap()
      .then(() => {
        setIsSaving(false);
        isSavingRef.current = false;
        // Refresh the react-query cache; the ["dental-screening"] query's
        // queryFn re-dispatches getDentalScreening, keeping Redux in sync.
        queryClient.invalidateQueries({ queryKey: ["dental-screening"] });

        // Reset the form for the next student; the ref guard stops the
        // auto-apply effect from re-filling the just-saved values.
        resetAfterSaveRef.current = true;
        resetFormToDefaults();
        savedStudentKeyRef.current = String(rawStudentId);
        setSavedStudentKey(String(rawStudentId));

        toast.success("Dental screening saved successfully", {
          description: selectedStudent?.name
            ? `Record saved for ${selectedStudent.name}`
            : undefined,
        });
      })
      .catch((error) => {
        setIsSaving(false);
        isSavingRef.current = false;
        console.error("Unable to save dental screening:", error);

        toast.error("Failed to save dental screening", {
          description: getBackendErrorMessage(error),
        });
      });
  };

  // Clears the dental form back to its default state so the next student can
  // be assessed. Called after a successful save (with the auto-apply guard set).
  const resetFormToDefaults = useCallback(() => {
    setAssessmentDate("2025-08-05");
    setLocation(locationOptions[0]);
    setExaminer(examinerOptions[0]);
    setAssistant(assistantOptions[0]);
    setChart(initialToothChart.map((tooth) => ({ ...tooth })));
    setOralHygiene("fair");
    setGingivalHealth("gingivitis");
    setPlaque("mild");
    setOtherFindings({});
    setNotes("Mild crowding in lower anterior region.");
    setReferralAction("");
    setReferralReason("");
    setFollowUpValue("");
    setCareInstructions("");
    setSidebarNotes("");
    // setDentalCodingValue("");
    // setDentalConditionValue("");
    setDentalCodingEntries([]);
    setSelectedPrimaryTooth(null);
    setSelectedAdultTooth(null);
    setActiveToothTab("primary");
    setFormErrors(null);
    setActiveDentalStep("chart");
  }, []);

  const handleCancelAssessment = () => {
    setAssessmentDate("2025-08-05");
    setLocation(locationOptions[0]);
    setExaminer(examinerOptions[0]);
    setAssistant(assistantOptions[0]);
    setSelectedPrimaryTooth(null);
    setSelectedAdultTooth(16);
    setOralHygiene("fair");
    setGingivalHealth("gingivitis");
    setPlaque("mild");
    setOtherFindings({});
    setNotes("Mild crowding in lower anterior region.");
    setReferralAction("");
    setReferralReason("");
    setFollowUpValue("");
    setCareInstructions("");
    setSidebarNotes("");
  };

  // ---- Coding popup helpers -------------------------------------------------
  const codingLabelMap = useMemo(() => {
    const map = {};

    if (Array.isArray(getDentalCoding)) {
      getDentalCoding.forEach((item) => {
        const code = String(item?.code ?? "").trim();
        const id = String(item?.id ?? "").trim();
        const name = String(item?.name ?? item?.code ?? "").trim();
        console.log({code, id, name});
        

        if (code) {
          map[code] = {
            id,
            name,
          };
        }
      });
    }

    return map;
  }, [getDentalCoding]);

  console.log(codingLabelMap,"codingLabelMap");
  

  const conditionLabelMap = useMemo(() => {
    const map = {};
    if (Array.isArray(getDentalCondition)) {
      getDentalCondition.forEach((item) => {
        console.log(item,"item---");
        
        const name = String(item?.name ?? "").trim();
        if (!name) return;
        // Keyed by name; the value carries every master field so entries can
        // use severity / risk_score / description later — the displayed label
        // itself remains the name.
        map[name] = {
          // code: ,
          // toothNumber: ,
          name,
          tooth: String(item?.tooth ?? ""),
          dentalConditionId: Number(item?.id ?? ""),
          description: String(item?.description ?? "").trim(),
          risk: String(item?.risk_score ?? item?.risk ?? "").trim(),
          surface: String(item.surface ?? "").trim(),
          severity: String(item?.severity ?? "").trim(),
          treatment: "",
        };
      });
    }
    return map;
  }, [getDentalCondition]);
  console.log(popupConditionValue,"conditionLabelMap");

  // Keep dentalFindingEntries in sync with the tooth chart — every tooth with a
// condition or marked finding becomes a finding entry (mirrors the manual
// dentalCodingEntries flow, but derived so saving always reflects the chart).
useEffect(() => {
  const entries = (Array.isArray(chart) ? chart : [])
    .filter((tooth) => tooth.number > 0)
    .filter((tooth) => {
      const hasCondition = String(tooth.condition ?? "").trim().length > 0;
      const hasStatus = String(tooth.status ?? "").trim().length > 0 &&
        !["healthy", "missing"].includes(String(tooth.status).trim());
      const hasFinding =
        hasCondition ||
        hasStatus ||
        (String(tooth.surface ?? "").trim() && String(tooth.surface ?? "").trim() !== "—") ||
        String(tooth.severity ?? "").trim() ||
        String(tooth.riskScore ?? "").trim();
      return hasFinding;
    })
    
    .map((tooth) => ({
      
      id: tooth.number,
      tooth_number: tooth.number,
      condition: String(tooth.condition ?? ""),
      dental_condition_id: (() => {
        // Resolve the condition NAME to its master ID — the backend expects the
        // ID, not the display name. Mirrors the lookup in handleConditionChange.
        const conditionName = String(tooth.condition ?? "")
          .trim()
          .toLowerCase();
        const conditionRecord = (
          Array.isArray(getDentalCondition) ? getDentalCondition : []
        ).find(
          (item) =>
            String(item?.name ?? "").trim().toLowerCase() === conditionName,
        );
        return String(conditionRecord?.id ?? tooth.condition ?? "");
      })(),
      surface: tooth.surface && tooth.surface !== "—" ? String(tooth.surface) : "",
      risk: tooth.riskScore || tooth.risk || "",
      severity: tooth.severity && tooth.severity !== "—" ? String(tooth.severity) : "",
      treatment: String(tooth.treatment ?? ""),
    }));
    
    setDentalFindingEntries(entries);
  }, [chart]);
  
  console.log(dentalFindingEntries,"entries");
  

  // Live condition info for the popup's read-only fields — derived directly
  // from the selection so severity / risk / label update as the user picks.
  const popupConditionInfo = popupConditionValue
    ? (conditionLabelMap[popupConditionValue] ?? null)
    : null;
  console.log(popupConditionInfo, "popupConditionInfo");

  const handleSaveCodingEntry = () => {
    const coding = String(popupCodingValue ?? "").trim();
    console.log(coding, "coding---");

    const condition = String(popupConditionValue ?? "").trim();
    if (!coding || !condition) {
      toast.error("Please select both coding and condition");
      return;
    }
    // Tooth priority: the coding's trailing 2 digits (user convention, e.g.
    // "K02.83" → tooth 83), else the currently selected tooth on the chart.
    const codedTooth = extractToothFromCoding(coding);
    const toothNumber = codedTooth ?? selectedTooth;
    if (toothNumber == null) {
      toast.error("Please select a tooth first");
      return;
    }
    // The map value is the full master object — the label stays a plain string
    // for rendering, and the master id rides separately as dentalCodingId.
    const codingInfo = codingLabelMap[coding] ?? null;
    const codingLabel = codingInfo?.name ?? coding;
    const dentalCodingId = codingInfo?.id ?? "";
    // The map value is the full master object — the label is still its name,
    // while severity / risk / description ride along on the entry.
    const conditionInfo = conditionLabelMap[condition];
    console.log(conditionInfo,"conditionInfo");
    const conditionLabel = conditionInfo?.name ?? condition;
    // Derive the chart status from the condition so the tooth paints itself:
    // Dental Caries → caries (red), No Abnormality → healthy (green),
    // everything else → other (amber) — e.g. tooth 83 → "other".
    const status = mapConditionToStatus(conditionLabel);
    // When the tooth came from the coding, infer the dentition from the FDI
    // range (51-85 = primary) instead of the active tab.
    const dentition =
      codedTooth != null
        ? codedTooth >= 51
          ? "primary"
          : "adult"
        : activeToothTab;
    const entry = {
      // Unique per entry and stable across edits; the master coding id is
      // carried separately as dentalCodingId for the save payload.
      id: editingEntryId ?? Date.now(),
      coding,
      codingLabel,
      dentalCodingId,
      condition,
      conditionLabel,
      conditionSeverity: conditionInfo?.severity ?? "",
      conditionRiskScore: conditionInfo?.risk ?? "",
      conditionDescription: conditionInfo?.description ?? "",
      dentalConditionId: conditionInfo?.dentalConditionId ?? "",
      status,
      tooth: toothNumber,
      surface: String(popupSurfaceValue ?? "").trim(),   // was: surface: "",
      risk: conditionInfo?.risk,
      treatment: String(popupTreatmentValue ?? "").trim(),
      dentition,
    };
    // Edit mode: replace the existing entry in place (keeps its id and order);
    // Add mode: append a new one.
    const isEditingEntry = editingEntryId != null;
    const previousEntry = isEditingEntry
      ? dentalCodingEntries.find((item) => item.id === editingEntryId)
      : null;
    const nextEntries = isEditingEntry
      ? dentalCodingEntries.map((item) =>
          item.id === editingEntryId ? entry : item,
        )
      : [...dentalCodingEntries, entry];
    setDentalCodingEntries(nextEntries);

    // Paint the affected teeth on the chart. When editing, both the old tooth
    // (restore from remaining entries or healthy) and the new tooth (paint from
    // this entry) may need updating. Primary teeth are appended on first use
    // (toothMap prefers chart entries over its healthy defaults).
    setChart((prev) => {
      let next = prev;
      // 1. Old tooth: re-derive from the entries that still target it.
      if (previousEntry?.tooth != null) {
        next = next.map((tooth) => {
          if (tooth.number !== previousEntry.tooth) return tooth;
          const lastEntry = [...nextEntries]
            .reverse()
            .find((item) => item.tooth === previousEntry.tooth);
          return lastEntry
            ? {
                ...tooth,
                status: lastEntry.status,
                treatment: lastEntry.codingLabel,
                severity: lastEntry.conditionSeverity || "—",
                riskScore: lastEntry.conditionRiskScore || "",
              }
            : {
                ...tooth,
                status: "healthy",
                surface: "—",
                severity: "—",
                treatment: "No treatment needed",
              };
        });
      }
      // 2. New tooth: paint from the newest entry targeting it.
      if (entry.tooth != null) {
        const lastEntry = [...nextEntries]
          .reverse()
          .find((item) => item.tooth === entry.tooth);
        const exists = next.some((tooth) => tooth.number === entry.tooth);
        if (exists) {
          next = next.map((tooth) =>
            tooth.number === entry.tooth
              ? {
                  ...tooth,
                  status: lastEntry?.status ?? "healthy",
                  treatment: lastEntry?.codingLabel ?? "No treatment needed",
                  severity: lastEntry?.conditionSeverity || "—",
                  riskScore: lastEntry?.conditionRiskScore || "",
                }
              : tooth,
          );
        } else {
          next = [
            ...next,
            {
              number: entry.tooth,
              status,
              surface: "",
              severity: entry.conditionSeverity || "",
              riskScore: entry.conditionRiskScore || "",
              treatment: codingLabel,
            },
          ];
        }
      }
      return next;
    });
    setIsCodingPopupOpen(false);
    setEditingEntryId(null);
    toast.success(
      isEditingEntry
        ? `Coding updated for tooth ${toothNumber}`
        : `Coding added for tooth ${toothNumber}${codedTooth != null ? " (from coding)" : ""}`,
    );
  };

  // Chip click: open the popup in edit mode, pre-filled with the entry's values.
  const handleEditCodingEntry = (entry) => {
    setEditingEntryId(entry.id);
    setPopupCodingValue(entry.coding ?? "");
    setPopupConditionValue(entry.condition ?? "");
    setPopupTreatmentValue(entry.treatment ?? "");
    setPopupSurfaceValue(entry.surface ?? "");

    setIsCodingPopupOpen(true);
  };

  // The entry currently being edited (null in add mode) — used by the dialog
  // title/description to show the right tooth.
  const editingEntry =
    editingEntryId != null
      ? (dentalCodingEntries.find((item) => item.id === editingEntryId) ?? null)
      : null;
  console.log(dentalCodingEntries, "dentalCodingEntries");

  const handleRemoveCodingEntry = (id) => {
    const removed = dentalCodingEntries.find((entry) => entry.id === id);
    const next = dentalCodingEntries.filter((entry) => entry.id !== id);
    setDentalCodingEntries(next);
    // If the removed entry was open in the edit dialog, reset to add mode
    // so the dialog never saves against a deleted entry.
    if (editingEntryId === id) {
      setEditingEntryId(null);
      setIsCodingPopupOpen(false);
      setPopupCodingValue("");
      setPopupConditionValue("");
      setPopupTreatmentValue("");
      setPopupSurfaceValue("");

    }
    // Re-paint the tooth: the last remaining entry wins; with no entries left
    // the tooth returns to healthy. (Primary teeth not present in `chart`
    // simply fall back to toothMap's healthy default.)
    if (removed?.tooth != null) {
      setChart((prev) =>
        prev.map((tooth) => {
          if (tooth.number !== removed.tooth) return tooth;
          const lastEntry = [...next]
            .reverse()
            .find((item) => item.tooth === removed.tooth);
          return lastEntry
            ? {
                ...tooth,
                status: lastEntry.status,
                treatment: lastEntry.codingLabel,
              }
            : { ...tooth, status: "healthy", treatment: "No treatment needed" };
        }),
      );
    }
  };

  // Search the backend so records outside the currently loaded pages are found.
  const handleCodingSearch = useCallback(
    async (keyword) => {
      const search = keyword.trim();
      setCodingSearchTerm(keyword);
      if (!search) {
        // setCodingSearchOptions(null);
        await dispatch(getDentalCodingScreening({ page: 1, perPage: 50 }));
        return;
      }
      setCodingSearchOptions([]);
      try {
        const firstPage = await dispatch(
          getDentalCodingScreening({ page: 1, perPage: 50, search }),
        ).unwrap();
        const allItems = [...(firstPage?.items ?? [])];
        const lastPage = Number(firstPage?.lastPage ?? 1);

        // Some API versions ignore the search parameter, so scan all pages and
        // filter locally to support codes that are not on the first page.
        for (let page = 2; page <= lastPage; page += 1) {
          const nextPage = await dispatch(
            getDentalCodingScreening({ page, perPage: 50, search }),
          ).unwrap();
          allItems.push(...(nextPage?.items ?? []));
        }

        const lowerSearch = search.toLowerCase();
        setCodingSearchOptions(
          mapDentalCodingOptions(
            allItems.filter((item) =>
              `${item?.code ?? ""} ${item?.name ?? ""}`
                .toLowerCase()
                .includes(lowerSearch),
            ),
          ),
        );
      } catch {
        setCodingSearchOptions([]);
      }
    },
    [dispatch],
  );

  // Coding options for the popup: use the search results when searching,
  // otherwise fall back to the full (throttled) list.
  // const popupCodingOptions =
  //   codingSearchTerm.trim() && codingSearchOptions !== null
  //     ? codingSearchOptions
  //     : getDentalCodingOptions;
  const popupCodingOptions =
    codingSearchOptions !== null ? codingSearchOptions : getDentalCodingOptions;

  // Infinite scroll: load the next page of codings when the dropdown bottom
  // is reached. hasMore is derived from the slice's total vs loaded count.
  const handleLoadMoreCoding = useCallback(async () => {
    if (getDentalCodingLoadingMore) return;
    const nextPage = (dentalCodingMeta?.codingPage ?? 0) + 1;
    if (nextPage > (dentalCodingMeta?.codingLastPage ?? 1)) return;
    const search = codingSearchTerm.trim();
    const result = await dispatch(
      getDentalCodingScreening({
        page: nextPage,
        perPage: 50,
        ...(search ? { search } : {}),
      }),
    ).unwrap();
    if (search) {
      setCodingSearchOptions((previous) => {
        const optionsByValue = new Map(
          (previous ?? []).map((option) => [option.value, option]),
        );
        mapDentalCodingOptions(result?.items).forEach((option) => {
          optionsByValue.set(option.value, option);
        });
        return Array.from(optionsByValue.values());
      });
    }
  }, [
    codingSearchTerm,
    dentalCodingMeta?.codingLastPage,
    dentalCodingMeta?.codingPage,
    dispatch,
    getDentalCodingLoadingMore,
  ]);

  const hasMoreCoding = codingSearchTerm.trim()
    ? false
    : getDentalCoding.length < (dentalCodingMeta?.codingTotal ?? 0);

  // Keep studentFilter in sync: selectedStudentFromFilter gives
  // studentFilter precedence over studentId, so without this the
  // assessment-card selection would be ignored once a student has
  // been picked in the filter dropdown.
  const handleAssessmentStudentChange = React.useCallback((value) => {
    setStudentId(value);
    setStudentFilter(value);
  }, []);

  const resetDependentFilters = React.useCallback(() => {
    setClassFilter("all");
    setSectionFilter("all");
    setStudentFilter("all");
    setStudentId("");
  }, []);

  const handleSchoolFilterChange = React.useCallback(
    (value) => {
      setSchoolName(value);
      resetDependentFilters();
    },
    [resetDependentFilters],
  );

  const handleAcademicYearFilterChange = React.useCallback(
    (value) => {
      setAcademicYear(value);
      resetDependentFilters();
    },
    [resetDependentFilters],
  );

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

  return (
    <section className="space-y-4">
      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 py-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary aspect-square">
              <ToothIcon className="size-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Dental Screening
              </h1>

              <p className="text-sm text-muted-foreground">
                Dental health screening and assessment
              </p>

              {/* <p className="text-xs text-muted-foreground">
                  {getData.studentCampLoading
                    ? "Loading students..."
                    : getData.studentCampQueryError
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
            studentsLoading={getData.studentCampLoading}
            studentsError={getData.studentCampQueryError}
            campsLoading={getData.campsLoading}
            campsQueryError={getData.campsQueryError}
            studentCampLoading={getData.studentCampLoading}
            studentCampQueryError={getData.studentCampQueryError}
            selectedCampId={selectedCampId}
            onCampChange={(value) => {
              setSelectedCampId(value);
              setAcademicYear(DEFAULT_ACADEMIC_YEAR);
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
                (student) =>
                  String(student.id ?? student.studentId) === String(value),
              );

              if (selectedFromList) {
                const selectedKeys = getStudentKeys(selectedFromList);
                const screeningRecord = findScreeningRecordByKeys(selectedKeys);
                applyScreeningRecordToForm(screeningRecord);
                syncChartForStudentRecord(screeningRecord);
              } else {
                syncChartForStudentRecord(null);
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
            onClick={handleCancelAssessment}
          >
            Save & Exit
          </Button>

          {formErrors && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/60 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              Please fix the highlighted fields before saving.
            </div>
          )}

          <Button
            type="button"
            onClick={handleSaveAssessment}
            disabled={
              isSaving ||
              (selectedStudent &&
                savedStudentKey ===
                  String(
                    selectedStudent?.id ??
                      selectedStudent?.cus_id ??
                      selectedStudent?.student_id ??
                      selectedStudent?.studentId ??
                      studentId,
                  ))
            }
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSaving
              ? "Saving..."
              : savedStudentKey &&
                  selectedStudent &&
                  savedStudentKey ===
                    String(
                      selectedStudent?.id ??
                        selectedStudent?.cus_id ??
                        selectedStudent?.student_id ??
                        selectedStudent?.studentId ??
                        studentId,
                    )
                ? "Saved ✓"
                : "Save assessment"}
          </Button>
        </div>
      </div>
      <StudentFilter
        // filterPayload={filterPayload}
        // isLoading={isLoading}
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
        getStudentDataByEvent={getStudentDataByEvent}
        setGetStudentDataByEvent={setGetStudentDataByEvent}
      />
      {dentalScreeningQueryError ? (
        <p className="text-sm text-destructive">
          Unable to load dental screening:{" "}
          {String(
            dentalScreeningQueryError?.message ?? dentalScreeningQueryError,
          )}
        </p>
      ) : null}
      {studentSelectValue?.length > 0 ? (
        <>
          <StudentProfileCard student={selectedStudent} />

          <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            {/* ---------------- Left column ---------------- */}
            {/* <div className="space-y-4">
          <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Assessment Details</h3>

            <div className="mt-4 space-y-3">
              <div>
                <FieldLabel>Assessment Date</FieldLabel>
                <div className="relative">
                  <input
                    type="date"
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background pl-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <SelectField
                label="Location"
                options={locationOptions}
                value={location}
                onChange={setLocation}
              />
              <SelectField
                label="Examiner"
                options={examinerOptions}
                value={examiner}
                onChange={setExaminer}
              />
              <SelectField
                label="Assistant"
                options={assistantOptions}
                value={assistant}
                onChange={setAssistant}
              />
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Findings Summary</h3>
            <div className="mt-3 space-y-2">
              <SummaryRow icon="caries" label="Caries" value={summary.caries} />
              <SummaryRow icon="other" label="Other Issues" value={summary.other} />
              <SummaryRow icon="healthy" label="Healthy" value={summary.healthy} />
              <SummaryRow icon="missing" label="Missing" value={summary.missing} />
            </div>
          </article>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveAssessment}
              className="h-10 flex-1 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save Assessment
            </button>
            <button
              type="button"
              onClick={handleSaveAssessment}
              className="h-10 flex-1 rounded-md border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Save &amp; Next
            </button>
          </div>
        </div> */}
            <div className="relative md:relative lg:sticky lg:top-36 z-10 self-start space-y-5">
              <FramerCard>
                <AssessmentCard
                  // onChange={handleAssessmentChange}
                  // form={assessmentForm}
                  form={{}}
                  data={getSelectedStudentScreeningData}
                  studentOptions={assessmentStudentOptions}
                  studentValue={studentSelectValue}
                  // isScreeningLoading={getData.studentCampLoading}
                  // isScreeningError={getData.studentCampQueryError}
                  // isScreening={true}
                  schoolName={schoolName}
                  onStudentChange={handleAssessmentStudentChange}
                  onSave={handleSaveAssessment}
                  onCancel={handleCancelAssessment}
                  authUser={authUser}
                />
              </FramerCard>
              <QuickFindingSummary
                activeToothTab={activeToothTab}
                quickFindings={quickFindings}
              />
            </div>
            <div className="min-w-0">
              <ScreeningStepper
                activeStep={activeDentalStep}
                setActiveStep={setActiveDentalStep}
                steps={DENTAL_STEPS}
                filterFemale={false}
                onSave={handleSaveAssessment}
              >
                {/* ---------------- Tooth chart ---------------- */}
                {/* <FramerCard> */}
                <div className="min-w-0 md:min-w-125 space-y-4 rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Tooth Chart (FDI Notation)
                  </h3>

                  <div className="mt-4">
                    <ToothChartSvg
                      chart={chart}
                      selectedTooth={selectedTooth}
                      quickFindings={quickFindings}
                      onSelectTooth={handleToothSelect}
                      activeToothTab={activeToothTab}
                      onToothTabChange={handleToothTabChange}
                      onPrimaryToothSelect={handlePrimaryToothSelect}
                      onAdultToothSelect={handleAdultToothSelect}
                    />
                  </div>

                  <Tabs defaultValue="tooth-details" className="w-full">
                    <TabsList className="w-full sm:w-1/2">
                      <TabsTrigger
                        value="tooth-details"
                        className="gap-2"
                        title="Clinical Findings"
                      >
                        <ToothTabIcon />

                        <span className="hidden sm:inline">
                          Clinical Findings
                        </span>
                      </TabsTrigger>

                      <TabsTrigger
                        value="dental-info"
                        className="gap-2"
                        title="Diagnosis & ICD Codes"
                      >
                        <IcdIcon />

                        <span className="hidden sm:inline">
                          Diagnosis & ICD Codes
                        </span>
                      </TabsTrigger>
                    </TabsList>

                    {/* ================= TOOTH DETAILS TAB ================= */}
                    <TabsContent value="tooth-details">
                      <FramerCard>
                        {currentTooth ? (
                          <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-border/70 bg-background p-3 sm:p-4">
                            {/* Header */}
                            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                  Current Tooth
                                </p>

                                <p className="mt-1 truncate text-sm font-semibold text-foreground sm:text-base">
                                  Tooth {currentTooth.number}{" "}
                                  <span className="font-normal text-muted-foreground">
                                    ({getToothName(currentTooth.number)})
                                  </span>
                                </p>
                              </div>

                              {/* Tooth graphic */}
                              <div className="flex shrink-0 justify-center sm:justify-end">
                                <ToothDetailGraphic
                                  status={currentTooth.status}
                                />
                              </div>
                            </div>

                            {/* Fields */}
                            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
                              {/* Status */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="min-w-0">
                                  <TextField
                                    label="Tooth Number"
                                    value={currentTooth.number}
                                    readOnly
                                  />
                                </div>
                                <div className="min-w-0">
                                  <FieldLabel>Status</FieldLabel>

                                  <Select
                                    value={String(
                                      currentTooth.status ?? "healthy",
                                    )}
                                    onValueChange={
                                      handleSelectedToothStatusChange
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>

                                    <SelectContent>
                                      {toothChartLegend.map((item) => (
                                        <SelectItem
                                          key={item.value}
                                          value={item.value}
                                        >
                                          {item.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="min-w-0">
                                <ReusableSelect
                                  label="Condition"
                                  options={getDentalCondtionOptions}
                                  value={currentTooth.condition}
                                  onChange={handleConditionChange}
                                />
                              </div>

                              {/* Surface */}
                              <div className="min-w-0">
                                <TextField
                                  label="Surface"
                                  value={currentTooth.surface}
                                  onChange={(e) =>
                                    handleSurfaceChange(e.target.value)
                                  }
                                />
                              </div>

                              {/* Severity */}
                              <div className="min-w-0">
                                <TextField
                                  label="Severity"
                                  value={
                                    getDentalConditionValue?.severity ??
                                    currentTooth.severity ??
                                    popupConditionInfo?.severity
                                  }
                                  readOnly
                                />
                              </div>
                              {/* Risk score */}
                              <div className="min-w-0">
                                <TextField
                                  label="Risk score"
                                  value={
                                      getDentalConditionValue?.risk_score ??
                                    currentTooth.risk ??
                                    popupConditionInfo?.risk
                                  }
                                  readOnly
                                />
                              </div>

                              {/* Treatment */}
                              <div className="min-w-0">
                                <ReusableSelect
                                  label="Treatment"
                                  options={DentalTreatmentOptionData}
                                  value={String(currentTooth.treatment ?? "")}
                                  onChange={handleSelectedToothTreatmentChange}
                                />
                              </div>
                            </div>

                            {/* Other finding */}
                            {currentTooth.status === "other" && (
                              <div className="w-full">
                                <FieldLabel>Other Finding</FieldLabel>

                                <input
                                  type="text"
                                  value={String(
                                    currentTooth.otherNote ??
                                      popupConditionInfo?.name ??
                                      "",
                                  )}
                                  onChange={(event) =>
                                    handleSelectedToothOtherNoteChange(
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Describe the finding"
                                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex min-w-0 flex-col rounded-xl border border-border/70 bg-background p-3 sm:p-4">
                            <div className="min-w-0">
                              {/* <div className="flex items-center justify-between gap-2">
                                <div>
                                  <h5 className="text-sm text-muted-foreground">
                                    Not
                                  </h5>
                                  <p className="mt-1 text-sm font-semibold text-foreground">
                                    Dental Information
                                  </p>
                                </div>
                              </div> */}
                              <EmptyState
                                title="Please Select Tooth"
                                description=" Please select a tooth from the dental chart to view and enter its clinical findings."
                              />
                            </div>
                          </div>
                        )}
                      </FramerCard>
                    </TabsContent>

                    {/* ================= DENTAL INFORMATION TAB ================= */}
                    <TabsContent value="dental-info">
                      <FramerCard>
                        {
                          <div className="flex min-w-0 flex-col rounded-xl border border-border/70 bg-background p-3 sm:p-4">
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Additional Details
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-foreground">
                                    Dental Information
                                  </p>
                                </div>
                                <Dialog
                                  open={isCodingPopupOpen}
                                  onOpenChange={(open) => {
                                    setIsCodingPopupOpen(open);
                                    if (open) {
                                      // "Add coding" trigger → always start
                                      // fresh in add mode (a cancelled edit
                                      // must not leak into the next save).
                                      setEditingEntryId(null);
                                      setPopupCodingValue("");
                                      setPopupConditionValue("");
                                      setPopupTreatmentValue("");
                                    }
                                  }}
                                >
                                  <DialogTrigger className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50">
                                    <Plus className="size-3.5" />
                                    Add coding
                                  </DialogTrigger>
                                  <DialogContent className="shadow-2xs sm:max-w-max md:max-w-1/2 lg:max-w-1/4">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {editingEntryId != null
                                          ? "Edit coding entry"
                                          : "Add coding entry"}
                                      </DialogTitle>
                                      <DialogDescription>
                                        {editingEntryId != null
                                          ? "Update the dental coding or its associated"
                                          : "Select a dental coding and its associated"}{" "}
                                        condition for tooth{" "}
                                        <span className="font-medium text-foreground">
                                          {editingEntry?.tooth ??
                                            popupCodingValue.slice(-2) ??
                                            currentTooth?.number}
                                        </span>{" "}
                                        (
                                        {getToothName &&
                                          getToothName(
                                            editingEntry?.tooth ??
                                              currentTooth?.number ??
                                              "",
                                          )}
                                        ).
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-2">
                                      <div className="min-w-0">
                                        <ReusableSelect
                                          label="Coding"
                                          options={popupCodingOptions}
                                          value={popupCodingValue}
                                          onChange={setPopupCodingValue}
                                          onSearch={handleCodingSearch}
                                          onLoadMore={handleLoadMoreCoding}
                                          hasMore={hasMoreCoding}
                                          isLoadingMore={
                                            getDentalCodingLoadingMore
                                          }
                                          disabled={getDentalCodingLoading}
                                        />
                                      </div>
                                      <div className="min-w-0">
                                        <ReusableSelect
                                          label="Condition"
                                          options={getDentalCondtionOptions}
                                          value={popupConditionValue}
                                          onChange={setPopupConditionValue}
                                          disabled={
                                            getDentalConditionLoading ||
                                            !popupCodingValue
                                          }
                                        />
                                      </div>
                                      {popupConditionInfo ? (
                                        <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-2">
                                          <div className="min-w-0">
                                            {/* <label className="mb-1.5 block text-xs text-muted-foreground"></label> */}
                                            <TextField
                                              type="text"
                                              label="Condition"
                                              readOnly
                                              value={popupConditionInfo.name}
                                              // className="h-9 w-full cursor-default rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none"
                                            />
                                          </div>
                                          <div className="min-w-0">
                                            {/* <label className="mb-1.5 block text-xs text-muted-foreground">
                                              
                                            </label> */}
                                            <TextField
                                              label="Severity"
                                              type="text"
                                              readOnly
                                              value={
                                                popupConditionInfo.severity ||
                                                "—"
                                              }
                                              // className="h-9 w-full cursor-default rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none"
                                            />
                                          </div>
                                          <div className="min-w-0">
                                            {/* <label className="mb-1.5 block text-xs text-muted-foreground">
                                              
                                            </label> */}
                                            <TextField
                                              label="Risk score"
                                              type="text"
                                              readOnly
                                              value={
                                                popupConditionInfo.risk ||
                                                "—"
                                              }
                                              // className="h-9 w-full cursor-default rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none"
                                            />
                                          </div>
                                          <div className="min-w-0">
                                            <ReusableSelect
                                              label="Treatment"
                                              options={
                                                DentalTreatmentOptionData
                                              }
                                              value={popupTreatmentValue}
                                              onChange={setPopupTreatmentValue}
                                            />
                                          </div>
                                           <div className="min-w-0">
                                           <TextField
  type="text"
  label="Surface"
  value={popupSurfaceValue}
  onChange={(e) => setPopupSurfaceValue(e.target.value)}
/>

                                           </div>
                                        </div>
                                      ) : null}
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                          setIsCodingPopupOpen(false)
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="button"
                                        onClick={handleSaveCodingEntry}
                                      >
                                        {editingEntryId != null
                                          ? "Update"
                                          : "Save"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              {dentalCodingEntries.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {dentalCodingEntries.map((entry) => (
                                    <span
                                      key={entry.id}
                                      title={
                                        entry.conditionDescription
                                          ? `${entry.conditionLabel}: ${entry.conditionDescription}`
                                          : undefined
                                      }
                                      className="inline-flex items-end gap-1.5 rounded-full border border-border bg-muted/50 py-1 pl-2.5 pr-1 text-xs"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleEditCodingEntry(entry)
                                        }
                                        aria-label={`Edit coding entry${entry.tooth != null ? ` for tooth ${entry.tooth}` : ""}`}
                                        title="Click to edit this coding"
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-full font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                                      >
                                        {entry.codingLabel}
                                        <Pencil className="size-3 text-muted-foreground/70" />
                                      </button>
                                      <span className="text-muted-foreground">
                                        - {entry.conditionLabel}
                                      </span>
                                      {entry.treatment ? (
                                        <span className="text-muted-foreground">
                                          · {entry.treatment}
                                        </span>
                                      ) : null}
                                      {/* {entry.conditionSeverity ? (
                                      <span
                                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                          entry.conditionSeverity === "High"
                                            ? "bg-destructive/10 text-destructive"
                                            : entry.conditionSeverity === "Medium"
                                              ? "bg-amber-500/10 text-amber-600"
                                              : "bg-emerald-500/10 text-emerald-600"
                                        }`}
                                      >
                                        {entry.conditionSeverity}
                                        {entry.conditionRiskScore
                                          ? ` · ${entry.conditionRiskScore}`
                                          : ""}
                                      </span>
                                    ) : null} */}
                                      {entry.tooth != null ? (
                                        <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                          Tooth {entry.tooth}
                                        </span>
                                      ) : null}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveCodingEntry(entry.id)
                                        }
                                        aria-label="Remove coding entry"
                                        className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <X className="size-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-3 text-xs text-muted-foreground">
                                  No coding entries yet. Use "Add coding" to
                                  record findings.
                                </p>
                              )}
                            </div>

                            {/* Your additional fields can go here */}
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {/* Additional fields */}
                            </div>
                          </div>
                        }
                      </FramerCard>
                    </TabsContent>
                  </Tabs>
                </div>
                {/* </FramerCard> */}

                {/* ---------------- Oral hygiene ---------------- */}
                {/* <FramerCard> */}
                  <OralHygenic
                    oralHygiene={oralHygiene}
                    gingivalHealth={gingivalHealth}
                    plaque={plaque}
                    sidebarNotes={sidebarNotes}
                    careInstructions={careInstructions}
                    referralAction={referralAction}
                    referralReason={referralReason}
                    followUpValue={followUpValue}
                    setReferralAction={setReferralAction}
                    setReferralReason={setReferralReason}
                    setFollowUpValue={setFollowUpValue}
                    setCareInstructions={setCareInstructions}
                    setSidebarNotes={setSidebarNotes}
                    updatedAtValue={updatedAtValue}
                    setOralHygiene={setOralHygiene}
                    setGingivalHealth={setGingivalHealth}
                    setPlaque={setPlaque}
                    oralHygieneToggleOptions={oralHygieneToggleOptions}
                    gingivalHealthToggleOptions={gingivalHealthToggleOptions}
                    plaqueToggleOptions={plaqueToggleOptions}
                    formatDate={formatDate}
                  />
                {/* </FramerCard> */}

                {/* ---------------- Dental findings ---------------- */}
                <div className="grid items-start gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
                  <OtherFindings
                    otherFindings={otherFindings}
                    toggleFinding={toggleFinding}
                    otherFindingsOptions={otherFindingsOptions}
                  />
                  <RiskSeverity
                    riskScoreValue={riskScoreValue}
                    severityScoreValue={severityScoreValue}
                  />
                  <Notes
                    notes={notes}
                    formErrors={formErrors}
                    handleNotesChange={handleNotesChange}
                  />
                </div>

                {/* ---------------- Review ---------------- */}
                <div className="space-y-5">
                  <Review
                    quickFindings={quickFindings}
                    oralHygiene={oralHygiene}
                    notes={notes}
                    otherFindingsOptions={otherFindingsOptions}
                    gingivalHealth={gingivalHealth}
                    plaque={plaque}
                    referralAction={referralAction}
                    referralReason={referralReason}
                    followUpValue={followUpValue}
                    riskScoreValue={riskScoreValue}
                    severityScoreValue={severityScoreValue}
                    careInstructions={careInstructions}
                    sidebarNotes={sidebarNotes}
                    otherFindings={otherFindings}
                  />
                </div>
              </ScreeningStepper>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-6">
          <EmptyState
            title="No Student Data"
            description="Select a camp and student to view and edit general screening details."
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
    </section>
  );
}

function SummaryRow({ icon, label, value }) {
  const { icon: Icon, tone } = SUMMARY_ICONS[icon];
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-md",
            tone,
          )}
        >
          <Icon className="size-3.5" strokeWidth={2.25} />
        </span>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ReviewValue({ label, value }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium capitalize text-foreground">
        {value}
      </p>
    </div>
  );
}

function DetailField({ label, value, capitalize }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm font-medium text-foreground",
          capitalize && "capitalize",
        )}
      >
        {value}
      </p>
    </div>
  );
}

// function ToothDetailPanel({ tooth, onClose }) {
//   if (!tooth) return null;
//   const toothName = getToothName(tooth.number);
//   return (
//     <div className="rounded-xl border bg-card p-4">
//       <div className="mb-3 flex items-center justify-between">
//         <div>
//           <p className="text-sm font-semibold text-foreground">
//             Tooth {tooth.number}
//           </p>
//           <p className="text-xs text-muted-foreground">{toothName}</p>
//         </div>
//         <button
//           type="button"
//           onClick={onClose}
//           className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
//         >
//           <X className="size-4" />
//         </button>
//       </div>
//       <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//         <DetailField label="Status" value={tooth.status} capitalize />
//         <DetailField label="Surface" value={tooth.surface} />
//         <DetailField label="Severity" value={tooth.severity} />
//         <DetailField label="Treatment" value={tooth.treatment} />
//       </div>
//     </div>
//   );
// }
// ---- Tab icons -------------------------------------------------------------
// Shared base: strips duplicated svg boilerplate, sizes via the default
// className (overridable), and colors through global.css tokens via
// `fill="currentColor"` + text-* utility classes (e.g. text-primary maps to
// var(--color-primary)). Pass `text-current` in className to inherit the
// tab trigger's active/inactive color instead.

function TabIconBase({ viewBox, className, children }) {
  return (
    <svg
      viewBox={viewBox}
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      {children}
    </svg>
  );
}

// Clinical Findings tab — brand color (var(--color-primary)).
const ToothTabIcon = ({ className }) => (
  <TabIconBase
    viewBox="0 0 24 24"
    className={cn("text-primary size-6", className)}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14 13.5c.83 0 1.605-.26 2.245-.695l.005-.005l2.925 2.925a11.5 11.5 0 0 0-.17 2.02v2.08c0 1.195-.975 2.17-2.17 2.17h-.27a2.18 2.18 0 0 1-2.08-1.56l-.95-3.255c-.2-.7-.875-1.185-1.575-1.185s-1.325.445-1.555 1.105L9.22 20.535a2.165 2.165 0 0 1-2.05 1.46A2.174 2.174 0 0 1 5 19.825v-2.08c0-2.44-.61-3.815-1.26-5.27l-.004-.009C3.127 11.099 2.5 9.69 2.5 7.496c0-3.036 2.465-5.5 5.5-5.5c.733 0 1.357.283 1.96.557l.005.002l.016.007c.64.288 1.24.558 2.019.558c.785 0 1.395-.275 2.035-.565l.005-.002c.603-.274 1.227-.558 1.96-.558c3.035 0 5.5 2.465 5.5 5.5c0 2.2-.63 3.615-1.24 4.98l-.022.05c-.222.502-.44.993-.628 1.525l-2.305-2.305c.44-.64.695-1.415.695-2.245c0-2.205-1.795-4-4-4s-4 1.795-4 4s1.795 4 4 4m2.5-4a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0"
    />
  </TabIconBase>
);

// Diagnosis & ICD Codes tab — info color (var(--color-info)).
const IcdIcon = ({ className }) => (
  <TabIconBase
    viewBox="0 0 48 48"
    className={cn("text-info size-6", className)}
  >
    <path d="M32 26v-4h1a2 2 0 1 1 0 4z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 6a3 3 0 0 0-3 3v30a3 3 0 0 0 3 3h30a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3zm4 14a1 1 0 1 0 0 2h1v4h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4h1a1 1 0 1 0 0-2zm12.856 2.37a2.2 2.2 0 1 0 0 3.111a1 1 0 0 1 1.414 1.414a4.2 4.2 0 1 1 0-5.94a1 1 0 0 1-1.414 1.415M31 20a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a4 4 0 0 0 0-8z"
    />
  </TabIconBase>
);
