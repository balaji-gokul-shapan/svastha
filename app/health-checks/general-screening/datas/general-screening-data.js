// Mock data + helpers for the General Screening form.
// Maps directly onto the API shape:
// { student_id, blood_group_id, allergy_id, chronic_disease_id, immunization_id,
//   height, weight, height_standard_id, weight_standard_id, bmi, bmi_category_id }
//
// Swap the option arrays for real lookup-table data later — the shapes
// (value/label, or plain strings) are what the form already expects.
import OverweightIcon from '@iconify-react/healthicons/overweight';
import Overweight24pxIcon from '@iconify-react/healthicons/overweight-24px';
import UnderweightIcon from '@iconify-react/healthicons/underweight';
import ManIcon from '@iconify-react/healthicons/man';
export const studentOptions = [
  { id: 1, name: "Devvrat Guneta" },
  { id: 2, name: "Aarav Mehta" },
  { id: 3, name: "Ishita Sharma" },
  { id: 4, name: "Kabir Nair" },
  { id: 5, name: "Ananya Reddy" },
];

export const locationOptions = ["Sunshine Public School", "Riverside Elementary", "Maple Grove Academy"];
export const examinerOptions = ["Dr. Priya Sharma", "Dr. Arjun Mehta", "Dr. Kavya Reddy"];
export const assistantOptions = ["Riya Nair", "Sanjay Kumar", "Meera Iyer"];

export const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const allergyOptions = ["None", "Peanuts", "Dust", "Pollen", "Penicillin", "Lactose", "Seafood"];

export const chronicDiseaseOptions = [
  "None",
  "Asthma",
  "Type 1 Diabetes",
  "Epilepsy",
  "Congenital Heart Disease",
  "Anemia",
];

export const immunizationOptions = [
  { value: "up_to_date", label: "Up to date", tone: "good" },
  { value: "partial", label: "Partial", tone: "warn" },
  { value: "overdue", label: "Overdue", tone: "bad" },
];

export const heightStandardOptions = ["Below Average", "Average", "Above Average"];
export const weightStandardOptions = ["Below Average", "Average", "Above Average"];

// ---------------------------------------------------------------------------
// BMI calculation + clinical category cutoffs (standard WHO adult bands —
// swap for pediatric growth-chart percentiles if that's what bmi_category_id
// actually references in your schema).
// ---------------------------------------------------------------------------

export function calcBmi(heightCm, weightKg) {
  const height = Number(heightCm);
  const weight = Number(weightKg);

  if (
    !Number.isFinite(height) ||
    !Number.isFinite(weight) ||
    height <= 0 ||
    weight <= 0
  ) {
    return null;
  }

  const heightM = height / 100;

  return Number((weight / (heightM * heightM)).toFixed(2));
}

export function bmiCategory(bmiValue, categories = FALLBACK_CATEGORIES) {
  const bmi = Number(bmiValue);

  // Invalid / empty BMI
  if (
    bmiValue == null ||
    bmiValue === "" ||
    !Number.isFinite(bmi)
  ) {
    return {
      label: "—",
      icon: ManIcon,
      tone: "muted",
    };
  }

  const category = categories.find((item) => {
    const min = Number(item.min_value);
    const max = Number(item.max_value);

    return bmi >= min && bmi <= max;
  });

  if (!category) {
    return {
      label: "—",
      icon: ManIcon,
      tone: "muted",
    };
  }

  switch (category.name.toLowerCase()) {
    case "underweight":
      return {
        label: category.name,
        icon: UnderweightIcon,
        tone: "info",
      };

    case "normal":
      return {
        label: category.name,
        icon: ManIcon,
        tone: "success",
      };

    case "overweight":
      return {
        label: category.name,
        icon: Overweight24pxIcon,
        tone: "warning",
      };

    case "obese":
      return {
        label: category.name,
        icon: OverweightIcon,
        tone: "destructive",
      };

    case "severely obese":
      return {
        label: category.name,
        icon: OverweightIcon,
        tone: "destructive",
      };

    default:
      return {
        label: category.name,
        icon: ManIcon,
        tone: "muted",
      };
  }
}

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Underweight", min_value: "0.00", max_value: "18.49" },
  { id: 2, name: "Normal", min_value: "18.50", max_value: "24.90" },
  { id: 3, name: "Overweight", min_value: "25.00", max_value: "29.90" },
  { id: 4, name: "Obese", min_value: "30.00", max_value: "34.90" },
  { id: 5, name: "Severely Obese", min_value: "35.00", max_value: "999.00" },
];

