// Mock data + helpers for the General Screening form.
// Maps directly onto the API shape:
// { student_id, blood_group_id, allergy_id, chronic_disease_id, immunization_id,
//   height, weight, height_standard_id, weight_standard_id, bmi, bmi_category_id }
//
// Swap the option arrays for real lookup-table data later — the shapes
// (value/label, or plain strings) are what the form already expects.

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

export function bmiCategory(bmi) {
  if (bmi == null || Number.isNaN(bmi)) return { label: "—", tone: "muted" };
  if (bmi < 18.5) return { label: "Underweight", tone: "info" };
  if (bmi < 25) return { label: "Normal", tone: "success" };
  if (bmi < 30) return { label: "Overweight", tone: "warning" };
  return { label: "Obese", tone: "destructive" };
}