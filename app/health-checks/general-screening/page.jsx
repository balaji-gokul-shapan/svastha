"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChevronDown,
  Cross,
  Ruler,
  Save,
  ScanHeart,
  Search,
  Weight,
} from "lucide-react";

import { ToggleGroup } from "./toggleGroup";
import {
  allergyOptions,
  assistantOptions,
  bloodGroupOptions,
  calcBmi,
  chronicDiseaseOptions,
  examinerOptions,
  immunizationOptions,
  locationOptions,
  studentOptions,
  bmiCategory,
} from "./general-screening-data";
import { BmiGauge } from "./bmiCategory";
import { BmiSvgGauge } from "./BmiSvgGauge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getCamp } from "@/lib/features/getCampSlice";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import { getInitialScreening } from "@/lib/features/getInitialScreening";
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

function NumberField({ label, value, onChange, unit }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background pl-3 pr-12 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}

const GROWTH_STANDARD_BANDS = [
  { minAge: 5, maxAge: 6, heightMin: 105, heightMax: 124, weightMin: 15, weightMax: 25 },
  { minAge: 7, maxAge: 8, heightMin: 115, heightMax: 136, weightMin: 19, weightMax: 32 },
  { minAge: 9, maxAge: 10, heightMin: 126, heightMax: 148, weightMin: 24, weightMax: 40 },
  { minAge: 11, maxAge: 12, heightMin: 136, heightMax: 162, weightMin: 30, weightMax: 51 },
  { minAge: 13, maxAge: 14, heightMin: 148, heightMax: 174, weightMin: 38, weightMax: 64 },
  { minAge: 15, maxAge: 16, heightMin: 154, heightMax: 182, weightMin: 45, weightMax: 72 },
  { minAge: 17, maxAge: 18, heightMin: 158, heightMax: 186, weightMin: 50, weightMax: 80 },
];

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
  console.log(value, "fffff");

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