export const GROWTH_STANDARD_BANDS = [
  {
    minAge: 5,
    maxAge: 6,
    heightMin: 105,
    heightMax: 124,
    weightMin: 15,
    weightMax: 25,
  },
  {
    minAge: 7,
    maxAge: 8,
    heightMin: 115,
    heightMax: 136,
    weightMin: 19,
    weightMax: 32,
  },
  {
    minAge: 9,
    maxAge: 10,
    heightMin: 126,
    heightMax: 148,
    weightMin: 24,
    weightMax: 40,
  },
  {
    minAge: 11,
    maxAge: 12,
    heightMin: 136,
    heightMax: 162,
    weightMin: 30,
    weightMax: 51,
  },
  {
    minAge: 13,
    maxAge: 14,
    heightMin: 148,
    heightMax: 174,
    weightMin: 38,
    weightMax: 64,
  },
  {
    minAge: 15,
    maxAge: 16,
    heightMin: 154,
    heightMax: 182,
    weightMin: 45,
    weightMax: 72,
  },
  {
    minAge: 17,
    maxAge: 18,
    heightMin: 158,
    heightMax: 186,
    weightMin: 50,
    weightMax: 80,
  },
];

// ---------------------------------------------------------------------------
// Age-based reference ranges for vitals (resting, school-age children).
// Bands mirror GROWTH_STANDARD_BANDS by age so one DOB lookup covers both.
// Values are standard pediatric reference tables; treat them as the default
// and swap in your school's / board's source-of-truth numbers as needed.
// ---------------------------------------------------------------------------
export const VITALS_STANDARD_BANDS = [
  {
    minAge: 5,
    maxAge: 6,
    pulseMin: 75,
    pulseMax: 115,
    bpSystolicMin: 95,
    bpSystolicMax: 105,
    bpDiastolicMin: 57,
    bpDiastolicMax: 68,
    spo2Min: 95,
    spo2Max: 100,
    tempMin: 36.1,
    tempMax: 37.2,
  },
  {
    minAge: 7,
    maxAge: 8,
    pulseMin: 70,
    pulseMax: 110,
    bpSystolicMin: 97,
    bpSystolicMax: 107,
    bpDiastolicMin: 57,
    bpDiastolicMax: 69,
    spo2Min: 95,
    spo2Max: 100,
    tempMin: 36.1,
    tempMax: 37.2,
  },
  {
    minAge: 9,
    maxAge: 10,
    pulseMin: 70,
    pulseMax: 110,
    bpSystolicMin: 102,
    bpSystolicMax: 110,
    bpDiastolicMin: 61,
    bpDiastolicMax: 73,
    spo2Min: 95,
    spo2Max: 100,
    tempMin: 36.1,
    tempMax: 37.2,
  },
  {
    minAge: 11,
    maxAge: 12,
    pulseMin: 60,
    pulseMax: 105,
    bpSystolicMin: 106,
    bpSystolicMax: 114,
    bpDiastolicMin: 61,
    bpDiastolicMax: 77,
    spo2Min: 95,
    spo2Max: 100,
    tempMin: 36.1,
    tempMax: 37.2,
  },
  {
    minAge: 13,
    maxAge: 14,
    pulseMin: 60,
    pulseMax: 100,
    bpSystolicMin: 110,
    bpSystolicMax: 119,
    bpDiastolicMin: 65,
    bpDiastolicMax: 76,
    spo2Min: 95,
    spo2Max: 100,
    tempMin: 36.1,
    tempMax: 37.2,
  },
  {
    minAge: 15,
    maxAge: 16,
    pulseMin: 60,
    pulseMax: 100,
    bpSystolicMin: 112,
    bpSystolicMax: 124,
    bpDiastolicMin: 66,
    bpDiastolicMax: 78,
    spo2Min: 95,
    spo2Max: 100,
    tempMin: 36.1,
    tempMax: 37.2,
  },
  {
    minAge: 17,
    maxAge: 18,
    pulseMin: 60,
    pulseMax: 100,
    bpSystolicMin: 118,
    bpSystolicMax: 128,
    bpDiastolicMin: 65,
    bpDiastolicMax: 83,
    spo2Min: 95,
    spo2Max: 100,
    tempMin: 36.1,
    tempMax: 37.2,
  },
];