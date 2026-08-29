"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
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
import IExamMultipleChoiceOutlineIcon from '@iconify-react/healthicons/i-exam-multiple-choice-outline';
import ReferralIcon from '@iconify-react/healthicons/referral';
import { VisionSnapshot } from "./EyeSnapshot";
import { ToggleGroup } from "./toggleGroup";
import {
  assistantOptions,
  classifyAcuity,
  colorVisionStatusOptions,
  colorVisionTestTypeOptions,
  conjunctivaOptions,
  corneaOptions,
  coverTestOptions,
  distanceAcuityOptions,
  examinerOptions,
  followUpOptions,
  lensTypeOptions,
  lidsOptions,
  locationOptions,
  nearAcuityOptions,
  pupilOptions,
  refractiveErrorOptions,
  yesNoOptions,
} from "./vision-screening-data";
import { Button } from "@/components/ui/button";
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
import { visionScreeningSchema } from "./vision-screening-schema";
import { FramerCard } from "@/util/FramerCard";
import { getMasterData } from "@/util/masterData";
import { getAllMasterScreening } from "@/lib/features/masterScreeningSlice";
import { getAssignEvent } from "@/lib/features/getEventAssignSlice";
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
      {label && <FieldLabel>{label}</FieldLabel>}
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

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}

// Rendered once per eye (OD / OS / OU). MUST stay at module scope: if defined
// inside VisionScreeningPage, every keystroke re-created the component type and
// React remounted the row, so the remarks input lost focus while typing.
// Dependencies from the page are passed as props instead of closed over.
function AcuityRow({
  label,
  eye,
  onChange,
  visionResultData,
  acuitySeverityMap,
}) {
  const severityFor = (value) => {
    const record = (acuitySeverityMap ?? {})[String(value ?? "").trim()];
    return record?.severity ?? "";
  };

  const severityLine = (value) => {
    const severity = severityFor(value);
    if (!severity) return null;
    return (
      <p className={`mt-1 text-xs ${SEVERITY_TEXT_CLASS[severityTone(severity)]}`}>
        {severity}
      </p>
    );
  };

  const distanceOptions = (Array.isArray(visionResultData) ? visionResultData : []).map(
    (item) => item?.name,
  );

  return (
    <div className="rounded-lg border border-border/70 bg-background p-3 sm:p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div>
          <SelectField
            label="Distance (Without)"
            options={distanceOptions}
            value={eye.distanceWithout}
            onChange={(v) => onChange({ ...eye, distanceWithout: v })}
          />
          {/* {severityLine(eye.distanceWithout)} */}
        </div>
        <div>
          <SelectField
            label="Near (Without)"
            options={nearAcuityOptions}
            value={eye.nearWithout}
            onChange={(v) => onChange({ ...eye, nearWithout: v })}
          />
        </div>
        <div>
          <SelectField
            label="Distance (With)"
            options={distanceOptions}
            value={eye.distanceWith}
            onChange={(v) => onChange({ ...eye, distanceWith: v })}
          />
          {/* {severityLine(eye.distanceWith)} */}
        </div>
        <div>
          <SelectField
            label="Near (With)"
            options={nearAcuityOptions}
            value={eye.nearWith}
            onChange={(v) => onChange({ ...eye, nearWith: v })}
          />
        </div>
      </div>
      <div className="mt-3">
        <TextField
          label="Remarks"
          value={eye.remarks}
          onChange={(v) => onChange({ ...eye, remarks: v })}
          placeholder="Optional notes for this eye"
        />
      </div>
    </div>
  );
}

const emptyEye = {
  distanceWithout: "",
  nearWithout: "",
  distanceWith: "",
  nearWith: "",
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

const SEVERITY_TEXT_CLASS = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};

const SUMMARY_TONE_CLASS = {
  success: "text-success bg-success/10",
  info: "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
  muted: "text-muted-foreground bg-muted",
};

export default function VisionScreeningPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
   const academicYearOptions = ["2026-2027", "2025-2026", "2024-2025"];
 const [selectedCampId, setSelectedCampId] = useState("1");
  const [academicYear, setAcademicYear] = useState(academicYearOptions[0]);
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("all");
  const [schoolName, setSchoolName] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
