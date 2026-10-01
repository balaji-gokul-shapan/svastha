"use client";

import {
  Activity,
  Baby,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CircleDot,
  Cross,
  Download,
  Ear,
  Eye,
  FileText,
  HeartPulse,
  Loader2,
  Printer,
  Search,
  ShieldCheck,
  Syringe,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// import { useState } from "react";
import { fadeUp, FramerCard } from "@/util/FramerCard";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { EmptyState } from "@/components/ui/empty-state";
import { selectAuthUser } from "@/lib/features/auth-slice";
import useAssignedEvents, { findSelectedCamp } from "@/lib/useAssignedEvents";
import {
  getScreeningIds,
  getScreeningKeys,
  isScreeningKeyAssigned,
} from "@/lib/camp-utils";
import { getStudentByEvent } from "@/lib/features/getEventAssignSlice";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { toast } from "sonner";
import StudentFilter from "../utilities/studentFilter";
import { useAllScreeningReport } from "@/components/healthChecks/getScreeningReport";
import { useScreeningRecordByFilter } from "@/components/students/getScreeningRecordByFilter";
import Image from "next/image";
import {
  getSignatureValue,
  normalizeSignatureUrl,
} from "@/lib/signature-utils";
import { getDoctorSignature } from "@/lib/features/doctorSignatureSlice";

/* =========================================================
   COMPLETE STUDENT HEALTH PROFILE DATA
========================================================= */

const HEALTH_PROFILE_TEMPLATE = {
  student: {
    name: "Arjun Kumar",
    id: "SCH-104-001",
    class: "5-A",
    school: "Sunshine Public School",
    age: 10,
    gender: "Male",
    dateOfBirth: "12 March 2016",
    bloodGroup: "A+",
  },

  assessment: {
    date: "17 Aug 2026",
    examiner: "Dr. Priya Sharma",
    designation: "Medical Officer",
    assistant: "Riya Nair",
    location: "Sunshine Public School",
  },

  overall: {
    score: 92,
    status: "Healthy",
    summary: "Good overall health",
  },

  vitals: {
    height: {
      value: "145 cm",
      status: "Normal",
    },
    weight: {
      value: "38 kg",
      status: "Normal",
    },
    bmi: {
      value: "18.1",
      status: "Normal",
      percentile: "65th percentile",
    },
    bloodPressure: {
      value: "108/68 mmHg",
      status: "Normal",
    },
    pulse: {
      value: "82 bpm",
      status: "Normal",
    },
    temperature: {
      value: "98.4 °F",
      status: "Normal",
    },
    oxygen: {
      value: "99%",
      status: "Normal",
    },
  },

  vision: {
    status: "Normal",
    rightEye: {
      acuity: "6/6",
      corrected: "6/6",
    },
    leftEye: {
      acuity: "6/6",
      corrected: "6/6",
    },
    colorVision: "Normal",
    strabismus: "Absent",
    usesCorrection: "No",
    remarks:
      "No abnormal visual findings detected. Visual acuity is normal in both eyes.",
  },

  hearing: {
    status: "Normal",

    rightEar: {
      status: "Normal",
      threshold: "≤ 20 dB",
      findings: "No abnormality detected",
    },

    leftEar: {
      status: "Normal",
      threshold: "≤ 20 dB",
      findings: "No abnormality detected",
    },

    whisperTest: {
      right: "Pass",
      left: "Pass",
      distance: "2 feet",
    },

    speech: {
      right: "100%",
      left: "100%",
      srtRight: "10 dB",
      srtLeft: "10 dB",
    },

    tympanometry: {
      right: "Type A",
      left: "Type A",
    },

    remarks: "Hearing within normal range in both ears.",
  },

  dental: {
    status: "Good",
    oralHygiene: "Good",
    gingivalHealth: "Healthy",
    plaque: "Mild",
    caries: 2,
    otherIssues: 1,
    healthyTeeth: 25,
    missingTeeth: 0,

    currentTooth: {
      number: 16,
      name: "Upper Right First Molar",
      status: "Caries",
      surface: "Occlusal",
      severity: "Moderate",
      treatment: "Restoration",
    },

    referral: {
      action: "Routine dental follow-up",
      reason: "Minor dental caries",
      followUp: "6 months",
    },

    instructions: "Brush twice daily and floss regularly.",
    notes: "Overall good oral health",
  },

  ent: {
    status: "Normal",
    nose: "Normal",
    throat: "Normal",
    tonsils: "Normal",
    lymphNodes: "No abnormality",
    remarks: "No significant ENT findings.",
  },

  immunization: {
    status: "Up to date",
    vaccines: "Completed",
    nextReview: "As scheduled",
  },

  history: {
    allergies: "None",
    chronicDisease: "None",
    previousCondition: "None reported",
    surgeries: "None",
    medications: "None",
    familyHistory: "No significant history",
  },

  riskFactors: {
    earInfections: "No",
    speechDelay: "No",
    learningDifficulty: "No",
    familyHistory: "No",
    noiseExposure: "No",
    otherRisks: "None",
  },

  referral: {
    required: true,
    type: "Dental",
    priority: "Routine",
    referredTo: "Dental Clinic",
    reason: "Minor dental caries",
    followUp: "6 months",
  },

  recommendations: [
    "Maintain a balanced diet and regular physical activity.",
    "Continue regular oral hygiene practices.",
    "Continue routine annual health screening.",
    "Keep immunizations up to date.",
    "Follow up with a dentist within 6 months.",
  ],

  clinicalNotes:
    "Student is generally healthy. Growth parameters are within the expected range. Vision and hearing screenings show no significant concerns. Mild dental findings noted and routine dental follow-up is recommended.",
};

const normalizeId = (value) => String(value ?? "").trim();

const recordBelongsToStudent = (record, studentIds) => {
  const normalizedStudentIds = new Set(
    (Array.isArray(studentIds) ? studentIds : [studentIds])
      .map((value) => normalizeId(value).toLowerCase())
      .filter(Boolean),
  );

  if (!normalizedStudentIds.size) return false;

  const recordStudentIds = [
    record?.id,
    record?.cus_id,
    record?.student_cus_id,
    record?.student_id,
    record?.studentId,
    record?.school_registration_number,
    record?.admission_number,
    record?.student?.id,
    record?.student?.cus_id,
    record?.student?.student_id,
    record?.student?.school_registration_number,
    record?.student?.admission_number,
    record?.report?.cus_id,
    record?.report?.student_cus_id,
    record?.report?.student_id,
    record?.report?.studentId,
    record?.report?.school_registration_number,
    record?.report?.admission_number,
    record?.report?.student?.id,
    record?.report?.student?.cus_id,
    record?.report?.student?.student_id,
    record?.report?.student?.school_registration_number,
    record?.report?.student?.admission_number,
  ]
    .map((value) => normalizeId(value).toLowerCase())
    .filter(Boolean);

  // Some report endpoints expose a student record directly. Only use its
  // `id` when no explicit student identifier is available; otherwise `id`
  // commonly refers to the screening record itself.
  const idsToMatch = recordStudentIds.length
    ? recordStudentIds
    : [normalizeId(record?.id).toLowerCase()];

  return idsToMatch.some((id) => normalizedStudentIds.has(id));
};

const findStudentScreeningRecord = (records, studentIds) => {
  if (!records) return null;

  // The screening hook returns ONE already-resolved record per screening
  // (or null), not a list — so normalise before calling .find().
  const list = Array.isArray(records) ? records : [records];

  return list.find((record) => recordBelongsToStudent(record, studentIds)) ?? null;
};

const formatMetric = (value, unit, fallback) => {
  const text = String(value ?? "").trim();

  return text ? `${text}${unit ? ` ${unit}` : ""}` : fallback;
};

const getRecordName = (record, ...keys) => {
  for (const key of keys) {
    const value = record?.[key];
    const name =
      typeof value === "object" && value !== null
        ? value.name ?? value.label
        : value;
    const text = String(name ?? "").trim();

    if (text) return text;
  }

  return "";
};

/** "Yes" / true → "Yes", false → "No", empty → "". Never invents a value. */
const toYesNoText = (value) => {
  if (value === null || value === undefined || value === "") return "";

  const text = String(value).trim().toLowerCase();

  if (["1", "true", "yes", "y"].includes(text)) return "Yes";
  if (["0", "false", "no", "n"].includes(text)) return "No";

  return String(value).trim();
};

/** Placeholder shown when a screening has not been recorded for the student. */
const NOT_RECORDED = "Not recorded";

/**
 * First non-empty value across `keys`, or `fallback` when none is present.
 * Used so every card can fall back to "Not recorded" instead of silently
 * showing the demo values baked into HEALTH_PROFILE_TEMPLATE.
 */
const pick = (record, keys, fallback = NOT_RECORDED) => {
  const value = getRecordName(record, ...keys);

  return value || fallback;
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function StudenthealthReport() {
  const dispatch = useAppDispatch();
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [schoolName, setSchoolName] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [studentId, setStudentId] = useState("");
  const reportRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const authUser = useAppSelector(selectAuthUser);
  const doctorSignatureState = useAppSelector((state) => state.doctorSignature);

  /* ------------------------------------------------------------------
     Doctor signature — same source as the report (GET /doctor-signature/{id}).
     The overview page can be opened without visiting Profile first, so the
     signature is fetched here rather than relying on that page to have
     populated the slice.
     ------------------------------------------------------------------ */
  const doctorId = authUser?.id ?? authUser?.Id ?? null;

  const isDoctorUser = useMemo(() => {
    const values = [
      authUser?.account_type,
      authUser?.emp_account_type,
      authUser?.user_type_id,
      authUser?.role,
    ];

    return values.some((value) => {
      if (value == null) return false;
      if (typeof value === "number") return value === 5;
      if (typeof value === "object") {
        return String(value.role ?? value.name ?? value.id ?? "").trim().toLowerCase() === "doctor";
      }

      const normalized = String(value).trim().toLowerCase();

      return normalized === "doctor" || normalized === "5";
    });
  }, [authUser]);

  useEffect(() => {
    // The endpoint is doctor-only; other roles get a 401 there.
    if (!doctorId || !isDoctorUser) return;

    dispatch(getDoctorSignature(doctorId));
  }, [dispatch, doctorId, isDoctorUser]);

  const doctorSignatureUrl = normalizeSignatureUrl(
    getSignatureValue(doctorSignatureState),
  );

  /**
   * Signed-in examiner's name. Several auth payload fields (`label`,
   * `user_type`, `role`) can be OBJECTS, so only take a real non-empty
   * string — rendering an object here is what previously crashed.
   */
  const examinerName = useMemo(() => {
    const candidates = [
      authUser?.label,
      authUser?.emp_name,
      authUser?.user_name,
      authUser?.username,
      authUser?.name,
    ];

    return (
      candidates
        .find((value) => typeof value === "string" && value.trim().length > 0)
        ?.trim() ?? ""
    );
  }, [authUser]);
  const { assignedEvents, assignEventLoading, assignEventError } =
    useAssignedEvents();

  const selectedCamp = useMemo(
    () => findSelectedCamp(assignedEvents, schoolName),
    [assignedEvents, schoolName],
  );

  /* ---------------------------------------------------------------------- */
  /* Camp screening assignment                                              */
  /*                                                                         */
  /* The camp only runs a subset of screenings (screening_ids "1".."5").      */
  /* Map them to slug keys and hide every section that is not assigned, so    */
  /* the overview matches the report. An empty list = no restriction.         */
  /* ---------------------------------------------------------------------- */

  const assignedScreeningIds = getScreeningIds(selectedCamp);
  const assignedScreeningKeys = getScreeningKeys(selectedCamp);
  const isAssigned = (key) =>
    isScreeningKeyAssigned(assignedScreeningKeys, key);

  const showGeneral = isAssigned("general");
  const showVision = isAssigned("vision");
  const showHearing = isAssigned("hearing");
  const showDental = isAssigned("dental");
  const showEnt = isAssigned("ent");
  // Immunization has no screening_id of its own in the 1..5 scheme, so it
  // follows the general screening assignment.
  const showImmunization = showGeneral;
  const showUnknownScreenings =
    assignedScreeningIds.length > 0 && assignedScreeningKeys.length === 0;

  const assignedEventIds = useMemo(
    () =>
      (Array.isArray(assignedEvents) ? assignedEvents : [])
        .map((event) => String(event?.id ?? "").trim())
        .filter(Boolean)
        .sort(),
    [assignedEvents],
  );

  

  const { data: campStudentMap } = useQuery({
    queryKey: ["report-camp-rosters", assignedEventIds],
    queryFn: async () => {
      const map = {};
      for (const event of Array.isArray(assignedEvents) ? assignedEvents : []) {
        const eventId = String(event?.id ?? "").trim();
        if (!eventId) continue;
        try {
          const result = await dispatch(
            getStudentByEvent({ eventId }),
          ).unwrap();
          // New paginated shape: { items: [...], total, page, perPage }
          const rows = Array.isArray(result?.items)
            ? result.items
            : Array.isArray(result)
              ? result
              : [];
          const campName = String(event?.name ?? "").trim();
          const campSchool = String(
            event?.school?.school_name ??
              event?.school?.name ??
              event?.school_name ??
              event?.schoolName ??
              "",
          ).trim();
          for (const row of Array.isArray(rows) ? rows : []) {
            const keys = [
              row?.id,
              row?.studentId,
              row?.student_id,
              row?.cus_id,
              row?.school_registration_number,
              row?.admission_number,
            ]
              .map((value) => String(value ?? "").trim())
              .filter(Boolean);
            for (const key of keys) {
              if (!map[key]) {
                map[key] = {
                  campId: eventId,
                  campName,
                  schoolName: campSchool,
                };
              }
            }
          }
        } catch {
          // One failed roster must not break the remaining camps.
        }
      }
      return map;
    },
    enabled: assignedEventIds.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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

  // Students for the dropdown + the one currently selected//
  const students = useMemo(
    () => (Array.isArray(filterPayload?.items) ? filterPayload.items : []),
    [filterPayload],
  );

  const selectedStudent = useMemo(() => {
    if (!studentId) return null;
    return (
      students.find((student) => {
        console.log(student,"studentsed");
        
        const ids = [
          student?.id,
          student?.studentId,
          student?.student_id,
          student?.cus_id,
          student?.school_registration_number,
          student?.admission_number,
        ]
          .map((value) => String(value ?? "").trim())
          .filter(Boolean);
        return ids.includes(String(studentId).trim());
      }) ?? null
    );
  }, [students, studentId]);

  console.log(selectedStudent,"selectedStudentssssssssss");
  

  const selectedStudentIds = useMemo(
    () =>
      [
        selectedStudent?.id,
        selectedStudent?.cus_id,
        selectedStudent?.student_id,
        selectedStudent?.studentId,
        selectedStudent?.school_registration_number,
        selectedStudent?.admission_number,
        studentId,
      ].filter((value) => normalizeId(value)),
    [selectedStudent, studentId],
  );

  console.log(selectedStudentIds,"ssssssssssswwwwwwww");
  

  const selectedStudentId = selectedStudentIds[0] ?? "";

  // const {
  //   campScreeningRecords = [],
  //   campVisionScreeningRecords = [],
  //   campDentalScreeningRecords = [],
  //   campHearingScreeningRecords = [],
  //   campEntScreeningRecords = [],
  // } = useAllScreeningReport({
  //   campId: String(selectedCamp?.id ?? selectedCamp?.camp_id ?? "").trim(),
  //   getId: selectedStudentId,
  // });
  const {
    generalScreeningRecord = [],
    hearingScreeningRecord = [],
    dentalScreeningRecord = [],
    visionScreeningRecord = [],
    entScreeningRecord = [],
    isLoading: screeningLoading,
  } = useScreeningRecordByFilter({
    getId: selectedStudentId,
    campId: String(
      selectedCamp?.id ??
        selectedCamp?.campId ??
        selectedCamp?.camp_id ??
        "",
    ).trim(),
    class: String(
      selectedStudent?.class ?? selectedStudent?.Class ?? "",
    ).trim(),
    section: String(
      selectedStudent?.sec ?? selectedStudent?.section ?? "",
    ).trim(),
  });
  
  console.log(generalScreeningRecord,"generalScreeningRecord", selectedStudentIds, "selectedStudentIds");
  
  const studentData = useMemo(() => {
    if (!selectedStudentId) {
      return {
        general: null,
        vision: null,
        dental: null,
        hearing: null,
        ent: null,
      };
    }

    const resolve = (record) =>
      findStudentScreeningRecord(record, selectedStudentId) ?? record ?? null;

    return {
      general: resolve(generalScreeningRecord),
      vision: resolve(visionScreeningRecord),
      dental: resolve(dentalScreeningRecord),
      hearing: resolve(hearingScreeningRecord),
      ent: resolve(entScreeningRecord),
    };
  }, [
      generalScreeningRecord,
      visionScreeningRecord,
      dentalScreeningRecord,
      hearingScreeningRecord,
      entScreeningRecord,
      selectedStudentId,
      // selectedStudentId,
    ]);

    console.log(studentData, "studentDatassssssssssssssss");

  const healthProfile = useMemo(() => {
    if (!selectedStudent) return HEALTH_PROFILE_TEMPLATE;
    const s = selectedStudent;
    const general = studentData.general;
    const vision = studentData.vision;
    const dental = studentData.dental;
    const hearing = studentData.hearing;
    const ent = studentData.ent;

    const filterSchool =
      selectedCamp?.schoolName && selectedCamp.schoolName !== "all"
        ? selectedCamp.schoolName
        : schoolName && schoolName !== "all"
          ? schoolName
          : "";
    const filterCamp =
      selectedCamp?.name && selectedCamp.name !== "all"
        ? selectedCamp.name
        : "";

    const studentCampId = String(
      s.camp_id ?? s.campId ?? s.event_id ?? s.eventId ?? "",
    ).trim();
    const studentCampEvent =
      studentCampId && Array.isArray(assignedEvents)
        ? assignedEvents.find(
            (event) => String(event?.id ?? "") === studentCampId,
          )
        : null;
    const studentCampName = String(studentCampEvent?.name ?? "").trim();
    const studentCampSchool = String(
      studentCampEvent?.school?.school_name ??
        studentCampEvent?.school?.name ??
        studentCampEvent?.school_name ??
        studentCampEvent?.schoolName ??
        "",
    ).trim();

    const studentLookupKeys = [
      s.id,
      s.studentId,
      s.student_id,
      s.cus_id,
      s.school_registration_number,
      s.admission_number,
    ]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean);
    let rosterCamp = null;
    for (const key of studentLookupKeys) {
      if (campStudentMap?.[key]) {
        rosterCamp = campStudentMap[key];
        break;
      }
    }
    const rosterCampName = String(rosterCamp?.campName ?? "").trim();
    const rosterCampSchool = String(rosterCamp?.schoolName ?? "").trim();

    const resolvedSchool =
      filterSchool ||
      studentCampSchool ||
      rosterCampSchool ||
      s.school_name ||
      s.schoolName ||
      s.school ||
      "--";
    const resolvedCamp =
      filterCamp ||
      studentCampName ||
      rosterCampName ||
      s.camp_name ||
      s.campName ||
      s.camp ||
      "--";

    return {
      ...HEALTH_PROFILE_TEMPLATE,
      assessment: {
        ...HEALTH_PROFILE_TEMPLATE.assessment,
        date: general?.created_at ?? general?.screening_date ?? HEALTH_PROFILE_TEMPLATE.assessment.date,
        location: resolvedSchool,
        camp: resolvedCamp,
        // Real signed-in examiner instead of the demo "Dr. Priya Sharma".
        examiner:
          getRecordName(general, "examiner", "examiner_name", "doctor_name") ||
          examinerName ||
          HEALTH_PROFILE_TEMPLATE.assessment.examiner,
        designation:
          getRecordName(general, "designation", "examiner_designation") ||
          HEALTH_PROFILE_TEMPLATE.assessment.designation,
        assistant:
          getRecordName(general, "assistant", "assistant_name") ||
          HEALTH_PROFILE_TEMPLATE.assessment.assistant,
      },
      student: {
        ...HEALTH_PROFILE_TEMPLATE.student,
        name: s.name ?? s.student_name ?? HEALTH_PROFILE_TEMPLATE.student.name,
        id:
          s.school_registration_number ??
          s.admission_number ??
          s.cus_id ??
          s.id ??
          HEALTH_PROFILE_TEMPLATE.student.id,
        class:
          s.Class ??
          s.class ??
          s.grade ??
          HEALTH_PROFILE_TEMPLATE.student.class,
        school: resolvedSchool,
        campName: resolvedCamp,
        dateOfBirth:
          s.dob ??
          s.date_of_birth ??
          HEALTH_PROFILE_TEMPLATE.student.dateOfBirth,
        age: s.age ?? HEALTH_PROFILE_TEMPLATE.student.age,
        gender: s.gender ?? s.Gender ?? HEALTH_PROFILE_TEMPLATE.student.gender,
        bloodGroup:
          getRecordName(general, "blood_group", "blood_group_name") ||
          getRecordName(s, "blood_group", "blood_group_name") ||
          HEALTH_PROFILE_TEMPLATE.student.bloodGroup,
      },
      vitals: {
        ...HEALTH_PROFILE_TEMPLATE.vitals,
        height: {
          ...HEALTH_PROFILE_TEMPLATE.vitals.height,
          value: formatMetric(general?.height, "cm", NOT_RECORDED),
        },
        weight: {
          ...HEALTH_PROFILE_TEMPLATE.vitals.weight,
          value: formatMetric(general?.weight, "kg", NOT_RECORDED),
        },
        bmi: {
          ...HEALTH_PROFILE_TEMPLATE.vitals.bmi,
          value: formatMetric(general?.bmi, "", NOT_RECORDED),
        },
        bloodPressure: {
          ...HEALTH_PROFILE_TEMPLATE.vitals.bloodPressure,
          value:
            getRecordName(general, "bp", "blood_pressure") || NOT_RECORDED,
        },
        pulse: {
          ...HEALTH_PROFILE_TEMPLATE.vitals.pulse,
          value: formatMetric(general?.pulse, "bpm", NOT_RECORDED),
        },
        temperature: {
          ...HEALTH_PROFILE_TEMPLATE.vitals.temperature,
          value: formatMetric(general?.temperature, "°F", NOT_RECORDED),
        },
        oxygen: {
          ...HEALTH_PROFILE_TEMPLATE.vitals.oxygen,
          value: formatMetric(general?.spo2, "%", NOT_RECORDED),
        },
      },
      immunization: {
        ...HEALTH_PROFILE_TEMPLATE.immunization,
        status: pick(general, [
          "immunization",
          "immunization_name",
          "immunization_status",
        ]),
        vaccines: pick(
          general,
          ["vaccines", "vaccine_status", "vaccination_status"],
          NOT_RECORDED,
        ),
      },

      /* ---------------- VISION — from the vision screening record -------- */
      vision: {
        ...HEALTH_PROFILE_TEMPLATE.vision,
        status: pick(vision, ["status", "overall_status", "vision_status"]),
        rightEye: {
          acuity: pick(vision, ["od_distance_with", "od_distance_without"]),
          corrected: pick(vision, ["od_distance_with"], NOT_RECORDED),
        },
        leftEye: {
          acuity: pick(vision, ["os_distance_with", "os_distance_without"]),
          corrected: pick(vision, ["os_distance_with"], NOT_RECORDED),
        },
        colorVision: pick(vision, ["color_vision_status"]),
        strabismus: toYesNoText(vision?.strabismus) || NOT_RECORDED,
        usesCorrection: toYesNoText(vision?.uses_glasses_or_lens) || NOT_RECORDED,
        remarks:
          getRecordName(
            vision,
            "od_remarks",
            "os_remarks",
            "advice_suggestions",
            "muscle_balance_remarks",
          ) || NOT_RECORDED,
      },

      /* ---------------- HEARING — from the hearing screening record ------ */
      hearing: {
        ...HEALTH_PROFILE_TEMPLATE.hearing,
        status: pick(hearing, ["overall_status", "status"]),
        rightEar: {
          status: pick(hearing, ["overall_status_re"], NOT_RECORDED),
          threshold: pick(hearing, ["pta_500hz_re"], NOT_RECORDED),
          findings: pick(hearing, ["ear_exam_re"], NOT_RECORDED),
        },
        leftEar: {
          status: pick(hearing, ["overall_status_le"], NOT_RECORDED),
          threshold: pick(hearing, ["pta_500hz_le"], NOT_RECORDED),
          findings: pick(hearing, ["ear_exam_le"], NOT_RECORDED),
        },
        whisperTest: {
          right: pick(hearing, ["whisper_test_re"], NOT_RECORDED),
          left: pick(hearing, ["whisper_test_le"], NOT_RECORDED),
          distance: pick(hearing, ["whisper_test_distance"], NOT_RECORDED),
        },
        speech: {
          right: pick(hearing, ["speech_recognition_re"], NOT_RECORDED),
          left: pick(hearing, ["speech_recognition_le"], NOT_RECORDED),
          srtRight: pick(hearing, ["srt_re"], NOT_RECORDED),
          srtLeft: pick(hearing, ["srt_le"], NOT_RECORDED),
        },
        tympanometry: {
          right: pick(hearing, ["tympanometry_re"], NOT_RECORDED),
          left: pick(hearing, ["tympanometry_le"], NOT_RECORDED),
        },
        remarks:
          getRecordName(
            hearing,
            "whisper_test_remarks",
            "ear_comments",
            "recommendation_type",
          ) || NOT_RECORDED,
      },

      /* ---------------- DENTAL — from the dental screening record -------- */
      dental: {
        ...HEALTH_PROFILE_TEMPLATE.dental,
        status: pick(dental, ["oral_hygiene", "status", "oral_health"]),
        oralHygiene: pick(dental, ["oral_hygiene", "oral_health"]),
        gingivalHealth: pick(dental, ["gingival_health", "gingivitis"]),
        plaque: pick(dental, ["plaque", "plaque_status"]),
        caries: String(dental?.caries ?? dental?.decayed ?? "").trim()
          ? String(dental?.caries ?? dental?.decayed).trim()
          : "0",
        otherIssues: String(dental?.other_issues ?? "").trim()
          ? String(dental.other_issues).trim()
          : "0",
        healthyTeeth: String(dental?.healthy_teeth ?? "").trim()
          ? String(dental.healthy_teeth).trim()
          : NOT_RECORDED,
        missingTeeth: String(dental?.missing_teeth ?? "").trim()
          ? String(dental.missing_teeth).trim()
          : "0",
        currentTooth: {
          ...HEALTH_PROFILE_TEMPLATE.dental.currentTooth,
          number: pick(dental, ["tooth_number", "current_tooth"], NOT_RECORDED),
          name: pick(dental, ["tooth_name"], NOT_RECORDED),
          status: pick(dental, ["tooth_status", "condition"], NOT_RECORDED),
          surface: pick(dental, ["surface"], NOT_RECORDED),
          severity: pick(dental, ["severity"], NOT_RECORDED),
          treatment: pick(dental, ["treatment", "recommendation"], NOT_RECORDED),
        },
        referral: {
          action: toYesNoText(dental?.referral_required) || NOT_RECORDED,
          reason: pick(dental, ["referral_reason"], NOT_RECORDED),
          followUp: pick(dental, ["follow_up_period", "follow_up"], NOT_RECORDED),
        },
        instructions: pick(dental, ["instructions", "advice"], NOT_RECORDED),
        notes: pick(dental, ["notes", "remarks"], NOT_RECORDED),
      },

      /* ---------------- ENT — from the ENT screening record -------------- */
      ent: {
        ...HEALTH_PROFILE_TEMPLATE.ent,
        status: pick(ent, ["ent_grade", "severity", "risk_level", "status"]),
        nose: pick(ent, ["nasal_breathing", "nasal_blockage", "nose_status"]),
        throat: pick(ent, ["oropharynx", "pharyngeal_wall", "throat_status"]),
        tonsils: pick(ent, ["tonsils", "tonsillar_enlargement"]),
        lymphNodes: pick(ent, ["head_neck_lymph_nodes"]),
        remarks: pick(
          ent,
          ["summary_remarks", "any_other_findings", "ear_comments"],
          NOT_RECORDED,
        ),
      },

      history: {
        ...HEALTH_PROFILE_TEMPLATE.history,
        allergies: pick(general, ["allergy", "allergy_name"], "None"),
        chronicDisease: pick(
          general,
          ["chronic_disease", "chronic_disease_name"],
          "None",
        ),
        medications:
          getRecordName(general, "regular_medication", "medications") || "None",
      },

      referral: {
        ...HEALTH_PROFILE_TEMPLATE.referral,
        required:
          general?.referral_required === true ||
          general?.referral_required === 1 ||
          general?.referral_required === "1"
            ? true
            : Boolean(vision?.referral_to_specialist),
        type:
          getRecordName(general, "referral_type") ||
          getRecordName(ent, "recommend_to") ||
          (vision?.referral_to_specialist ? "Vision specialist" : "Not required"),
        reason:
          getRecordName(general, "referral_type_notes", "referral", "referral_reason") ||
          getRecordName(vision, "referral_reason") ||
          getRecordName(dental, "referral_reason") ||
          NOT_RECORDED,
        followUp:
          getRecordName(general, "follow_up_period") ||
          getRecordName(vision, "follow_up") ||
          getRecordName(hearing, "follow_up_period") ||
          NOT_RECORDED,
      },
      clinicalNotes:
        getRecordName(
          general,
          "remarks",
          "notes",
          "clinical_notes",
        ) ||
        getRecordName(ent, "summary_remarks", "any_other_findings") ||
        NOT_RECORDED,
    };
  }, [
    selectedStudent,
    schoolName,
    selectedCamp,
    assignedEvents,
    campStudentMap,
    examinerName,
    studentData.general,
    studentData.vision,
    studentData.dental,
    studentData.hearing,
    studentData.ent,
  ]);



  /**
   * Which of the five screenings actually have a record for this student.
   * Rendered as a coverage strip so a blank card is obviously "not screened"
   * rather than a real finding.
   */
  const screeningCoverage = useMemo(() => {
    const items = [
      { key: "general", label: "General", icon: Activity, record: studentData.general },
      { key: "vision", label: "Vision", icon: Eye, record: studentData.vision },
      { key: "hearing", label: "Hearing", icon: Ear, record: studentData.hearing },
      { key: "dental", label: "Dental", icon: Activity, record: studentData.dental },
      { key: "ent", label: "ENT", icon: CircleDot, record: studentData.ent },
    ];

    return items.map((item) => ({
      ...item,
      recorded: Boolean(item.record),
    }));
  }, [studentData]);

  const recordedCount = screeningCoverage.filter((item) => item.recorded).length;

  /**
   * BMI as a real number, or null when height/weight were never recorded.
   * The value stored in `healthProfile` is the "Not recorded" placeholder in that
   * case, which must never reach the gauge or the 5xl numeral.
   */
  const bmiSummary = useMemo(() => {
    const parsed = Number.parseFloat(
      String(healthProfile.vitals.bmi.value ?? "").trim(),
    );

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { value: null, label: "", percentile: NOT_RECORDED };
    }

    const rounded = Math.round(parsed * 10) / 10;

    // Same clinical bands the general screening page uses.
    const label =
      rounded < 18.5
        ? "Underweight"
        : rounded < 25
          ? "Normal"
          : rounded < 30
            ? "Overweight"
            : "Obese";

    return {
      value: String(rounded),
      label,
      percentile: healthProfile.vitals.bmi.percentile,
    };
  }, [healthProfile.vitals.bmi.value, healthProfile.vitals.bmi.percentile]);

  const radarValues = useMemo(
    () => ({
      growth: statusToScore(healthProfile.vitals.bmi.status),
      vision: statusToScore(healthProfile.vision.status),
      hearing: statusToScore(healthProfile.hearing.status),
      dental: statusToScore(healthProfile.dental.status),
      ent: statusToScore(healthProfile.ent.status),
      immunization: statusToScore(healthProfile.immunization.status),
    }),
    [healthProfile],
  );

  const handleDownloadPdf = async () => {
    const node = reportRef.current;
    if (!node || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      // Paint the page behind the transparent report body so the PDF has no
      // transparent gaps — body already carries the theme's bg-background.
      const nodeBg = window.getComputedStyle(node).backgroundColor;
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const backgroundColor =
        nodeBg && nodeBg !== "rgba(0, 0, 0, 0)" ? nodeBg : bodyBg || "#ffffff";

      const sections = Array.from(node.children);
      const captured = [];
      const skipped = [];

      for (let index = 0; index < sections.length; index += 1) {
        const section = sections[index];
        try {
          const canvas = await html2canvas(section, {
            scale: 2,
            useCORS: true,
            backgroundColor,
            logging: false,
            onclone: (clonedDoc, clonedSection) => {
              if (!clonedSection) return;
              const originals = section.querySelectorAll("svg, svg *");
              const clones = clonedSection.querySelectorAll("svg, svg *");
              clones.forEach((cloneEl, svgIndex) => {
                const originalEl = originals[svgIndex];
                if (!originalEl) return;
                const computed = window.getComputedStyle(originalEl);
                // Resolved token colors as concrete attributes — these survive
                // SVG serialization, class-based fills do not.
                cloneEl.setAttribute("fill", computed.fill);
                cloneEl.setAttribute("stroke", computed.stroke);
                cloneEl.setAttribute("color", computed.color);
              });
            },
          });
          captured.push({
            imgData: canvas.toDataURL("image/png"),
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
          });
        } catch (sectionError) {
          console.error(
            `PDF export: section ${index + 1} failed — skipped`,
            sectionError,
          );
          skipped.push(index + 1);
        }
      }

      if (captured.length === 0) {
        throw new Error("No report sections could be rendered");
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const gap = 4;

      let pageStarted = false;
      let cursorY = margin;
      const startPage = () => {
        if (pageStarted) pdf.addPage();
        pageStarted = true;
        cursorY = margin;
      };

      for (const { imgData, canvasWidth, canvasHeight } of captured) {
        const imageHeight = (canvasHeight * contentWidth) / canvasWidth;
        if (imageHeight <= contentHeight) {
          // Section fits on a single page — flow it, breaking first if needed.
          if (!pageStarted || cursorY + imageHeight > pageHeight - margin) {
            startPage();
          }
          pdf.addImage(
            imgData,
            "PNG",
            margin,
            cursorY,
            contentWidth,
            imageHeight,
          );
          cursorY += imageHeight + gap;
        } else {
          // Section taller than one page — slice it across pages.
          let rendered = 0;
          while (rendered < imageHeight) {
            startPage();
            pdf.addImage(
              imgData,
              "PNG",
              margin,
              margin - rendered,
              contentWidth,
              imageHeight,
            );
            rendered += contentHeight;
          }
          cursorY = margin;
        }
      }

      const studentName = healthProfile?.student?.name || "student";
      pdf.save(
        `health-report-${studentName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
      );

      if (skipped.length > 0) {
        toast.warning(
          `Report downloaded, but ${skipped.length} section(s) could not be rendered`,
        );
      } else {
        toast.success("Report downloaded");
      }
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="hc-shell min-h-screen">
      <div className="sticky top-14 z-10 flex flex-col gap-3 border-b border-border/60 bg-background/85 px-0 backdrop-blur supports-backdrop-filter:bg-background/70 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 py-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm aspect-square">
              <Cross className="size-6" />
            </div>

            <div>
              {/* <h1 className="text-2xl font-semibold tracking-tight">
              Report
              </h1>

              <p className="text-sm text-muted-foreground">
                General health screening and assessment
              </p> */}
              <div>
                <h1 className="font-sf text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  Health Check Overview
                </h1>

                <div className="hc-rule mt-2.5 h-0.5 w-full rounded-full" />

                <p className="mt-2.5 text-sm text-muted-foreground">
                  Comprehensive student health assessment
                  {healthProfile.assessment.date
                    ? ` · ${healthProfile.assessment.date}`
                    : ""}
                </p>
              </div>

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
            onClick={handleDownloadPdf}
            disabled={isExportingPdf || !selectedStudent}
          >
            {isExportingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExportingPdf ? "Preparing PDF…" : "Download PDF"}
          </Button>

          {/* <Button type="button" variant="outline">
            Save & Exit
          </Button>

          <Button type="button">
            Save Report
          </Button> */}
        </div>
      </div>
      <div className="py-5">
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
      </div>

      {/* SCREENING COVERAGE — shows at a glance which screenings have real data */}
      {selectedStudent ? (
        <div className="mb-1 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Screening coverage
                </p>
                <p className="text-xs text-muted-foreground">
                  {recordedCount} of {screeningCoverage.length} screenings recorded
                  for this student
                </p>
              </div>
            </div>

            {/* Progress rail */}
            <div className="h-1.5 w-full max-w-[16rem] overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{
                  width: `${
                    (recordedCount / screeningCoverage.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {screeningCoverage.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
                    item.recorded
                      ? "border-success/30 bg-success/5"
                      : "border-dashed border-border bg-muted/30"
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 ${
                      item.recorded ? "text-success" : "text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {item.recorded ? "Recorded" : "Not screened"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {/* HEADER */}
      {/* <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />

                <h1 className="text-lg font-semibold text-foreground">
                  Health Check Overview
                </h1>
              </div>

              <p className="text-xs text-muted-foreground">
                Complete student health assessment
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <Button
              variant="outline"
              className="border-border bg-card text-muted-foreground"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>

            <Button className="bg-primary hover:bg-primary/90">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

        </div>
      </header> */}
      {selectedStudent && showUnknownScreenings ? (
  
        <div className="rounded-xl border border-dashed border-border bg-card p-6">
          <EmptyState
            title="No Screenings Assigned"
            description="This camp has no screenings assigned. Select a different camp to view the overview."
          />
        </div>
      ) : selectedStudent ? (
        /* The report page renders its content on a printable "sheet"
           (`.report-surface`: white paper, A4 width, soft shadow). Reusing the
           exact same wrapper here means the overview looks like the report on
           screen AND the html2canvas PDF export inherits the same look. */
        <main
          ref={reportRef}
          className="report-surface report-sheet space-y-6 text-foreground"
        >
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center justify-end gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md">
                <Image src="/logo.svg" alt="Svastha" width={24} height={24} />
              </span>

              <span className="font-sf text-3xl font-bold tracking-wide text-brand-blue">
                Svas
                <span className="text-brand-green">t</span>
                ha
              </span>
              <span className="text-xs text-muted-foreground">
                {"Healthy roots, rising stars"}
              </span>
            </div>

            <h6 className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0 text-primary" />
              <span className="whitespace-nowrap">
                Health Check Overview
              </span>
            </h6>
          </div>

          {/* STUDENT PROFILE */}
          {/* `report-doc__identity` already supplies the panel padding, so the
              old inner p-5 wrapper is dropped to avoid double padding. */}
          <div className="report-doc__identity">
              <div className="report-sheet__identity flex flex-col gap-5">
                <div className="flex gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UserRound className="size-8" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-foreground">
                        {healthProfile.student.name}
                      </h2>

                      <Badge className="bg-success/10 text-success">
                        {healthProfile.overall.status}
                      </Badge>
                    </div>

                    <div className="my-2 flex items-start gap-2 ">
                      <CircleDot
                        size={15}
                        className="bg-success/10 text-success"
                      />
                      {/* <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> */}
                      <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-success">
                        Assessment Complete
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {healthProfile.student.id} • Class{" "}
                      {healthProfile.student.class}
                    </p>

                    {healthProfile.student.school ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          School:
                        </span>{" "}
                        {healthProfile.student.school}
                        {healthProfile.student.campName &&
                          healthProfile.student.campName !== "--" && (
                            <>
                              {" "}
                              •{" "}
                              <span className="font-medium text-foreground">
                                Camp:
                              </span>{" "}
                              {healthProfile.student.campName}
                            </>
                          )}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>DOB: {healthProfile.student.dateOfBirth}</span>

                      <span>Age: {healthProfile.student.age}</span>

                      <span>Gender: {healthProfile.student.gender}</span>

                      <span>
                        Blood Group: {healthProfile.student.bloodGroup}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SCORE — ADDITION: HealthScoreRing added alongside the
                    existing text block, nothing original removed */}
                <div className="flex items-center gap-4 rounded-xl border border-success/20 bg-success/5 px-6 py-4">
                  <HealthScoreRing score={healthProfile.overall.score} />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Health Score
                    </p>

                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-success">
                        {healthProfile.overall.score}
                      </span>

                      <span className="pb-1 text-sm text-muted-foreground">
                        /100
                      </span>
                    </div>

                    <p className="text-xs text-success">
                      {healthProfile.overall.summary}
                    </p>
                  </div>
                </div>
              </div>
          </div>

          {/* ASSESSMENT DETAILS */}
          <FramerCard asCard className="border-border bg-card">
            <CardHeader className="hc-panel-head">
              <CardTitle className="text-base text-foreground">
                Assessment Details
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="report-sheet__grid-2 grid grid-cols-1 gap-4 py-4">
                <Result
                  label="Assessment Date"
                  value={healthProfile.assessment.date}
                />

                <Result
                  label="Camp"
                  value={healthProfile.assessment.camp || "--"}
                />

                <Result
                  label="Location"
                  value={healthProfile.assessment.location || "--"}
                />

                <Result
                  label="Examiner"
                  value={healthProfile.assessment.examiner}
                />

                <Result
                  label="Assistant"
                  value={healthProfile.assessment.assistant}
                />

                <Result
                  label="Designation"
                  value={healthProfile.assessment.designation}
                />
              </div>
            </CardContent>
          </FramerCard>

          {/* VITALS */}
          <section className="report-sheet__grid-4 grid grid-cols-2 gap-4">
            <StatCard
              icon={Activity}
              label="Height"
              value={healthProfile.vitals.height.value}
              status={healthProfile.vitals.height.status}
              color="blue"
            />

            <StatCard
              icon={HeartPulse}
              label="Weight"
              value={healthProfile.vitals.weight.value}
              status={healthProfile.vitals.weight.status}
              color="green"
            />

            <StatCard
              icon={Baby}
              label="BMI"
              value={healthProfile.vitals.bmi.value}
              status={healthProfile.vitals.bmi.status}
              color="purple"
            />

            <StatCard
              icon={ShieldCheck}
              label="Immunization"
              value={healthProfile.immunization.status}
              status="Complete"
              color="cyan"
            />
          </section>

          {/* MORE VITALS */}
          <section className="report-sheet__grid-4 grid grid-cols-2 gap-4">
            <StatCard
              icon={HeartPulse}
              label="Blood Pressure"
              value={healthProfile.vitals.bloodPressure.value}
              status={healthProfile.vitals.bloodPressure.status}
              color="red"
            />

            <StatCard
              icon={Activity}
              label="Pulse"
              value={healthProfile.vitals.pulse.value}
              status={healthProfile.vitals.pulse.status}
              color="blue"
            />

            <StatCard
              icon={Activity}
              label="Temperature"
              value={healthProfile.vitals.temperature.value}
              status={healthProfile.vitals.temperature.status}
              color="orange"
            />

            <StatCard
              icon={ShieldCheck}
              label="SpO₂"
              value={healthProfile.vitals.oxygen.value}
              status={healthProfile.vitals.oxygen.status}
              color="cyan"
            />
          </section>

          {/* MAIN CONTENT */}
          <div className="report-sheet__split grid grid-cols-1 gap-5">
            <div className="space-y-5">
              {/* GROWTH */}
              {showGeneral ? (
              <FramerCard asCard className="border-border bg-card">
                <CardHeader className="hc-panel-head">
                  <SectionTitle
                    icon={Activity}
                    title="Growth & BMI"
                    subtitle="Physical measurements and growth assessment"
                    badge="Normal"
                  />
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="report-sheet__grid-2 grid gap-4">
                    <Measurement
                      title="Height"
                      value="145"
                      unit="cm"
                      standard="Average"
                    />

                    <Measurement
                      title="Weight"
                      value="38"
                      unit="kg"
                      standard="Average"
                    />
                  </div>

                  <div className="hc-tile h-full">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          Body Mass Index
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Calculated from height and weight
                        </p>
                      </div>

                      {bmiSummary.value !== null ? (
                        <Badge className="shrink-0 bg-success/10 text-success">
                          {bmiSummary.label}
                        </Badge>
                      ) : null}
                    </div>

                    {/* The gauge and the large numeral only make sense for a real
                        numeric BMI. When height/weight were never recorded the
                        value is the "Not recorded" placeholder, and rendering that
                        at 5xl overflowed the tile — so show a quiet empty state
                        instead of a broken gauge. */}
                    {bmiSummary.value !== null ? (
                      <div className="flex flex-col items-center gap-2 py-6 sm:flex-row sm:justify-center sm:gap-8">
                        <BmiMiniGauge bmi={bmiSummary.value} />

                        <div className="text-center">
                          <p className="hc-figure text-5xl font-bold text-foreground">
                            {bmiSummary.value}
                          </p>

                          <p className="mt-2 text-xs text-muted-foreground">
                            BMI • {bmiSummary.percentile}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                        <p className="text-sm font-medium italic text-muted-foreground/70">
                          Not recorded
                        </p>

                        <p className="text-xs text-muted-foreground">
                          BMI is calculated once height and weight are entered.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </FramerCard>
              ) : null}

              {/* VISION */}
              {showVision ? (
              <FramerCard asCard className="border-border bg-card">
                <CardHeader className="hc-panel-head">
                  <SectionTitle
                    icon={Eye}
                    title="Vision Screening"
                    subtitle="Visual acuity and eye health"
                    badge={healthProfile.vision.status}
                  />
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="report-sheet__grid-2 grid gap-4">
                    <VisionCard
                      eye="Right Eye (OD)"
                      acuity={healthProfile.vision.rightEye.acuity}
                      corrected={healthProfile.vision.rightEye.corrected}
                    />

                    <VisionCard
                      eye="Left Eye (OS)"
                      acuity={healthProfile.vision.leftEye.acuity}
                      corrected={healthProfile.vision.leftEye.corrected}
                    />
                  </div>

                  <div className="report-sheet__grid-3 hc-tile grid gap-4">
                    <Result
                      label="Color Vision"
                      value={healthProfile.vision.colorVision}
                    />

                    <Result
                      label="Strabismus"
                      value={healthProfile.vision.strabismus}
                    />

                    <Result
                      label="Uses Correction"
                      value={healthProfile.vision.usesCorrection}
                    />
                  </div>

                  <Note text={healthProfile.vision.remarks} />
                </CardContent>
              </FramerCard>
              ) : null}

              {/* HEARING */}
              {showHearing ? (
              <FramerCard asCard className="border-border bg-card">
                <CardHeader className="hc-panel-head">
                  <SectionTitle
                    icon={Ear}
                    title="Hearing Screening"
                    subtitle="Audiological assessment and hearing health"
                    badge={healthProfile.hearing.status}
                  />
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="report-sheet__grid-2 grid gap-4">
                    <ScreeningResult
                      title="Right Ear"
                      value={healthProfile.hearing.rightEar.status}
                      description={healthProfile.hearing.rightEar.findings}
                    />

                    <ScreeningResult
                      title="Left Ear"
                      value={healthProfile.hearing.leftEar.status}
                      description={healthProfile.hearing.leftEar.findings}
                    />
                  </div>

                  <div className="report-sheet__grid-2 grid gap-4">
                    <InfoCard title="Whisper Test">
                      <div className="grid grid-cols-2 gap-4">
                        <Result
                          label="Right Ear"
                          value={healthProfile.hearing.whisperTest.right}
                        />

                        <Result
                          label="Left Ear"
                          value={healthProfile.hearing.whisperTest.left}
                        />
                      </div>

                      <p className="mt-4 text-xs text-muted-foreground">
                        Distance: {healthProfile.hearing.whisperTest.distance}
                      </p>
                    </InfoCard>

                    <InfoCard title="Speech Assessment">
                      <div className="grid grid-cols-2 gap-4">
                        <Result
                          label="Right"
                          value={healthProfile.hearing.speech.right}
                        />

                        <Result
                          label="Left"
                          value={healthProfile.hearing.speech.left}
                        />

                        <Result
                          label="SRT Right"
                          value={healthProfile.hearing.speech.srtRight}
                        />

                        <Result
                          label="SRT Left"
                          value={healthProfile.hearing.speech.srtLeft}
                        />
                      </div>
                    </InfoCard>
                  </div>

                  <InfoCard title="Tympanometry">
                    <div className="grid grid-cols-2 gap-4">
                      <Result
                        label="Right Ear"
                        value={healthProfile.hearing.tympanometry.right}
                      />

                      <Result
                        label="Left Ear"
                        value={healthProfile.hearing.tympanometry.left}
                      />
                    </div>
                  </InfoCard>
                </CardContent>
              </FramerCard>
              ) : null}

            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="space-y-5">
              {/* BLOOD GROUP */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader className="hc-panel-head">
                  <CardTitle className="text-base text-foreground">
                    Blood Group
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 text-xl font-bold text-destructive">
                      {healthProfile.student.bloodGroup}
                    </div>

                    <div>
                      <p className="font-medium text-foreground">
                        {healthProfile.student.bloodGroup}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Blood group recorded
                      </p>
                    </div>
                  </div>
                </CardContent>
              </FramerCard>

              {/* IMMUNIZATION */}
              {showImmunization ? (
              <FramerCard asCard className="border-border bg-card">
                <CardHeader className="hc-panel-head">
                  <SectionTitle
                    icon={Syringe}
                    title="Immunization"
                    subtitle="Vaccination status"
                    badge={healthProfile.immunization.status}
                  />
                </CardHeader>

                <CardContent className="space-y-4">
                  <StatusLine
                    label="Recommended vaccines"
                    value={healthProfile.immunization.vaccines}
                  />

                  <StatusLine
                    label="Vaccination status"
                    value={healthProfile.immunization.status}
                  />

                  <StatusLine
                    label="Next review"
                    value={healthProfile.immunization.nextReview}
                  />
                </CardContent>
              </FramerCard>
              ) : null}

              {/* HEALTH HISTORY */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader className="hc-panel-head">
                  <CardTitle className="text-base text-foreground">
                    Health History
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <HistoryItem
                    label="Allergies"
                    value={healthProfile.history.allergies}
                  />

                  <HistoryItem
                    label="Chronic Disease"
                    value={healthProfile.history.chronicDisease}
                  />

                  <HistoryItem
                    label="Previous Condition"
                    value={healthProfile.history.previousCondition}
                  />

                  <HistoryItem
                    label="Surgeries"
                    value={healthProfile.history.surgeries}
                  />

                  <HistoryItem
                    label="Medications"
                    value={healthProfile.history.medications}
                  />
                </CardContent>
              </FramerCard>

              {/* RISK FACTORS */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader className="hc-panel-head">
                  <CardTitle className="text-base text-foreground">
                    Risk Factors
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <StatusLine
                    label="Frequent Ear Infections"
                    value={healthProfile.riskFactors.earInfections}
                  />

                  <StatusLine
                    label="Speech Delay"
                    value={healthProfile.riskFactors.speechDelay}
                  />

                  <StatusLine
                    label="Learning Difficulty"
                    value={healthProfile.riskFactors.learningDifficulty}
                  />

                  <StatusLine
                    label="Family History"
                    value={healthProfile.riskFactors.familyHistory}
                  />

                  <StatusLine
                    label="Noise Exposure"
                    value={healthProfile.riskFactors.noiseExposure}
                  />
                </CardContent>
              </FramerCard>

              {/* REFERRAL */}
              <FramerCard asCard className="border-warning/30 bg-card">
                <CardHeader className="hc-panel-head">
                  <CardTitle className="text-base text-foreground">
                    Referral & Follow-up
                  </CardTitle>
                  <Badge className="bg-warning/10 text-warning w-fit">
                    {healthProfile.referral.priority}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Result label="Type" value={healthProfile.referral.type} />

                  <Result
                    label="Referred To"
                    value={healthProfile.referral.referredTo}
                  />

                  <Result
                    label="Reason"
                    value={healthProfile.referral.reason}
                  />

                  <Result
                    label="Follow-up"
                    value={healthProfile.referral.followUp}
                  />
                </CardContent>
              </FramerCard>

              {/* NOTES */}
              <FramerCard asCard className="border-border bg-card">
                <CardHeader className="hc-panel-head">
                  <CardTitle className="text-base text-foreground">
                    Clinical Notes
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="hc-tile text-sm leading-6 text-foreground/80">
                    {healthProfile.clinicalNotes}
                  </p>
                </CardContent>
              </FramerCard>
            </aside>
          </div>
           {/* DENTAL */}
           {showDental ? (
              <FramerCard asCard className="border-border bg-card">
                <CardHeader className="hc-panel-head">
                  <SectionTitle
                    icon={HeartPulse}
                    title="Dental Screening"
                    subtitle="Oral and dental examination"
                    badge={healthProfile.dental.status}
                  />
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="report-sheet__grid-3 grid gap-4">
                    <ScreeningResult
                      title="Oral Hygiene"
                      value={healthProfile.dental.oralHygiene}
                      description="Overall oral hygiene"
                    />

                    <ScreeningResult
                      title="Gingival Health"
                      value={healthProfile.dental.gingivalHealth}
                      description="Gum health"
                    />

                    <ScreeningResult
                      title="Plaque"
                      value={healthProfile.dental.plaque}
                      description="Plaque assessment"
                    />
                  </div>

                  <div className="report-sheet__grid-4 grid grid-cols-2 gap-3">
                    <SummaryValue
                      label="Caries"
                      value={healthProfile.dental.caries}
                    />

                    <SummaryValue
                      label="Other Issues"
                      value={healthProfile.dental.otherIssues}
                    />

                    <SummaryValue
                      label="Healthy"
                      value={healthProfile.dental.healthyTeeth}
                    />

                    <SummaryValue
                      label="Missing"
                      value={healthProfile.dental.missingTeeth}
                    />
                  </div>

                  <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
                    <p className="text-xs text-muted-foreground">
                      Current Tooth
                    </p>

                    <h3 className="mt-1 font-semibold text-foreground">
                      Tooth {healthProfile.dental.currentTooth.number}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({healthProfile.dental.currentTooth.name})
                      </span>
                    </h3>

                    <div className="report-sheet__grid-4 mt-4 grid grid-cols-2 gap-4">
                      <Result
                        label="Status"
                        value={healthProfile.dental.currentTooth.status}
                      />

                      <Result
                        label="Surface"
                        value={healthProfile.dental.currentTooth.surface}
                      />

                      <Result
                        label="Severity"
                        value={healthProfile.dental.currentTooth.severity}
                      />

                      <Result
                        label="Treatment"
                        value={healthProfile.dental.currentTooth.treatment}
                      />
                    </div>
                  </div>

                  <InfoCard title="Dental Referral">
                    <div className="report-sheet__grid-3 grid gap-4">
                      <Result
                        label="Recommended Action"
                        value={healthProfile.dental.referral.action}
                      />

                      <Result
                        label="Reason"
                        value={healthProfile.dental.referral.reason}
                      />

                      <Result
                        label="Follow-up"
                        value={healthProfile.dental.referral.followUp}
                      />
                    </div>
                  </InfoCard>
                </CardContent>
              </FramerCard>
           ) : null}

              {/* ENT */}
              {showEnt ? (
              <FramerCard asCard className="border-border bg-card">
                <CardHeader className="hc-panel-head">
                  <SectionTitle
                    icon={Activity}
                    title="ENT Screening"
                    subtitle="Ear, nose and throat assessment"
                    badge={healthProfile.ent.status}
                  />
                </CardHeader>

                <CardContent>
                  <div className="report-sheet__grid-4 grid grid-cols-2 gap-4 pb-4">
                    <Result label="Nose" value={healthProfile.ent.nose} />

                    <Result label="Throat" value={healthProfile.ent.throat} />

                    <Result label="Tonsils" value={healthProfile.ent.tonsils} />

                    <Result
                      label="Lymph Nodes"
                      value={healthProfile.ent.lymphNodes}
                    />
                  </div>

                  <Note text={healthProfile.ent.remarks} />
                </CardContent>
              </FramerCard>
              ) : null}

          {/* FINAL ASSESSMENT */}
          <FramerCard asCard className="border-border bg-card">
            <CardHeader className="hc-panel-head">
              <SectionTitle
                icon={CheckCircle2}
                title="Overall Assessment"
                subtitle="Summary of complete health screening"
                badge="Healthy"
              />
            </CardHeader>

            <CardContent>
              {/* ADDITION: radar chart summarizing all six systems at a
                  glance, placed above the existing grid — the grid below
                  is completely unchanged */}
              <div className="mb-6 flex justify-center">
                <SystemsRadarChart
                  values={radarValues}
                  assignedScreeningKeys={assignedScreeningKeys}
                />
              </div>

              <div className="report-sheet__grid-3 grid grid-cols-2 gap-3">
                {showGeneral ? (
                  <OverallItem title="Growth" value="Normal" />
                ) : null}
                {showVision ? (
                  <OverallItem title="Vision" value="Normal" />
                ) : null}
                {showHearing ? (
                  <OverallItem title="Hearing" value="Normal" />
                ) : null}
                {showDental ? (
                  <OverallItem title="Dental" value="Good" />
                ) : null}
                {showEnt ? <OverallItem title="ENT" value="Normal" /> : null}
                {showImmunization ? (
                  <OverallItem title="Immunization" value="Up to date" />
                ) : null}
              </div>

              <Separator className="my-5 bg-muted" />

              <h3 className="text-sm font-semibold text-foreground">
                Recommendations
              </h3>

              <ul className="report-sheet__grid-2 mt-3 grid gap-3">
                {healthProfile.recommendations.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="report-sheet__grid-2 relative mt-7 grid grid-cols-1 items-center gap-6 border-t border-border pt-5 sm:items-end">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Examined by</p>

                  <p className="mt-1 font-medium break-words text-foreground">
                    {healthProfile.assessment.examiner}
                  </p>

                  <p className="text-xs break-words text-muted-foreground">
                    {healthProfile.assessment.designation}
                  </p>
                </div>

                
                

                
                <div className="relative min-w-0 justify-self-center text-center sm:justify-self-end sm:text-right">
                  <div className="absolute right-3/4 z-1 flex size-28 shrink-0 flex-col items-center justify-center gap-0.5 justify-self-center rounded-full border-2 border-dashed border-primary/40 p-2 text-center rotate-325 sm:size-32">
                  <Image src="/logo.svg" alt="Svastha" width={26} height={26} />

                  <span className="font-sf text-xs font-bold tracking-wide text-brand-blue">
                    Svastha
                  </span>

                  <span className="text-[8px] leading-tight tracking-[0.14em] text-primary">
                    Authorized Signatory
                  </span>

                  <span className="text-[8px] leading-tight text-muted-foreground text-brand-green">
                    SMS
                  </span>
                </div>
                  <div className="relative mx-auto h-28 w-72 max-w-full sm:h-32 sm:w-80">
                    {doctorSignatureUrl ? (
                      <Image
                        src={doctorSignatureUrl}
                        alt={`Signature of ${healthProfile.assessment.examiner}`}
                        fill
                        sizes="(max-width: 640px) 200px, 20rem"
                        unoptimized
                        className="object-contain"
                      />
                    ) : (
                      <p className="font-serif text-2xl italic text-primary">
                        {examinerName || healthProfile.assessment.examiner}
                      </p>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {healthProfile.assessment.date}
                  </p>
                </div>
              </div>
            </CardContent>
          </FramerCard>
        </main>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-6">
          <EmptyState
            title="No Report Data"
            description="Select a Student to get the Report"
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
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function StatCard({ icon: Icon, label, value, status, color }) {
  const styles = {
    blue: "bg-primary/10 text-primary",
    green: "bg-success/10 text-success",
    purple: "bg-primary/10 text-primary",
    cyan: "bg-info/10 text-info",
    red: "bg-destructive/10 text-destructive",
    orange: "bg-warning/10 text-warning",
  };

  return (
    /* Mirrors the report's `status-card`: compact tile, hairline rule between
       the label and the figure, soft top-edge lift instead of a heavy shadow
       (a heavy shadow muddies up in the html2canvas PDF rasterisation). */
    <div className="hc-tile group border">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex size-8 items-center justify-center rounded-lg ${styles[color]}`}
        >
          {Icon ? <Icon className="size-4" /> : null}
        </div>

        {status ? (
          <span className="report-doc__badge rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
            {status}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-[10px] font-semibold tracking-[0.07em] text-muted-foreground uppercase">
        {label}
      </p>

      <p className="hc-figure mt-1 text-xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, badge }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="report-doc__heading">
        {Icon ? (
          <span className="flex size-5 shrink-0 items-center justify-center text-primary">
            <Icon className="size-4" />
          </span>
        ) : null}

        <div className="flex flex-col gap-0">
          <span>{title}</span>

        {subtitle ? (
          <span className=" text-[10px] font-medium tracking-normal normal-case text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
        </div>
      </div>

      {badge ? (
        <Badge className="report-doc__badge shrink-0 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
          {badge}
        </Badge>
      ) : null}
    </div>
  );
}

function Measurement({ title, value, unit, standard }) {
  // `value` is the "Not recorded" placeholder when the vitals were never
  // entered. Render it at body size so the long word can never blow out the
  // 3xl numeral slot and overflow the tile.
  const isEmpty =
    value === NOT_RECORDED ||
    value === "--" ||
    value === null ||
    value === undefined ||
    value === "";

  return (
    <div className="hc-tile hc-tile--accent">
      <p className="text-[10px] font-semibold tracking-[0.07em] text-muted-foreground uppercase">
        {title}
      </p>

      {isEmpty ? (
        <p className="mt-2 text-lg font-medium italic text-muted-foreground/60">
          Not recorded
        </p>
      ) : (
        <p className="hc-figure mt-2 text-3xl font-semibold text-foreground">
          {value}{" "}
          <span className="text-sm font-normal text-muted-foreground">{unit}</span>
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
        <span className="text-xs text-muted-foreground">Standard</span>

        <span className="truncate rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
          {standard ?? "—"}
        </span>
      </div>
    </div>
  );
}

function VisionCard({ eye, acuity, corrected }) {
  // Same guard as Measurement: acuity is the "Not recorded" placeholder when
  // the vision screening was never done, and at 4xl that long word overflows.
  const acuityEmpty =
    acuity === NOT_RECORDED ||
    acuity === "--" ||
    acuity === null ||
    acuity === undefined ||
    acuity === "";

  return (
    <div className="hc-tile hc-tile--accent">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {/* ADDITION: small colored eye status badge, classified from the
              acuity value — text content below is completely unchanged */}
          <EyeStatusBadge acuity={acuity} />
          <p className="truncate text-sm font-medium text-foreground">{eye}</p>
        </div>

        <Badge className="shrink-0 rounded-full bg-success/10 text-success">Normal</Badge>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Visual Acuity</p>

          {acuityEmpty ? (
            <p className="mt-1 text-lg font-medium italic text-muted-foreground/60">
              Not recorded
            </p>
          ) : (
            <p className="hc-figure mt-1 text-4xl font-bold text-foreground">
              {acuity}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">Corrected</p>

          <p className="mt-1 text-sm font-medium text-foreground">
            {corrected ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScreeningResult({ title, value, description }) {
  return (
    <div className="hc-tile flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>

        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      <Badge className="shrink-0 rounded-full bg-success/10 text-success">
        {value}
      </Badge>
    </div>
  );
}

function Result({ label, value }) {
  // Values that fell through to the NOT_RECORDED placeholder are dimmed so a
  // genuinely blank field is never mistaken for a real clinical finding.
  const isEmpty =
    value === NOT_RECORDED ||
    value === "--" ||
    value === null ||
    value === undefined ||
    value === "";

  return (
    /* Report-style key/value row: hairline separated, label in small caps —
       the same language the report uses in its summary tables. */
    <div className="min-w-0 border-t border-border/60 pt-2">
      <p className="text-[10px] font-semibold tracking-[0.07em] text-muted-foreground uppercase">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-medium ${
          isEmpty ? "italic text-muted-foreground/60" : "text-foreground"
        }`}
      >
        {isEmpty ? "Not recorded" : value}
      </p>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="hc-panel">
      <div className="hc-panel-head">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <div className="hc-rule mt-2 h-0.5 w-10 rounded-full" />
      </div>

      <div className="p-4">{children}</div>
    </div>
  );
}

function Note({ text }) {
  return (
    <div className="hc-tile hc-tile--accent border-warning/30 bg-warning/5">
      <p className="text-xs font-medium tracking-wide text-warning uppercase">
        Remarks
      </p>

      <p className="mt-1.5 text-sm text-foreground/80">{text}</p>
    </div>
  );
}

function StatusLine({ label, value }) {
  return (
    <div className="flex justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>

      <span className="text-xs text-success">{value}</span>
    </div>
  );
}

function HistoryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>

      <div className="mt-1.5 rounded-lg border border-border/70 bg-card/60 px-3 py-2">
        <p className="text-sm text-foreground/80">{value}</p>
      </div>
    </div>
  );
}

function SummaryValue({ label, value }) {
  return (
    <div className="hc-tile text-center">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>

      <p className="hc-figure mt-1.5 text-2xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function OverallItem({ title, value }) {
  return (
    <div className="hc-tile flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </p>

        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>

      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="size-4 text-success" />
      </span>
    </div>
  );
}

/* =========================================================
   NEW: SVG VISUALIZATION COMPONENTS
   All additive — nothing above this line was removed to make room
   for these; they're purely new components wired in at four spots.
========================================================= */

// Maps a status word to a 0-100 score, used only for the radar chart's
// visual scale — doesn't touch or replace the original status strings
// anywhere else in the report.
function statusToScore(status) {
  const s = (status ?? "").toString().toLowerCase();
  if (
    [
      "normal",
      "good",
      "up to date",
      "healthy",
      "complete",
      "completed",
    ].includes(s)
  )
    return 100;
  if (["mild", "fair"].includes(s)) return 75;
  if (["moderate"].includes(s)) return 55;
  if (!s) return 40;
  return 35;
}

// Circular progress ring for the overall health score (0–100).
function HealthScoreRing({ score, size = 96 }) {
  const clamped = Math.min(Math.max(Number(score) || 0, 0), 100);
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);

  const tone =
    clamped >= 80 ? "success" : clamped >= 50 ? "warning" : "destructive";
  const strokeClass = {
    success: "stroke-success",
    warning: "stroke-warning",
    destructive: "stroke-destructive",
  }[tone];
  const fillClass = {
    success: "fill-success",
    warning: "fill-warning",
    destructive: "fill-destructive",
  }[tone];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-muted"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className={strokeClass}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        dominantBaseline="middle"
        className={`${fillClass} font-bold`}
        style={{ fontSize: size * 0.26 }}
      >
        {clamped}
      </text>
      <text
        x="50%"
        y="68%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground"
        style={{ fontSize: size * 0.1 }}
      >
        / 100
      </text>
    </svg>
  );
}

// Semicircle BMI gauge — value range 10–35, colored by clinical band.
function BmiMiniGauge({ bmi, size = 150 }) {
  const value = parseFloat(bmi);
  const min = 10;
  const max = 35;
  const hasValue = !Number.isNaN(value);
  const clamped = hasValue ? Math.min(Math.max(value, min), max) : min;
  const angle = ((clamped - min) / (max - min)) * 180;

  const cx = size / 2;
  const cy = size * 0.6;
  const r = size * 0.42;
  const strokeWidth = size * 0.07;

  function polarToCartesian(a) {
    const rad = ((a - 180) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const start = polarToCartesian(0);
  const end = polarToCartesian(180);
  const needleTip = polarToCartesian(angle);

  const tone = !hasValue
    ? "muted"
    : value < 18.5
      ? "info"
      : value < 25
        ? "success"
        : value < 30
          ? "warning"
          : "destructive";
  const toneStroke = {
    muted: "stroke-muted-foreground",
    info: "stroke-info",
    success: "stroke-success",
    warning: "stroke-warning",
    destructive: "stroke-destructive",
  }[tone];
  const toneFill = {
    muted: "fill-muted-foreground",
    info: "fill-info",
    success: "fill-success",
    warning: "fill-warning",
    destructive: "fill-destructive",
  }[tone];

  return (
    <svg
      width={size}
      height={size * 0.65}
      viewBox={`0 0 ${size} ${size * 0.65}`}
      className="shrink-0"
    >
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
        fill="none"
        className="stroke-muted"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {hasValue && (
        <>
          <line
            x1={cx}
            y1={cy}
            x2={needleTip.x}
            y2={needleTip.y}
            className={toneStroke}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={4} className={toneFill} />
        </>
      )}
    </svg>
  );
}

// Six-axis radar chart summarizing Growth / Vision / Hearing / Dental /
// ENT / Immunization at a glance.
const RADAR_AXES = [
  { key: "growth", label: "Growth", screening: "general" },
  { key: "vision", label: "Vision", screening: "vision" },
  { key: "hearing", label: "Hearing", screening: "hearing" },
  { key: "dental", label: "Dental", screening: "dental" },
  { key: "ent", label: "ENT", screening: "ent" },
  { key: "immunization", label: "Immun.", screening: "general" },
];

function SystemsRadarChart({ values, size = 260, assignedScreeningKeys = [] }) {
  // Only plot the systems this camp actually ran, so the chart never advertises
  // a screening that is hidden from the page. Empty list = plot everything.
  const assignedAxes = assignedScreeningKeys.length
    ? RADAR_AXES.filter((axis) =>
        assignedScreeningKeys.includes(axis.screening),
      )
    : RADAR_AXES;

  // A radar polygon needs at least 3 axes to read as a shape — a 1 or 2 axis
  // camp degenerates into a line, so fall back to the full set.
  const axes = assignedAxes.length >= 3 ? assignedAxes : RADAR_AXES;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 34;
  const n = axes.length;
  const angleStep = (Math.PI * 2) / n;

  function pointAt(index, fraction) {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = fraction * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const ringLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = axes.map((axis, i) =>
    pointAt(i, (values[axis.key] ?? 0) / 100),
  );
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {ringLevels.map((level) => {
        const ringPoints = axes.map((_, i) => {
          const p = pointAt(i, level);
          return `${p.x},${p.y}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={ringPoints}
            fill="none"
            className="stroke-border"
            strokeWidth={1}
          />
        );
      })}

      {axes.map((axis, i) => {
        const edge = pointAt(i, 1);
        return (
          <line
            key={axis.key}
            x1={cx}
            y1={cy}
            x2={edge.x}
            y2={edge.y}
            className="stroke-border"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={polygonPoints}
        className="fill-primary/15 stroke-primary"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle
          key={axes[i].key}
          cx={p.x}
          cy={p.y}
          r={3.5}
          className="fill-primary"
        />
      ))}

      {axes.map((axis, i) => {
        const label = pointAt(i, 1.18);
        return (
          <text
            key={axis.key}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 11, fontWeight: 500 }}
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}

// Small colored eye glyph, classified from a Snellen-style acuity string
// (e.g. "6/6", "6/18") — purely decorative, sits next to the eye label.
function EyeStatusBadge({ acuity, size = 26 }) {
  const match = /^6\/(\d+)/.exec((acuity ?? "").trim());
  const ratio = match ? Number(match[1]) / 6 : null;
  const tone =
    ratio == null
      ? "muted"
      : ratio <= 1.2
        ? "success"
        : ratio <= 2
          ? "info"
          : ratio <= 4
            ? "warning"
            : "destructive";
  const toneClass = {
    muted: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success",
    info: "bg-info/15 text-info",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/15 text-destructive",
  }[tone];

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${toneClass}`}
      style={{ width: size, height: size }}
    >
      <Eye
        style={{ width: size * 0.55, height: size * 0.55 }}
        strokeWidth={2.25}
      />
    </span>
  );
}
