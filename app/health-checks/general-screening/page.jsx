"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  AlertCircle,
  ChevronDown,
  Cross,
  Droplet,
  Heart,
  Loader2,
  Ruler,
  Save,
  Search,
  Thermometer,
  Weight,
  Wind,
} from "lucide-react";
import INoteActionIcon from "@iconify-react/healthicons/i-note-action";

import {
  assistantOptions,
  bloodGroupOptions,
  calcBmi,
  examinerOptions,
  immunizationOptions,
  locationOptions,
  bmiCategory,
  GROWTH_STANDARD_BANDS,
  VITALS_STANDARD_BANDS,
} from "./datas/general-screening-data";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import { getInitialScreening } from "@/lib/features/getInitialScreening";
import { getAssignEvent } from "@/lib/features/getEventAssignSlice";

import {
  createInitialScreening,
  updateInitialScreening,
} from "@/lib/features/registerGeneralScreening";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import StudentProfileCard from "@/app/students/studentProfileCard";
import StudentFilter from "../utilities/studentFilter";
import { FramerCard } from "@/util/FramerCard";
import AssessmentCard from "@/app/ui/AssessmentCard";

import { getAllMasterScreening } from "@/lib/features/masterScreeningSlice";
import { getMasterData } from "@/util/masterData";

import { generalScreeningSchema } from "./datas/general-screening-schema";
import { Textarea } from "@/components/ui/textarea";
import { selectAuthUser } from "@/lib/features/auth-slice";
import ScreeningStepper from "@/components/ScreeningStepper";

/* ============================================================
   Loading
============================================================ */

const GeneralSectionLoading = () => (
  <div className="min-h-24 rounded-xl border border-border bg-card p-4" />
);

const ClinicalSignsCard = dynamic(
  () => import("./components/ClinicalSignCard"),
  {
    loading: GeneralSectionLoading,
  },
);

const FemaleStudentsCard = dynamic(
  () => import("./components/FemaleStudentsCard"),
  {
    loading: GeneralSectionLoading,
  },
);

const GeneralPhysicalExamination = dynamic(
  () => import("./components/GeneralPhysicalExamination"),
  {
    loading: GeneralSectionLoading,
  },
);

const GrowthVitals = dynamic(() => import("./components/GrowthVitals"), {
  loading: GeneralSectionLoading,
});

const BloodGroup = dynamic(() => import("./components/BloodGroup"), {
  loading: GeneralSectionLoading,
});

const HealthHistory = dynamic(() => import("./components/HealthHistory"), {
  loading: GeneralSectionLoading,
});

/* ============================================================
   Small reusable components
============================================================ */

function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-xs text-muted-foreground">
      {children}
    </label>
  );
}

