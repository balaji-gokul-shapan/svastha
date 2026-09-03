"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Calendar,
  ClipboardCheckIcon,
  Eye,
  EyeDashed,
  Focus,
  Glasses,
  LensConvex,
  Save,
  Search,
  Send,
  Summary,
} from "lucide-react";
import { ToggleGroup } from "./utilities/toggleGroup";
import {
  assistantOptions,
  classifyAcuity,
  colorVisionStatusOptions,
  colorVisionTestTypeOptions,
  conjunctivaOptions,
  corneaOptions,
  coverTestOptions,
  distanceAcuityOptions,
  followUpOptions,
  lensTypeOptions,
  lidsOptions,
  nearAcuityOptions,
  pupilOptions,
  refractiveErrorOptions,
  yesNoOptions,
} from "./datas/vision-screening-data";
import { Button } from "@/components/ui/button";
import ReusableSelect from "@/components/ui/reusable-select";
import CampStudentSelectorDrawer from "@/components/health-checks/camp-student-selector-drawer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getVisionScreening } from "@/lib/features/getVisionScreening";
import { createVisionScreening } from "@/lib/features/registerVisionScreening";
import useStudentData from "@/components/health-checks/getStudentData";
import AssessmentCard from "@/app/ui/AssessmentCard";
import { EmptyState } from "@/components/ui/empty-state";
import StudentProfileCard from "@/app/students/studentProfileCard";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import StudentFilter from "../utilities/studentFilter";
import { visionScreeningSchema } from "./datas/vision-screening-schema";
import { FramerCard } from "@/util/FramerCard";
import { getMasterData } from "@/util/masterData";
import { getAllMasterScreening } from "@/lib/features/masterScreeningSlice";
import { getAssignEvent } from "@/lib/features/getEventAssignSlice";
import { selectAuthUser } from "@/lib/features/auth-slice";
import { TextareaField, TextField } from "@/components/ui/text-field";
import { SelectField } from "./utilities/selectField";
import ScreeningStepper from "@/components/ScreeningStepper";

const VisionSectionLoading = () => (
  <div className="min-h-24 rounded-xl border border-border bg-card p-4" />
);

const VisionSnapshotCard = dynamic(
  () => import("./components/VisionSnapshotCard"),
  { loading: VisionSectionLoading },
);
const RefractiveError = dynamic(() => import("./components/RefractiveError"), {
  loading: VisionSectionLoading,
});
const VisionExamination = dynamic(
  () => import("./components/VisionExamination"),
  { loading: VisionSectionLoading },
);
const VisionRefractiveError = dynamic(
  () => import("./components/VisionRefractiveError"),
  { loading: VisionSectionLoading },
);
const LensCorrection = dynamic(() => import("./components/LensCorrection"), {
  loading: VisionSectionLoading,
});
const RefferalPlan = dynamic(() => import("./components/RefferalPlan"), {
  loading: VisionSectionLoading,
});
const QuickSummaryFindings = dynamic(
  () => import("./components/QuickSummaryFindings"),
  { loading: VisionSectionLoading },
);

const VISION_STEPS = [
  { value: "acuity", label: "Acuity", shortLabel: "Acuity" },
  { value: "findings", label: "Findings", shortLabel: "Findings" },
  { value: "examination", label: "Eye Examination", shortLabel: "Exam" },
  { value: "correction", label: "Correction", shortLabel: "Correction" },
  { value: "referral", label: "Referral", shortLabel: "Referral" },
  { value: "review", label: "Review & Findings", shortLabel: "Review" },
];

function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-xs text-muted-foreground">
      {children}
    </label>
  );
}

// function TextField({ label, value, onChange, placeholder }) {
//   return (
//     <div>
//       {label && <FieldLabel>{label}</FieldLabel>}
//       <input
//         type="text"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
//       />
//     </div>
//   );
// }

// Rendered once per eye (OD / OS / OU). MUST stay at module scope: if defined
// inside VisionScreeningPage, every keystroke re-created the component type and
// React remounted the row, so the remarks input lost focus while typing.
// Dependencies from the page are passed as props instead of closed over.

const emptyEye = {
  distanceWithout: "NA",
  nearWithout: "NA",
  distanceWith: "NA",
  nearWith: "NA",
  remarks: "",
};