export default function GeneralScreeningPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { studentData = [], loading: studentsLoading, error: studentsError } = useAppSelector(
    (state) => state.getInitialScreening,
  );
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

  const [bloodGroup, setBloodGroup] = useState(bloodGroupOptions[0]);
  const [allergy, setAllergy] = useState(allergyOptions[0]);
  const [chronicDisease, setChronicDisease] = useState(
    chronicDiseaseOptions[0],
  );
  const [immunization, setImmunization] = useState("up_to_date");
  const [notes, setNotes] = useState("");


  // const {
  //   data: campsData = [],
  //   isLoading: campsLoading,
  //   error: campsQueryError,
  // } = useQuery({
  //   queryKey: ["doctor-camps"],
  //   queryFn: () => dispatch(getCamp()).unwrap(),
  //   staleTime: 0,
  //   refetchOnWindowFocus: true,
  // });

  // const {
  //   data: studentCampData = [],
  //   isLoading: studentCampLoading,
  //   error: studentCampQueryError,
  // } = useQuery({
  //   queryKey: ["student-healthcamp", selectedCampId],
  //   enabled: Boolean(selectedCampId),
  //   queryFn: () => dispatch(getStudentByCamp({ campId: selectedCampId })).unwrap(),
  //   staleTime: 0,
  //   refetchOnWindowFocus: true,
  // });

  const getData = useStudentData(selectedCampId);
  console.log(getData, "getData");



  // const studentCampRows = useMemo(() => {
  //   if (Array.isArray(studentCampData)) {
  //     return studentCampData;
  //   }

  //   if (Array.isArray(studentCampData?.data)) {
  //     return studentCampData.data;
  //   }

  //   if (studentCampData && typeof studentCampData === "object") {
  //     return [studentCampData];
  //   }

  //   return [];
  // }, [studentCampData]);
  // console.log(studentCampRows,"studentCampRows");


  // const filteredCampRows = useMemo(() => {
  //   if (!selectedCampId || !studentCampRows.length) {
  //     return [];
  //   }

  //   const selectedCampMeta = Array.isArray(campsData)
  //     ? campsData.find(
  //         (camp) => String(camp?.id ?? camp?.campId ?? camp?.camp_id ?? "") === String(selectedCampId),
  //       )
  //     : null;

  //   const selectedSchoolId = String(
  //     selectedCampMeta?.school_id ?? selectedCampMeta?.schoolId ?? selectedCampMeta?.school ?? "",
  //   ).trim();
  //   const selectedDoctorId = String(
  //     selectedCampMeta?.doctor_id ?? selectedCampMeta?.doctorId ?? selectedCampMeta?.doctor ?? "",
  //   ).trim();
  //   const selectedCampDate = String(
  //     selectedCampMeta?.camp_date ?? selectedCampMeta?.campDate ?? "",
  //   ).trim();

  //   return studentCampRows.filter((row) => {
  //     const rowCamp = row?.camp && typeof row.camp === "object" ? row.camp : row;
  //     const rowCampId = String(rowCamp?.id ?? rowCamp?.camp_id ?? rowCamp?.campId ?? row?.id ?? "").trim();
  //     const rowSchoolId = String(rowCamp?.school_id ?? rowCamp?.schoolId ?? rowCamp?.school ?? "").trim();
  //     const rowDoctorId = String(rowCamp?.doctor_id ?? rowCamp?.doctorId ?? rowCamp?.doctor ?? "").trim();
  //     const rowCampDate = String(rowCamp?.camp_date ?? rowCamp?.campDate ?? "").trim();

  //     const idMatch = rowCampId && rowCampId === String(selectedCampId).trim();
  //     if (idMatch) {
  //       return true;
  //     }

  //     const schoolDoctorMatch =
  //       selectedSchoolId &&
  //       selectedDoctorId &&
  //       rowSchoolId === selectedSchoolId &&
  //       rowDoctorId === selectedDoctorId;
  //     const dateMatch = !selectedCampDate || !rowCampDate || rowCampDate === selectedCampDate;

  //     if (schoolDoctorMatch && dateMatch) {
  //       return true;
  //     }

  //     // Keep row when API already pre-filters by camp and metadata is missing at row level.
  //     if (!rowCampId && !rowSchoolId && !rowDoctorId) {
  //       return true;
  //     }

  //     return false;
  //   });
  // }, [campsData, selectedCampId, studentCampRows]);

  //-----------------new code----------------
  const [schoolName, setSchoolName] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");

  const { data: filterPayload, isLoading } = useQuery({
    queryKey: [
      "filter-student",
      schoolName,
      academicYear,
      "options",
    ],
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
    queryKey: ["initial-screening", schoolName, academicYear, classFilter, sectionFilter, studentFilter],
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

  console.log(filterPayload, "filterPayload---------------------------");
  //-------------------------------------------

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

      // Fallback for flattened student row shape.
      if (row && typeof row === "object" && (row.student_id || row.studentId || row.school_registration_number)) {
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

    return Array.from(yearSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
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
      const year = String(student?.academic_year ?? student?.academicYear ?? "").trim();
      if (activeAcademicYear && year && year !== activeAcademicYear) {
        return;
      }

      const classValue = String(student?.Class ?? student?.class ?? student?.grade ?? "")
        .split("-")[0]
        .trim();

      if (classValue) {
        classSet.add(classValue);
      }
    });

    return Array.from(classSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [activeAcademicYear, campStudents]);

  const getSection = useMemo(() => {
    const sectionSet = new Set();

    campStudents.forEach((student) => {
      const year = String(student?.academic_year ?? student?.academicYear ?? "").trim();
      if (activeAcademicYear && year && year !== activeAcademicYear) {
        return;
      }

      const classValue = String(student?.Class ?? student?.class ?? student?.grade ?? "")
        .split("-")[0]
        .trim();
      if (selectedClassFilter !== "all" && classValue !== selectedClassFilter) {
        return;
      }

      const sectionValue = String(student?.sec ?? student?.section ?? student?.grade ?? "")
        .split("-")[1]
        ?.trim() || String(student?.sec ?? student?.section ?? "").trim();

      if (sectionValue) {
        sectionSet.add(sectionValue);
      }
    });

    return Array.from(sectionSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [activeAcademicYear, campStudents, selectedClassFilter]);



  const students = useMemo(() => (Array.isArray(studentData) ? studentData : []), [studentData]);
  const camps = useMemo(() => (Array.isArray(getData.campsData) ? getData.campsData : []), [getData.campsData]);

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

      if (rawId === undefined || rawId === null || String(rawId).trim() === "") {
        return;
      }

      const id = String(rawId).trim();
      const classValue = String(student?.Class ?? student?.class ?? student?.grade ?? "")
        .split("-")[0]
        .trim();
      const sectionValue =
        String(student?.sec ?? student?.section ?? student?.grade ?? "").split("-")[1]?.trim() ||
        String(student?.sec ?? student?.section ?? "").trim();

      uniqueStudents.set(id, {
        ...student,
        id,
        studentId:
          student?.studentId ??
          student?.student_id ??
          student?.school_registration_number ??
          student?.admission_number ??
          id,
        name: student?.name ?? student?.student_name ?? student?.studentName ?? "",
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

  const effectiveFilteredStudents = useMemo(() => {
    if (studentFilter === "all") {
      return filteredStudents;
    }

    return filteredStudents.filter((student) => {
      const key = String(student?.id ?? student?.studentId ?? "").trim();
      return key && key === String(studentFilter).trim();
    });
  }, [filteredStudents, studentFilter]);
  console.log(filteredStudents, "filteredStudents");
  console.log(effectiveFilteredStudents, "effectiveFilteredStudents");


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

        return dataKeys.some((key) => keys.has(key));
      }),
    [students],
  );

  const applyScreeningRecordToForm = (screeningRecord) => {
    const getMetricValue = (value) => {
      const normalizedValue = String(value ?? "").trim();
      return normalizedValue || "0";
    };

    setHeight(getMetricValue(screeningRecord?.height));
    setWeight(getMetricValue(screeningRecord?.weight));
    setNotes(
      String(
        screeningRecord?.notes ??
        screeningRecord?.remark ??
        screeningRecord?.remarks ??
        "",
      ),
    );
  };

  const selectedStudentFromFilter = useMemo(() => {
    const activeId = studentFilter !== "all" ? studentFilter : studentId;
    if (activeId && Array.isArray(filterPayload?.items)) {
      return (
        filterPayload.items.find(
          (student) =>
            String(student?.id ?? student?.studentId ?? student?.cus_id) === String(activeId),
        ) ?? null
      );
    }
    return null;
  }, [filterPayload?.items, studentFilter, studentId]);

  const selectedStudent = useMemo(() => {
    if (selectedStudentFromFilter) {
      return selectedStudentFromFilter;
    }

    if (effectiveFilteredStudents.length) {
      const explicitSelection = effectiveFilteredStudents.find(
        (student) => String(student.id ?? student.studentId ?? student.cus_id) === String(studentId),
      );
      if (explicitSelection) return explicitSelection;
    }

    if (studentId && Array.isArray(filterPayload?.items)) {
      const match = filterPayload.items.find(
        (student) => String(student.id ?? student.studentId ?? student.cus_id) === String(studentId),
      );
      if (match) return match;
    }

    return null;
  }, [effectiveFilteredStudents, filterPayload?.items, selectedStudentFromFilter, studentId]);

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

  const selectedStudentKey = String(selectedStudent?.id ?? selectedStudent?.studentId ?? selectedStudent?.cus_id ?? "");
  const studentSelectValue = selectedStudentKey;
  const hasSelectedStudent = Boolean(selectedStudent || selectedStudentKey || (studentFilter && studentFilter !== "all") || studentId);

  const assessmentStudentOptions = useMemo(
    () =>
      effectiveFilteredStudents.map((student) => {
        const value = String(student.id ?? student.studentId ?? student.cus_id ?? "");
        const studentCode =
          student.studentId ?? student.student_id ?? student.school_registration_number ?? student.admission_number;

        return {
          value,
          label: `${student.name || student.student_name || "Unknown"}${studentCode ? ` (${studentCode})` : ""}`,
        };
      }),
    [effectiveFilteredStudents],
  );
  const selectedStudentKeys = useMemo(() => {
    if (selectedStudent) {
      return getStudentKeys(selectedStudent);
    }

    return new Set(
      [studentSelectValue, studentId, studentFilter]
        .map((value) => String(value ?? "").trim())
        .filter((val) => val && val !== "all"),
    );
  }, [selectedStudent, studentFilter, studentId, studentSelectValue]);

  const getSelectedStudentScreeningData = useMemo(() => {
    if (!selectedStudentKeys.size || !students.length) {
      return null;
    }

    return findScreeningRecordByKeys(selectedStudentKeys) ?? null;
  }, [findScreeningRecordByKeys, selectedStudentKeys, students]);

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
    () => evaluateGrowthStandard("height", parseMetricValue(height), studentAgeYears),
    [height, studentAgeYears],
  );

  const weightStandardResult = useMemo(
    () => evaluateGrowthStandard("weight", parseMetricValue(weight), studentAgeYears),
    [studentAgeYears, weight],
  );

  const bmi = useMemo(() => calcBmi(height, weight), [height, weight]);
  const category = useMemo(() => bmiCategory(getSelectedStudentScreeningData?.bmi ?? bmi), [getSelectedStudentScreeningData?.bmi, bmi]);
  console.log(getSelectedStudentScreeningData, "getSelectedStudentScreeningData");
  const assessmentForm = useMemo(
    () => ({
      height,
      weight,
      bmi: getSelectedStudentScreeningData?.bmi || (bmi ? bmi.toFixed(1) : ""),
      notes,
      bloodGroup,
    }),
    [bmi, getSelectedStudentScreeningData?.bmi, height, notes, weight, bloodGroup],
  );




  const handleAssessmentChange = (field, value) => {
    if (field === "height") {
      setHeight(value);
      return;
    }

    if (field === "weight") {
      setWeight(value);
      return;
    }

    if (field === "notes") {
      setNotes(value);
    }
    if (field === "bloodGroup") {
      setBloodGroup(value);
    }
  };


  const handleSaveAssessment = () => {
    const rawStudentId =
      selectedStudent?.id ??
      selectedStudent?.cus_id ??
      selectedStudent?.student_id ??
      selectedStudent?.studentId ??
      studentId;

    const numericStudentId = Number(rawStudentId) || 0;
    const numericCampId = Number(selectedCampId) || Number(selectedStudent?.camp_id) || 1;

    const bloodGroupIndex = bloodGroupOptions.indexOf(bloodGroup);
    const bloodGroupId = bloodGroupIndex !== -1 ? bloodGroupIndex + 1 : 0;

    const allergyIndex = allergyOptions.indexOf(allergy);
    const allergyId = allergyIndex !== -1 ? allergyIndex : null;

    const chronicDiseaseIndex = chronicDiseaseOptions.indexOf(chronicDisease);
    const chronicDiseaseId = chronicDiseaseIndex !== -1 ? chronicDiseaseIndex : null;

    const immunizationMap = { up_to_date: 1, partial: 2, overdue: 3 };
    const immunizationId = immunizationMap[immunization] || 1;

    const standardMap = { "Below Average": 1, "Average": 2, "Above Average": 3 };
    const heightStandardId = standardMap[heightStandardResult?.standard] || 2;
    const weightStandardId = standardMap[weightStandardResult?.standard] || 2;

    const numHeight = Number(height) || 0;
    const numWeight = Number(weight) || 0;
    const bmiCategoryMap = {
      "Underweight": 1,
      "Normal": 2,
      "Overweight": 3,
      "Obese": 4,
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
      height_standard_id: heightStandardId,
      weight_standard_id: weightStandardId,
      bmi_category_id: bmiCategoryId,
    };
    console.log(payload,"payload");
    

    const existingRecordId =
      getSelectedStudentScreeningData?.id ??
      getSelectedStudentScreeningData?.screening_id ??
      getSelectedStudentScreeningData?.screeningId;

    const saveAction = existingRecordId
      ? updateInitialScreening({ id: existingRecordId, payload })
      : createInitialScreening(payload);

    dispatch(saveAction)
      .unwrap()
      .then(() => {
        dispatch(
          getInitialScreening({
            all: true,
            search: "",
            status: "all",
            sortBy: "name",
            sortOrder: "asc",
          }),
        );
      })
      .catch((error) => {
        console.error("Unable to save general screening:", error);
      });
  };

  const handleCancelAssessment = () => {
    applyScreeningRecordToForm(getSelectedStudentScreeningData);
  };

  const bloodGroupToggleOptions = bloodGroupOptions.map((g) => ({
    value: g,
    label: g,
    tone: "neutral",
  }));

  return (
    <section className="space-y-4 ">
      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 py-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary aspect-square">
              <Cross className="size-6" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
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
          <CampStudentSelectorDrawer
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
      <>
        <StudentFilter
          filterPayload={filterPayload}
          isLoading={isLoading}
          schoolName={schoolName}
          academicYear={academicYear}
          classFilter={classFilter}
          sectionFilter={sectionFilter}
          studentFilter={studentFilter}
          onSchoolNameChange={(value) => {
            setSchoolName(value);
            setClassFilter("all");
            setSectionFilter("all");
            setStudentFilter("all");
            setStudentId("");
          }}
          onAcademicYearChange={(value) => {
            setAcademicYear(value);
            setClassFilter("all");
            setSectionFilter("all");
            setStudentFilter("all");
            setStudentId("");
          }}
          onClassFilterChange={(value) => {
            setClassFilter(value);
            setSectionFilter("all");
            setStudentFilter("all");
            setStudentId("");
          }}
          onSectionFilterChange={(value) => {
            setSectionFilter(value);
            setStudentFilter("all");
            setStudentId("");
          }}
          onStudentFilterChange={(value) => {
            setStudentFilter(value);
            setStudentId(value === "all" ? "" : value);
          }}
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
              <AssessmentCard
                onChange={handleAssessmentChange}
                form={assessmentForm}
                data={getSelectedStudentScreeningData}
                studentOptions={assessmentStudentOptions}
                studentValue={studentSelectValue}
                isScreeningLoading={studentsLoading || getData.studentCampLoading}
                isScreeningError={studentsError || getData.studentCampQueryError}
                isScreening={true}
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
                }}
                onSave={handleSaveAssessment}
                onCancel={handleCancelAssessment}
              />
              {/* ---------------- Middle column: growth & vitals ---------------- */}
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

                {/* Height & Weight */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {/* Height */}
                  <div className="rounded-xl border border-border/70 bg-background p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-info/10">
                        <Ruler className="size-4 text-info" />
                      </div>

                      <span className="text-[11px] text-muted-foreground">cm</span>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">Height</p>

                    <div className="mt-1 flex items-end gap-1">
                      <span className="text-2xl font-semibold tracking-tight">
                        {height || "0 cm"}
                      </span>

                      {/* <span className="mb-1 text-xs text-muted-foreground">cm</span> */}
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="rounded-xl border border-border/70 bg-background p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-success/10">
                        <Weight className="size-4 text-success" />
                      </div>

                      <span className="text-[11px] text-muted-foreground">kg</span>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">Weight</p>

                    <div className="mt-1 flex items-end gap-1">
                      <span className="text-2xl font-semibold tracking-tight">
                        {weight || "0 kg"}
                      </span>

                      {/* <span className="mb-1 text-xs text-muted-foreground">kg</span> */}
                    </div>
                  </div>
                </div>

                {/* Input fields */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <NumberField
                    label="Height"
                    value={height}
                    onChange={setHeight}
                    unit="cm"
                  />

                  <NumberField
                    label="Weight"
                    value={weight}
                    onChange={setWeight}
                    unit="kg"
                  />
                </div>

                {/* Standards */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                </div>

                {/* BMI CARD */}
                <div className="mt-5 overflow-hidden rounded-2xl border border-border/70 bg-background">
                  {/* BMI Header */}
                  <div className="flex flex-col md:flex-row items-center justify-between border-b border-border/70 px-4 py-3">
                    <div>
                      <h3 className="text-sm font-semibold">Body Mass Index</h3>

                      <p className="text-[11px] text-muted-foreground">
                        Calculated from height and weight
                      </p>
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-xs font-medium ${category.tone === "success"
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
                  {/* <div className="relative px-4 py-5">
              <BmiGauge  bmi={initialScreeningData?.bmi} category={category} />
            </div> */}
                  {/* BMI Visualization */}
                  <div className="relative px-4 py-5">
                    <BmiGauge bmi={bmi || getSelectedStudentScreeningData?.bmi} />
                  </div>

                  {/* BMI Details */}
                  <div className="grid grid-cols-3 divide-x divide-border/70 border-t border-border/70">
                    <div className="p-4 text-center">
                      <p className="text-[11px] text-muted-foreground">BMI</p>

                      <p className="mt-1 text-lg font-semibold">
                        {bmi || getSelectedStudentScreeningData?.bmi || 0.0}
                        {/* {Number.isFinite(Number(getSelectedStudentScreeningData?.bmi))
                          ? Number(getSelectedStudentScreeningData?.bmi).toFixed(1)
                          : "0.0"} */}
                      </p>
                    </div>

                    <div className="p-4 text-center">
                      <p className="text-[11px] text-muted-foreground">Height</p>

                      <p className="mt-1 text-sm font-semibold">
                        {getSelectedStudentScreeningData?.height ? `${getSelectedStudentScreeningData.height} ` : "0 cm"}
                      </p>
                    </div>

                    <div className="p-4 text-center">
                      <p className="text-[11px] text-muted-foreground">Weight</p>

                      <p className="mt-1 text-sm font-semibold">
                        {getSelectedStudentScreeningData?.weight ? `${getSelectedStudentScreeningData.weight}` : "0 kg"}
                      </p>
                    </div>
                  </div>
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
                      Height, weight and BMI are currently within the expected range
                      for this assessment.
                    </p>
                  </div>
                </div>
              </article>

              {/* ---------------- Right column: health profile ---------------- */}
              <div className="space-y-4">
                <article className="space-y-4 rounded-xl border border-border bg-card p-4">
                  <ToggleGroup
                    label="Blood Group"
                    options={bloodGroupToggleOptions}
                    value={bloodGroup}
                    onChange={setBloodGroup}
                    columns={8}
                  />
                  <ToggleGroup
                    label="Immunization Status"
                    options={immunizationOptions}
                    value={immunization}
                    onChange={setImmunization}
                    columns={3}
                  />
                </article>

                <article className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Health History
                  </h3>
                  <div className="mt-3 space-y-3">
                    <SelectField
                      label="Allergy"
                      options={allergyOptions}
                      value={allergy}
                      onChange={setAllergy}
                    />
                    <SelectField
                      label="Chronic Disease"
                      options={chronicDiseaseOptions}
                      value={chronicDisease}
                      onChange={setChronicDisease}
                    />
                  </div>
                </article>

                <article className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter notes"
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
              action={(
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCaDrawerOpen(true)}
                >
                  <Search className="size-4" />
                  Select Student
                </Button>
              )}
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
    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-3">
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