function SelectField({ label, options, value, onChange, icon: Icon, error }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 ${
            error ? "border-destructive focus:ring-destructive/30" : ""
          }`}
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

      {error ? (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

function NumberField({ label, value, onChange, unit, error }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 w-full rounded-md border border-input bg-background pl-3 pr-12 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 ${
            error ? "border-destructive focus:ring-destructive/30" : ""
          }`}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {unit}
        </span>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value, tone = "muted" }) {
  const toneStyles = {
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={`flex size-7 items-center justify-center rounded-md ${
            toneStyles[tone] ?? toneStyles.muted
          }`}
        >
          <Icon className="size-3.5" />
        </span>

        <span className="text-sm text-muted-foreground">{label}</span>
      </div>

      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

/* ============================================================
   FIX #1
   ONE helper for identifying a student.

   IMPORTANT:
   Screening record ID and student ID are NOT necessarily the same.
============================================================ */

function getStudentKey(student) {
  if (!student) {
    return "";
  }

  return String(
    student?.id ??
      student?.studentId ??
      student?.student_id ??
      student?.cus_id ??
      student?.school_registration_number ??
      student?.admission_number ??
      "",
  ).trim();
}

/* ============================================================
   Age
============================================================ */

export function getAgeInYearsFromDob(dobValue) {
  const dobString = String(dobValue ?? "").trim();

  if (!dobString) {
    return null;
  }

  const dob = new Date(dobString);

  if (Number.isNaN(dob.getTime())) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const hadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hadBirthdayThisYear) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

/* ============================================================
   Growth standard
============================================================ */

function evaluateGrowthStandard(metric, value, ageYears) {
  if (!Number.isFinite(value) || value <= 0) {
    return {
      standard: "Not entered",
      status: "Enter value",
      tone: "muted",
    };
  }

  if (!Number.isFinite(ageYears)) {
    return {
      standard: "Unknown",
      status: "DOB required",
      tone: "warning",
    };
  }

  const band = GROWTH_STANDARD_BANDS.find(
    (item) => ageYears >= item.minAge && ageYears <= item.maxAge,
  );

  if (!band) {
    return {
      standard: "Unknown",
      status: "Age out of range",
      tone: "warning",
    };
  }

  const min = metric === "height" ? band.heightMin : band.weightMin;

  const max = metric === "height" ? band.heightMax : band.weightMax;

  if (value < min) {
    return {
      standard: "Below Average",
      status: `Below range (${min}-${max})`,
      tone: "destructive",
    };
  }

  if (value > max) {
    return {
      standard: "Above Average",
      status: `Above range (${min}-${max})`,
      tone: "warning",
    };
  }

  return {
    standard: "Average",
    status: `Within range (${min}-${max})`,
    tone: "success",
  };
}

/* ============================================================
   Constants
============================================================ */

const IMMUNIZATION_MAP = {
  up_to_date: 1,
  partial: 2,
  overdue: 3,
  na: 4,
};

const STANDARD_MAP = {
  "Below Average": 1,
  Average: 2,
  "Above Average": 3,
};

const BMI_CATEGORY_MAP = {
  Underweight: 1,
  Normal: 2,
  Overweight: 3,
  Obese: 4,
  severeObesse: 5,
};

/* ============================================================
   Parse metric
============================================================ */

function parseMetricValue(rawValue) {
  if (typeof rawValue === "number") {
    return Number.isFinite(rawValue) ? rawValue : Number.NaN;
  }

  const value = String(rawValue ?? "")
    .trim()
    .toLowerCase()
    .replace(/(cm|kg)$/i, "")
    .replace(/[^0-9.-]/g, "")
    .trim();

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/* ============================================================
   Backend error
============================================================ */

function getBackendErrorMessage(error) {
  let payload = error;

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return /<!doctype html|<html[\s>]/i.test(payload) || payload.length > 240
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
    "Unable to save screening. Please try again.";

  return /<!doctype html|<html[\s>]/i.test(String(message)) ||
    String(message).length > 240
    ? "Unable to save screening. Please try again."
    : String(message);
}

/* ============================================================
   Blood pressure
============================================================ */

function parseBloodPressure(rawValue) {
  const [systolic, diastolic] = String(rawValue ?? "")
    .trim()
    .replace(/[^0-9/]/g, "")
    .split("/")
    .map(Number);

  if (
    !Number.isFinite(systolic) ||
    !Number.isFinite(diastolic) ||
    systolic <= 0 ||
    diastolic <= 0
  ) {
    return null;
  }

  return {
    systolic,
    diastolic,
  };
}

/* ============================================================
   Vitals standard
============================================================ */

function evaluateVitalsStandard(metric, rawValue, ageYears) {
  const parsed =
    metric === "bloodPressure"
      ? parseBloodPressure(rawValue)
      : Number.parseFloat(String(rawValue ?? ""));

  const hasValue =
    metric === "bloodPressure"
      ? parsed !== null
      : Number.isFinite(parsed) && parsed > 0;

  if (!hasValue) {
    return {
      standard: "Not entered",
      status: "Enter value",
      tone: "muted",
    };
  }

  if (!Number.isFinite(ageYears)) {
    return {
      standard: "Unknown",
      status: "DOB required",
      tone: "warning",
    };
  }

  const band = VITALS_STANDARD_BANDS.find(
    (item) => ageYears >= item.minAge && ageYears <= item.maxAge,
  );

  if (!band) {
    return {
      standard: "Unknown",
      status: "Age out of range",
      tone: "warning",
    };
  }

  if (metric === "bloodPressure") {
    const below =
      parsed.systolic < band.bpSystolicMin ||
      parsed.diastolic < band.bpDiastolicMin;

    const above =
      parsed.systolic > band.bpSystolicMax ||
      parsed.diastolic > band.bpDiastolicMax;

    const rangeText = `(${band.bpSystolicMin}-${band.bpSystolicMax}/${band.bpDiastolicMin}-${band.bpDiastolicMax} mmHg)`;

    if (below) {
      return {
        standard: "Below Average",
        status: `Below range ${rangeText}`,
        tone: "destructive",
      };
    }

    if (above) {
      return {
        standard: "Above Average",
        status: `Above range ${rangeText}`,
        tone: "warning",
      };
    }

    return {
      standard: "Average",
      status: `Within range ${rangeText}`,
      tone: "success",
    };
  }

  const min =
    metric === "pulse"
      ? band.pulseMin
      : metric === "temperature"
        ? band.tempMin
        : band.spo2Min;

  const max =
    metric === "pulse"
      ? band.pulseMax
      : metric === "temperature"
        ? band.tempMax
        : band.spo2Max;

  if (parsed < min) {
    return {
      standard: "Below Average",
      status: `Below range (${min}-${max})`,
      tone: "destructive",
    };
  }

  if (parsed > max) {
    return {
      standard: "Above Average",
      status: `Above range (${min}-${max})`,
      tone: "warning",
    };
  }

  return {
    standard: "Average",
    status: `Within range (${min}-${max})`,
    tone: "success",
  };
}

/* ============================================================
   PAGE
============================================================ */

export default function GeneralScreeningPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  /* ============================================================
     Redux
  ============================================================ */

  const {
    studentData = [],
    loading: studentsLoading,
    error: studentsError,
  } = useAppSelector((state) => state.getInitialScreening);

  const authUser = useAppSelector(selectAuthUser);

  /* ============================================================
     Master data
  ============================================================ */

  const {
    data: masterScreeningData = {},
    isLoading: masterScreeningDataLoading,
    error: masterScreeningQueryError,
  } = useQuery({
    queryKey: ["master-screening"],

    queryFn: () => dispatch(getAllMasterScreening()).unwrap(),

    staleTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,
  });

  const requiredMasterData = useMemo(
    () =>
      getMasterData(masterScreeningData, [
        "allergies",
        "blood-groups",
        "bmi-categories",
        "chronic-diseases",
        "skin-masters",
        "nutrition-masters",
        "consciousness-masters",
        "appearance-masters",
        "height-weight-standards",
        "immunizations",
        "vital-signs",
      ]),
    [masterScreeningData],
  );

  const allergies = requiredMasterData.allergies ?? [];

  const chronicDiseasesOption = requiredMasterData["chronic-diseases"] ?? [];

  const bloodGroupOption = requiredMasterData["blood-groups"] ?? [];

  const bmiCategories = requiredMasterData["bmi-categories"] ?? [];

  const nutritionOptions = requiredMasterData["nutrition-masters"] ?? [];

  const consciousnessOptions =
    requiredMasterData["consciousness-masters"] ?? [];

  const appearanceOptions = requiredMasterData["appearance-masters"] ?? [];

  const skinOptions = requiredMasterData["skin-masters"] ?? [];

  /* ============================================================
     Filters / selection
  ============================================================ */

  const academicYearOptions = ["2026-2027", "2025-2026", "2024-2025"];

  const [isCaDrawerOpen, setIsCaDrawerOpen] = useState(false);

  const [activeStep, setActiveStep] = useState("growth");

  const [selectedCampId, setSelectedCampId] = useState("");

  const [studentId, setStudentId] = useState("");

  const [academicYear, setAcademicYear] = useState(academicYearOptions[0]);

  const [selectedClassFilter, setSelectedClassFilter] = useState("all");

  const [getStudentDataByEvent, setGetStudentDataByEvent] = useState([]);

  /* ============================================================
     Form state
  ============================================================ */

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [pulse, setPulse] = useState("");
  const [temperature, setTemperature] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [spo2, setSpo2] = useState("");

  const [bloodGroup, setBloodGroup] = useState(
    bloodGroupOption?.[0]?.name ?? "",
  );

  const [allergy, setAllergy] = useState("None");

  const [chronicDisease, setChronicDisease] = useState("None");

  const [immunization, setImmunization] = useState("up_to_date");

  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  /* ============================================================
     Save protection
  ============================================================ */

  const isSavingRef = useRef(false);

  const savedStudentKeyRef = useRef(null);

  const [savedStudentKey, setSavedStudentKey] = useState(null);

  /* ============================================================
     Clinical signs
  ============================================================ */

  const [clinicalSigns, setClinicalSigns] = useState({
    pallor: "",
    clubbing: "",
    edema: "",
    skinAssessment:
      skinOptions.find((item) => item.name === "Normal")?.name ??
      skinOptions?.[0]?.name ??
      "Normal",
    medicalCondition: "",
    currentComplaints: "",
    regularMedication: "",
  });

  useEffect(() => {
    setClinicalSigns((prev) => {
      if (
        prev.skinAssessment &&
        (skinOptions.length === 0 ||
          skinOptions.some((item) => item.name === prev.skinAssessment))
      ) {
        return prev;
      }

      return {
        ...prev,
        skinAssessment:
          skinOptions.find((item) => item.name === "Normal")?.name ??
          skinOptions[0]?.name ??
          "Normal",
      };
    });
  }, [skinOptions]);

  /* ============================================================
     Physical examination
  ============================================================ */

  const [physicalExamination, setPhysicalExamination] = useState({
    generalAppearance: appearanceOptions?.[0]?.name ?? "",
    postureSpine: appearanceOptions?.[0]?.name ?? "",
    nutritionalStatus: nutritionOptions?.[0]?.name ?? "",
    consciousness: consciousnessOptions?.[0]?.name ?? "",
    cvs: "",
    respiratorySystem: "",
    abdomen: "",
    neurology: "",
    referral: "",
  });

  /* ============================================================
     Female screening
  ============================================================ */

  const [femaleScreening, setFemaleScreening] = useState({
    menstrualCycle: "",
    excessiveBleeding: "",
    menstrualPain: "",
    otherConcerns: "",
    referral: "",
  });

  const [formErrors, setFormErrors] = useState(null);

  /* ============================================================
     Filters
  ============================================================ */

  const [schoolName, setSchoolName] = useState("all");

  const [classFilter, setClassFilter] = useState("all");

  const [sectionFilter, setSectionFilter] = useState("all");

  const [studentFilter, setStudentFilter] = useState("all");

  /* ============================================================
     Screening query
  ============================================================ */

  useQuery({
    queryKey: [
      "initial-screening",
      schoolName,
      academicYear,
      classFilter,
      sectionFilter,
      studentFilter,
    ],

    queryFn: () =>
      dispatch(
        getInitialScreening({
          all: true,
          search: "",
          status: "all",
          sortBy: "name",
          sortOrder: "asc",
        }),
      ).unwrap(),

    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  /* ============================================================
     Assigned events
  ============================================================ */

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

      return dispatch(getAssignEvent()).unwrap();
    },

    enabled: Boolean(authUser?.id ?? authUser?.Id),

    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  /* ============================================================
     FIX #2
     RESET FUNCTION

     This clears EVERYTHING.
  ============================================================ */

  const resetFormToDefaults = useCallback(() => {
    setHeight("");
    setWeight("");
    setPulse("");
    setTemperature("");
    setBloodPressure("");
    setSpo2("");

    setBloodGroup(bloodGroupOption?.[0]?.name ?? "");

    setAllergy("None");
    setChronicDisease("None");
    setImmunization("up_to_date");
    setNotes("");

    setClinicalSigns({
      pallor: "",
      clubbing: "",
      edema: "",
      skinAssessment:
        skinOptions.find((item) => item.name === "Normal")?.name ??
        skinOptions?.[0]?.name ??
        "Normal",
      medicalCondition: "",
      currentComplaints: "",
      regularMedication: "",
    });

    setPhysicalExamination({
      generalAppearance: appearanceOptions?.[0]?.name ?? "",
      postureSpine: appearanceOptions?.[0]?.name ?? "",
      nutritionalStatus: nutritionOptions?.[0]?.name ?? "",
      consciousness: consciousnessOptions?.[0]?.name ?? "",
      cvs: "",
      respiratorySystem: "",
      abdomen: "",
      neurology: "",
      referral: "",
    });

    setFemaleScreening({
      menstrualCycle: "",
      excessiveBleeding: "",
      menstrualPain: "",
      otherConcerns: "",
      referral: "",
    });

    setFormErrors(null);
    setActiveStep("growth");
  }, [
    bloodGroupOption,
    skinOptions,
    appearanceOptions,
    nutritionOptions,
    consciousnessOptions,
  ]);

  /* ============================================================
     FIX #3
     Apply saved screening to form.

     Notice that missing values become "" instead of "0".
  ============================================================ */

  const applyScreeningRecordToForm = useCallback(
    (screeningRecord) => {
      const getMetricValue = (value) => {
        const normalizedValue = String(value ?? "").trim();

        return normalizedValue || "";
      };

      const normalizeText = (value, fallback = "") => {
        const normalized = String(value ?? "").trim();

        return normalized || fallback;
      };

      const normalizeChoice = (value, validOptions, fallback = "") => {
        const text = String(value ?? "").trim();

        if (!text) {
          return fallback;
        }

        const exactMatch = validOptions.find(
          (option) => option.toLowerCase() === text.toLowerCase(),
        );

        if (exactMatch) {
          return exactMatch;
        }

        if (["1", "true", "yes", "y"].includes(text.toLowerCase())) {
          return validOptions[1] ?? fallback;
        }

        if (["0", "false", "no", "n"].includes(text.toLowerCase())) {
          return validOptions[0] ?? fallback;
        }

        return fallback;
      };

      const normalizeBinary = (value, fallback = "0") => {
        const text = String(value ?? "").trim();

        if (!text) {
          return fallback;
        }

        if (["1", "true", "yes", "y"].includes(text.toLowerCase())) {
          return "1";
        }

        if (["0", "false", "no", "n"].includes(text.toLowerCase())) {
          return "0";
        }

        return text;
      };

      /* -------------------------
         Growth / vitals
      ------------------------- */

      setHeight(getMetricValue(screeningRecord?.height));

      setWeight(getMetricValue(screeningRecord?.weight));

      setPulse(getMetricValue(screeningRecord?.pulse));

      setTemperature(getMetricValue(screeningRecord?.temperature));

      setBloodPressure(
        String(
          screeningRecord?.blood_pressure ?? screeningRecord?.bp ?? "",
        ).trim(),
      );

      setSpo2(getMetricValue(screeningRecord?.spo2));

      /* -------------------------
         Notes
      ------------------------- */

      setNotes(
        String(
          screeningRecord?.notes ??
            screeningRecord?.remark ??
            screeningRecord?.remarks ??
            "",
        ),
      );

      /* -------------------------
         Health history
      ------------------------- */

      setAllergy(
        screeningRecord?.allergy?.name ??
          screeningRecord?.allergy_name ??
          allergies[0]?.name ??
          "None",
      );

      setChronicDisease(
        screeningRecord?.chronic_disease?.name ??
          screeningRecord?.chronic_disease_name ??
          chronicDiseasesOption[0]?.name ??
          "None",
      );

      setBloodGroup(
        screeningRecord?.blood_group?.name ??
          screeningRecord?.blood_group_name ??
          screeningRecord?.bloodGroup ??
          bloodGroupOption[0]?.name ??
          "",
      );

      /* -------------------------
         Clinical signs
      ------------------------- */

      setClinicalSigns((prev) => ({
        ...prev,

        pallor: normalizeBinary(
          screeningRecord?.pallor ?? screeningRecord?.clinical_signs?.pallor,
          "0",
        ),

        clubbing: normalizeBinary(
          screeningRecord?.clubbing ??
            screeningRecord?.clinical_signs?.clubbing,
          "0",
        ),

        edema: normalizeBinary(
          screeningRecord?.edema ?? screeningRecord?.clinical_signs?.edema,
          "0",
        ),

        skinAssessment:
          skinOptions.find(
            (item) =>
              String(item.id) ===
              String(screeningRecord?.skin ?? screeningRecord?.skin_assessment),
          )?.name ??
          screeningRecord?.skin ??
          screeningRecord?.skin_assessment ??
          "Normal",

        medicalCondition: normalizeText(
          screeningRecord?.medical_condition ??
            screeningRecord?.medicalCondition ??
            screeningRecord?.known_medical_condition,
          "",
        ),

        currentComplaints: normalizeText(
          screeningRecord?.current_complaints ??
            screeningRecord?.currentComplaints,
          "",
        ),

        regularMedication: normalizeText(
          screeningRecord?.regular_medication ??
            screeningRecord?.regularMedication,
          "",
        ),
      }));

      /* -------------------------
         Physical examination
      ------------------------- */

      setPhysicalExamination({
        generalAppearance: normalizeChoice(
          appearanceOptions.find(
            (item) =>
              String(item.id) === String(screeningRecord?.general_appearance),
          )?.name ??
            screeningRecord?.general_appearance ??
            screeningRecord?.generalAppearance,
          appearanceOptions.map((item) => item.name).length
            ? appearanceOptions.map((item) => item.name)
            : ["Normal", "Needs Attention", "NA"],
          "Normal",
        ),

        postureSpine: normalizeChoice(
          appearanceOptions.find(
            (item) =>
              String(item.id) === String(screeningRecord?.posture_spine),
          )?.name ??
            screeningRecord?.posture_spine ??
            screeningRecord?.postureSpine,
          appearanceOptions.map((item) => item.name).length
            ? appearanceOptions.map((item) => item.name)
            : ["Normal", "Needs Attention", "NA"],
          "Normal",
        ),

        nutritionalStatus: normalizeChoice(
          nutritionOptions.find(
            (item) =>
              String(item.id) === String(screeningRecord?.nutritional_status),
          )?.name ??
            screeningRecord?.nutritional_status ??
            screeningRecord?.nutritionalStatus,
          nutritionOptions.map((item) => item.name).length
            ? nutritionOptions.map((item) => item.name)
            : ["Normal", "Underweight", "Overweight"],
          "Normal",
        ),

        consciousness: normalizeChoice(
          consciousnessOptions.find(
            (item) =>
              String(item.id) === String(screeningRecord?.consciousness),
          )?.name ?? screeningRecord?.consciousness,
          consciousnessOptions.map((item) => item.name).length
            ? consciousnessOptions.map((item) => item.name)
            : ["Alert", "Drowsy", "Unresponsive"],
          "Alert",
        ),

        cvs: normalizeText(screeningRecord?.cvs, ""),

        respiratorySystem: normalizeText(
          screeningRecord?.rs ?? screeningRecord?.respiratory_system,
          "",
        ),

        abdomen: normalizeText(screeningRecord?.abdomen, ""),

        neurology: normalizeText(screeningRecord?.neurology, ""),

        referral: normalizeText(screeningRecord?.referral, ""),
      });

      /* -------------------------
         Female screening
      ------------------------- */

      setFemaleScreening({
        menstrualCycle: normalizeText(screeningRecord?.menstrual_cycle, ""),

        excessiveBleeding: normalizeText(
          screeningRecord?.excessive_bleeding,
          "",
        ),

        menstrualPain: normalizeText(screeningRecord?.menstrual_pain, ""),

        otherConcerns: normalizeText(
          screeningRecord?.other_concern ?? screeningRecord?.other_concerns,
          "",
        ),

        referral: normalizeText(screeningRecord?.female_referral, ""),
      });
    },
    [
      allergies,
      chronicDiseasesOption,
      bloodGroupOption,
      skinOptions,
      appearanceOptions,
      nutritionOptions,
      consciousnessOptions,
    ],
  );

  /* ============================================================
     Student response array
  ============================================================ */

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

  /* ============================================================
     Event roster
  ============================================================ */

  const eventRoster =
    useAppSelector((state) => state.eventAssign?.students) || [];

  /* ============================================================
     Selected student
  ============================================================ */

  const selectedStudentFromFilter = useMemo(() => {
    const activeId = studentFilter !== "all" ? studentFilter : studentId;

    if (!activeId) {
      return null;
    }

    const normalizedId = String(activeId).trim();

    return (
      studentsArray.find(
        (student) => getStudentKey(student) === normalizedId,
      ) ?? null
    );
  }, [studentsArray, studentFilter, studentId]);

  const selectedStudent = useMemo(() => {
    if (selectedStudentFromFilter) {
      return selectedStudentFromFilter;
    }

    const activeId = studentFilter !== "all" ? studentFilter : studentId;

    if (!activeId) {
      return null;
    }

    const normalizedId = String(activeId).trim();

    return (
      eventRoster.find((student) => getStudentKey(student) === normalizedId) ??
      null
    );
  }, [selectedStudentFromFilter, studentFilter, studentId, eventRoster]);

  /* ============================================================
     Female
  ============================================================ */

  const isFemale = useMemo(
    () => selectedStudent?.gender?.toLowerCase() === "female",
    [selectedStudent],
  );
  /* ============================================================
     FIX #4
     Canonical selected student key
  ============================================================ */

  const selectedStudentKey = useMemo(() => {
    return getStudentKey(selectedStudent);
  }, [selectedStudent]);

  const studentSelectValue = selectedStudentKey;

  const hasSelectedStudent = Boolean(selectedStudentKey);

  /* ============================================================
     FIX #5
     Find screening ONLY by student_id

     DO NOT use record.id here.
  ============================================================ */

  const students = useMemo(
    () => (Array.isArray(studentData) ? studentData : []),
    [studentData],
  );

  const getSelectedStudentScreeningData = useMemo(() => {
    if (!selectedStudentKey || students.length === 0) {
      return null;
    }

    const record = students.find((screeningRecord) => {
      const recordStudentKey = String(
        screeningRecord?.student_id ??
          screeningRecord?.studentId ??
          screeningRecord?.student?.id ??
          screeningRecord?.student?.student_id ??
          screeningRecord?.cus_id ??
          "",
      ).trim();

      return recordStudentKey === selectedStudentKey;
    });

    return record ?? null;
  }, [selectedStudentKey, students]);

  /* ============================================================
     FIX #6
     THIS is the important effect.

     Every time student changes:
       1. Clear old student data.
       2. Check whether new student has saved data.
       3. If yes, load ONLY that student's data.
       4. If no, leave blank.
  ============================================================ */

  useEffect(() => {
    if (!selectedStudentKey) {
      resetFormToDefaults();
      return;
    }

    // ALWAYS clear previous student's values first.
    resetFormToDefaults();

    // New student does not have saved screening.
    if (!getSelectedStudentScreeningData) {
      return;
    }

    const recordStudentKey = String(
      getSelectedStudentScreeningData?.student_id ??
        getSelectedStudentScreeningData?.studentId ??
        getSelectedStudentScreeningData?.student?.id ??
        getSelectedStudentScreeningData?.student?.student_id ??
        getSelectedStudentScreeningData?.cus_id ??
        "",
    ).trim();

    // SAFETY:
    // Never apply a record belonging to another student.
    if (!recordStudentKey || recordStudentKey !== selectedStudentKey) {
      return;
    }

    // This is definitely the selected student's record.
    applyScreeningRecordToForm(getSelectedStudentScreeningData);
  }, [
    selectedStudentKey,
    getSelectedStudentScreeningData,
    resetFormToDefaults,
    applyScreeningRecordToForm,
  ]);

  /* ============================================================
     Student DOB / age
  ============================================================ */

  const studentDob = useMemo(
    () =>
      selectedStudent?.dob ??
      selectedStudent?.date_of_birth ??
      selectedStudent?.dateOfBirth ??
      getSelectedStudentScreeningData?.dob ??
      getSelectedStudentScreeningData?.date_of_birth ??
      getSelectedStudentScreeningData?.dateOfBirth ??
      "",
    [selectedStudent, getSelectedStudentScreeningData],
  );

  const studentAgeYears = useMemo(
    () => getAgeInYearsFromDob(studentDob),
    [studentDob],
  );

  /* ============================================================
     Standards
  ============================================================ */

  const heightStandardResult = useMemo(
    () =>
      evaluateGrowthStandard(
        "height",
        parseMetricValue(height),
        studentAgeYears,
      ),
    [height, studentAgeYears],
  );

  const weightStandardResult = useMemo(
    () =>
      evaluateGrowthStandard(
        "weight",
        parseMetricValue(weight),
        studentAgeYears,
      ),
    [weight, studentAgeYears],
  );

  const pulseStandardResult = useMemo(
    () => evaluateVitalsStandard("pulse", pulse, studentAgeYears),
    [pulse, studentAgeYears],
  );

  const bloodPressureStandardResult = useMemo(
    () =>
      evaluateVitalsStandard("bloodPressure", bloodPressure, studentAgeYears),
    [bloodPressure, studentAgeYears],
  );

  const spo2StandardResult = useMemo(
    () => evaluateVitalsStandard("spo2", spo2, studentAgeYears),
    [spo2, studentAgeYears],
  );

  const temperatureStandardResult = useMemo(
    () => evaluateVitalsStandard("temperature", temperature, studentAgeYears),
    [temperature, studentAgeYears],
  );

  /* ============================================================
     BMI
  ============================================================ */

  const bmi = useMemo(() => calcBmi(height, weight), [height, weight]);

  const selectedScreeningRecord = getSelectedStudentScreeningData;

  const displayBmi = useMemo(() => {
    if (bmi != null) {
      return bmi;
    }

    const saved = parseMetricValue(selectedScreeningRecord?.bmi);

    return saved > 0 ? saved : null;
  }, [bmi, selectedScreeningRecord]);

  const category = useMemo(() => bmiCategory(displayBmi), [displayBmi]);

  /* ============================================================
     Assessment form
  ============================================================ */

  const assessmentForm = useMemo(
    () => ({
      height,
      weight,
      bmi: displayBmi != null ? displayBmi.toFixed(1) : "",
      bloodPressure,
      pulse,
      temperature,
      spo2,
      bloodGroup,
    }),
    [
      height,
      weight,
      displayBmi,
      bloodPressure,
      pulse,
      temperature,
      spo2,
      bloodGroup,
    ],
  );

  /* ============================================================
     Error handlers
  ============================================================ */

  const clearFormError = useCallback((field) => {
    setFormErrors((prev) =>
      prev && prev[field]
        ? {
            ...prev,
            [field]: undefined,
          }
        : prev,
    );
  }, []);

  const handleHeightChange = useCallback(
    (value) => {
      setHeight(value);
      clearFormError("height");
    },
    [clearFormError],
  );

  const handleWeightChange = useCallback(
    (value) => {
      setWeight(value);
      clearFormError("weight");
    },
    [clearFormError],
  );

  const handleBloodGroupChange = useCallback(
    (value) => {
      setBloodGroup(value);
      clearFormError("bloodGroup");
    },
    [clearFormError],
  );

  const handleAllergyChange = useCallback(
    (value) => {
      setAllergy(value);
      clearFormError("allergy");
    },
    [clearFormError],
  );

  const handleChronicDiseaseChange = useCallback(
    (value) => {
      setChronicDisease(value);
      clearFormError("chronicDisease");
    },
    [clearFormError],
  );

  /* ============================================================
     Child component handlers
  ============================================================ */

  const handleClinicalSignChange = useCallback((field, value) => {
    setClinicalSigns((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handlePhysicalExaminationChange = useCallback((field, value) => {
    setPhysicalExamination((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleFemaleScreeningChange = useCallback((field, value) => {
    setFemaleScreening((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleAssessmentChange = useCallback(
    (field, value) => {
      if (field === "height") {
        handleHeightChange(value);
        return;
      }

      if (field === "weight") {
        handleWeightChange(value);
        return;
      }

      if (field === "bloodGroup") {
        handleBloodGroupChange(value);
      }
    },
    [handleHeightChange, handleWeightChange, handleBloodGroupChange],
  );

  /* ============================================================
     Blood group formatter
  ============================================================ */

  const formatBloodGroup = useCallback((value) => {
    if (!value) {
      return "--";
    }

    return value.replace(/\s*Positive/i, "+").replace(/\s*Negative/i, "-");
  }, []);

  /* ============================================================
     FIX #7
     Student change
  ============================================================ */

  const handleAssessmentStudentChange = useCallback((value) => {
    const nextStudentId = String(value ?? "").trim();

    setStudentId(nextStudentId);

    setStudentFilter(nextStudentId || "all");
  }, []);

  /* ============================================================
     Save assessment
  ============================================================ */

  const handleSaveAssessment = useCallback(() => {
    /* -------------------------
         Prevent double click
      ------------------------- */

    if (isSavingRef.current) {
      return;
    }

    const rawStudentId =
      selectedStudent?.id ??
      selectedStudent?.cus_id ??
      selectedStudent?.student_id ??
      selectedStudent?.studentId ??
      studentId;

    if (!String(rawStudentId ?? "").trim()) {
      toast.error("Select a student before saving the general screening.");

      return;
    }

    /* -------------------------
         Prevent duplicate save
      ------------------------- */

    if (savedStudentKeyRef.current === String(rawStudentId)) {
      toast.error(
        "This student's screening has already been saved. Select another student to continue.",
      );

      return;
    }

    /* -------------------------
         Validate
      ------------------------- */

    const formValues = {
      height,
      weight,
      bloodGroup,
      allergy,
      chronicDisease,
      immunization,
      skin: clinicalSigns.skinAssessment || "",
      regular_medication: clinicalSigns.regularMedication || "",
      current_complaints: clinicalSigns.currentComplaints || "",
      general_appearance: physicalExamination.generalAppearance || "",
      posture_spine: physicalExamination.postureSpine || "",
      nutritional_status: physicalExamination.nutritionalStatus || "",
      consciousness: physicalExamination.consciousness || "",
      cvs: physicalExamination.cvs || "",
      rs: physicalExamination.respiratorySystem || "",
      abdomen: physicalExamination.abdomen || "",
      neurology: physicalExamination.neurology || "",
      referral: physicalExamination.referral || "",
      notes,
    };

    const result = generalScreeningSchema.safeParse(formValues);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      const firstPerField = Object.fromEntries(
        Object.entries(errors)
          .map(([field, messages]) => [field, messages?.[0]])
          .filter(([, message]) => Boolean(message)),
      );

      setFormErrors(firstPerField);

      toast.error(
        Object.values(firstPerField).find(Boolean) ||
          "Please fill all required fields.",
      );

      return;
    }

    setFormErrors(null);

    /* -------------------------
         IDs
      ------------------------- */

    const numericStudentId = Number(rawStudentId) || 0;

    const numericCampId =
      Number(selectedCampId) || Number(selectedStudent?.camp_id) || 1;

    /* -------------------------
         Master entries
      ------------------------- */

    const bloodGroupEntry = bloodGroupOption.find(
      (item) =>
        formatBloodGroup(item.name).trim() ===
        formatBloodGroup(bloodGroup).trim(),
    );

    const allergyEntry = allergies.find((item) => item.name === allergy);

    const chronicDiseaseEntry = chronicDiseasesOption.find(
      (item) => item.name === chronicDisease,
    );

    const getExaminationMastersId = (findings, value) => {
      const normalizedValue = String(value ?? "")
        .trim()
        .toLowerCase();

      return findings.find(
        (item) =>
          String(item?.name ?? "")
            .trim()
            .toLowerCase() === normalizedValue,
      );
    };

    const consciousnessEntry = getExaminationMastersId(
      consciousnessOptions,
      physicalExamination.consciousness,
    );

    const nutritionEntry = getExaminationMastersId(
      nutritionOptions,
      physicalExamination.nutritionalStatus,
    );

    const generalAppearanceEntry = getExaminationMastersId(
      appearanceOptions,
      physicalExamination.generalAppearance,
    );

    const postureAppearanceEntry = getExaminationMastersId(
      appearanceOptions,
      physicalExamination.postureSpine,
    );

    const skinAssessmentEntry = getExaminationMastersId(
      skinOptions,
      clinicalSigns.skinAssessment,
    );

    /* -------------------------
         Payload
      ------------------------- */

    const payload = {
      student_id: numericStudentId,

      camp_id: numericCampId,

      blood_group_id: bloodGroupEntry?.id ?? 0,

      allergy_id: allergyEntry?.id ?? null,

      chronic_disease_id: chronicDiseaseEntry?.id ?? null,

      immunization_id: IMMUNIZATION_MAP[immunization] || 1,

      height: Number(height) || 0,

      weight: Number(weight) || 0,

      pulse: pulse ? Number(pulse) : 0,

      temperature: temperature ? Number(temperature) : 0,

      bp: bloodPressure || "",

      spo2: spo2 ? Number(spo2) : 0,

      height_standard_id: STANDARD_MAP[heightStandardResult?.standard] || 2,

      weight_standard_id: STANDARD_MAP[weightStandardResult?.standard] || 2,

      bmi_category_id: BMI_CATEGORY_MAP[category?.label] || 2,

      pallor: clinicalSigns.pallor || "0",

      skin: skinAssessmentEntry?.id || null,

      clubbing: clinicalSigns.clubbing || "0",

      edema: clinicalSigns.edema || "0",

      regular_medication: clinicalSigns.regularMedication || "",

      current_complaints: clinicalSigns.currentComplaints || "",

      general_appearance: generalAppearanceEntry?.id || "",

      posture_spine: postureAppearanceEntry?.id || "",

      nutritional_status: nutritionEntry?.id ?? null,

      consciousness: consciousnessEntry?.id || null,

      cvs: physicalExamination.cvs || "",

      rs: physicalExamination.respiratorySystem || "",

      abdomen: physicalExamination.abdomen || "",

      neurology: physicalExamination.neurology || "",

      referral: physicalExamination.referral || "",

      remarks: notes || "",

      ...(isFemale
        ? {
            menstrual_cycle: femaleScreening.menstrualCycle || "",

            menstrual_pain: femaleScreening.menstrualPain || "",

            excessive_bleeding: femaleScreening.excessiveBleeding || "",

            other_concern: femaleScreening.otherConcerns || "",

            female_referral: femaleScreening.referral || "",
          }
        : {}),
    };

    /* -------------------------
         Save
      ------------------------- */

    const existingRecordId =
      getSelectedStudentScreeningData?.id ??
      getSelectedStudentScreeningData?.screening_id ??
      getSelectedStudentScreeningData?.screeningId;

    const hasSavedMeasurements = (() => {
      const record = getSelectedStudentScreeningData;

      if (!record) {
        return false;
      }

      const parseMetric = (value) => {
        const parsed = Number.parseFloat(
          String(value ?? "").replace(/[^0-9.-]/g, ""),
        );

        return Number.isFinite(parsed) && parsed > 0;
      };

      return parseMetric(record.height) || parseMetric(record.weight);
    })();

    /*
     * Create-only flow.
     *
     * Change to true if you later want
     * update-on-resave.
     */
    const ALLOW_SCREENING_UPDATE = false;

    const saveAction =
      ALLOW_SCREENING_UPDATE && hasSavedMeasurements
        ? updateInitialScreening({
            id: existingRecordId,
            studentId: numericStudentId,
            payload,
          })
        : createInitialScreening(payload);

    setIsSaving(true);
    isSavingRef.current = true;

    dispatch(saveAction)
      .unwrap()

      .then(() => {
        setIsSaving(false);
        isSavingRef.current = false;

        /* -------------------------
             Mark student saved
          ------------------------- */

        savedStudentKeyRef.current = String(numericStudentId);

        setSavedStudentKey(String(numericStudentId));

        /* -------------------------
             Refresh screening list
          ------------------------- */

        queryClient.invalidateQueries({
          queryKey: ["initial-screening"],
        });

        /*
         * Clear the form.
         *
         * IMPORTANT:
         * We no longer use resetAfterSaveRef.
         * When the query refetches, the student
         * record will be matched by student_id.
         */
        resetFormToDefaults();

        toast.success(
          ALLOW_SCREENING_UPDATE && hasSavedMeasurements
            ? "Initial screening updated successfully"
            : "Initial screening saved successfully",
          {
            description: selectedStudent?.name
              ? `Record saved for ${selectedStudent.name}`
              : undefined,
          },
        );
      })

      .catch((error) => {
        setIsSaving(false);
        isSavingRef.current = false;

        console.error("Unable to save general screening:", error);

        toast.error("Failed to save initial screening", {
          description: getBackendErrorMessage(error),
        });
      });
  }, [
    selectedStudent,
    studentId,
    height,
    weight,
    bloodGroup,
    allergy,
    chronicDisease,
    immunization,
    clinicalSigns,
    physicalExamination,
    femaleScreening,
    notes,
    selectedCampId,
    bloodGroupOption,
    allergies,
    chronicDiseasesOption,
    consciousnessOptions,
    nutritionOptions,
    appearanceOptions,
    skinOptions,
    heightStandardResult?.standard,
    weightStandardResult?.standard,
    category?.label,
    getSelectedStudentScreeningData,
    isFemale,
    dispatch,
    queryClient,
    resetFormToDefaults,
    formatBloodGroup,
  ]);

  /* ============================================================
     Save wrapper
  ============================================================ */

  const handleSaveScreening = useCallback(() => {
    handleSaveAssessment();
  }, [handleSaveAssessment]);

  /* ============================================================
     Cancel
  ============================================================ */

  const handleCancelAssessment = useCallback(() => {
    if (getSelectedStudentScreeningData) {
      applyScreeningRecordToForm(getSelectedStudentScreeningData);
    } else {
      resetFormToDefaults();
    }
  }, [
    getSelectedStudentScreeningData,
    applyScreeningRecordToForm,
    resetFormToDefaults,
  ]);

  /* ============================================================
     Filter handlers
  ============================================================ */

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
    const nextStudentId = value === "all" ? "" : String(value).trim();

    setStudentFilter(value);
    setStudentId(nextStudentId);
  }, []);

  /* ============================================================
     Class options
  ============================================================ */

  const classOptions = useMemo(() => {
    if (studentsArray.length === 0) {
      return ["all"];
    }

    const classSet = new Set();

    studentsArray.forEach((student) => {
      const cls = String(
        student?.Class ?? student?.class ?? student?.grade ?? "",
      )
        .split("-")[0]
        .trim();

      if (cls) {
        classSet.add(cls);
      }
    });

    return [
      "all",
      ...Array.from(classSet).sort((a, b) =>
        a.localeCompare(b, undefined, {
          numeric: true,
        }),
      ),
    ];
  }, [studentsArray]);

  /* ============================================================
     Section options
  ============================================================ */

  const sectionOptions = useMemo(() => {
    if (studentsArray.length === 0) {
      return ["all"];
    }

    const sectionSet = new Set();

    studentsArray.forEach((student) => {
      const cls = String(
        student?.Class ?? student?.class ?? student?.grade ?? "",
      )
        .split("-")[0]
        .trim();

      if (selectedClassFilter !== "all" && cls !== selectedClassFilter) {
        return;
      }

      const sec = String(student?.sec ?? student?.section ?? "").trim();

      if (sec) {
        sectionSet.add(sec);
      }
    });

    return [
      "all",
      ...Array.from(sectionSet).sort((a, b) =>
        a.localeCompare(b, undefined, {
          numeric: true,
        }),
      ),
    ];
  }, [studentsArray, selectedClassFilter]);

  /* ============================================================
     Assessment student options
  ============================================================ */

  const assessmentStudentOptions = useMemo(() => {
    return studentsArray.map((student) => {
      const value = getStudentKey(student);

      const studentCode =
        student.studentId ??
        student.student_id ??
        student.school_registration_number ??
        student.admission_number;

      return {
        value,
        label: `${student.name || student.student_name || "Unknown"}${
          studentCode ? ` (${studentCode})` : ""
        }`,
      };
    });
  }, [studentsArray]);

  /* ============================================================
     Toggle options
  ============================================================ */

  const bloodGroupToggleOptions = useMemo(
    () =>
      (bloodGroupOption.length
        ? bloodGroupOption
        : bloodGroupOptions.map((g) => ({
            id: undefined,
            name: g,
          }))
      ).map((g) => ({
        value: g.name ?? g,
        label: g.name ?? g,
        tone: "neutral",
      })),
    [bloodGroupOption, bloodGroupOptions],
  );

  const nutritionToggleOptions = useMemo(
    () =>
      (nutritionOptions.length
        ? nutritionOptions
        : ["Normal", "Underweight", "Overweight"].map((name) => ({
            id: undefined,
            name,
          }))
      ).map((item) => {
        const name = item.name ?? item;

        return {
          value: name,
          label: name,
          tone:
            name === "Normal"
              ? "good"
              : name === "Underweight"
                ? "warn"
                : name === "Overweight"
                  ? "bad"
                  : "neutral",
        };
      }),
    [nutritionOptions],
  );

  const consciousnessToggleOptions = useMemo(
    () =>
      (consciousnessOptions.length
        ? consciousnessOptions
        : ["Alert", "Drowsy", "Unresponsive"].map((name) => ({
            id: undefined,
            name,
          }))
      ).map((item) => {
        const name = item.name ?? item;

        return {
          value: name,
          label: name,
          tone:
            name === "Alert"
              ? "good"
              : name === "Drowsy"
                ? "warn"
                : name === "Unresponsive"
                  ? "bad"
                  : "neutral",
        };
      }),
    [consciousnessOptions],
  );

  const generalAppearanceToggleOptions = useMemo(
    () =>
      (appearanceOptions.length
        ? appearanceOptions
        : ["Normal", "Needs Attention", "NA"].map((name) => ({
            id: undefined,
            name,
          }))
      ).map((item) => {
        const name = item.name ?? item;

        return {
          value: name,
          label: name,
          tone:
            name === "Normal"
              ? "good"
              : name === "Needs Attention"
                ? "warn"
                : "neutral",
        };
      }),
    [appearanceOptions],
  );

  const skinAssessmentToggleOptions = useMemo(
    () =>
      (skinOptions.length
        ? skinOptions
        : ["Normal", "Abnormal", "Rashes", "Infection", "NA"].map((name) => ({
            id: undefined,
            name,
          }))
      ).map((item) => {
        const name = item.name ?? item;

        return {
          value: name,
          label: name,
          tone:
            name === "Normal"
              ? "good"
              : name === "Abnormal" || name === "Rashes" || name === "Infection"
                ? "warn"
                : "neutral",
        };
      }),
    [skinOptions],
  );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section className="space-y-4">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 py-3">
            <div className="flex size-12 aspect-square items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cross className="size-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                General Screening
              </h1>

              <p className="text-sm text-muted-foreground">
                General health screening and assessment
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelAssessment}
          >
            Save & Exit
          </Button>

          {formErrors && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/60 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              Please fix the highlighted fields before saving
              {formErrors.error && `: ${formErrors.error}`}
            </div>
          )}

          <Button
            type="button"
            onClick={handleSaveAssessment}
            disabled={
              isSaving ||
              Boolean(
                selectedStudentKey && savedStudentKey === selectedStudentKey,
              )
            }
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            {isSaving
              ? "Saving..."
              : savedStudentKey && savedStudentKey === selectedStudentKey
                ? "Saved ✓"
                : "Save assessment"}
          </Button>
        </div>
      </div>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <div className="space-y-4">
        <StudentFilter
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

        {hasSelectedStudent ? (
          <>
            <StudentProfileCard student={selectedStudent} />

            <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] xl:items-start">
              {/* ==================================================
                  LEFT
              ================================================== */}

              <div className="relative md:relative lg:sticky top-0 lg:top-36 z-10 self-start">
                <FramerCard>
                  <AssessmentCard
                    onChange={handleAssessmentChange}
                    form={assessmentForm}
                    data={getSelectedStudentScreeningData}
                    studentOptions={assessmentStudentOptions}
                    studentValue={studentSelectValue}
                    isScreeningLoading={studentsLoading}
                    isScreeningError={studentsError}
                    isScreening={true}
                    schoolName={schoolName}
                    onStudentChange={handleAssessmentStudentChange}
                    onSave={handleSaveAssessment}
                    onCancel={handleCancelAssessment}
                    authUser={authUser}
                  />
                </FramerCard>
              </div>

              {/* ==================================================
                  RIGHT
              ================================================== */}

              <div className="min-w-0">
                <ScreeningStepper
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  isFemale={isFemale}
                  onSave={handleSaveScreening}
                >
                  {/* ==================================================
                      GROWTH + VITALS
                  ================================================== */}

                  <GrowthVitals
                    height={height}
                    handleHeightChange={handleHeightChange}
                    pulse={pulse}
                    setPulse={setPulse}
                    spo2={spo2}
                    setSpo2={setSpo2}
                    bloodPressure={bloodPressure}
                    setBloodPressure={setBloodPressure}
                    weight={weight}
                    handleWeightChange={handleWeightChange}
                    bmi={bmi}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    heightStandardResult={heightStandardResult}
                    weightStandardResult={weightStandardResult}
                    pulseStandardResult={pulseStandardResult}
                    spo2StandardResult={spo2StandardResult}
                    bloodPressureStandardResult={bloodPressureStandardResult}
                    temperatureStandardResult={temperatureStandardResult}
                    category={category}
                    bmiCategories={bmiCategories}
                    displayBmi={displayBmi}
                  />

                  {/* ==================================================
                      CLINICAL SIGNS
                  ================================================== */}

                  <ClinicalSignsCard
                    data={clinicalSigns}
                    onChange={handleClinicalSignChange}
                    skinAssessmentToggleOptions={skinAssessmentToggleOptions}
                  />

                  {/* ==================================================
                      PHYSICAL EXAMINATION
                  ================================================== */}

                  <GeneralPhysicalExamination
                    data={physicalExamination}
                    setData={setPhysicalExamination}
                    onChange={handlePhysicalExaminationChange}
                    nutritionToggleOptions={nutritionToggleOptions}
                    consciousnessToggleOptions={consciousnessToggleOptions}
                    generalAppearanceToggleOptions={
                      generalAppearanceToggleOptions
                    }
                  />

                  {/* ==================================================
                      FEMALE
                  ================================================== */}

                  {isFemale && (
                    <FemaleStudentsCard
                      data={femaleScreening}
                      onChange={handleFemaleScreeningChange}
                    />
                  )}

                  {/* ==================================================
                      BLOOD GROUP / HEALTH HISTORY
                  ================================================== */}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <BloodGroup
                      bloodGroup={bloodGroup}
                      handleBloodGroupChange={handleBloodGroupChange}
                      formErrors={formErrors}
                      bloodGroupToggleOptions={bloodGroupToggleOptions}
                      immunizationOptions={immunizationOptions}
                      immunization={immunization}
                      setImmunization={setImmunization}
                    />

                    <div className="space-y-4">
                      <HealthHistory
                        allergy={allergy}
                        chronicDisease={chronicDisease}
                        handleAllergyChange={handleAllergyChange}
                        handleChronicDiseaseChange={handleChronicDiseaseChange}
                        formErrors={formErrors}
                        allergies={allergies}
                        chronicDiseasesOption={chronicDiseasesOption}
                      />

                      {/* ==================================================
                          NOTES
                      ================================================== */}

                      <article className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
                            <INoteActionIcon className="size-4 text-info" />
                          </div>

                          <h3 className="text-sm font-semibold text-foreground">
                            Notes
                          </h3>
                        </div>

                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          placeholder="Enter notes"
                          className="mt-3 w-full resize-none rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                        />
                      </article>
                    </div>
                  </div>

                  {/* ==================================================
                      REVIEW
                  ================================================== */}

                  <FramerCard>
                    <div className="space-y-4">
                      <article className="rounded-xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold text-foreground">
                          Review & Submit
                        </h3>

                        <p className="mt-2 text-sm text-muted-foreground">
                          Please review all the information before saving the
                          screening.
                        </p>

                        <div className="mt-4 space-y-2">
                          <SummaryRow
                            icon={Ruler}
                            label="Height"
                            value={`${height || "—"} cm`}
                            tone="info"
                          />

                          <SummaryRow
                            icon={Weight}
                            label="Weight"
                            value={`${weight || "—"} kg`}
                            tone="success"
                          />

                          <SummaryRow
                            icon={Activity}
                            label="BMI"
                            value={bmi ? bmi.toFixed(1) : "—"}
                            tone={category.tone}
                          />

                          <SummaryRow
                            icon={Heart}
                            label="Pulse"
                            value={pulse || "—"}
                            tone="info"
                          />

                          <SummaryRow
                            icon={Thermometer}
                            label="Temperature"
                            value={temperature ? `${temperature}°C` : "—"}
                            tone="info"
                          />

                          <SummaryRow
                            icon={Droplet}
                            label="Blood Pressure"
                            value={bloodPressure || "—"}
                            tone="info"
                          />

                          <SummaryRow
                            icon={Wind}
                            label="SpO2"
                            value={spo2 ? `${spo2}%` : "—"}
                            tone="info"
                          />
                        </div>
                      </article>
                    </div>
                  </FramerCard>
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
      </div>
    </section>
  );
}
