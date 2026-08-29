"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ChevronDown,
  Cross,
  HeartPulse,
  Save,
  Scale,
  Search,
  Stethoscope,
  Syringe,
  Wind,
} from "lucide-react";
import HeightIcon from "@iconify-react/healthicons/height";
import HealthDataSecurityOutlineIcon from "@iconify-react/healthicons/health-data-security-outline";
import WeightIcon from "@iconify-react/healthicons/weight";
import INoteActionIcon from "@iconify-react/healthicons/i-note-action";
import { ToggleGroup } from "./toggleGroup";
import BloodDropOutlineIcon from "@iconify-react/healthicons/blood-drop-outline";
import BloodPressureMonitorIcon from "@iconify-react/healthicons/blood-pressure-monitor";
import PulseOximeterOutlineIcon from "@iconify-react/healthicons/pulse-oximeter-outline";
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
} from "./general-screening-data";
import { BmiGauge } from "./bmiCategory";
import { BmiSvgGauge } from "./BmiSvgGauge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getCamp } from "@/lib/features/getCampSlice";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import { getInitialScreening } from "@/lib/features/getInitialScreening";
import { getAssignEvent } from "@/lib/features/getEventAssignSlice";

import {
  createInitialScreening,
  updateInitialScreening,
} from "@/lib/features/registerGeneralScreening";
import AssessmentCard from "@/app/ui/AssessmentCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import CampStudentSelectorDrawer from "@/components/health-checks/camp-student-selector-drawer";
import useStudentData from "@/components/health-checks/getStudentData";
import StudentProfileCard from "@/app/students/studentProfileCard";
import StudentFilter from "../utilities/studentFilter";
import { FramerCard } from "@/util/FramerCard";
import { getAllMasterScreening } from "@/lib/features/masterScreeningSlice";
import { getMasterData } from "@/util/masterData";
import { generalScreeningSchema } from "./general-screening-schema";
import ClinicalSignsCard from "./ClinicalSignCard";
import GeneralPhysicalExamination from "./GeneralPhysicalExamination";
import FemaleStudentsCard from "./FemaleStudentsCard";
import EditableVitalCard from "./EditableVitalCard";
import { Textarea } from "@/components/ui/textarea";
import { selectAuthUser } from "@/lib/features/auth-slice";

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
          className={`h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 ${error ? "border-destructive focus:ring-destructive/30" : ""}`}
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
          className={`h-10 w-full rounded-md border border-input bg-background pl-3 pr-12 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 ${error ? "border-destructive focus:ring-destructive/30" : ""}`}
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

function getAgeInYearsFromDob(dobValue) {
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

// Parses "120/80" (or "120/80 mmHg") into { systolic, diastolic } or null.
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

  return { systolic, diastolic };
}

// Age-based health-standard evaluation for vitals — same shape as
// evaluateGrowthStandard so the result feeds straight into StandardStatus.
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

  // Blood pressure compares systolic AND diastolic independently.
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

  const min = metric === "pulse" ? band.pulseMin : band.spo2Min;
  const max = metric === "pulse" ? band.pulseMax : band.spo2Max;

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

