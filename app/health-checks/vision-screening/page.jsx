"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Eye,
  Glasses,
  Save,
  Search,
  Send,
} from "lucide-react";

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
import { useAppDispatch } from "@/lib/hooks";
import { getVisionScreening } from "@/lib/features/getVisionScreening";
import useStudentData from "@/components/health-checks/getStudentData";
import AssessmentCard from "@/app/ui/AssessmentCard";
import { EmptyState } from "@/components/ui/empty-state";
import StudentProfileCard from "@/app/students/studentProfileCard";

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
      {label && <FieldLabel>{label}</FieldLabel>}
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

// Initial state for one eye's four acuity readings + remarks.
const emptyEye = {
  distanceWithout: "",
  nearWithout: "",
  distanceWith: "",
  nearWith: "",
  remarks: "",
};

function AcuityRow({ label, eye, onChange }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background p-3 sm:p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SelectField
          label="Distance (Without)"
          options={distanceAcuityOptions}
          value={eye.distanceWithout}
          onChange={(v) => onChange({ ...eye, distanceWithout: v })}
        />
        <SelectField
          label="Near (Without)"
          options={nearAcuityOptions}
          value={eye.nearWithout}
          onChange={(v) => onChange({ ...eye, nearWithout: v })}
        />
        <SelectField
          label="Distance (With)"
          options={distanceAcuityOptions}
          value={eye.distanceWith}
          onChange={(v) => onChange({ ...eye, distanceWith: v })}
        />
        <SelectField
          label="Near (With)"
          options={nearAcuityOptions}
          value={eye.nearWith}
          onChange={(v) => onChange({ ...eye, nearWith: v })}
        />
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

const SUMMARY_TONE_CLASS = {
  success: "text-success bg-success/10",
  info: "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
  muted: "text-muted-foreground bg-muted",
};

export default function VisionScreeningPage() {
  const dispatch = useAppDispatch();
  const academicYearOptions = ["2026-2027", "2025-2026", "2024-2025"];

  const [studentId, setStudentId] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("2026-08-05");
  const [location, setLocation] = useState(locationOptions[0]);
  const [examiner, setExaminer] = useState(examinerOptions[0]);
  const [assistant, setAssistant] = useState(assistantOptions[0]);

  const [od, setOd] = useState({ ...emptyEye, distanceWith: "6/6" });
  const [os, setOs] = useState({ ...emptyEye, distanceWith: "6/9" });
  const [ou, setOu] = useState(emptyEye);

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
  const [selectedCampId, setSelectedCampId] = useState("");
  const [academicYear, setAcademicYear] = useState(academicYearOptions[0]);
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("all");

  const [referral, setReferral] = useState("no");
  const [adviceSuggestions, setAdviceSuggestions] = useState("");
  const [followUp, setFollowUp] = useState(followUpOptions[0]);

  const {
    data: visionScreeningData = [],
    isLoading: visionScreeningLoading,
    error: visionScreeningQueryError,
  } = useQuery({
    queryKey: ["vision-screening"],
    queryFn: () => dispatch(getVisionScreening()).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const {
    campsData = [],
    campsLoading,
    campsQueryError,
    studentCampLoading,
    studentCampQueryError,
    filteredCampRows,
  } = useStudentData(selectedCampId);

  const campStudents = useMemo(() => {
    if (!filteredCampRows.length) {
      return [];
    }

    return filteredCampRows.flatMap((row) => {
      if (Array.isArray(row?.students)) {
        return row.students;
      }

      if (Array.isArray(row?.student)) {
        return row.student;
      }

      if (row?.student && typeof row.student === "object") {
        return [row.student];
      }

      if (
        row &&
        typeof row === "object" &&
        (row.student_id || row.studentId || row.school_registration_number)
      ) {
        return [row];
      }

      return [];
    });
  }, [filteredCampRows]);

  const academicYears = useMemo(() => {
    const yearSet = new Set();

    campStudents.forEach((student) => {
      const year = student?.academic_year ?? student?.academicYear ?? "";
      if (String(year).trim()) {
        yearSet.add(String(year).trim());
      }
    });

    return Array.from(yearSet).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }, [campStudents]);

  const activeAcademicYear = useMemo(() => {
    if (!selectedCampId) {
      return "";
    }

    if (academicYears.includes(academicYear)) {
      return academicYear;
    }

    return academicYears[0] ?? "";
  }, [academicYear, academicYears, selectedCampId]);

  const getClass = useMemo(() => {
    const classSet = new Set();

    campStudents.forEach((student) => {
      const year = String(
        student?.academic_year ?? student?.academicYear ?? "",
      ).trim();
      if (activeAcademicYear && year && year !== activeAcademicYear) {
        return;
      }

      const classValue = String(
        student?.Class ?? student?.class ?? student?.grade ?? "",
      )
        .split("-")[0]
        .trim();

      if (classValue) {
        classSet.add(classValue);
      }
    });

    return Array.from(classSet).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }, [activeAcademicYear, campStudents]);

  const getSection = useMemo(() => {
    const sectionSet = new Set();

    campStudents.forEach((student) => {
      const year = String(
        student?.academic_year ?? student?.academicYear ?? "",
      ).trim();
      if (activeAcademicYear && year && year !== activeAcademicYear) {
        return;
      }

      const classValue = String(
        student?.Class ?? student?.class ?? student?.grade ?? "",
      )
        .split("-")[0]
        .trim();
      if (selectedClassFilter !== "all" && classValue !== selectedClassFilter) {
        return;
      }

      const sectionValue =
        String(student?.sec ?? student?.section ?? student?.grade ?? "")
          .split("-")[1]
          ?.trim() || String(student?.sec ?? student?.section ?? "").trim();

      if (sectionValue) {
        sectionSet.add(sectionValue);
      }
    });

    return Array.from(sectionSet).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }, [activeAcademicYear, campStudents, selectedClassFilter]);

  const camps = useMemo(
    () => (Array.isArray(campsData) ? campsData : []),
    [campsData],
  );

  const campOptions = useMemo(() => {
    return camps
      .map((item) => {
        const value = String(item.id ?? item.campId ?? item.camp_id ?? "");
        const label =
          item.name ??
          item.camp_name ??
          item.title ??
          item.doctor_name ??
          (value ? `Camp ${value}` : "");

        return { value, label: String(label) };
      })
      .filter((item) => item.value && item.label);
  }, [camps]);

  const normalizedCampStudents = useMemo(() => {
    const uniqueStudents = new Map();

    campStudents.forEach((student) => {
      const rawId =
        student?.id ??
        student?.studentId ??
        student?.student_id ??
        student?.school_registration_number ??
        student?.admission_number;

      if (
        rawId === undefined ||
        rawId === null ||
        String(rawId).trim() === ""
      ) {
        return;
      }

      const id = String(rawId).trim();
      const classValue = String(
        student?.Class ?? student?.class ?? student?.grade ?? "",
      )
        .split("-")[0]
        .trim();
      const sectionValue =
        String(student?.sec ?? student?.section ?? student?.grade ?? "")
          .split("-")[1]
          ?.trim() || String(student?.sec ?? student?.section ?? "").trim();

      uniqueStudents.set(id, {
        ...student,
        id,
        studentId:
          student?.studentId ??
          student?.student_id ??
          student?.school_registration_number ??
          student?.admission_number ??
          id,
        name:
          student?.name ?? student?.student_name ?? student?.studentName ?? "",
        Class: classValue,
        sec: sectionValue,
      });
    });

    return Array.from(uniqueStudents.values());
  }, [campStudents]);

  const filteredCampStudents = useMemo(() => {
    if (!selectedCampId) {
      return [];
    }

    return normalizedCampStudents.filter((student) => {
      const year = String(
        student?.academic_year ?? student?.academicYear ?? "",
      ).trim();
      const classValue = String(
        student?.Class ?? student?.class ?? student?.grade ?? "",
      )
        .split("-")[0]
        .trim();
      const sectionValue =
        String(student?.sec ?? student?.section ?? student?.grade ?? "")
          .split("-")[1]
          ?.trim() || String(student?.sec ?? student?.section ?? "").trim();

      const yearMatch =
        !activeAcademicYear || !year || year === activeAcademicYear;
      const classMatch =
        selectedClassFilter === "all" || classValue === selectedClassFilter;
      const sectionMatch =
        selectedSectionFilter === "all" ||
        sectionValue === selectedSectionFilter;

      return yearMatch && classMatch && sectionMatch;
    });
  }, [
    activeAcademicYear,
    normalizedCampStudents,
    selectedCampId,
    selectedClassFilter,
    selectedSectionFilter,
  ]);

  const filteredStudents = filteredCampStudents;

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

  const applyScreeningRecordToForm = (screeningRecord) => {
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
    setStrabismus(String(record?.strabismus ?? "no"));
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

    setUsesGlasses(String(record?.uses_glasses_or_lens ?? "no"));
    setLensType(String(record?.lens_type ?? lensTypeOptions[0]));
    setLensPower(String(record?.lens_power ?? ""));
    setLensRemarks(String(record?.lens_remarks ?? ""));

    setReferral(String(record?.referral ?? "no"));
    setAdviceSuggestions(String(record?.advice_suggestions ?? ""));
    setFollowUp(String(record?.follow_up ?? followUpOptions[0]));
  };

  const selectedStudent = useMemo(() => {
    if (!filteredStudents.length) {
      return null;
    }

    const explicitSelection = filteredStudents.find(
      (student) =>
        String(student.id ?? student.studentId) === String(studentId),
    );

    return explicitSelection ?? null;
  }, [filteredStudents, studentId]);

  const classOptions = useMemo(() => {
    if (!selectedCampId) {
      return ["all"];
    }

    return ["all", ...getClass];
  }, [getClass, selectedCampId]);

  const sectionOptions = useMemo(() => {
    if (!selectedCampId) {
      return ["all"];
    }

    return ["all", ...getSection];
  }, [getSection, selectedCampId]);

  const selectedStudentKey = String(
    selectedStudent?.id ?? selectedStudent?.studentId ?? "",
  );
  const studentSelectValue = filteredStudents.some(
    (student) => String(student.id ?? student.studentId) === selectedStudentKey,
  )
    ? selectedStudentKey
    : "";

  const assessmentStudentOptions = useMemo(
    () =>
      filteredStudents.map((student) => {
        const value = String(student.id ?? student.studentId ?? "");
        const studentCode =
          student.studentId ??
          student.student_id ??
          student.school_registration_number ??
          student.admission_number;
        return {
          value,
          label: `${student.name || "Unknown"}${studentCode ? ` (${studentCode})` : ""}`,
        };
      }),
    [filteredStudents],
  );

  const odStatus = useMemo(
    () => classifyAcuity(od.distanceWith || od.distanceWithout),
    [od],
  );
  const osStatus = useMemo(
    () => classifyAcuity(os.distanceWith || os.distanceWithout),
    [os],
  );
  const selectedStudentKeys = useMemo(() => {
    if (selectedStudent) {
      return getStudentKeys(selectedStudent);
    }

    return new Set(
      [studentSelectValue, studentId]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    );
  }, [selectedStudent, studentId, studentSelectValue]);

  const getSelectedStudentScreeningData = useMemo(() => {
    if (
      !selectedStudentKeys.size ||
      !Array.isArray(visionScreeningData) ||
      !visionScreeningData.length
    ) {
      return null;
    }

    return findScreeningRecordByKeys(selectedStudentKeys) ?? null;
  }, [findScreeningRecordByKeys, selectedStudentKeys, visionScreeningData]);
  console.log(
    getSelectedStudentScreeningData,
    "getSelectedStudentScreeningData",
  );

  const handleSaveAssessment = () => {
    const payload = {
      studentId:
        selectedStudent?.studentId ??
        selectedStudent?.student_id ??
        selectedStudent?.school_registration_number ??
        selectedStudent?.admission_number ??
        selectedStudent?.id ??
        studentId,
      assessmentDate,
      location,
      examiner,
      assistant,
      od,
      os,
      ou,
      colorVisionStatus,
      colorVisionTestType,
      colorVisionRemarks,
      coverTest,
      strabismus,
      muscleBalanceRemarks,
      lids,
      conjunctiva,
      cornea,
      pupil,
      externalOtherFindings,
      refractiveError,
      refractiveErrorRemarks,
      usesGlasses,
      lensType,
      lensPower,
      lensRemarks,
      referral,
      adviceSuggestions,
      followUp,
    };

    console.log("Save vision assessment:", payload);
  };

  const handleCancelAssessment = () => {
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
    setFollowUp(followUpOptions[0]);
  };

  return (
    <section className="space-y-4">
      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 py-2">
            {/* <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Eye className="size-5" />
            </div> */}
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary aspect-square">
                <Eye className="size-6" />
              </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
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
          <CampStudentSelectorDrawer
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
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelAssessment}
          >
            Save & Exit
          </Button>

          <Button type="button" onClick={handleSaveAssessment}>
            <Save className="size-4" />
            Save & Next
          </Button>
        </div>
      </div>
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
            <AssessmentCard
              // onChange={handleAssessmentChange}
              // form={assessmentForm}
              data={getSelectedStudentScreeningData}
              studentOptions={assessmentStudentOptions}
              studentValue={studentSelectValue}
              onStudentChange={(value) => {
                const selectedFromList = filteredStudents.find(
                  (student) =>
                    String(student.id ?? student.studentId) === String(value),
                );

                if (selectedFromList) {
                  const selectedKeys = getStudentKeys(selectedFromList);
                  const screeningRecord =
                    findScreeningRecordByKeys(selectedKeys);
                  applyScreeningRecordToForm(screeningRecord);
                }

                setStudentId(value);
              }}
              onSave={handleSaveAssessment}
              onCancel={handleCancelAssessment}
            />

            <article className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">
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

            <div className="flex gap-2">
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
            </div>
          </div>

          {/* ---------------- Middle column: acuity + external exam ---------------- */}
          <div className="space-y-4">
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
                    getSelectedStudentScreeningData?.od_distance_without || od
                  }
                  onChange={setOd}
                />
                <AcuityRow
                  label="Left Eye (OS)"
                  eye={
                    getSelectedStudentScreeningData?.os_distance_without || os
                  }
                  onChange={setOs}
                />
                <AcuityRow
                  label="Both Eyes (OU)"
                  eye={
                    getSelectedStudentScreeningData?.ou_distance_without || ou
                  }
                  onChange={setOu}
                />
              </div>
            </article>

            <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Color Vision &amp; Muscle Balance
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SelectField
                  label="Color Vision Status"
                  options={colorVisionStatusOptions}
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

            <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-foreground">
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
          </div>

          {/* ---------------- Right column: refraction, correction, referral ---------------- */}
          <div className="space-y-4">
            <article className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">
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

            <article className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">
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

            <article className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Referral &amp; Follow-up
              </h3>
              <div className="mt-3 space-y-3">
                <ToggleGroup
                  label="Referral to Specialist"
                  options={yesNoOptions("no")}
                  value={referral}
                  onChange={setReferral}
                />
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
                  onChange={setFollowUp}
                />
              </div>
            </article>
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
                <Search  className="size-4" />
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
