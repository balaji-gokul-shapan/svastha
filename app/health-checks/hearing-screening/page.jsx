"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity,
  Ear,
  EarOff,
  Headphones,
  Loader2,
  Mic,
  Radio,
  Save,
  Search,
  ShieldAlert,
  Stethoscope,
  User,
  Volume2,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CampStudentSelectorDrawer from "@/components/health-checks/camp-student-selector-drawer";
import useStudentData from "@/components/health-checks/getStudentData";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getHearingScreening } from "@/lib/features/getHearingScreening";
import AssessmentCard from "@/app/ui/AssessmentCard";
import { EmptyState } from "@/components/ui/empty-state";
import StudentProfileCard from "@/app/students/studentProfileCard";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import StudentFilter from "../utilities/studentFilter";
import { createHearingScreening } from "@/lib/features/registerHearingScreening";
import { FramerCard } from "@/util/FramerCard";
import { hearingScreeningSchema } from "./datas/hearningSchema";
import { getMasterData } from "@/util/masterData";
import { getAllMasterScreening } from "@/lib/features/masterScreeningSlice";
import { selectAuthUser } from "@/lib/features/auth-slice";
import { getAssignEvent } from "@/lib/features/getEventAssignSlice";
import ScreeningStepper from "@/components/ScreeningStepper";

const HearingSectionLoading = () => (
  <div className="min-h-24 rounded-xl border border-border bg-card p-4" />
);

const HearingSummary = dynamic(() => import("./components/HearingSummary"), {
  loading: HearingSectionLoading,
});
const HearingQuickFinding = dynamic(
  () => import("./components/HearingQuickFinding"),
  { loading: HearingSectionLoading },
);
const AudioGramCard = dynamic(() => import("./components/AudioGramCard"), {
  loading: HearingSectionLoading,
});
const WhishperTest = dynamic(() => import("./components/WhishperTest"), {
  loading: HearingSectionLoading,
});
const RiskFactors = dynamic(() => import("./components/RiskFactors"), {
  loading: HearingSectionLoading,
});
const EarHealth = dynamic(() => import("./components/EarHealth"), {
  loading: HearingSectionLoading,
});
const EarExaminationCard = dynamic(
  () => import("./components/EarExaminationCard"),
  { loading: HearingSectionLoading },
);
const Tympanomentry = dynamic(() => import("./components/Tympanomentry"), {
  loading: HearingSectionLoading,
});
const Review = dynamic(() => import("./components/Review"), {
  loading: HearingSectionLoading,
});

const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000];

const HEARING_STEPS = [
  {
    value: "audiometry",
    label: "Pure Tone Audiometry",
    shortLabel: "Audiometry",
  },
  { value: "whisper", label: "Whisper Test", shortLabel: "Whisper" },
  {
    value: "risk",
    label: "Risk Factors & Referral",
    shortLabel: "Risk Factors",
  },
  { value: "ear", label: "Ear Health & Exam", shortLabel: "Ear Exam" },
  { value: "tympanometry", label: "Tympanometry", shortLabel: "Tympanometry" },
  { value: "review", label: "Review & Submit", shortLabel: "Review" },
];