export default function GeneralScreeningPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const {
    studentData = [],
    loading: studentsLoading,
    error: studentsError,
  } = useAppSelector((state) => state.getInitialScreening);

  const {
    data: masterScreeningData = {},
    isLoading: masterScreeningDataLoading,
    error: masterScreeningQueryError,
  } = useQuery({
    queryKey: ["master-screening"],

    queryFn: () => dispatch(getAllMasterScreening()).unwrap(),

    // Master data doesn't normally need to be
    // requested again immediately.
    staleTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,
  });

  console.log(masterScreeningData, "All Master Screening Data");

  // ---------------------------------------------------------
  // Required master data for THIS module
  // ---------------------------------------------------------

  const requiredMasterData = useMemo(
    () =>
      getMasterData(masterScreeningData, [
        "allergies",
        "blood-groups",
        "bmi-categories",
        "chronic-diseases",
        "color-vision-statuses",
        "dental-conditions",
        "dental-treatments",
        "ear-examinations",
        "hearing-classifications",
        "hearing-referral-reasons",
        "height-weight-standards",
        "immunizations",
        "oral-hygiene-statuses",
        "plaque-scores",
        "vision-referral-reasons",
        "vision-results",
        "vital-signs",
      ]),
    [masterScreeningData],
  );
  console.log(requiredMasterData, "requiredMasterData");

  const allergies = requiredMasterData.allergies ?? [];

  const chronicDiseasesOption = requiredMasterData["chronic-diseases"] ?? [];

  const bloodGroupOption = requiredMasterData["blood-groups"] ?? [];
  const bmiCategories = requiredMasterData["bmi-categories"] ?? [];

  const authUser = useAppSelector(selectAuthUser);

  const academicYearOptions = ["2026-2027", "2025-2026", "2024-2025"];
  const [isCaDrawerOpen, setIsCaDrawerOpen] = useState(false);
  const [selectedCampId, setSelectedCampId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [academicYear, setAcademicYear] = useState(academicYearOptions[0]);
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("all");
  const [assessmentDate, setAssessmentDate] = useState("2026-08-05");
  const [location, setLocation] = useState(locationOptions[0]);
  const [examiner, setExaminer] = useState(examinerOptions[0]);
  const [assistant, setAssistant] = useState(assistantOptions[0]);

  const [height, setHeight] = useState("0");
  const [weight, setWeight] = useState("0");
  const [pulse, setPulse] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [spo2, setSpo2] = useState("");

  const [bloodGroup, setBloodGroup] = useState(
    bloodGroupOption?.[0]?.name ?? "",
  );
  const [allergy, setAllergy] = useState("None");
  const [chronicDisease, setChronicDisease] = useState("None");
  const [immunization, setImmunization] = useState("up_to_date");
  const [notes, setNotes] = useState("");

  // ============================================================
  // CLINICAL SIGNS
  // ============================================================

  const [clinicalSigns, setClinicalSigns] = useState({
    pallor: 0,
    clubbing: 0,
    edema: 0,
    skinAssessment: "Normal",
    medicalCondition: "",
    currentComplaints: "",
    regularMedication: "",
  });

  // ============================================================
  // GENERAL PHYSICAL EXAMINATION
  // ============================================================

  const [physicalExamination, setPhysicalExamination] = useState({
    generalAppearance: "Normal",
    postureSpine: "Normal",
    nutritionalStatus: "Normal",
    consciousness: "Alert",
    cvs: "Normal S1 S2",
    respiratorySystem: "Bilateral clear",
    abdomen: "Soft, non-tender",
    neurology: "NAD",
    referral: "",
  });
  const [femaleScreening, setFemaleScreening] = useState({
    menstrualCycle: "Regular",
    excessiveBleeding: 0,
    menstrualPain: 0,
    otherConcerns: "",
    referral: "",
  });
  // { fieldName: "message" } — populated when zod validation fails.
  const [formErrors, setFormErrors] = useState(null);

  const clearFormError = (field) =>
    setFormErrors((prev) =>
      prev && prev[field] ? { ...prev, [field]: undefined } : prev,
    );

  // Wrapped setters so a field's error clears the moment the user edits it.
  const handleHeightChange = (value) => {
    setHeight(value);
    clearFormError("height");
  };
  const handleWeightChange = (value) => {
    setWeight(value);
    clearFormError("weight");
  };
  const handleBloodGroupChange = (value) => {
    setBloodGroup(value);
    clearFormError("bloodGroup");
  };
  const handleAllergyChange = (value) => {
    setAllergy(value);
    clearFormError("allergy");
  };
  const handleChronicDiseaseChange = (value) => {
    setChronicDisease(value);
    clearFormError("chronicDisease");
  };

  const [schoolName, setSchoolName] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");

  const { data: filterPayload, isLoading } = useQuery({
    queryKey: ["filter-student", schoolName, academicYear, "options"],
    queryFn: () =>
      dispatch(
        getFilterStudent({
          all: true,
          status: "all",
          schoolName,
          academicYear,
          sortBy: "name",
          sortOrder: "asc",
          search: "",
        }),
      ).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

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

  const {
    data: assignedEvents,
    isLoading: assignEventLoading,
    error: assignEventError,
  } = useQuery({
    // Key includes the user id: when the session hydrates (or the
    // signed-in user changes) the query refetches with the right id.
    queryKey: ["get-event", authUser?.id ?? authUser?.Id ?? null],
    queryFn: () => {
      const userId = authUser?.id ?? authUser?.Id;
      if (!userId) {
        throw new Error("Signed-in user not available yet");
      }
      return dispatch(getAssignEvent({ id: userId })).unwrap();
    },
    // Don't fire before the auth user is in the store — otherwise
    // `authUser.id` throws and the query dies in the error state.
    enabled: Boolean(authUser?.id ?? authUser?.Id),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  console.log(assignedEvents, "assignedEvents");

  //-------------------------------------------

  const applyScreeningRecordToForm = (screeningRecord) => {
    const getMetricValue = (value) => {
      const normalizedValue = String(value ?? "").trim();
      return normalizedValue || "0";
    };

    setHeight(getMetricValue(screeningRecord?.height));
    setWeight(getMetricValue(screeningRecord?.weight));
    setPulse(getMetricValue(screeningRecord?.pulse) || "");
    setBloodPressure(
      String(screeningRecord?.blood_pressure ?? "").trim() || "",
    );
    setSpo2(getMetricValue(screeningRecord?.spo2) || "");
    setNotes(
      String(
        screeningRecord?.notes ??
          screeningRecord?.remark ??
          screeningRecord?.remarks ??
          "",
      ),
    );
    setAllergy(
      screeningRecord?.allergy?.name ??
        screeningRecord?.allergy_name ??
        allergies[0]?.name ??
        "",
    );
    setChronicDisease(
      screeningRecord?.chronic_disease?.name ??
        screeningRecord?.chronic_disease_name ??
        chronicDiseasesOption[0]?.name ??
        "",
    );
    setBloodGroup(
      screeningRecord?.blood_group?.name ??
        screeningRecord?.blood_group_name ??
        screeningRecord?.bloodGroup ??
        bloodGroupOption[0]?.name ??
        "",
    );
  };

  const selectedStudentFromFilter = useMemo(() => {
    const activeId = studentFilter !== "all" ? studentFilter : studentId;
    if (activeId && Array.isArray(filterPayload?.items)) {
      return (
        filterPayload.items.find(
          (student) =>
            String(student?.id ?? student?.studentId ?? student?.cus_id) ===
            String(activeId),
        ) ?? null
      );
    }
    return null;
  }, [filterPayload?.items, studentFilter, studentId]);

  const selectedStudent = useMemo(() => {
    if (selectedStudentFromFilter) {
      return selectedStudentFromFilter;
    }

    if (studentId && Array.isArray(filterPayload?.items)) {
      const match = filterPayload.items.find(
        (student) =>
          String(student.id ?? student.studentId ?? student.cus_id) ===
          String(studentId),
      );
      if (match) return match;
    }

    return null;
  }, [filterPayload?.items, selectedStudentFromFilter, studentId]);

  const classOptions = useMemo(() => {
    if (!Array.isArray(filterPayload?.items)) return ["all"];
    const classSet = new Set();
    filterPayload.items.forEach((student) => {
      const cls = String(
        student?.Class ?? student?.class ?? student?.grade ?? "",
      )
        .split("-")[0]
        .trim();
      if (cls) classSet.add(cls);
    });
    return [
      "all",
      ...Array.from(classSet).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    ];
  }, [filterPayload?.items]);

  const sectionOptions = useMemo(() => {
    if (!Array.isArray(filterPayload?.items)) return ["all"];
    const sectionSet = new Set();
    filterPayload.items.forEach((student) => {
      const cls = String(
        student?.Class ?? student?.class ?? student?.grade ?? "",
      )
        .split("-")[0]
        .trim();
      if (selectedClassFilter !== "all" && cls !== selectedClassFilter) return;
      const sec = String(student?.sec ?? student?.section ?? "").trim();
      if (sec) sectionSet.add(sec);
    });
    return [
      "all",
      ...Array.from(sectionSet).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    ];
  }, [filterPayload?.items, selectedClassFilter]);

  const selectedStudentKey = String(
    selectedStudent?.id ??
      selectedStudent?.studentId ??
      selectedStudent?.cus_id ??
      "",
  );
  const studentSelectValue = selectedStudentKey;
  const hasSelectedStudent = Boolean(
    selectedStudent ||
    selectedStudentKey ||
    (studentFilter && studentFilter !== "all") ||
    studentId,
  );

  const assessmentStudentOptions = useMemo(
    () =>
      (filterPayload?.items ?? []).map((student) => {
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
    [filterPayload?.items],
  );
  const selectedStudentKeys = useMemo(() => {
    if (selectedStudent) {
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
    }

    return new Set(
      [studentSelectValue, studentId, studentFilter]
        .map((value) => String(value ?? "").trim())
        .filter((val) => val && val !== "all"),
    );
  }, [selectedStudent, studentFilter, studentId, studentSelectValue]);

  const students = useMemo(
    () => (Array.isArray(studentData) ? studentData : []),
    [studentData],
  );

  const getSelectedStudentScreeningData = useMemo(() => {
    if (!selectedStudentKeys.size || !students.length) {
      return null;
    }

    return (
      students.find((data) => {
        const dataKeys = [
          data?.id,
          data?.studentId,
          data?.student_id,
          data?.school_registration_number,
          data?.admission_number,
        ]
          .map((value) => String(value ?? "").trim())
          .filter(Boolean);

        return dataKeys.some((key) => selectedStudentKeys.has(key));
      }) ?? null
    );
  }, [selectedStudentKeys, students]);
  console.log(
    getSelectedStudentScreeningData,
    "getSelectedStudentScreeningData",
  );

  useEffect(() => {
    if (getSelectedStudentScreeningData) {
      applyScreeningRecordToForm(getSelectedStudentScreeningData);
      return;
    }

    setHeight("0");
    setWeight("0");
  }, [getSelectedStudentScreeningData]);

  const studentDob = useMemo(
    () =>
      selectedStudent?.dob ??
      selectedStudent?.date_of_birth ??
      selectedStudent?.dateOfBirth ??
      getSelectedStudentScreeningData?.dob ??
      getSelectedStudentScreeningData?.date_of_birth ??
      getSelectedStudentScreeningData?.dateOfBirth ??
      "",
    [getSelectedStudentScreeningData, selectedStudent],
  );

  const studentAgeYears = useMemo(
    () => getAgeInYearsFromDob(studentDob),
    [studentDob],
  );

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
    [studentAgeYears, weight],
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

  const bmi = useMemo(() => calcBmi(height, weight), [height, weight]);

  // Single source of truth for every BMI readout on the screen (category
  // pill, gauge, details grid, assessment payload): the live height/weight
  // calculation wins while it produces a valid value, otherwise we show the
  // student's saved screening record. Mirrors the `live || saved` order the
  // rest of this page uses.
  const selectedScreeningRecord = getSelectedStudentScreeningData;

  const displayBmi = useMemo(() => {
    if (bmi != null) return bmi;
    const saved = parseMetricValue(selectedScreeningRecord?.bmi);
    return saved > 0 ? saved : null;
  }, [bmi, selectedScreeningRecord]);

  // const displayHeightCm = useMemo(() => {
  //   const live = parseMetricValue(height);
  //   if (live > 0) return live;
  //   const saved = parseMetricValue(selectedScreeningRecord?.height);
  //   return saved > 0 ? saved : null;
  // }, [height, selectedScreeningRecord]);

  // const displayWeightKg = useMemo(() => {
  //   const live = parseMetricValue(weight);
  //   if (live > 0) return live;
  //   const saved = parseMetricValue(selectedScreeningRecord?.weight);
  //   return saved > 0 ? saved : null;
  // }, [weight, selectedScreeningRecord]);

  const category = useMemo(() => bmiCategory(displayBmi), [displayBmi]);
  const assessmentForm = useMemo(
    () => ({
      height,
      weight,
      bmi: displayBmi ? displayBmi.toFixed(1) : "",
      bloodPressure,
      pulse,
      spo2,
      bloodGroup,
    }),
    [bmi, displayBmi, height, pulse,bloodPressure, spo2, weight, bloodGroup,],
  );

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

  const handleAssessmentChange = useCallback((field, value) => {
    if (field === "height") {
      setHeight(value);
      return;
    }

    if (field === "weight") {
      setWeight(value);
      return;
    }

    if (field === "bmi") {
      setNotes(value);
    }
    if (field === "bloodGroup") {
      setBloodGroup(value);
    }
  }, []);

  const formatBloodGroup = (bloodGroup) => {
    if (!bloodGroup) return "--";

    return bloodGroup.replace(/\s*Positive/i, "+").replace(/\s*Negative/i, "-");
  };

  const handleSaveAssessment = useCallback(() => {
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

    // --- Validate editable fields with zod -------------------------
    const formValues = {
      height,
      weight,
      bloodGroup,
      allergy,
      chronicDisease,
      immunization,
      notes,
      clinicalSigns,
      physicalExamination,
      femaleScreening,
    };

    const result = generalScreeningSchema.safeParse(formValues);

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
      toast.error("Select a student before saving the General screening");
      return;
    }

    const numericStudentId = Number(rawStudentId) || 0;
    const numericCampId =
      Number(selectedCampId) || Number(selectedStudent?.camp_id) || 1;
    console.log(bloodGroupOption, bloodGroup, "bloodGroupOption");

    const bloodGroupEntry = bloodGroupOption.find(
      (item) =>
        formatBloodGroup(item.name).trim() ===
        formatBloodGroup(bloodGroup).trim(),
    );

    const bloodGroupId = bloodGroupEntry?.id ?? 0;

    const allergyEntry = allergies.find((item) => item.name === allergy);
    console.log(allergyEntry, "allergyEntry");

    const allergyId = allergyEntry?.id ?? null;

    const chronicDiseaseEntry = chronicDiseasesOption.find(
      (item) => item.name === chronicDisease,
    );
    const chronicDiseaseId = chronicDiseaseEntry?.id ?? null;

    const immunizationMap = { up_to_date: 1, partial: 2, overdue: 3 };
    const immunizationId = immunizationMap[immunization] || 1;

    const standardMap = { "Below Average": 1, Average: 2, "Above Average": 3 };
    const heightStandardId = standardMap[heightStandardResult?.standard] || 2;
    const weightStandardId = standardMap[weightStandardResult?.standard] || 2;
    const pulseStandardId = pulse
      ? standardMap[pulseStandardResult?.standard] || 2
      : null;
    const bloodPressureStandardId = bloodPressure
      ? standardMap[bloodPressureStandardResult?.standard] || 2
      : null;
    const spo2StandardId = spo2
      ? standardMap[spo2StandardResult?.standard] || 2
      : null;

    const numHeight = Number(height) || 0;
    const numWeight = Number(weight) || 0;
    const bmiCategoryMap = {
      Underweight: 1,
      Normal: 2,
      Overweight: 3,
      Obese: 4,
      severeObesse: 5,
    };
    const bmiCategoryId = bmiCategoryMap[category?.label] || 2;

    const payload = {
      student_id: numericStudentId,
      camp_id: numericCampId,
      blood_group_id: bloodGroupId,
      allergy_id: allergyId === 0 ? null : allergyId,
      chronic_disease_id: chronicDiseaseId === 0 ? null : chronicDiseaseId,
      immunization_id: immunizationId,
      height: numHeight,
      weight: numWeight,
      pulse: pulse ? Number(pulse) : null,
      blood_pressure: bloodPressure || null,
      spo2: spo2 ? Number(spo2) : null,
      height_standard_id: heightStandardId,
      weight_standard_id: weightStandardId,
      pulse_standard_id: pulseStandardId,
      blood_pressure_standard_id: bloodPressureStandardId,
      spo2_standard_id: spo2StandardId,
      bmi_category_id: bmiCategoryId,
      pallor: clinicalSigns.pallor,
      clubbing: clinicalSigns.clubbing,
      edema: clinicalSigns.edema,
      skin: clinicalSigns.skin,
    };
    const existingRecordId =
      getSelectedStudentScreeningData?.id ??
      getSelectedStudentScreeningData?.screening_id ??
      getSelectedStudentScreeningData?.screeningId;

    // Update only when this student's screening already has saved
    // measurements (height/weight); otherwise create a fresh record.
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
    // const saveAction = existingRecordId
    //   ? updateInitialScreening({ id: existingRecordId, payload })
    //   : createInitialScreening(payload);

    const saveAction = hasSavedMeasurements
      ? updateInitialScreening({
          id: existingRecordId,
          studentId: numericStudentId,
          payload,
        })
      : createInitialScreening(payload);

    dispatch(saveAction)
      .unwrap()
      .then(() => {
        // Refresh the react-query cache after a successful save. The
        // ["initial-screening"] query's queryFn re-dispatches
        // getInitialScreening, which keeps the Redux store in sync —
        // so no manual dispatch is needed here.
        queryClient.invalidateQueries({ queryKey: ["initial-screening"] });

        toast.success(
          hasSavedMeasurements
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
        console.error("Unable to save general screening:", error);

        toast.error("Failed to save initial screening", {
          description:
            error?.message ?? "Something went wrong. Please try again.",
        });
      });
  }, [
    allergy,
    bloodGroup,
    bloodPressureStandardResult?.standard,
    category?.label,
    chronicDisease,
    getSelectedStudentScreeningData,
    height,
    heightStandardResult?.standard,
    immunization,
    notes,
    pulseStandardResult?.standard,
    queryClient,
    selectedCampId,
    selectedStudent,
    spo2StandardResult?.standard,
    studentId,
    weight,
    weightStandardResult?.standard,
  ]);

  const handleCancelAssessment = useCallback(() => {
    applyScreeningRecordToForm(getSelectedStudentScreeningData);
  }, [getSelectedStudentScreeningData]);

  // Keep studentFilter in sync: selectedStudentFromFilter gives
  // studentFilter precedence over studentId, so without this the
  // assessment-card selection would be ignored once a student has
  // been picked in the filter dropdown.
  const handleAssessmentStudentChange = useCallback((value) => {
    setStudentId(value);
    setStudentFilter(value);
  }, []);

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
    setStudentFilter(value);
    setStudentId(value === "all" ? "" : value);
  }, []);

  const bloodGroupToggleOptions = useMemo(
    () =>
      (bloodGroupOption.length
        ? bloodGroupOption
        : bloodGroupOptions.map((g) => ({ id: undefined, name: g }))
      ).map((g) => ({
        value: g.name ?? g,
        label: g.name ?? g,
        tone: "neutral",
      })),
    [bloodGroupOption, bloodGroupOptions],
  );

  return (
    <section className="space-y-4 ">
      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 py-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary aspect-square">
              <Cross className="size-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                General Screening
              </h1>

              <p className="text-sm text-muted-foreground">
                General health screening and assessment
              </p>

              {/* <p className="text-xs text-muted-foreground">
                  {studentsLoading
                    ? "Loading students..."
                    : studentsError
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
            studentsLoading={studentsLoading}
            studentsError={studentsError}
            campsLoading={getData.campsLoading}
            campsQueryError={getData.campsQueryError}
            studentCampLoading={getData.studentCampLoading}
            studentCampQueryError={getData.studentCampQueryError}
            selectedCampId={selectedCampId}
            onCampChange={(value) => {
              setSelectedCampId(value);
              setAcademicYear("");
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
                (student) => String(student.id ?? student.studentId) === String(value),
              );

              if (selectedFromList) {
                const selectedKeys = getStudentKeys(selectedFromList);
                const screeningRecord = findScreeningRecordByKeys(selectedKeys);
                applyScreeningRecordToForm(screeningRecord);
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
              <AlertCircle className="size-4 shrink-0" />
              Please fix the highlighted fields before saving.
            </div>
          )}

          <Button type="button" onClick={handleSaveAssessment}>
            <Save className="size-4" />
            Save & Next
          </Button>
        </div>
      </div>
      <>
        <StudentFilter
          // filterPayload={filterPayload}
          isLoading={isLoading}
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
        />
        {hasSelectedStudent ? (
          <>
            <StudentProfileCard student={selectedStudent} />
            <div className="grid gap-4 grid-cols-1 xl:grid-cols-[300px_1fr_320px] ">
              {/* ---------------- Left column ---------------- */}
              {/* <div className="space-y-4">
          <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Assessment Details</h3>

            <div className="mt-4 space-y-3">
              <SelectField
                label="Student"
                options={studentOptions.map((s) => s.name)}
                value={studentOptions.find((s) => s.id === studentId)?.name}
                onChange={(name) => setStudentId(studentOptions.find((s) => s.name === name)?.id)}
              />

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

              <SelectField label="Location" options={locationOptions} value={location} onChange={setLocation} />
              <SelectField label="Examiner" options={examinerOptions} value={examiner} onChange={setExaminer} />
              <SelectField label="Assistant" options={assistantOptions} value={assistant} onChange={setAssistant} />
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Growth Summary</h3>
            <div className="mt-3 space-y-2">
              <SummaryRow icon={Ruler} label="Height" value={`${height || "—"} cm`} tone="info" />
              <SummaryRow icon={Weight} label="Weight" value={`${weight || "—"} kg`} tone="success" />
              <SummaryRow icon={Activity} label="BMI" value={bmi ? bmi.toFixed(1) : "—"} tone={category.tone} />
              <SummaryRow icon={Droplet} label="Category" value={category.label} tone={category.tone} />
            </div>
          </article>

          <div className="flex gap-2">
            <button
              type="button"
              className="h-10 flex-1 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save Assessment
            </button>
            <button
              type="button"
              className="h-10 flex-1 rounded-md border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Save &amp; Next
            </button>
          </div>
        </div> */}
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
              {/* ---------------- Middle column: growth & vitals ---------------- */}
              <FramerCard>
                <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary aspect-square">
                          <Activity className="size-4" />
                        </span>

                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Growth & Vitals
                          </h3>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Physical measurements and growth assessment
                          </p>
                        </div>
                      </div>
                    </div>

                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                      Assessment
                    </span>
                  </div>

                  <div className="grid grid-cols-2  xl:grid-cols-5 gap-2 py-5">
                    <EditableVitalCard
                      label="Pulse"
                      value={pulse}
                      onChange={setPulse}
                      unit="bpm"
                      icon={Stethoscope}
                      iconClass="bg-domain-physical/10"
                      iconColor="text-domain-physical"
                      placeholder="0"
                    />
                    <EditableVitalCard
                      label="Blood Pressure"
                      value={bloodPressure}
                      onChange={setBloodPressure}
                      unit="mmHg"
                      icon={BloodPressureMonitorIcon}
                      iconClass="bg-destructive/10"
                      iconColor="text-destructive"
                      inputType="text"
                      placeholder="120/80"
                      displayValue={bloodPressure || "0/0"}
                    />
                    <EditableVitalCard
                      label="SpO₂"
                      value={spo2}
                      onChange={setSpo2}
                      unit="%"
                      icon={PulseOximeterOutlineIcon}
                      iconClass="bg-domain-vision/10"
                      iconColor="text-domain-vision"
                      placeholder="0"
                    />
                    <EditableVitalCard
                      label="Height"
                      value={height}
                      onChange={handleHeightChange}
                      unit="cm"
                      icon={HeightIcon}
                      iconClass="bg-info/10"
                      iconColor="text-info"
                      placeholder="0"
                    />
                    <EditableVitalCard
                      label="Weight"
                      value={weight}
                      onChange={handleWeightChange}
                      unit="kg"
                      icon={WeightIcon}
                      iconClass="bg-success/10"
                      iconColor="text-success"
                      placeholder="0"
                    />
                  </div>
                  {/* Vitals Standards — age-based range check, like Height/Weight */}
                  {/* <div className="grid gap-3 md:grid-cols-3">
                    <StandardStatus
                      label="Pulse Standard"
                      value={pulse || pulseStandardResult.standard}
                      status={pulseStandardResult.status}
                      tone={pulseStandardResult.tone}
                    />
                    <StandardStatus
                      label="Blood Pressure Standard"
                      value={bloodPressure || bloodPressureStandardResult.standard}
                      status={bloodPressureStandardResult.status}
                      tone={bloodPressureStandardResult.tone}
                    />
                    <StandardStatus
                      label="SpO₂ Standard"
                      value={spo2 || spo2StandardResult.standard}
                      status={spo2StandardResult.status}
                      tone={spo2StandardResult.tone}
                    />
                  </div> */}
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 py-5">
                    {/* LEFT SIDE - Height & Weight */}
                    <div className="grid gap-2 space-y-2">
                      {/* Height & Weight Cards */}
                      {/* <div className="grid gap-3 sm:grid-cols-2">
                        <EditableVitalCard
                          label="Height"
                          value={height}
                          onChange={handleHeightChange}
                          unit="cm"
                          icon={HeightIcon}
                          iconClass="bg-info/10"
                          iconColor="text-info"
                          placeholder="0"
                        />
                        <EditableVitalCard
                          label="Weight"
                          value={weight}
                          onChange={handleWeightChange}
                          unit="kg"
                          icon={WeightIcon}
                          iconClass="bg-success/10"
                          iconColor="text-success"
                          placeholder="0"
                        />
                      </div> */}

                      {/* Input Fields */}
                      {/* <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <NumberField
                          label="Height"
                          value={height}
                          onChange={handleHeightChange}
                          unit="cm"
                          error={formErrors?.height}
                        />

                        <NumberField
                          label="Weight"
                          value={weight}
                          onChange={handleWeightChange}
                          unit="kg"
                          error={formErrors?.weight}
                        />
                      </div> */}
                      {/* Standards */}
                      <div className=" grid gap-3 grid-cols-1 md:grid-cols-1">
                        <StandardStatus
                          label="Height Standard"
                          value={height || heightStandardResult.standard}
                          status={heightStandardResult.status}
                          tone={heightStandardResult.tone}
                        />

                        <StandardStatus
                          label="Weight Standard"
                          value={weight || weightStandardResult.standard}
                          status={weightStandardResult.status}
                          tone={weightStandardResult.tone}
                        />
                        <StandardStatus
                          label="Pulse Standard"
                          value={pulse || pulseStandardResult.standard}
                          status={pulseStandardResult.status}
                          tone={pulseStandardResult.tone}
                        />
                        <StandardStatus
                          label="Blood Pressure Standard"
                          value={
                            bloodPressure ||
                            bloodPressureStandardResult.standard
                          }
                          status={bloodPressureStandardResult.status}
                          tone={bloodPressureStandardResult.tone}
                        />
                        <StandardStatus
                          label="SpO₂ Standard"
                          value={spo2 || spo2StandardResult.standard}
                          status={spo2StandardResult.status}
                          tone={spo2StandardResult.tone}
                        />
                      </div>
                    </div>

                    {/* RIGHT SIDE - BMI */}
                    <FramerCard className="overflow-hidden rounded-2xl border border-border/70 bg-background">
                      {/* BMI Header */}
                      <div className="flex flex-row items-center justify-between border-b border-border/70 px-4 py-3 md:flex-row">
                        <div>
                          <h3 className="text-sm font-semibold">
                            Body Mass Index
                          </h3>

                          <p className="text-[11px] text-muted-foreground">
                            Calculated from height and weight
                          </p>
                        </div>

                        <div
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            category.tone === "success"
                              ? "bg-success/10 text-success"
                              : category.tone === "warning"
                                ? "bg-warning/10 text-warning"
                                : category.tone === "destructive"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {category.label}
                        </div>
                      </div>

                      {/* BMI Visualization */}
                      <div className="relative px-4 py-5">
                        <BmiGauge categories={bmiCategories} bmi={displayBmi} />
                      </div>
                    </FramerCard>
                  </div>

                  {/* Clinical interpretation */}
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <Activity className="size-4 text-success" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Growth assessment
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                        Height, weight and BMI are currently within the expected
                        range for this assessment.
                      </p>
                    </div>
                  </div>

                  {/* =========================================================
    CLINICAL SIGNS
========================================================= */}

                  <ClinicalSignsCard
                    data={clinicalSigns}
                    onChange={handleClinicalSignChange}
                  />

                  {selectedStudent?.gender?.toLowerCase() === "female" && (
                    <FemaleStudentsCard
                      data={femaleScreening}
                      onChange={handleFemaleScreeningChange}
                    />
                  )}

                  {/* =========================================================
    GENERAL PHYSICAL EXAMINATION
========================================================= */}

                  <GeneralPhysicalExamination
                    data={physicalExamination}
                    onChange={handlePhysicalExaminationChange}
                  />
                </article>
              </FramerCard>

              {/* ---------------- Right column: health profile ---------------- */}
              <div className="space-y-4">
                <FramerCard>
                  <article className="space-y-4 rounded-xl border border-border bg-card p-4">
                    <ToggleGroup
                      icon={BloodDropOutlineIcon}
                      label="Blood Group"
                      options={bloodGroupToggleOptions}
                      value={bloodGroup}
                      onChange={handleBloodGroupChange}
                      columns={8}
                      iconBg={"bg-destructive/10"}
                      textClass={"text-destructive"}
                    />
                    {formErrors?.bloodGroup && (
                      <p className="text-xs text-destructive">
                        {formErrors.bloodGroup}
                      </p>
                    )}
                    <ToggleGroup
                      icon={Syringe}
                      label="Immunization Status"
                      options={immunizationOptions}
                      value={immunization}
                      onChange={setImmunization}
                      columns={3}
                      iconBg={"bg-info/20"}
                      textClass={"text-info"}
                    />
                  </article>
                </FramerCard>
                <FramerCard>
                  <article className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
                        <HealthDataSecurityOutlineIcon className="size-4 text-info" />
                      </div>

                      <h3 className="text-sm font-semibold text-foreground">
                        Health History
                      </h3>
                    </div>
                    <div className="mt-3 space-y-3">
                      <SelectField
                        label="Allergy"
                        options={[
                          "None",
                          ...allergies.map((item) => item.name),
                        ]}
                        value={allergy}
                        onChange={handleAllergyChange}
                        error={formErrors?.allergy}
                      />
                      <SelectField
                        label="Chronic Disease"
                        options={[
                          "None",
                          ...chronicDiseasesOption.map((item) => item.name),
                        ]}
                        value={chronicDisease}
                        onChange={handleChronicDiseaseChange}
                        error={formErrors?.chronicDisease}
                      />
                    </div>
                  </article>
                </FramerCard>

                <FramerCard>
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
                </FramerCard>
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
      </>
    </section>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function StandardStatus({ label, value, status, tone = "success" }) {
  const dotClass =
    tone === "destructive"
      ? "bg-destructive"
      : tone === "warning"
        ? "bg-warning"
        : tone === "muted"
          ? "bg-muted-foreground"
          : "bg-success";

  const textClass =
    tone === "destructive"
      ? "text-destructive"
      : tone === "warning"
        ? "text-warning"
        : tone === "muted"
          ? "text-muted-foreground"
          : "text-success";

  return (
    <div className="flex flex-row items-center justify-between rounded-xl border border-border/70 bg-background p-3">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>

        <p className="mt-1 truncate text-sm font-medium">{value}</p>
      </div>

      <div className="ml-3 flex items-center gap-1.5">
        <span className={`size-1.5 rounded-full ${dotClass}`} />

        <span className={`text-[11px] font-medium ${textClass}`}>{status}</span>
      </div>
    </div>
  );
}