const authUser = useAppSelector(selectAuthUser);
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

  console.log(masterScreeningData, "All Master Screening Data"); 

  const requiredMasterData = useMemo(
      () =>
        getMasterData(masterScreeningData, [
          "color-vision-statuses",
          "vision-results",
          "vision-referral-reasons"
        ]),
      [masterScreeningData],
    );
    console.log(requiredMasterData , "requiredMasterData");
  const colorVisionData = requiredMasterData["color-vision-statuses"];
  const visionResultData = requiredMasterData["vision-results"];
  const referralReasons = requiredMasterData["vision-referral-reasons"];

  // Acuity master data → { "6/6": record } lookup for severity classification.
  const acuitySeverityMap = useMemo(() => {
    const map = {};
    (Array.isArray(visionResultData) ? visionResultData : []).forEach((item) => {
      if (item?.name) {
        map[String(item.name).trim()] = item;
      }
    });
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
  const [assessmentDate, setAssessmentDate] = useState("2026-08-05");
  const [location, setLocation] = useState(locationOptions[0]);
  const [examiner, setExaminer] = useState(examinerOptions[0]);
  const [assistant, setAssistant] = useState(assistantOptions[0]);

  const [od, setOd] = useState({ ...emptyEye, distanceWith: "6/6" });
  const [os, setOs] = useState({ ...emptyEye, distanceWith: "6/9" });
  const [ou, setOu] = useState(emptyEye);

  const [colorVisionStatus, setColorVisionStatus] = useState(
    colorVisionData?.name,
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
  console.log(assignedEvents,"assignedEvents");
  
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
      distanceWithout: String(record?.od_distance_without ?? ""),
      nearWithout: String(record?.od_near_without ?? ""),
      distanceWith: String(record?.od_distance_with ?? "6/6"),
      nearWith: String(record?.od_near_with ?? ""),
      remarks: String(record?.od_remarks ?? ""),
    });

    setOs({
      distanceWithout: String(record?.os_distance_without ?? ""),
      nearWithout: String(record?.os_near_without ?? ""),
      distanceWith: String(record?.os_distance_with ?? "6/9"),
      nearWith: String(record?.os_near_with ?? ""),
      remarks: String(record?.os_remarks ?? ""),
    });

    setOu({
      distanceWithout: String(record?.ou_distance_without ?? ""),
      nearWithout: String(record?.ou_near_without ?? ""),
      distanceWith: String(record?.ou_distance_with ?? ""),
      nearWith: String(record?.ou_near_with ?? ""),
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

  const selectedStudentKey = String(
    selectedStudent?.id ?? selectedStudent?.studentId ?? "",
  );
  const studentSelectValue = selectedStudentKey || "";

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
      color_vision_status: colorVisionStatus,
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
    console.log(payload,"payload");
    

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
            error?.message ?? "Something went wrong. Please try again.",
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
    setOu(emptyEye);

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
        filterPayload={filterPayload}
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
      {studentSelectValue?.length > 0 ? (
        <>
          <StudentProfileCard student={selectedStudent} />
          <div className="grid gap-4 xl:grid-cols-[300px_1fr_320px]">
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
              <FramerCard>
                <AssessmentCard
                  // onChange={handleAssessmentChange}
                  // form={assessmentForm}
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

              <FramerCard>
                <article className="rounded-xl border border-border bg-card p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                      <ClipboardCheckIcon size={16} className="text-primary" />
                    </span>
                    Quick Findings Summary
                  </h3>
                  <div className="mt-3 space-y-2">
                    <SummaryRow
                      icon={Eye}
                      label="OD Acuity"
                      value={odStatus.label}
                      tone={odStatus.tone}
                    />
                    <SummaryRow
                      icon={Eye}
                      label="OS Acuity"
                      value={osStatus.label}
                      tone={osStatus.tone}
                    />
                    <SummaryRow
                      icon={AlertTriangle}
                      label="Strabismus"
                      value={strabismus === "yes" ? "Present" : "Absent"}
                      tone={strabismus === "yes" ? "warning" : "success"}
                    />
                    <SummaryRow
                      icon={Glasses}
                      label="Uses Correction"
                      value={usesGlasses === "yes" ? "Yes" : "No"}
                      tone="muted"
                    />
                    <SummaryRow
                      icon={Send}
                      label="Referral"
                      value={referral === "yes" ? "Required" : "Not Required"}
                      tone={referral === "yes" ? "warning" : "success"}
                    />
                  </div>
                </article>
              </FramerCard>
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

            {/* ---------------- Middle column: acuity + external exam ---------------- */}
            <div className="space-y-4">
              <FramerCard>
                <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Visual Acuity Snapshot
                  </h3>
                  <div className="mt-4">
                    <VisionSnapshot
                      odDistanceWith={od.distanceWith}
                      odDistanceWithout={od.distanceWithout}
                      osDistanceWith={os.distanceWith}
                      osDistanceWithout={os.distanceWithout}
                    />
                  </div>

                  <div className="mt-5 space-y-3">
                    <AcuityRow
                      label="Right Eye (OD)"
                      eye={
                        getSelectedStudentScreeningData?.od_distance_without ||
                        od
                      }
                      onChange={setOd}
                      visionResultData={visionResultData}
                      acuitySeverityMap={acuitySeverityMap}
                    />
                    <AcuityRow
                      label="Left Eye (OS)"
                      eye={
                        getSelectedStudentScreeningData?.os_distance_without ||
                        os
                      }
                      onChange={setOs}
                      visionResultData={visionResultData}
                      acuitySeverityMap={acuitySeverityMap}
                    />
                    <AcuityRow
                      label="Both Eyes (OU)"
                      eye={
                        getSelectedStudentScreeningData?.ou_distance_without ||
                        ou
                      }
                      onChange={setOu}
                      visionResultData={visionResultData}
                      acuitySeverityMap={acuitySeverityMap}
                    />
                  </div>
                </article>
              </FramerCard>
              <FramerCard>
                <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
                  {/* <h3 className="text-sm font-semibold text-foreground">
                    Color Vision &amp; Muscle Balance
                  </h3> */}
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-warning/10">
                      <EyeDashed className="size-4 text-warning" />
                    </span>
                    Refractive Error
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <SelectField
                      label="Color Vision Status"
                      options={colorVisionData?.map((item)=> item.name)}
                      value={colorVisionStatus}
                      onChange={setColorVisionStatus}
                    />
                    <SelectField
                      label="Test Type"
                      options={colorVisionTestTypeOptions}
                      value={colorVisionTestType}
                      onChange={setColorVisionTestType}
                    />
                    <TextField
                      label="Color Vision Remarks"
                      value={colorVisionRemarks}
                      onChange={setColorVisionRemarks}
                      placeholder="Optional"
                    />
                    <SelectField
                      label="Cover Test"
                      options={coverTestOptions}
                      value={coverTest}
                      onChange={setCoverTest}
                    />
                    <div>
                      <ToggleGroup
                        label="Strabismus"
                        options={yesNoOptions("no")}
                        value={strabismus}
                        onChange={setStrabismus}
                      />
                    </div>
                    <TextField
                      label="Muscle Balance Remarks"
                      value={muscleBalanceRemarks}
                      onChange={setMuscleBalanceRemarks}
                      placeholder="Optional"
                    />
                  </div>
                </article>
              </FramerCard>

              <FramerCard>
                <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
                  {/* <h3 className="text-sm font-semibold text-foreground">
                    External Examination
                  </h3> */}
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-domain-vision/10">
                      <IExamMultipleChoiceOutlineIcon  className="size-4 text-domain-vision" />
                    </span>
                      External Examination
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <SelectField
                      label="Lids"
                      options={lidsOptions}
                      value={lids}
                      onChange={setLids}
                    />
                    <SelectField
                      label="Conjunctiva"
                      options={conjunctivaOptions}
                      value={conjunctiva}
                      onChange={setConjunctiva}
                    />
                    <SelectField
                      label="Cornea"
                      options={corneaOptions}
                      value={cornea}
                      onChange={setCornea}
                    />
                    <SelectField
                      label="Pupil"
                      options={pupilOptions}
                      value={pupil}
                      onChange={setPupil}
                    />
                  </div>
                  <div className="mt-3">
                    <FieldLabel>Other Findings</FieldLabel>
                    <textarea
                      value={externalOtherFindings}
                      onChange={(e) => setExternalOtherFindings(e.target.value)}
                      rows={3}
                      placeholder="Enter notes"
                      className="w-full resize-none rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                </article>
              </FramerCard>
            </div>

            {/* ---------------- Right column: refraction, correction, referral ---------------- */}
            <div className="space-y-4">
              <FramerCard>
                <article className="rounded-xl border border-border bg-card p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-success/10">
                      <Focus className="size-4 text-success" />
                    </span>
                    Refractive Error
                  </h3>
                  <div className="mt-3 space-y-3">
                    <SelectField
                      label="Refractive Error"
                      options={refractiveErrorOptions}
                      value={refractiveError}
                      onChange={setRefractiveError}
                    />
                    <TextField
                      label="Remarks"
                      value={refractiveErrorRemarks}
                      onChange={setRefractiveErrorRemarks}
                      placeholder="Optional"
                    />
                  </div>
                </article>
              </FramerCard>
              <FramerCard>
                <article className="rounded-xl border border-border bg-card p-4">
                  {/* <h3 className="text-sm font-semibold text-foreground">
                   
                  </h3> */}
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-info/10">
                      <LensConvex className="size-4 text-info" />
                    </span>
                    Correction / Lens
                  </h3>
                  <div className="mt-3 space-y-3">
                    <ToggleGroup
                      label="Uses Glasses or Lens"
                      options={yesNoOptions("neutral")}
                      value={
                        getSelectedStudentScreeningData?.uses_glasses_or_lens ||
                        usesGlasses
                      }
                      onChange={setUsesGlasses}
                    />
                    <SelectField
                      label="Lens Type"
                      options={lensTypeOptions}
                      value={lensType}
                      onChange={setLensType}
                    />
                    <TextField
                      label="Lens Power"
                      value={lensPower}
                      onChange={setLensPower}
                      placeholder="e.g. -1.50 DS"
                    />
                    <TextField
                      label="Lens Remarks"
                      value={lensRemarks}
                      onChange={setLensRemarks}
                      placeholder="Optional"
                    />
                  </div>
                </article>
              </FramerCard>

              <FramerCard>
                <article className="rounded-xl border border-border bg-card p-4">
                  {/* <h3 className="text-sm font-semibold text-foreground">
                    Referral &amp; Follow-up
                  </h3> */}
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-domain-oral/10">
                      <ReferralIcon  className="size-5 text-domain-oral" />
                    </span>
                    Referral &amp; Follow-up
                  </h3>
                  <div className="mt-3 space-y-3">
                    <ToggleGroup
                      label="Referral to Specialist"
                      options={yesNoOptions("no")}
                      value={referral}
                      onChange={setReferral}
                    />
                    {referral === "yes" && (
                      <div>
                        <SelectField
                          label="Referral Reason"
                          options={[
                            "",
                            ...(Array.isArray(referralReasons)
                              ? referralReasons
                              : []
                            ).map((item) => String(item?.name ?? "").trim()),
                          ].filter((name, index, all) => all.indexOf(name) === index)}
                          value={referralReason}
                          onChange={handleReferralReasonChange}
                          error={formErrors?.referralReason}
                        />
                        {formErrors?.referralReason && (
                          <p className="mt-1.5 text-xs text-destructive">
                            {formErrors.referralReason}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <FieldLabel>Advice / Suggestions</FieldLabel>
                      <textarea
                        value={adviceSuggestions}
                        onChange={(e) => setAdviceSuggestions(e.target.value)}
                        rows={3}
                        placeholder="Enter notes"
                        className="w-full resize-none rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                    <SelectField
                      label="Follow-up"
                      options={followUpOptions}
                      value={followUp}
                      onChange={handleFollowUpChange}
                      error={formErrors?.followUp}
                    />
                  </div>
                </article>
              </FramerCard>
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

function SummaryRow({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={`flex size-6 items-center justify-center rounded-md ${SUMMARY_TONE_CLASS[tone] || SUMMARY_TONE_CLASS.muted}`}
        >
          <Icon className="size-3.5" strokeWidth={2.25} />
        </span>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