// Map a master-data severity string ("Normal"/"Mild"/"Moderate"/"High"/
// "Severe"/"Critical") to a UI tone.
function severityTone(severity) {
  const s = String(severity ?? "").toLowerCase();
  if (s.includes("critical") || s.includes("severe")) return "destructive";
  if (s.includes("high") || s.includes("moderate")) return "warning";
  if (s.includes("mild")) return "info";
  if (s.includes("normal")) return "success";
  return "muted";
}

export default function VisionScreeningPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const academicYearOptions = ["2026-2027", "2025-2026", "2024-2025"];
  const [selectedCampId, setSelectedCampId] = useState("1");
  const [academicYear, setAcademicYear] = useState(academicYearOptions[0]);
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [schoolName, setSchoolName] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [getStudentDataByEvent, setGetStudentDataByEvent] = useState([]);

  const authUser = useAppSelector(selectAuthUser);
  //   const { data: filterPayload, isLoading } = useQuery({
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

  const requiredMasterData = useMemo(
    () =>
      getMasterData(masterScreeningData, [
        "color-vision-statuses",
        "vision-results",
        "vision-referral-reasons",
      ]),
    [masterScreeningData],
  );

  const colorVisionData = requiredMasterData["color-vision-statuses"];
  const visionResultData = requiredMasterData["vision-results"];
  const referralReasons = requiredMasterData["vision-referral-reasons"];

  // Acuity master data → { "6/6": record } lookup for severity classification.
  const acuitySeverityMap = useMemo(() => {
    const map = {};
    (Array.isArray(visionResultData) ? visionResultData : []).forEach(
      (item) => {
        if (item?.name) {
          map[String(item.name).trim()] = item;
        }
      },
    );
    return map;
  }, [visionResultData]);

  // Distance acuity dropdown values come from master data when available.
  const distanceAcuityNames = useMemo(() => {
    const names = (Array.isArray(visionResultData) ? visionResultData : [])
      .map((item) => String(item?.name ?? "").trim())
      .filter(Boolean);
    return names.length ? names : distanceAcuityOptions;
  }, [visionResultData]);

  // Classify using master-data severity first; falls back to the static
  // heuristic for values not present in master data (CF/HM/PL/NPL, near).
  const classifyWithMaster = useCallback(
    (value) => {
      const trimmed = String(value ?? "").trim();
      if (!trimmed) return { label: "Not tested", tone: "muted" };

      const match = acuitySeverityMap[trimmed] || distanceAcuityNames[trimmed];
      if (match) {
        const severity = String(match.severity ?? "").trim();
        return {
          label: severity || trimmed,
          description: match.description,
          riskScore: match.risk_score,
          tone: severityTone(severity),
        };
      }

      return classifyAcuity(trimmed);
    },
    [acuitySeverityMap, distanceAcuityNames],
  );

  const [studentId, setStudentId] = useState("");
  const [activeVisionStep, setActiveVisionStep] = useState("acuity");
  // const [assessmentDate, setAssessmentDate] = useState("2026-08-05");
  // const [location, setLocation] = useState(locationOptions[0]);
  // const [examiner, setExaminer] = useState(examinerOptions[0]);
  // const [assistant, setAssistant] = useState(assistantOptions[0]);

  const [od, setOd] = useState({ ...emptyEye, distanceWith: "6/6" });
  const [os, setOs] = useState({ ...emptyEye, distanceWith: "6/9" });
  const [ou, setOu] = useState({ ...emptyEye });

  // Seeded from the static options (NOT master data) — master data arrives
  // asynchronously and is an array anyway, so `colorVisionData?.name` was
  // always undefined and the payload key got dropped by JSON.stringify,
  // causing the backend to reject saves with
  // "Invalid input: expected string, received undefined".
  const [colorVisionStatus, setColorVisionStatus] = useState(
    colorVisionStatusOptions[0],
  );
  const [colorVisionTestType, setColorVisionTestType] = useState(
    colorVisionTestTypeOptions[0],
  );
  const [colorVisionRemarks, setColorVisionRemarks] = useState("");

  const [coverTest, setCoverTest] = useState(coverTestOptions[0]);
  const [strabismus, setStrabismus] = useState("no");
  const [muscleBalanceRemarks, setMuscleBalanceRemarks] = useState("");

  const [lids, setLids] = useState(lidsOptions[0]);
  const [conjunctiva, setConjunctiva] = useState(conjunctivaOptions[0]);
  const [cornea, setCornea] = useState(corneaOptions[0]);
  const [pupil, setPupil] = useState(pupilOptions[0]);
  const [externalOtherFindings, setExternalOtherFindings] = useState("");

  const [refractiveError, setRefractiveError] = useState(
    refractiveErrorOptions[0],
  );
  const [refractiveErrorRemarks, setRefractiveErrorRemarks] = useState("");
  const [isCaDrawerOpen, setIsCaDrawerOpen] = useState(false);

  const [usesGlasses, setUsesGlasses] = useState("no");
  const [lensType, setLensType] = useState(lensTypeOptions[0]);
  const [lensPower, setLensPower] = useState("");
  const [lensRemarks, setLensRemarks] = useState("");

  const [referral, setReferral] = useState("no");
  const [adviceSuggestions, setAdviceSuggestions] = useState("");
  const [followUp, setFollowUp] = useState(followUpOptions[0]);
  const [referralReason, setReferralReason] = useState("");

  // { fieldName: "message" } — populated when zod validation fails.
  const [formErrors, setFormErrors] = useState(null);

  const clearFormError = (field) =>
    setFormErrors((prev) =>
      prev && prev[field] ? { ...prev, [field]: undefined } : prev,
    );

  const handleReferralReasonChange = (value) => {
    setReferralReason(value);
    clearFormError("referralReason");
  };

  const handleFollowUpChange = (value) => {
    setFollowUp(value);
    clearFormError("followUp");
  };

  const {
    data: visionScreeningData = [],
    isLoading: visionScreeningLoading,
    error: visionScreeningQueryError,
  } = useQuery({
    queryKey: ["vision-screening", studentId],
    queryFn: () => dispatch(getVisionScreening({ studentId })).unwrap(),
    enabled: Boolean(String(studentId).trim()),
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
  // const {
  //   campsData = [],
  //   campsLoading,
  //   campsQueryError,
  //   studentCampLoading,
  //   studentCampQueryError,
  //   filteredCampRows,
  // } = useStudentData(selectedCampId);

  // const campStudents = useMemo(() => {
  //   if (!filteredCampRows.length) {
  //     return [];
  //   }

  //   return filteredCampRows.flatMap((row) => {
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
  // }, [filteredCampRows]);

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

  // const getClass = useMemo(() => {
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

  //   return Array.from(classSet).sort((a, b) =>
  //     a.localeCompare(b, undefined, { numeric: true }),
  //   );
  // }, [activeAcademicYear, campStudents]);

  // const getSection = useMemo(() => {
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

  //   return Array.from(sectionSet).sort((a, b) =>
  //     a.localeCompare(b, undefined, { numeric: true }),
  //   );
  // }, [activeAcademicYear, campStudents, selectedClassFilter]);

  // const camps = useMemo(
  //   () => (Array.isArray(campsData) ? campsData : []),
  //   [campsData],
  // );

  // const campOptions = useMemo(() => {
  //   return camps
  //     .map((item) => {
  //       const value = String(item.id ?? item.campId ?? item.camp_id ?? "1");
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

  const classOptions = useMemo(() => {
    if (!Array.isArray(studentsArray?.items)) return ["all"];
    const classSet = new Set();
    studentsArray.items.forEach((student) => {
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
  }, [studentsArray?.items]);

  const sectionOptions = useMemo(() => {
    if (!Array.isArray(studentsArray?.items)) return ["all"];
    const sectionSet = new Set();
    studentsArray.items.forEach((student) => {
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
  }, [studentsArray?.items, selectedClassFilter]);

  // const filteredCampStudents = useMemo(() => {
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
  //   // activeAcademicYear,
  //   normalizedCampStudents,
  //   selectedCampId,
  //   selectedClassFilter,
  //   selectedSectionFilter,
  // ]);

  // const filteredStudents = filteredCampStudents;

  const getStudentKeys = (student) =>
    new Set(
      [
        student?.id,
        student?.studentId,
        student?.student_id,
        student?.school_registration_number,
        student?.admission_number,
      ]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    );

  const findScreeningRecordByKeys = useCallback(
    (keys) =>
      visionScreeningData.find((record) => {
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
    [visionScreeningData],
  );

  const applyScreeningRecordToForm = useCallback((screeningRecord) => {
    const record = screeningRecord ?? {};
    setOd({
      distanceWithout: String(record?.od_distance_without || "NA"),
      nearWithout: String(record?.od_near_without || "NA"),
      distanceWith: String(record?.od_distance_with || "6/6"),
      nearWith: String(record?.od_near_with || "NA"),
      remarks: String(record?.od_remarks ?? ""),
    });

    setOs({
      distanceWithout: String(record?.os_distance_without || "NA"),
      nearWithout: String(record?.os_near_without || "NA"),
      distanceWith: String(record?.os_distance_with || "6/9"),
      nearWith: String(record?.os_near_with || "NA"),
      remarks: String(record?.os_remarks ?? ""),
    });

    setOu({
      distanceWithout: String(record?.ou_distance_without || "NA"),
      nearWithout: String(record?.ou_near_without || "NA"),
      distanceWith: String(record?.ou_distance_with || "NA"),
      nearWith: String(record?.ou_near_with || "NA"),
      remarks: String(record?.ou_remarks ?? ""),
    });

    setColorVisionStatus(
      String(record?.color_vision_status ?? colorVisionStatusOptions[0]),
    );
    setColorVisionTestType(
      String(record?.color_vision_test_type ?? colorVisionTestTypeOptions[0]),
    );
    setColorVisionRemarks(String(record?.color_vision_remarks ?? ""));

    setCoverTest(String(record?.cover_test ?? coverTestOptions[0]));
    setStrabismus(
      record?.strabismus === true || record?.strabismus === "true"
        ? "yes"
        : "no",
    );
    setMuscleBalanceRemarks(String(record?.muscle_balance_remarks ?? ""));

    setLids(String(record?.lids ?? lidsOptions[0]));
    setConjunctiva(String(record?.conjunctiva ?? conjunctivaOptions[0]));
    setCornea(String(record?.cornea ?? corneaOptions[0]));
    setPupil(String(record?.pupil ?? pupilOptions[0]));
    setExternalOtherFindings(String(record?.external_other_findings ?? ""));

    setRefractiveError(
      String(record?.refractive_error ?? refractiveErrorOptions[0]),
    );
    setRefractiveErrorRemarks(String(record?.refractive_error_remarks ?? ""));

    setUsesGlasses(
      record?.uses_glasses_or_lens === true ||
        record?.uses_glasses_or_lens === "true"
        ? "yes"
        : "no",
    );
    setLensType(String(record?.lens_type ?? lensTypeOptions[0]));
    setLensPower(String(record?.lens_power ?? ""));
    setLensRemarks(String(record?.lens_remarks ?? ""));

    setReferral(
      record?.referral_to_specialist === true ||
        record?.referral_to_specialist === "true"
        ? "yes"
        : "no",
    );
    setAdviceSuggestions(String(record?.advice_suggestions ?? ""));
    setReferralReason(String(record?.referral_reason ?? ""));
    setFollowUp(String(record?.follow_up ?? followUpOptions[0]));
  }, []);

  // const selectedStudent = useMemo(() => {
  //   const activeStudentId = studentFilter !== "all" ? studentFilter : studentId;
  //   const selectedFromFilter = Array.isArray(filterPayload?.items)
  //     ? filterPayload.items.find(
  //         (student) =>
  //           String(student?.id ?? student?.studentId ?? student?.cus_id) ===
  //           String(activeStudentId),
  //       )
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

  //   return explicitSelection ?? null;
  // }, [filterPayload?.items, filteredStudents, studentFilter, studentId]);

  // const classOptions = useMemo(() => {
  //   if (!selectedCampId) {
  //     return ["all"];
  //   }

  //   return ["all", ...getClass];
  // }, [getClass, selectedCampId]);

  // const sectionOptions = useMemo(() => {
  //   if (!selectedCampId) {
  //     return ["all"];
  //   }

  //   return ["all", ...getSection];
  // }, [getSection, selectedCampId]);

  const selectedStudentFromFilter = useMemo(() => {
    const activeId = studentFilter !== "all" ? studentFilter : studentId;
    if (activeId && Array.isArray(studentsArray)) {
      return (
        studentsArray.find(
          (student) =>
            String(student?.id ?? student?.studentId ?? student?.cus_id) ===
            String(activeId),
        ) ?? null
      );
    }
    return null;
  }, [studentsArray, studentFilter, studentId]);

  const selectedStudent = useMemo(() => {
    if (selectedStudentFromFilter) {
      return selectedStudentFromFilter;
    }

    if (studentId && Array.isArray(studentsArray?.items)) {
      const match = studentsArray.items.find(
        (student) =>
          String(student.id ?? student.studentId ?? student.cus_id) ===
          String(studentId),
      );
      if (match) return match;
    }

    return null;
  }, [studentsArray, selectedStudentFromFilter, studentId]);

  const selectedStudentKey = String(
    selectedStudent?.id ?? selectedStudent?.studentId ?? "",
  );
  const studentSelectValue = selectedStudentKey || "";

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

  const odStatus = useMemo(
    () => classifyWithMaster(od.distanceWith || od.distanceWithout),
    [classifyWithMaster, od],
  );
  const osStatus = useMemo(
    () => classifyWithMaster(os.distanceWith || os.distanceWithout),
    [classifyWithMaster, os],
  );
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

  const students = useMemo(
    () => (Array.isArray(visionScreeningData) ? visionScreeningData : []),
    [visionScreeningData],
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

  //   // The endpoint is already scoped to /vision-test/student/{studentId}.
  //   return visionScreeningData[0] ?? null;
  // }, [studentId, visionScreeningData]);

  useEffect(() => {
    if (!studentId || visionScreeningLoading) {
      return;
    }

    applyScreeningRecordToForm(getSelectedStudentScreeningData);
  }, [
    getSelectedStudentScreeningData,
    studentId,
    visionScreeningLoading,
    applyScreeningRecordToForm,
  ]);
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

  // return (
    const message =
    fieldMessages[0] ??
    payload.message ??
    payload.error ??
    payload.detail ??
    "Something went wrong. Please try again."
  // );
   return /<!doctype html|<html[\s>]/i.test(String(message)) ||
    String(message).length > 240
    ? "Unable to save screening. Please try again."
    : String(message);
}
  const handleSaveAssessment = useCallback(() => {
    const rawStudentId =
      selectedStudent?.id ??
      selectedStudent?.cus_id ??
      selectedStudent?.student_id ??
      selectedStudent?.studentId ??
      studentId;

    if (!String(rawStudentId ?? "").trim()) {
      toast.error("Select a student before saving the vision screening.");
      return;
    }

    // --- Validate editable fields with zod -------------------------
    const formValues = {
      followUp,
      referral,
      referralReason,
      od_distance_without: od.distanceWithout,
      od_near_without: od.nearWithout,
      os_distance_without: os.distanceWithout,
      os_near_without: os.nearWithout,
      ou_distance_without: ou.distanceWithout,
      ou_near_without: ou.nearWithout,
      od_remarks: od.remarks,
      os_remarks: os.remarks,
    };

    const result = visionScreeningSchema.safeParse(formValues);
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

    const payload = {
      student_id: Number(rawStudentId) || 0,
      camp_id:
        Number(selectedCampId) ||
        Number(selectedStudent?.camp_id ?? selectedStudent?.campId) ||
        0,
      od_distance_without: od.distanceWithout,
      od_near_without: od.nearWithout,
      od_distance_with: od.distanceWith,
      od_near_with: od.nearWith,
      od_remarks: od.remarks,
      os_distance_without: os.distanceWithout,
      os_near_without: os.nearWithout,
      os_distance_with: os.distanceWith,
      os_near_with: os.nearWith,
      os_remarks: os.remarks,
      ou_distance_without: ou.distanceWithout,
      ou_near_without: ou.nearWithout,
      ou_distance_with: ou.distanceWith,
      ou_near_with: ou.nearWith,
      ou_remarks: ou.remarks,
      color_vision_status: colorVisionStatus ?? colorVisionStatusOptions[0],
      color_vision_test_type: colorVisionTestType,
      color_vision_remarks: colorVisionRemarks,
      cover_test: coverTest,
      strabismus: strabismus === "yes",
      muscle_balance_remarks: muscleBalanceRemarks,
      lids,
      conjunctiva,
      cornea,
      pupil,
      external_other_findings: externalOtherFindings,
      refractive_error: refractiveError,
      refractive_error_remarks: refractiveErrorRemarks,
      uses_glasses_or_lens: usesGlasses === "yes",
      lens_type: lensType,
      lens_power: lensPower,
      lens_remarks: lensRemarks,
      referral_to_specialist: referral === "yes",
      referral_reason: referral === "yes" ? referralReason : null,
      advice_suggestions: adviceSuggestions,
      follow_up: followUp,
    };
    dispatch(createVisionScreening(payload))
      .unwrap()
      .then(() => {
        // Refresh the react-query cache; the ["vision-screening"] query's
        // queryFn re-dispatches getVisionScreening, keeping Redux in sync.
        queryClient.invalidateQueries({ queryKey: ["vision-screening"] });

        toast.success("Vision screening saved successfully", {
          description: selectedStudent?.name
            ? `Record saved for ${selectedStudent.name}`
            : undefined,
        });
      })
      .catch((error) => {
        console.error("Unable to save vision screening:", error);

        toast.error("Failed to save vision screening", {
          description:
           getBackendErrorMessage(error),
        });
      });
  }, [
    adviceSuggestions,
    colorVisionRemarks,
    colorVisionStatus,
    colorVisionTestType,
    conjunctiva,
    cornea,
    coverTest,
    externalOtherFindings,
    followUp,
    lensPower,
    lensRemarks,
    lensType,
    lids,
    muscleBalanceRemarks,
    od,
    os,
    ou,
    pupil,
    queryClient,
    referral,
    referralReason,
    refractiveError,
    refractiveErrorRemarks,
    selectedCampId,
    selectedStudent,
    strabismus,
    studentId,
    usesGlasses,
  ]);

  const handleCancelAssessment = useCallback(() => {
    setOd({ ...emptyEye, distanceWith: "6/6" });
    setOs({ ...emptyEye, distanceWith: "6/9" });
    setOu({ ...emptyEye });

    setColorVisionStatus(colorVisionStatusOptions[0]);
    setColorVisionTestType(colorVisionTestTypeOptions[0]);
    setColorVisionRemarks("");

    setCoverTest(coverTestOptions[0]);
    setStrabismus("no");
    setMuscleBalanceRemarks("");

    setLids(lidsOptions[0]);
    setConjunctiva(conjunctivaOptions[0]);
    setCornea(corneaOptions[0]);
    setPupil(pupilOptions[0]);
    setExternalOtherFindings("");

    setRefractiveError(refractiveErrorOptions[0]);
    setRefractiveErrorRemarks("");

    setUsesGlasses("no");
    setLensType(lensTypeOptions[0]);
    setLensPower("");
    setLensRemarks("");

    setReferral("no");
    setAdviceSuggestions("");
    setReferralReason("");
    setFollowUp(followUpOptions[0]);
  }, []);

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

  return (
    <section className="space-y-4">
      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 py-3">
            {/* <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Eye className="size-5" />
            </div> */}
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary aspect-square">
              <Eye className="size-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Vision Screening
              </h1>

              <p className="text-sm text-muted-foreground">
                Vision health screening and assessment
              </p>
              {/* <p className="text-xs text-muted-foreground">
                  {studentCampLoading
                    ? "Loading students..."
                    : studentCampQueryError
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
            studentsLoading={studentCampLoading}
            studentsError={studentCampQueryError}
            campsLoading={campsLoading}
            campsQueryError={campsQueryError}
            studentCampLoading={studentCampLoading}
            studentCampQueryError={studentCampQueryError}
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
                (student) =>
                  String(student.id ?? student.studentId) === String(value),
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
              <AlertTriangle className="size-4 shrink-0" />
              Please fix the highlighted fields before saving.
            </div>
          )}

          <Button type="button" onClick={handleSaveAssessment}>
            <Save className="size-4" />
            Save & Next
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
      {studentSelectValue?.length > 0 ? (
        <>
          <StudentProfileCard student={selectedStudent} />
          <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            {/* ---------------- Left column ---------------- */}
            <div className="space-y-4">
              {/* <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Assessment Details
            </h3>
            <div className="mt-4 space-y-3">
              <SelectField
                label="Student"
                options={assessmentStudentOptions.map((item) => item.label)}
                value={
                  assessmentStudentOptions.find(
                    (item) => item.value === String(studentId),
                  )?.label ?? ""
                }
                onChange={(label) => {
                  const selectedOption = assessmentStudentOptions.find(
                    (item) => item.label === label,
                  );
                  setStudentId(selectedOption?.value ?? "");
                }}
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
          </article> */}
              <div className="relative md:relative lg:sticky lg:top-24 z-10 self-start space-y-5">
                <FramerCard>
                <AssessmentCard
                  form={{}}
                  data={getSelectedStudentScreeningData}
                  studentOptions={assessmentStudentOptions}
                  studentValue={studentSelectValue}
                  schoolName={schoolName}
                  onStudentChange={handleAssessmentStudentChange}
                  onSave={handleSaveAssessment}
                  onCancel={handleCancelAssessment}
                  authUser={authUser}
                />
                </FramerCard>
              </div>

              {/* <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelAssessment}
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
              </div> */}
            </div>

            <div className="min-w-0">
              <ScreeningStepper
                activeStep={activeVisionStep}
                setActiveStep={setActiveVisionStep}
                steps={VISION_STEPS}
                filterFemale={false}
                onSave={handleSaveAssessment}
              >
                <div className="space-y-4">
              <VisionSnapshotCard
                od={od}
                setOd={setOd}
                os={os}
                setOs={setOs}
                ou={ou}
                setOu={setOu}
                getSelectedStudentScreeningData={
                  getSelectedStudentScreeningData
                }
                visionResultData={visionResultData}
                acuitySeverityMap={acuitySeverityMap}
              />
                </div>

                <div className="space-y-4">
              <RefractiveError
                muscleBalanceRemarks={muscleBalanceRemarks}
                setMuscleBalanceRemarks={setMuscleBalanceRemarks}
                colorVisionData={colorVisionData}
                colorVisionStatus={colorVisionStatus}
                colorVisionTestType={colorVisionTestType}
                colorVisionRemarks={colorVisionRemarks}
                setColorVisionStatus={setColorVisionStatus}
                setColorVisionTestType={setColorVisionTestType}
                setColorVisionRemarks={setColorVisionRemarks}
                coverTest={coverTest}
                setCoverTest={setCoverTest}
                strabismus={strabismus}
                setStrabismus={setStrabismus}
                coverTestOptions={coverTestOptions}
                colorVisionTestTypeOptions={colorVisionTestTypeOptions}
                yesNoOptions={yesNoOptions}
              />
                </div>

                <div className="space-y-4">
              <VisionExamination
                lids={lids}
                conjunctiva={conjunctiva}
                cornea={cornea}
                pupil={pupil}
                externalOtherFindings={externalOtherFindings}
                setExternalOtherFindings={setExternalOtherFindings}
                setLids={setLids}
                setConjunctiva={setConjunctiva}
                setCornea={setCornea}
                setPupil={setPupil}
                lidsOptions={lidsOptions}
                conjunctivaOptions={conjunctivaOptions}
                corneaOptions={corneaOptions}
                pupilOptions={pupilOptions}
              />
                </div>

                <div className="space-y-4">
              <VisionRefractiveError
                refractiveErrorRemarks={refractiveErrorRemarks}
                refractiveError={refractiveError}
                setRefractiveError={setRefractiveError}
                setRefractiveErrorRemarks={setRefractiveErrorRemarks}
                refractiveErrorOptions={refractiveErrorOptions}
              />
              <LensCorrection
                lensType={lensType}
                lensPower={lensPower}
                lensRemarks={lensRemarks}
                setLensType={setLensType}
                setLensPower={setLensPower}
                setLensRemarks={setLensRemarks}
                yesNoOptions={yesNoOptions}
                usesGlasses={usesGlasses}
                setUsesGlasses={setUsesGlasses}
                getSelectedStudentScreeningData={getSelectedStudentScreeningData}
                lensTypeOptions={lensTypeOptions}
              />
                </div>

                <div className="space-y-4">
              <RefferalPlan
                referral={referral}
                setReferral={setReferral}
                referralReason={referralReason}
                handleReferralReasonChange={handleReferralReasonChange}
                adviceSuggestions={adviceSuggestions}
                setAdviceSuggestions={setAdviceSuggestions}
                followUp={followUp}
                setFollowUp={setFollowUp}
                handleFollowUpChange={handleFollowUpChange}
                followUpOptions={followUpOptions}
                referralReasons={referralReasons}
                yesNoOptions={yesNoOptions}
                formErrors={formErrors}
              />
                </div>
                <div className="space-y-4">
                  <QuickSummaryFindings
                    odStatus={odStatus}
                    osStatus={osStatus}
                    colorVisionStatus={colorVisionStatus}
                    lensType={lensType}
                    strabismus={strabismus}
                    usesGlasses={usesGlasses}
                    referral={referral}
                    followUp={followUp}
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
            description="Select a camp and student to view and edit vision screening details."
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
