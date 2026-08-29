"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity,
  Ear,
  EarOff,
  Headphones,
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
import { hearingScreeningSchema } from "./hearningSchema";
import { getMasterData } from "@/util/masterData";
import { getAllMasterScreening } from "@/lib/features/masterScreeningSlice";
import { selectAuthUser } from "@/lib/features/auth-slice";
import { getAssignEvent } from "@/lib/features/getEventAssignSlice";

const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000];

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
  console.log(assignedEvents,"assignedEvents");
  console.log(masterScreeningData, "All Master Screening Data");

  

  const requiredMasterData = React.useMemo(
    () =>
      getMasterData(masterScreeningData, [
        "hearing-classifications",
        "hearing-referral-reasons",
        "ear-examinations",
      ]),
    [masterScreeningData],
  );
  console.log(requiredMasterData, "requiredMasterData");

 

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

    dispatch(createHearingScreening(data))
      .unwrap()
      .then(() => {
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
        console.error("Unable to save hearing screening:", error);

        toast.error("Failed to save hearing screening", {
          description:
            error?.message ?? "Something went wrong. Please try again.",
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

  const selectedStudentFromFilter = React.useMemo(() => {
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

  const selectedStudent = React.useMemo(() => {
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

          <Button onClick={handleSave}>
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
      {/* =====================================================
          MAIN GRID
      ===================================================== */}
      {studentSelectValue?.length > 0 ? (
        <>
          <StudentProfileCard student={selectedStudent} />
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
            {/* =================================================
            LEFT COLUMN
        ================================================= */}
            <div className="space-y-4">
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
              {/* Hearing Summary */}
              <FramerCard>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Hearing Summary</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <SummaryRow
                      icon={Ear}
                      label="Right Ear"
                      value={
                        reHearingResult.classification
                          ? `${reHearingResult.pta.toFixed(1)} dB · ${reHearingResult.classification.severity}`
                          : form.overall_status_re || "Not assessed"
                      }
                    />

                    <SummaryRow
                      icon={Ear}
                      label="Left Ear"
                      value={
                        leHearingResult.classification
                          ? `${leHearingResult.pta.toFixed(1)} dB · ${leHearingResult.classification.severity}`
                          : form.overall_status_le || "Not assessed"
                      }
                    />

                    <SummaryRow
                      icon={Activity}
                      label="Overall Status"
                      value={form.overall_status || "Not assessed"}
                    />

                    <SummaryRow
                      icon={ShieldAlert}
                      label="Referral"
                      value={form.referral_priority || "None"}
                    />
                  </CardContent>
                </Card>
              </FramerCard>
              {/* Quick Status */}
              <FramerCard>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Findings</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <StatusItem label="Right Ear" value={form.ear_exam_re} />

                    <StatusItem
                      label="Left Ear"
                      // value={form.overall_status_le}
                      value={form.ear_exam_le}
                      // status={form.ear_exam_le}
                    />

                    <StatusItem label="Overall" value={form.overall_status} />
                  </CardContent>
                </Card>
              </FramerCard>
            </div>
            {/* =================================================
            CENTER COLUMN
        ================================================= */}

            <div className="space-y-4">
              {/* Audiogram */}
              <FramerCard>
                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-border/70">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Waves className="size-4" />
                          </div>

                          <div>
                            <CardTitle className="text-base">
                              Pure Tone Audiometry
                            </CardTitle>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Hearing thresholds by frequency
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Badge variant="outline" className="gap-1.5">
                          <span className="size-2 rounded-full bg-primary" />
                          Right Ear
                        </Badge>

                        <Badge variant="outline" className="gap-1.5">
                          <span className="size-2 rounded-full bg-warning" />
                          Left Ear
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <Audiogram form={form} updateField={updateField} />
                  </CardContent>
                </Card>
              </FramerCard>
              <FramerCard>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 ">
                  {/* Whisper Test */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-info/10 text-info">
                          <Volume2 className="size-4" />
                        </div>

                        <div>
                          <CardTitle className="text-sm">
                            Whisper Test
                          </CardTitle>

                          <p className="text-xs text-muted-foreground">
                            Basic speech perception screening
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <SelectField
                          label="Right Ear"
                          value={form.whisper_test_re}
                          onChange={(value) =>
                            updateField("whisper_test_re", value)
                          }
                          options={["Pass", "Fail", "Not Tested"]}
                        />

                        <SelectField
                          label="Left Ear"
                          value={form.whisper_test_le}
                          onChange={(value) =>
                            updateField("whisper_test_le", value)
                          }
                          options={["Pass", "Fail", "Not Tested"]}
                        />

                        <Field
                          label="Test Distance"
                          value={form.whisper_test_distance}
                          onChange={(e) =>
                            updateField("whisper_test_distance", e.target.value)
                          }
                          placeholder="e.g. 2 feet"
                        />

                        <Field
                          label="Remarks"
                          value={form.whisper_test_remarks}
                          onChange={(e) =>
                            updateField("whisper_test_remarks", e.target.value)
                          }
                          placeholder="Enter remarks"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Speech */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success">
                          <Mic className="size-4" />
                        </div>

                        <CardTitle className="text-sm">
                          Speech Assessment
                        </CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <NumberField
                          label="Speech Recognition - Right"
                          value={form.speech_recognition_re}
                          onChange={(value) =>
                            updateField("speech_recognition_re", value)
                          }
                          unit="%"
                        />

                        <NumberField
                          label="Speech Recognition - Left"
                          value={form.speech_recognition_le}
                          onChange={(value) =>
                            updateField("speech_recognition_le", value)
                          }
                          unit="%"
                        />

                        <NumberField
                          label="SRT - Right Ear"
                          value={form.srt_re}
                          onChange={(value) => updateField("srt_re", value)}
                          unit="dB"
                        />

                        <NumberField
                          label="SRT - Left Ear"
                          value={form.srt_le}
                          onChange={(value) => updateField("srt_le", value)}
                          unit="dB"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FramerCard>
              <FramerCard>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* =====================================================
          RISK FACTORS
      ===================================================== */}

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                          <ShieldAlert className="size-4" />
                        </div>

                        <div>
                          <CardTitle className="text-base">
                            Hearing Risk Factors
                          </CardTitle>

                          <p className="text-xs text-muted-foreground">
                            Relevant history and risk indicators
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <RiskField
                          label="Frequent Ear Infections"
                          value={form.risk_frequent_ear_infections}
                          onChange={(value) =>
                            updateField("risk_frequent_ear_infections", value)
                          }
                        />

                        <RiskField
                          label="Speech Delay"
                          value={form.risk_speech_delay}
                          onChange={(value) =>
                            updateField("risk_speech_delay", value)
                          }
                        />

                        <RiskField
                          label="Learning Difficulty"
                          value={form.risk_learning_difficulty}
                          onChange={(value) =>
                            updateField("risk_learning_difficulty", value)
                          }
                        />

                        <RiskField
                          label="Family History"
                          value={form.risk_family_history_hearing_loss}
                          onChange={(value) =>
                            updateField(
                              "risk_family_history_hearing_loss",
                              value,
                            )
                          }
                        />

                        <RiskField
                          label="Noise Exposure"
                          value={form.risk_noise_exposure}
                          onChange={(value) =>
                            updateField("risk_noise_exposure", value)
                          }
                        />

                        <RiskField
                          label="Other Risks"
                          value={form.risk_others}
                          onChange={(value) =>
                            updateField("risk_others", value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* =====================================================
          REFERRAL
      ===================================================== */}

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                          <Radio className="size-4" />
                        </div>

                        <div>
                          <CardTitle className="text-base">
                            Referral & Follow-up
                          </CardTitle>

                          <p className="text-xs text-muted-foreground">
                            Recommended action based on screening
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Field
                        label="Referral Grade"
                        value={form.referral_grade}
                        onChange={(e) =>
                          updateField("referral_grade", e.target.value)
                        }
                      />

                      <Field
                        label="Recommendation Type"
                        value={form.recommendation_type}
                        onChange={(e) =>
                          updateField("recommendation_type", e.target.value)
                        }
                      />

                      <Field
                        label="Recommended To"
                        value={form.recommended_to}
                        onChange={(e) =>
                          updateField("recommended_to", e.target.value)
                        }
                      />

                      <Field
                        label="Referral Priority"
                        value={form.referral_priority}
                        onChange={(e) =>
                          updateField("referral_priority", e.target.value)
                        }
                      />

                      <div className="md:col-span-2">
                        {/* <Textarea
                          value={form.referral_reason}
                          onChange={(e) =>
                            updateField("referral_reason", e.target.value)
                          }
                          placeholder="Referral reason..."
                          rows={3}
                          className={formErrors?.referral_reason ? "border-destructive focus-visible:ring-destructive" : ""}
                        /> */}
                        <SelectField
                          label="Referral Reason"
                          value={form.referral_reason}
                          onChange={(value) =>
                            updateField("referral_reason", value)
                          }
                          options={referralReasonOptions}
                          error={formErrors?.referral_reason}
                        />
                        {formErrors?.referral_reason && (
                          <p className="mt-1.5 text-xs text-destructive">
                            {formErrors.referral_reason}
                          </p>
                        )}
                      </div>

                      <div className="lg:col-span-3">
                        <Textarea
                          value={form.follow_up}
                          onChange={(e) =>
                            updateField("follow_up", e.target.value)
                          }
                          placeholder="Follow-up instructions..."
                          rows={3}
                          className={
                            formErrors?.follow_up
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                        />
                        {formErrors?.follow_up && (
                          <p className="mt-1.5 text-xs text-destructive">
                            {formErrors.follow_up}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FramerCard>
            </div>

            {/* =================================================
            RIGHT COLUMN
        ================================================= */}

            <div className="space-y-4">
              {/* Ear Health */}
              <FramerCard>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ear Health</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <EarResult
                      label="Right Ear"
                      status={form.ear_exam_re}
                      // status={form.overall_status_re}
                      ear="RE"
                    />

                    <EarResult
                      label="Left Ear"
                      status={form.ear_exam_le}
                      ear="LE"
                    />

                    <div className="border-t border-border/70 pt-4">
                      <p className="mb-2 text-xs text-muted-foreground">
                        Overall Status
                      </p>

                      <Input
                        value={form.overall_status}
                        onChange={(e) =>
                          updateField("overall_status", e.target.value)
                        }
                        placeholder="Overall hearing status"
                        aria-invalid={Boolean(formErrors?.overall_status)}
                        className={
                          formErrors?.overall_status
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                      />
                      {formErrors?.overall_status && (
                        <p className="mt-1.5 text-xs text-destructive">
                          {formErrors.overall_status}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FramerCard>

              {/* Ear Examination */}
              <FramerCard>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Stethoscope className="size-4" />
                      </div>

                      <CardTitle className="text-sm">Ear Examination</CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <SelectField
                      label="Left Ear"
                      value={form.ear_exam_le}
                      onChange={(value) => updateField("ear_exam_le", value)}
                      options={examinationOptions}
                      error={formErrors?.ear_exam_le}
                    />

                    <SelectField
                      label="Right Ear"
                      value={form.ear_exam_re}
                      onChange={(value) => updateField("ear_exam_re", value)}
                      options={examinationOptions}
                      error={formErrors?.ear_exam_re}
                    />
                  </CardContent>
                </Card>
              </FramerCard>

              {/* Tympanometry */}
              <FramerCard>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tympanometry</CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-3">
                    <SelectField
                      label="Right Ear"
                      value={form.tympanometry_re}
                      onChange={(value) =>
                        updateField("tympanometry_re", value)
                      }
                      options={[
                        "Normal",
                        "Abnormal",
                        "Type A",
                        "Type B",
                        "Type C",
                      ]}
                    />

                    <SelectField
                      label="Left Ear"
                      value={form.tympanometry_le}
                      onChange={(value) =>
                        updateField("tympanometry_le", value)
                      }
                      options={[
                        "Normal",
                        "Abnormal",
                        "Type A",
                        "Type B",
                        "Type C",
                      ]}
                    />
                  </CardContent>
                </Card>
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
          className="min-w-[500px] w-full"
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

function NumberField({ label, value, onChange, unit, error }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <div className="relative">
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`pr-12 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {unit}
        </span>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
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

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>

        <span className="text-sm">{label}</span>
      </div>

      <span className="max-w-[110px] truncate text-xs font-medium text-muted-foreground">
        {value || "—"}
      </span>
    </div>
  );
}

function StatusItem({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>

      <div className="flex items-center gap-2">
        <span
          className={`size-1.5 rounded-full ${
            value ? "bg-success" : "bg-muted-foreground"
          }`}
        />

        <span className="text-xs font-medium">{value || "Pending"}</span>
      </div>
    </div>
  );
}

function EarResult({ label, status, ear }) {
  const isNormal =
    String(status || "")
      .toLowerCase()
      .includes("normal") ||
    String(status || "")
      .toLowerCase()
      .includes("pass");

  return (
    <div className="rounded-xl border border-border/70 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${
              isNormal
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isNormal ? (
              <Ear className="size-5" />
            ) : (
              <EarOff className="size-5" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">{label}</p>

            <p className="text-[11px] text-muted-foreground">{ear}</p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
            isNormal
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {status || "Not assessed"}
        </span>
      </div>
    </div>
  );
}

function RiskField({ label, value, onChange }) {
  return (
    <div className="rounded-xl border border-border/70 p-3">
      <p className="mb-2 text-xs font-medium">{label}</p>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Select</option>

        <option value="No">No</option>

        <option value="Yes">Yes</option>

        <option value="Unknown">Unknown</option>
      </select>
    </div>
  );
}
