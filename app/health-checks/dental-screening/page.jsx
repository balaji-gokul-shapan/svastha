"use client";
import * as React from "react";
import dynamic from "next/dynamic";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleCheck,
  CircleParkingOffIcon,
  LucidePanelTopBottomDashed,
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
import StudentProfileCard from "@/app/students/studentProfileCard";
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

  // Dental conditions → gingival health toggle options ({value, label,
  // tone}) straight from master data. Prefer the dedicated dental-conditions
  // query (uses each item's severity for the tone) and fall back to the
  // combined master-data list.
  const gingivalHealthSource =
    Array.isArray(getDentalCondition) && getDentalCondition.length > 0
      ? getDentalCondition
      : Array.isArray(DentalConditionsMasterData)
        ? DentalConditionsMasterData
        : [];

  const gingivalHealthToggleOptions = gingivalHealthSource
    .map((item) => {
      const label = String(item?.name ?? "").trim();
      const value = label.toLowerCase();
      const severity = String(item?.severity ?? "").toLowerCase();
      const tone = severity.includes("high")
        ? "bad"
        : severity.includes("medium")
          ? "warn"
          : severity.includes("low") || severity.includes("none")
            ? "good"
            : label.includes("healthy")
              ? "good"
              : label.includes("abscess") || label.includes("caries")
                ? "bad"
                : "warn";
      return { value, label, tone };
    })
    .filter((option) => option.value);

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

  const [oralHygiene, setOralHygiene] = useState("fair");
  const [gingivalHealth, setGingivalHealth] = useState("gingivitis");
  const [plaque, setPlaque] = useState("mild");
  const [otherFindings, setOtherFindings] = useState({});
  const [notes, setNotes] = useState("Mild crowding in lower anterior region.");
  const [referralAction, setReferralAction] = useState("");
  const [referralReason, setReferralReason] = useState("");
  const [followUpValue, setFollowUpValue] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [sidebarNotes, setSidebarNotes] = useState("");

  // Separate tooth selection for each tab
  const [selectedPrimaryTooth, setSelectedPrimaryTooth] = useState(null);
  const [selectedAdultTooth, setSelectedAdultTooth] = useState(null);
  const [activeToothTab, setActiveToothTab] = useState("primary");
  const [getDentalCodingValue, setDentalCodingValue] = useState("");
  const [DentalConditionValue, setDentalConditionValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [dentalCodingEntries, setDentalCodingEntries] = useState([]);
  const [isCodingPopupOpen, setIsCodingPopupOpen] = useState(false);
  const [popupCodingValue, setPopupCodingValue] = useState("");
  const [popupConditionValue, setPopupConditionValue] = useState("");
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
          surface: "—",
          severity: "—",
          treatment: "No treatment needed",
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
  const eventRoster = useAppSelector((state) => state.eventAssign?.students) || [];

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
  }, [studentsArray, selectedStudentFromFilter, studentFilter, studentId, eventRoster]);

  const selectedStudentKey = String(
    selectedStudent?.id ?? selectedStudent?.studentId ?? "",
  );
  const studentSelectValue = selectedStudentKey || "";
  console.log(studentSelectValue,"studentSelectValue");
  
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

  const summary = useMemo(() => {
    const counts = { caries: 0, other: 0, healthy: 0, missing: 0 };
    chart.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status] += 1;
    });
    return counts;
  }, [chart]);

  const quickFindings = useMemo(
    () => ({
      caries: summary.caries,
      other: summary.other,
      healthy: summary.healthy,
      missing: summary.missing,
    }),
    [summary],
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
          surface: "—",
          severity: "—",
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

  const handleSaveAssessment = () => {
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
      findings: dentalCodingEntries.map((entry) => ({
        code: entry.coding,
        name: entry.condition,
        dental_condition_id: entry.dentalConditionId,
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

    setIsSaving(true);

    dispatch(createDentalScreening(payload))
      .unwrap()
      .then(() => {
        setIsSaving(false);
        // Refresh the react-query cache; the ["dental-screening"] query's
        // queryFn re-dispatches getDentalScreening, keeping Redux in sync.
        queryClient.invalidateQueries({ queryKey: ["dental-screening"] });

        // Reset the form for the next student; the ref guard stops the
        // auto-apply effect from re-filling the just-saved values.
        resetAfterSaveRef.current = true;
        resetFormToDefaults();

        toast.success("Dental screening saved successfully", {
          description: selectedStudent?.name
            ? `Record saved for ${selectedStudent.name}`
            : undefined,
        });
      })
      .catch((error) => {
        setIsSaving(false);
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
    setDentalCodingValue("");
    setDentalConditionValue("");
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

  const conditionLabelMap = useMemo(() => {
    const map = {};
    if (Array.isArray(getDentalCondition)) {
      getDentalCondition.forEach((item) => {
        const name = String(item?.name ?? "").trim();
        if (!name) return;
        // Keyed by name; the value carries every master field so entries can
        // use severity / risk_score / description later — the displayed label
        // itself remains the name.
        map[name] = {
          name,
          dentalConditionId: Number(item?.id ?? ""),
          description: String(item?.description ?? "").trim(),
          riskScore: String(item?.risk_score ?? "").trim(),
          severity: String(item?.severity ?? "").trim(),
        };
      });
    }
    return map;
  }, [getDentalCondition]);

  // Live condition info for the popup's read-only fields — derived directly
  // from the selection so severity / risk / label update as the user picks.
  const popupConditionInfo = popupConditionValue
    ? (conditionLabelMap[popupConditionValue] ?? null)
    : null;
  console.log(popupConditionInfo, popupConditionInfo);

  const handleSaveCodingEntry = () => {
    const coding = String(popupCodingValue ?? "").trim();
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
    const dentalConditionId = conditionLabelMap[condition];
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
      conditionRiskScore: conditionInfo?.riskScore ?? "",
      conditionDescription: conditionInfo?.description ?? "",
      dentalConditionId: conditionInfo?.dentalConditionId ?? "",
      status,
      tooth: toothNumber,
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
              surface: "—",
              severity: entry.conditionSeverity || "—",
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
    setIsCodingPopupOpen(true);
  };

  // The entry currently being edited (null in add mode) — used by the dialog
  // title/description to show the right tooth.
  const editingEntry =
    editingEntryId != null
      ? (dentalCodingEntries.find((item) => item.id === editingEntryId) ?? null)
      : null;

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
        setCodingSearchOptions(null);
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
  const popupCodingOptions =
    codingSearchTerm.trim() && codingSearchOptions !== null
      ? codingSearchOptions
      : getDentalCodingOptions;

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
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSaving ? "Saving..." : "Save assessment"}
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
            <div className="relative md:relative lg:sticky lg:top-24 z-10 self-start space-y-5">
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
              <QuickFindingSummary quickFindings={quickFindings} />
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

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-1">
                    {/* ================= CURRENT TOOTH ================= */}
                    <FramerCard>
                      {currentTooth && (
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
                            <div className="min-w-0">
                              <FieldLabel>Status</FieldLabel>

                              <Select
                                value={String(currentTooth.status ?? "healthy")}
                                onValueChange={handleSelectedToothStatusChange}
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

                            {/* Surface */}
                            <div className="min-w-0">
                              <TextField
                                label="Surface"
                                value={currentTooth.surface}
                                readOnly
                              />
                            </div>

                            {/* Severity */}
                            <div className="min-w-0">
                              <TextField
                                label="Severity"
                                value={
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
                                  currentTooth.riskScore ??
                                  popupConditionInfo?.riskScore
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
                      )}
                    </FramerCard>

                    {/* ================= SECOND CARD ================= */}
                    <FramerCard>
                      {currentTooth && (
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
                                          currentTooth.number}
                                      </span>{" "}
                                      (
                                      {getToothName(
                                        editingEntry?.tooth ??
                                          currentTooth.number,
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
                                      <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-3">
                                        <div className="min-w-0">
                                          <label className="mb-1.5 block text-xs text-muted-foreground">
                                            Condition
                                          </label>
                                          <input
                                            type="text"
                                            readOnly
                                            value={popupConditionInfo.name}
                                            className="h-9 w-full cursor-default rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none"
                                          />
                                        </div>
                                        <div className="min-w-0">
                                          <label className="mb-1.5 block text-xs text-muted-foreground">
                                            Severity
                                          </label>
                                          <input
                                            type="text"
                                            readOnly
                                            value={
                                              popupConditionInfo.severity || "—"
                                            }
                                            className="h-9 w-full cursor-default rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none"
                                          />
                                        </div>
                                        <div className="min-w-0">
                                          <label className="mb-1.5 block text-xs text-muted-foreground">
                                            Risk score
                                          </label>
                                          <input
                                            type="text"
                                            readOnly
                                            value={
                                              popupConditionInfo.riskScore ||
                                              "—"
                                            }
                                            className="h-9 w-full cursor-default rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none"
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
                      )}
                    </FramerCard>
                  </div>
                </div>
                {/* </FramerCard> */}

                {/* ---------------- Oral hygiene ---------------- */}
                <FramerCard>
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
                </FramerCard>

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