export default function HearingScreening({ screening = {} }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const authUser = useAppSelector(selectAuthUser);

  const [form, setForm] = React.useState({
    pta_250hz_re: screening.pta_250hz_re ?? "",
    pta_250hz_le: screening.pta_250hz_le ?? "",

    pta_500hz_re: screening.pta_500hz_re ?? "",
    pta_500hz_le: screening.pta_500hz_le ?? "",

    pta_1000hz_re: screening.pta_1000hz_re ?? "",
    pta_1000hz_le: screening.pta_1000hz_le ?? "",

    pta_2000hz_re: screening.pta_2000hz_re ?? "",
    pta_2000hz_le: screening.pta_2000hz_le ?? "",

    pta_4000hz_re: screening.pta_4000hz_re ?? "",
    pta_4000hz_le: screening.pta_4000hz_le ?? "",

    pta_8000hz_re: screening.pta_8000hz_re ?? "",
    pta_8000hz_le: screening.pta_8000hz_le ?? "",

    whisper_test_re: screening.whisper_test_re ?? "",
    whisper_test_le: screening.whisper_test_le ?? "",
    whisper_test_distance: screening.whisper_test_distance ?? "",
    whisper_test_remarks: screening.whisper_test_remarks ?? "",

    tympanometry_re: screening.tympanometry_re ?? "",
    tympanometry_le: screening.tympanometry_le ?? "",

    ear_exam_re: screening.ear_exam_re ?? "",
    ear_exam_le: screening.ear_exam_le ?? "",

    speech_recognition_re: screening.speech_recognition_re ?? "",

    speech_recognition_le: screening.speech_recognition_le ?? "",

    srt_re: screening.srt_re ?? "",
    srt_le: screening.srt_le ?? "",

    risk_frequent_ear_infections: screening.risk_frequent_ear_infections ?? "",

    risk_speech_delay: screening.risk_speech_delay ?? "",

    risk_learning_difficulty: screening.risk_learning_difficulty ?? "",

    risk_family_history_hearing_loss:
      screening.risk_family_history_hearing_loss ?? "",

    risk_noise_exposure: screening.risk_noise_exposure ?? "",

    risk_others: screening.risk_others ?? "",

    overall_status_re: screening.overall_status_re ?? "",

    overall_status_le: screening.overall_status_le ?? "",

    overall_status: screening.overall_status ?? "",

    referral_grade: screening.referral_grade ?? "",

    recommendation_type: screening.recommendation_type ?? "",

    recommended_to: screening.recommended_to ?? "",

    referral_priority: screening.referral_priority ?? "",

    referral_reason: screening.referral_reason ?? "",

    follow_up: screening.follow_up ?? "",
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
  const requiredMasterData = React.useMemo(
    () =>
      getMasterData(masterScreeningData, [
        "hearing-classifications",
        "hearing-referral-reasons",
        "ear-examinations",
      ]),
    [masterScreeningData],
  );
  // Hearing referral reasons → dropdown option names for the select.
  const referralReasonOptions = (
    requiredMasterData["hearing-referral-reasons"] ?? []
  )
    .map((item) => String(item?.name ?? "").trim())
    .filter(Boolean);

  const examinationOptions = (requiredMasterData["ear-examinations"] ?? [])
    .map((item) => String(item?.name ?? "").trim())
    .filter(Boolean);

  // Hearing classifications → used to classify the pure-tone average.
  const hearingClassifications =
    requiredMasterData["hearing-classifications"] ?? [];

  // Pure-tone average (500 / 1000 / 2000 Hz) for one ear, from the
  // thresholds entered in the audiogram.
  const pureToneAverage = React.useCallback(
    (ear) => {
      const keys = [
        `pta_500hz_${ear}`,
        `pta_1000hz_${ear}`,
        `pta_2000hz_${ear}`,
      ];
      const values = keys
        .map((key) => Number.parseFloat(String(form[key] ?? "")))
        .filter((n) => Number.isFinite(n));
      if (!values.length) return null;
      return values.reduce((sum, n) => sum + n, 0) / values.length;
    },
    [form],
  );

  // Match the PTA against the master-data [min_db, max_db] bands.
  const classifyPta = React.useCallback(
    (pta) => {
      if (!Number.isFinite(pta)) return null;
      return (
        hearingClassifications.find(
          (item) =>
            pta >= Number(item.min_db ?? -Infinity) &&
            pta <= Number(item.max_db ?? Infinity),
        ) ?? null
      );
    },
    [hearingClassifications],
  );

  const reHearingResult = React.useMemo(() => {
    const pta = pureToneAverage("re");
    return { pta, classification: classifyPta(pta) };
  }, [pureToneAverage, classifyPta]);

  const leHearingResult = React.useMemo(() => {
    const pta = pureToneAverage("le");
    return { pta, classification: classifyPta(pta) };
  }, [pureToneAverage, classifyPta]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear that field's error as soon as the user fixes it.
    setFormErrors((prev) =>
      prev && prev[field] ? { ...prev, [field]: undefined } : prev,
    );
  };

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

     return /<!doctype html|<html[\s>]/i.test(String(message)) ||
    String(message).length > 240
    ? "Unable to save screening. Please try again."
    : String(message);
  // );
}

  // { fieldName: "message" } — populated when zod validation fails.
  const [formErrors, setFormErrors] = React.useState(null);

  const handleSave = (e) => {
    const rawStudentId =
      selectedStudent?.id ??
      selectedStudent?.cus_id ??
      selectedStudent?.student_id ??
      selectedStudent?.studentId ??
      studentId;
    if (!String(rawStudentId ?? "").trim()) {
      toast.error("Select a student before saving the hearing screening.");
      return;
    }
    const result = hearingScreeningSchema.safeParse(form);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      // Reduce to { fieldName: firstMessage } for inline display.
      const firstPerField = Object.fromEntries(
        Object.entries(errors)
          .map(([field, messages]) => [field, messages?.[0]])
          .filter(([, message]) => Boolean(message)),
      );

      setFormErrors(firstPerField);

      // Keep the toast as a fallback summary.
      const firstError = Object.values(firstPerField).find(Boolean);
      toast.error(firstError || "Please fill all required fields.");

      return;
    } else {
      setFormErrors(null);
    }
    if (!String(rawStudentId ?? "").trim()) {
      toast.error("Select a student before saving the hearing screening.");
      return;
    }

    e.preventDefault();

    const data = {
      student_id: Number(rawStudentId) || 0,
      camp_id:
        Number(selectedCampId) ||
        Number(selectedStudent?.camp_id ?? selectedStudent?.campId) ||
        0,

      ...screening,
      ...form,
    };
 setIsSaving(true);
    dispatch(createHearingScreening(data))
      .unwrap()
      .then(() => {
         setIsSaving(false);
        // Refresh the react-query cache; the ["hearing-screening"] query's
        // queryFn re-dispatches getHearingScreening, keeping Redux in sync.
        queryClient.invalidateQueries({ queryKey: ["hearing-screening"] });

        toast.success("Hearing screening saved successfully", {
          description: selectedStudent?.name
            ? `Record saved for ${selectedStudent.name}`
            : undefined,
        });
      })
      .catch((error) => {
         setIsSaving(false);
        console.error("Unable to save hearing screening:", error);

        toast.error("Failed to save hearing screening", {
          description:
           getBackendErrorMessage(error),
        });
      });
  };

  const [isCaDrawerOpen, setIsCaDrawerOpen] = React.useState(false);
  const [selectedCampId, setSelectedCampId] = React.useState(1);
  const [studentId, setStudentId] = React.useState("");
  const [academicYear, setAcademicYear] = React.useState("2026-2027");
  const [selectedClassFilter, setSelectedClassFilter] = React.useState("all");
  const [selectedSectionFilter, setSelectedSectionFilter] =
    React.useState("all");
  const [schoolName, setSchoolName] = React.useState("all");
  const [classFilter, setClassFilter] = React.useState("all");
  const [sectionFilter, setSectionFilter] = React.useState("all");
  const [studentFilter, setStudentFilter] = React.useState("all");
  const [getStudentDataByEvent, setGetStudentDataByEvent] = React.useState([]);
    const [isSaving, setIsSaving] = useState(false);
  
  const {
    data: hearingScreeningData = [],
    isLoading: hearingScreeningLoading,
    error: hearingScreeningQueryError,
  } = useQuery({
    queryKey: ["hearing-screening", studentId],
    queryFn: () => dispatch(getHearingScreening({ studentId })).unwrap(),
    enabled: Boolean(String(studentId).trim()),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

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

  // const getData = useStudentData(selectedCampId);

  // const camps = React.useMemo(
  //   () => (Array.isArray(getData.campsData) ? getData.campsData : []),
  //   [getData.campsData],
  // );

  // const campOptions = React.useMemo(() => {
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
  // console.log(campOptions, "campOptions");

  // const campStudents = React.useMemo(() => {
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
  // console.log(campStudents, "campStudents");

  // const academicYears = React.useMemo(() => {
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

  // const activeAcademicYear = React.useMemo(() => {
  //   if (!selectedCampId) {
  //     return "";
  //   }

  //   if (academicYears.includes(academicYear)) {
  //     return academicYear;
  //   }

  //   return academicYears[0] ?? "";
  // }, [academicYear, academicYears, selectedCampId]);

  // const classOptions = React.useMemo(() => {
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

  // const sectionOptions = React.useMemo(() => {
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

  // const normalizedCampStudents = React.useMemo(() => {
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

  // const filteredStudents = React.useMemo(() => {
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

  // const findScreeningRecordByKeys = React.useCallback(
  //   (keys) =>
  //     hearingScreeningData.find((record) => {
  //       const recordKeys = [
  //         record?.id,
  //         record?.studentId,
  //         record?.student_id,
  //         record?.school_registration_number,
  //         record?.admission_number,
  //       ]
  //         .map((value) => String(value ?? "").trim())
  //         .filter(Boolean);

  //       return recordKeys.some((key) => keys.has(key));
  //     }),
  //   [hearingScreeningData],
  // );

  const applyScreeningRecordToForm = (screeningRecord) => {
    const record = screeningRecord ?? {};

    setForm({
      pta_250hz_re: String(record?.pta_250hz_re ?? ""),
      pta_250hz_le: String(record?.pta_250hz_le ?? ""),
      pta_500hz_re: String(record?.pta_500hz_re ?? ""),
      pta_500hz_le: String(record?.pta_500hz_le ?? ""),
      pta_1000hz_re: String(record?.pta_1000hz_re ?? ""),
      pta_1000hz_le: String(record?.pta_1000hz_le ?? ""),
      pta_2000hz_re: String(record?.pta_2000hz_re ?? ""),
      pta_2000hz_le: String(record?.pta_2000hz_le ?? ""),
      pta_4000hz_re: String(record?.pta_4000hz_re ?? ""),
      pta_4000hz_le: String(record?.pta_4000hz_le ?? ""),
      pta_8000hz_re: String(record?.pta_8000hz_re ?? ""),
      pta_8000hz_le: String(record?.pta_8000hz_le ?? ""),
      whisper_test_re: String(record?.whisper_test_re ?? ""),
      whisper_test_le: String(record?.whisper_test_le ?? ""),
      whisper_test_distance: String(record?.whisper_test_distance ?? ""),
      whisper_test_remarks: String(record?.whisper_test_remarks ?? ""),
      tympanometry_re: String(record?.tympanometry_re ?? ""),
      tympanometry_le: String(record?.tympanometry_le ?? ""),
      ear_exam_re: String(record?.ear_exam_re ?? ""),
      ear_exam_le: String(record?.ear_exam_le ?? ""),
      speech_recognition_re: String(record?.speech_recognition_re ?? ""),
      speech_recognition_le: String(record?.speech_recognition_le ?? ""),
      srt_re: String(record?.srt_re ?? ""),
      srt_le: String(record?.srt_le ?? ""),
      risk_frequent_ear_infections: String(
        record?.risk_frequent_ear_infections ?? "",
      ),
      risk_speech_delay: String(record?.risk_speech_delay ?? ""),
      risk_learning_difficulty: String(record?.risk_learning_difficulty ?? ""),
      risk_family_history_hearing_loss: String(
        record?.risk_family_history_hearing_loss ?? "",
      ),
      risk_noise_exposure: String(record?.risk_noise_exposure ?? ""),
      risk_others: String(record?.risk_others ?? ""),
      overall_status_re: String(record?.overall_status_re ?? ""),
      overall_status_le: String(record?.overall_status_le ?? ""),
      overall_status: String(record?.overall_status ?? ""),
      referral_grade: String(record?.referral_grade ?? ""),
      recommendation_type: String(record?.recommendation_type ?? ""),
      recommended_to: String(record?.recommended_to ?? ""),
      referral_priority: String(record?.referral_priority ?? ""),
      referral_reason: String(record?.referral_reason ?? ""),
      follow_up: String(record?.follow_up ?? ""),
    });
  };

  const [activeHearingStep, setActiveHearingStep] =
    React.useState("audiometry");

  const studentsArray = React.useMemo(() => {
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

  const selectedStudentFromFilter = React.useMemo(() => {
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

  const selectedStudent = React.useMemo(() => {
    if (selectedStudentFromFilter) {
      return selectedStudentFromFilter;
    }

    const activeId = studentFilter !== "all" ? studentFilter : studentId;
    if (!activeId) return null;

    // Primary lookup in studentsArray (from API response)
    if (Array.isArray(studentsArray) && studentsArray.length > 0) {
      const match = studentsArray.find(
        (student) =>
          String(student.id ?? student.studentId ?? student.cus_id) ===
          String(activeId),
      );
      if (match) return match;
    }

    // Fallback: look in the Redux slice roster
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
  // console.log("Filtered Students:", filteredStudents);
  // const selectedStudent = React.useMemo(() => {
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

  // const studentSelectValue = String(
  //   selectedStudent?.id ?? selectedStudent?.studentId ?? "",
  // );
  // console.log(studentSelectValue, "studentSelectValue");

  // const selectedStudentKeys = React.useMemo(() => {
  //   if (selectedStudent) {
  //     return getStudentKeys(selectedStudent);
  //   }

  //   return new Set(
  //     [studentSelectValue, studentId]
  //       .map((value) => String(value ?? "").trim())
  //       .filter(Boolean),
  //   );
  // }, [selectedStudent, studentId, studentSelectValue]);

  const getSelectedStudentScreeningData = React.useMemo(() => {
    if (!studentId || !Array.isArray(hearingScreeningData)) {
      return null;
    }

    // The endpoint is already scoped to /hear-test/student/{studentId}.
    return hearingScreeningData[0] ?? null;
  }, [hearingScreeningData, studentId]);

  React.useEffect(() => {
    if (!studentId || hearingScreeningLoading) {
      return;
    }

    applyScreeningRecordToForm(getSelectedStudentScreeningData);
  }, [getSelectedStudentScreeningData, hearingScreeningLoading, studentId]);

  const assessmentStudentOptions = React.useMemo(
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
    <section className="space-y-5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between mb-4">
        <>
          <div className="flex items-center gap-2 py-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary aspect-square">
              <Ear className="size-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Hearing Screening
              </h1>

              <p className="text-sm text-muted-foreground">
                Audiological assessment and hearing health
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
        </>

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
              setStudentId(value);
              setIsCaDrawerOpen(false);
            }}
            filteredStudents={filteredStudents}
            normalizedCampStudents={normalizedCampStudents}
          /> */}

          <Button variant="outline">Save & Exit</Button>

          {formErrors && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/60 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              <ShieldAlert className="size-4 shrink-0" />
              Please fix the highlighted fields before saving.
            </div>
          )}

          <Button onClick={handleSave} disabled={isSaving}>
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
      {/* =====================================================
          MAIN GRID
      ===================================================== */}
      {studentSelectValue?.length > 0 ? (
        <>
          <StudentProfileCard student={selectedStudent} />
          <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            {/* =================================================
            LEFT COLUMN
        ================================================= */}
            <div className="space-y-4">
              <div className="relative md:relative lg:sticky lg:top-24 z-10 self-start space-y-5">
                <FramerCard>
                  {/* Assessment Details */}
                  {/* <Card>
            <CardHeader>
              <CardTitle className="text-base">Assessment Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Field label="Assessment Date" type="date" />

              <Field label="Location" placeholder="School / Clinic" />

              <Field label="Examiner" placeholder="Examiner name" />

              <Field label="Assistant" placeholder="Assistant name" />
            </CardContent>
          </Card> */}
                  <AssessmentCard
                    // onChange={handleAssessmentChange}
                    // form={assessmentForm}
                    data={getSelectedStudentScreeningData}
                    studentOptions={assessmentStudentOptions}
                    studentValue={studentSelectValue}
                    schoolName={schoolName}
                    onStudentChange={handleAssessmentStudentChange}
                    authUser={authUser}
                    // onSave={handleSaveAssessment}
                    // onCancel={handleCancelAssessment}
                  />
                </FramerCard>

                <HearingSummary
                  reHearingResult={reHearingResult}
                  leHearingResult={leHearingResult}
                  form={form}
                />
                <HearingQuickFinding form={form} />
              </div>
              {/* Hearing Summary */}
              {/* Quick Status */}
            </div>
            {/* =================================================
            CENTER COLUMN
        ================================================= */}
            <div className="min-w-0">
              <ScreeningStepper
                activeStep={activeHearingStep}
                setActiveStep={setActiveHearingStep}
                steps={HEARING_STEPS}
                filterFemale={false}
                onSave={handleSave}
              >
                {/* ------------------- Pure Tone Audiometry ------------------- */}
                <div className="space-y-4">
                  <AudioGramCard>
                    <Audiogram form={form} updateField={updateField} />
                  </AudioGramCard>
                </div>

                {/* ------------------- Whisper Test ------------------- */}
                <div className="space-y-4">
                  <WhishperTest form={form} updateField={updateField} />
                </div>

                {/* ------------------- Risk Factors & Referral ------------------- */}
                <div className="space-y-4">
                  <RiskFactors
                    form={form}
                    formErrors={formErrors}
                    referralReasonOptions={referralReasonOptions}
                    updateField={updateField}
                  />
                </div>

                {/* ------------------- Ear Health & Examination ------------------- */}
                <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <EarHealth
                    form={form}
                    formErrors={formErrors}
                    updateField={updateField}
                  />

                  <EarExaminationCard
                    form={form}
                    updateField={updateField}
                    formErrors={formErrors}
                    examinationOptions={examinationOptions}
                  />
                 </div>
                </div>

                {/* ------------------- Tympanometry ------------------- */}
                <div className="space-y-4">
                  <Tympanomentry
                    form={form}
                    updateField={updateField}
                    formErrors={formErrors}
                  />
                </div>

                {/* ------------------- Review & Submit ------------------- */}
                <div className="space-y-4">
                  <Review
                    form={form}
                    reHearingResult={reHearingResult}
                    leHearingResult={leHearingResult}
                    formErrors={formErrors}
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

      {/* Bottom actions */}
      {/* <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline">Save Assessment</Button>

        <Button onClick={handleSave}>Save & Next</Button>
      </div> */}
    </section>
  );
}

/* ============================================================
   AUDIOGRAM
============================================================ */

// Hearing thresholds are valid from 0 up to 120 dB — anything outside is
// clamped so the value always matches a hearing-classification band.
const PTA_MIN_DB = 0;
const PTA_MAX_DB = 120;

function clampDbValue(raw) {
  if (raw === "" || raw === null || raw === undefined) return "";
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return "";
  return String(Math.min(Math.max(parsed, PTA_MIN_DB), PTA_MAX_DB));
}

function Audiogram({ form, updateField }) {
  const width = 760;
  const height = 390;

  const left = 70;
  const right = 25;
  const top = 40;
  const bottom = 55;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  /*
    Hearing level:
    -10 dB → 120 dB
  */

  const minDb = -10;
  const maxDb = 120;

  const dbToY = (db) => {
    const value = Number(db);

    if (Number.isNaN(value)) {
      return null;
    }

    return top + ((value - minDb) / (maxDb - minDb)) * chartHeight;
  };

  const xForFrequency = (index) => {
    return left + (index / (FREQUENCIES.length - 1)) * chartWidth;
  };

  const getValue = (frequency, ear) => {
    return form[`pta_${frequency}hz_${ear}`];
  };

  const createPoints = (ear) => {
    return FREQUENCIES.map((frequency, index) => {
      const value = getValue(frequency, ear);

      const y = dbToY(value);

      if (y === null) {
        return null;
      }

      return {
        x: xForFrequency(index),
        y,
        value,
        frequency,
      };
    }).filter(Boolean);
  };

  const rightPoints = createPoints("re");
  const leftPoints = createPoints("le");

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="size-2.5 rounded-full bg-primary" />
          Right Ear (RE)
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="size-2.5 rounded-full bg-warning" />
          Left Ear (LE)
        </div>

        <span className="text-xs text-muted-foreground">
          Hearing threshold (dB HL)
        </span>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto rounded-xl border border-border/70 bg-background p-3 ">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-125 w-full"
        >
          {/* Horizontal grid */}
          {Array.from({ length: 14 }, (_, index) => {
            const db = index * 10;

            const y = dbToY(db);

            return (
              <g key={db}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className={db === 0 ? "text-border" : "text-border/40"}
                />

                <text
                  x={left - 15}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px]"
                >
                  {db}
                </text>
              </g>
            );
          })}

          {/* Frequency columns */}
          {FREQUENCIES.map((frequency, index) => {
            const x = xForFrequency(index);

            return (
              <g key={frequency}>
                <line
                  x1={x}
                  x2={x}
                  y1={top}
                  y2={height - bottom}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border/40"
                />

                <text
                  x={x}
                  y={height - 22}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {frequency >= 1000 ? `${frequency / 1000}k` : frequency}
                </text>
              </g>
            );
          })}

          {/* Y axis */}
          <text
            x="15"
            y={height / 2}
            transform={`rotate(-90 15 ${height / 2})`}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            Hearing Level (dB HL)
          </text>

          {/* X axis */}
          <text
            x={width / 2}
            y={height - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            Frequency (Hz)
          </text>

          {/* Normal hearing area */}
          <rect
            x={left}
            y={dbToY(-10)}
            width={chartWidth}
            height={dbToY(25) - dbToY(-10)}
            className="fill-success/5"
          />

          {/* Right ear line */}
          {rightPoints.length > 1 && (
            <polyline
              points={rightPoints
                .map((point) => `${point.x},${point.y}`)
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary"
            />
          )}

          {/* Left ear line */}
          {leftPoints.length > 1 && (
            <polyline
              points={leftPoints
                .map((point) => `${point.x},${point.y}`)
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-warning"
            />
          )}

          {/* Right points */}
          {rightPoints.map((point) => (
            <circle
              key={`re-${point.frequency}`}
              cx={point.x}
              cy={point.y}
              r="6"
              className="fill-primary"
            />
          ))}

          {/* Left points */}
          {leftPoints.map((point) => (
            <rect
              key={`le-${point.frequency}`}
              x={point.x - 5}
              y={point.y - 5}
              width="10"
              height="10"
              rx="2"
              className="fill-warning"
            />
          ))}
        </svg>
      </div>

      {/* Frequency inputs */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Pure Tone Thresholds</p>

            <p className="text-xs text-muted-foreground">
              Enter hearing level for each frequency
            </p>
          </div>
        </div>

        <div className="w-full overflow-auto rounded-xl border border-b  border-border/90">
          <div className="w-full grid grid-cols-[110px_repeat(6,minmax(75px,1fr))] bg-muted/40">
            <div className="p-3 text-xs font-medium">Ear</div>

            {FREQUENCIES.map((frequency) => (
              <div
                key={frequency}
                className="p-3 text-center text-xs font-medium"
              >
                {frequency >= 1000 ? `${frequency / 1000}k` : frequency}
              </div>
            ))}
          </div>

          {/* Right ear */}
          <div className="grid grid-cols-[110px_repeat(6,minmax(75px,1fr))] border-t border-border/70">
            <div className="flex items-center gap-2 p-3">
              <span className="size-2 rounded-full bg-primary" />

              <span className="text-xs font-medium">Right</span>
            </div>

            {FREQUENCIES.map((frequency) => {
              const field = `pta_${frequency}hz_re`;

              return (
                <div key={field} className="p-2">
                  <Input
                    type="number"
                    value={form[field]}
                    onChange={(e) =>
                      updateField(field, clampDbValue(e.target.value))
                    }
                    min={PTA_MIN_DB}
                    max={PTA_MAX_DB}
                    className="h-9 text-center text-xs"
                  />
                </div>
              );
            })}
          </div>

          {/* Left ear */}
          <div className="grid grid-cols-[110px_repeat(6,minmax(75px,1fr))] border-t border-border/70">
            <div className="flex items-center gap-2 p-3">
              <span className="size-2 rounded-full bg-warning" />

              <span className="text-xs font-medium">Left</span>
            </div>

            {FREQUENCIES.map((frequency) => {
              const field = `pta_${frequency}hz_le`;

              return (
                <div key={field} className="p-2">
                  <Input
                    type="number"
                    value={form[field]}
                    onChange={(e) =>
                      updateField(field, clampDbValue(e.target.value))
                    }
                    min={PTA_MIN_DB}
                    max={PTA_MAX_DB}
                    className="h-9 text-center text-xs"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
/* ============================================================
   COMPONENTS
============================================================ */

function Field({ label, value, onChange, placeholder, type = "text", error }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <Input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={
          error ? "border-destructive focus-visible:ring-destructive" : ""
        }
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SelectField({ label, value, onChange, options, error }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${error ? "border-destructive focus:ring-destructive" : ""}`}
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
