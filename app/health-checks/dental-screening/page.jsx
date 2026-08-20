"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronDown,
  Circle,
  CircleCheck,
  CircleParkingOffIcon,
  LucidePanelTopBottomDashed,
  Save,
  Search,
  ShieldAlert,
  Summary,
  TriangleAlert,
} from "lucide-react";

import { useAppDispatch } from "@/lib/hooks";
import { getDentalScreening } from "@/lib/features/getDentalScreening";
import CampStudentSelectorDrawer from "@/components/health-checks/camp-student-selector-drawer";
import { ToggleGroup } from "./toggleGroup";
import { ToothChartSvg, ToothDetailGraphic } from "./tooth-chart-svg";
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
} from "./dental-screening-data";
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
import { ScoreMeter } from "./scoreMeter";
import { EmptyState } from "@/components/ui/empty-state";
import ToothIcon from "./toothIcon";
import StudentProfileCard from "@/app/students/studentProfileCard";
import { cn } from "../../lib/util"; "../../lib/util";

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

function normalizeToothStatus(value) {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();
  return TOOTH_STATUS_SET.has(status) ? status : null;
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

  console.log(chartSource, "chartSource");

  chartSource.forEach((item) => {
    console.log(item, "item");

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

  const {
    data: dentalScreeningData = [],
    isLoading: dentalScreeningLoading,
    error: dentalScreeningQueryError,
  } = useQuery({
    queryKey: ["dental-screening"],
    queryFn: () => dispatch(getDentalScreening()).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const [assessmentDate, setAssessmentDate] = useState("2025-08-05");
  const [location, setLocation] = useState(locationOptions[0]);
  const [examiner, setExaminer] = useState(examinerOptions[0]);
  const [assistant, setAssistant] = useState(assistantOptions[0]);

  const [chart, setChart] = useState(initialToothChart);
  const [selectedTooth, setSelectedTooth] = useState(16);

  const [oralHygiene, setOralHygiene] = useState("fair");
  const [gingivalHealth, setGingivalHealth] = useState("gingivitis");
  const [plaque, setPlaque] = useState("mild");
  const [otherFindings, setOtherFindings] = useState({ malocclusion: true });
  const [notes, setNotes] = useState("Mild crowding in lower anterior region.");
  const [isCaDrawerOpen, setIsCaDrawerOpen] = useState(false);
  const [selectedCampId, setSelectedCampId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("all");

  const currentTooth = useMemo(
    () => chart.find((t) => t.number === selectedTooth),
    [chart, selectedTooth],
  );

  const hasDentalRecords = dentalScreeningData.length > 0;

  const getData = useStudentData(selectedCampId);

  const camps = useMemo(
    () => (Array.isArray(getData.campsData) ? getData.campsData : []),
    [getData.campsData],
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

  const campStudents = useMemo(() => {
    if (!getData.filteredCampRows.length) {
      return [];
    }

    return getData.filteredCampRows.flatMap((row) => {
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
  }, [getData.filteredCampRows]);

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

  const classOptions = useMemo(() => {
    if (!selectedCampId) {
      return ["all"];
    }

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

    return [
      "all",
      ...Array.from(classSet).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    ];
  }, [activeAcademicYear, campStudents, selectedCampId]);

  const sectionOptions = useMemo(() => {
    if (!selectedCampId) {
      return ["all"];
    }

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

    return [
      "all",
      ...Array.from(sectionSet).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    ];
  }, [activeAcademicYear, campStudents, selectedCampId, selectedClassFilter]);

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

  const filteredStudents = useMemo(() => {
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

  const applyScreeningRecordToForm = (screeningRecord) => {
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
    setGingivalHealth(
      String(
        record?.gingival_health ??
          gingivalHealthOptions[0]?.value ??
          "gingivitis",
      ),
    );
    setPlaque(String(record?.plaque ?? plaqueOptions[0]?.value ?? "mild"));
    setNotes(String(record?.notes ?? record?.remark ?? record?.remarks ?? ""));
  };

  const syncChartForStudentRecord = useCallback((screeningRecord) => {
    console.log(screeningRecord, "screeningRecord");

    const recordChart = buildChartFromRecord(screeningRecord);
    if (recordChart) {
      setChart(recordChart);
      setSelectedTooth((prev) =>
        recordChart.some((tooth) => tooth.number === prev)
          ? prev
          : (recordChart[0]?.number ?? 16),
      );
      return;
    }

    const countChart = buildChartFromCounts(screeningRecord);
    if (countChart) {
      setChart(countChart);
      setSelectedTooth((prev) =>
        countChart.some((tooth) => tooth.number === prev)
          ? prev
          : (countChart[0]?.number ?? 16),
      );
      return;
    }

    setChart(initialToothChart.map((tooth) => ({ ...tooth })));
    setSelectedTooth(16);
    console.log(countChart, "countChart");
  }, []);

  const selectedStudent = useMemo(() => {
    if (!filteredStudents.length) {
      return null;
    }

    const explicitSelection = filteredStudents.find(
      (student) =>
        String(student.id ?? student.studentId) === String(studentId),
    );

    return explicitSelection ?? filteredStudents[0];
  }, [filteredStudents, studentId]);

  const studentSelectValue = filteredStudents.some(
    (student) => String(student.id ?? student.studentId) === String(studentId),
  )
    ? String(studentId)
    : "";

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
      !Array.isArray(dentalScreeningData) ||
      !dentalScreeningData.length
    ) {
      return null;
    }

    return findScreeningRecordByKeys(selectedStudentKeys) ?? null;
  }, [dentalScreeningData, findScreeningRecordByKeys, selectedStudentKeys]);

  const referralAction =
    getSelectedStudentScreeningData?.referral_action ??
    getSelectedStudentScreeningData?.recommended_to ??
    getSelectedStudentScreeningData?.recommendation_type ??
    "No action required";

  const referralReason =
    getSelectedStudentScreeningData?.referral_reason ?? "No specific reason";

  const followUpValue =
    getSelectedStudentScreeningData?.follow_up ?? "As needed";

  const careInstructions =
    getSelectedStudentScreeningData?.care_instructions ?? "--";

  const sidebarNotes =
    getSelectedStudentScreeningData?.notes ??
    getSelectedStudentScreeningData?.remark ??
    getSelectedStudentScreeningData?.remarks ??
    notes ??
    "--";

  const updatedAtValue =
    getSelectedStudentScreeningData?.updated_at ??
    getSelectedStudentScreeningData?.updatedAt;

  console.log(
    getSelectedStudentScreeningData,
    "getSelectedStudentScreeningData",
  );

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
  console.log(quickFindings, "quickFindings");

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

  const handleSelectedToothStatusChange = (value) => {
    setChart((prev) =>
      prev.map((tooth) =>
        tooth.number === selectedTooth ? { ...tooth, status: value } : tooth,
      ),
    );
  };

  const handleSelectedToothOtherNoteChange = (value) => {
    setChart((prev) =>
      prev.map((tooth) =>
        tooth.number === selectedTooth
          ? {
              ...tooth,
              otherNote: value,
            }
          : tooth,
      ),
    );
  };

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

  const handleSaveAssessment = () => {
    const payload = {
      assessmentDate,
      location,
      examiner,
      assistant,
      selectedTooth,
      oralHygiene,
      gingivalHealth,
      plaque,
      otherFindings,
      notes,
      summary,
    };

    console.log("Save dental assessment:", payload);
  };

  const handleCancelAssessment = () => {
    setAssessmentDate("2025-08-05");
    setLocation(locationOptions[0]);
    setExaminer(examinerOptions[0]);
    setAssistant(assistantOptions[0]);
    setSelectedTooth(16);
    setOralHygiene("fair");
    setGingivalHealth("gingivitis");
    setPlaque("mild");
    setOtherFindings({ malocclusion: true });
    setNotes("Mild crowding in lower anterior region.");
  };

  return (
    <section className="space-y-4">
      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 py-2">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary aspect-square">
              <ToothIcon className="size-6" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
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
          <CampStudentSelectorDrawer
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
 
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
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
            <div className="space-y-4">
              <AssessmentCard
                // onChange={handleAssessmentChange}
                // form={assessmentForm}
                data={getSelectedStudentScreeningData}
                studentOptions={assessmentStudentOptions}
                studentValue={studentSelectValue}
                isScreeningLoading={getData.studentCampLoading}
                isScreeningError={getData.studentCampQueryError}
                // isScreening={true}
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
                    syncChartForStudentRecord(screeningRecord);
                  } else {
                    syncChartForStudentRecord(null);
                  }

                  setStudentId(value);
                }}
                onSave={handleSaveAssessment}
                onCancel={handleCancelAssessment}
              />
              <article className="rounded-xl border p-4 shadow-sm bg-card">
                <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                  <Summary size="18" className="text-primary" />
                  Quick Findings Summary
                </h3>

                {/* Caries */}
                <div className="mb-2 flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-destructive" />

                    <span className="text-xs font-medium text-destructive">
                      Caries
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-destructive">
                    {quickFindings.caries}
                  </span>
                </div>

                {/* Other Issues */}
                <div className="mb-2 flex items-center justify-between rounded-md border border-warning/30 bg-warning/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-warning" />

                    <span className="text-xs font-medium text-warning">
                      Other Issues
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-warning">
                    {quickFindings.other}
                  </span>
                </div>

                {/* Healthy */}
                <div className="mb-2 flex items-center justify-between rounded-md border border-success/30 bg-success/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CircleCheck className="size-4 text-success" />

                    <span className="text-xs font-medium text-success">
                      Healthy
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-success">
                    {quickFindings.healthy}
                  </span>
                </div>

                {/* Missing */}
                <div className="flex items-center justify-between rounded-md border border-info/30 bg-info/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CircleParkingOffIcon className="size-4 text-info" />

                    <span className="text-xs font-medium text-info">
                      Missing
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-info">
                    {quickFindings.missing}
                  </span>
                </div>
              </article>
            </div>
            {/* ---------------- Middle column: tooth chart ---------------- */}
            <div className="min-w-0 md:min-w-125 space-y-4 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Tooth Chart (FDI Notation)
            </h3>

            <div className="mt-4">
              <ToothChartSvg
                chart={chart}
                selectedTooth={selectedTooth}
                quickFindings={quickFindings}
                onSelectTooth={setSelectedTooth}
              />
            </div>

            {currentTooth && (
              <div className="mt-4 flex flex-col gap-4 rounded-lg border border-border/70 bg-background p-3 sm:flex-row sm:items-center sm:p-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Current Tooth</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    Tooth {currentTooth.number}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({getToothName(currentTooth.number)})
                    </span>
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <FieldLabel>Status</FieldLabel>
                      <Select
                        value={String(currentTooth.status ?? "healthy")}
                        onValueChange={handleSelectedToothStatusChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {toothChartLegend.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DetailField label="Surface" value={currentTooth.surface} />
                    <DetailField
                      label="Severity"
                      value={currentTooth.severity}
                    />
                    <DetailField
                      label="Treatment"
                      value={currentTooth.treatment}
                    />
                  </div>

                  {currentTooth.status === "other" ? (
                    <div className="mt-3">
                      <FieldLabel>Other Finding</FieldLabel>
                      <input
                        type="text"
                        value={String(currentTooth.otherNote ?? "")}
                        onChange={(event) =>
                          handleSelectedToothOtherNoteChange(event.target.value)
                        }
                        placeholder="Describe the finding"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                  ) : null}
                </div>

                <ToothDetailGraphic status={currentTooth.status} />
              </div>
            )}
             <div className="grid grid-rows-1 gap-4 pt-4">
                 <article className="space-y-4 rounded-xl border border-border bg-card p-4">
                <ToggleGroup
                  label="Oral Hygiene"
                  options={oralHygieneOptions}
                  value={oralHygiene}
                  onChange={setOralHygiene}
                />
                <ToggleGroup
                  label="Gingival Health"
                  options={gingivalHealthOptions}
                  value={gingivalHealth}
                  onChange={setGingivalHealth}
                />
                <ToggleGroup
                  label="Plaque"
                  options={plaqueOptions}
                  value={plaque}
                  onChange={setPlaque}
                />
              </article>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <article className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BookOpen className="size-4 text-primary" />
                    Care Instructions &amp; Notes
                  </h3>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Care Instructions
                    </p>
                    <p className="text-sm text-foreground">
                      {careInstructions}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm text-foreground">{sidebarNotes}</p>
                  </div>
                  <p className="pt-1 text-xs text-muted-foreground">
                    Last updated {formatDate(updatedAtValue)}
                  </p>
                </article>
                 <article className="space-y-3 rounded-xl border border-warning/40 bg-warning/5 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldAlert className="size-4 text-warning" />
                    Referral
                  </h3>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Recommended Action
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {referralAction}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reason</p>
                    <p className="text-sm font-medium text-foreground">
                      {referralReason}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Follow-up</p>
                    <p className="text-sm font-medium text-foreground">
                      {followUpValue}
                    </p>
                  </div>
                </article>
              </div>
              
              </div>
          </div>
           

            {/* ---------------- Right column ---------------- */}
            <div className="space-y-4">
               <article className="space-y-4 rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Risk &amp; Severity
                </h3>
                <ScoreMeter label="Risk Score" score={riskScoreValue} />
                <ScoreMeter label="Severity Score" score={severityScoreValue} />
              </article>
               <article className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Other Findings
                  </h3>
                  <div className="mt-3 space-y-2.5">
                    {otherFindingsOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2.5 text-sm text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={!!otherFindings[opt.id]}
                          onChange={() => toggleFinding(opt.id)}
                          className="size-4 accent-primary"
                        />
                        {opt.label}
                      </label>
                    ))}

                    <div className="pt-1">
                      <FieldLabel>Others</FieldLabel>
                      <input
                        type="text"
                        placeholder="Enter notes"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                  </div>
                </article>
            
              <article className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="mt-3 w-full resize-none rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </article>
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

function DetailField({ label, value, capitalize, currentTooth }) {
  console.log(label, value, capitalize, currentTooth, "DetailField");
  console.log(toothChartLegend, "toothChartLegend");

  // console.log(chart,"chart");

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
