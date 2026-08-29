// Mock data + helpers for the Vision Screening form.
// Field names below match the API shape exactly (od_distance_without,
// os_near_with, strabismus, uses_glasses_or_lens, etc.) — swap the option
// arrays for real lookup data later without touching the page component.

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

// Distance acuity: standard Snellen fractions, plus the notations used when
// acuity is too poor to measure on the chart at all.
export const distanceAcuityOptions = [
  "6/6", "6/9", "6/12", "6/18", "6/24", "6/36", "6/60",
  "CF (Counting Fingers)", "HM (Hand Movement)", "PL (Perception of Light)", "NPL (No Perception of Light)",
];

// Near acuity: Jaeger / N-notation.
export const nearAcuityOptions = ["N5", "N6", "N8", "N10", "N12", "N18", "N24", "N36", "NA"];

export const colorVisionStatusOptions = ["NA","Normal", "Deficient — Protanopia", "Deficient — Deuteranopia", "Deficient — Tritanopia", "Not Tested"];
export const colorVisionTestTypeOptions = ["NA","Ishihara", "Farnsworth D-15", "City University Test"];

export const coverTestOptions = ["NA","Orthophoria (Normal)", "Esophoria", "Exophoria", "Esotropia", "Exotropia", "Hypertropia", "Hypotropia"];

export const lidsOptions = ["NA","Normal", "Ptosis", "Blepharitis", "Stye", "Edema"];
export const conjunctivaOptions = ["NA","Normal", "Conjunctivitis", "Pallor", "Hyperemia", "Pterygium"];
export const corneaOptions = ["NA","Clear", "Opacity", "Scar", "Ulcer", "Arcus"];
export const pupilOptions = ["NA","Normal (PERRLA)", "Anisocoria", "Miosis", "Mydriasis", "Sluggish Reaction"];

export const refractiveErrorOptions = ["None", "Myopia", "Hyperopia", "Astigmatism", "Presbyopia", "Myopic Astigmatism", "Hyperopic Astigmatism"];
export const lensTypeOptions = ["None", "Single Vision", "Bifocal", "Progressive", "Contact Lens"];
export const followUpOptions = ["No follow-up needed", "1 month", "3 months", "6 months", "1 year"];

export const yesNoOptions = (goodValue) => {
  if (goodValue === "neutral") {
    return [
      { value: "yes", label: "Yes", tone: "neutral" },
      { value: "no", label: "No", tone: "neutral" },
    ];
  }
  return [
    { value: "yes", label: "Yes", tone: goodValue === "yes" ? "good" : "bad" },
    { value: "no", label: "No", tone: goodValue === "no" ? "good" : "bad" },
  ];
};

// ---------------------------------------------------------------------------
// Snellen-fraction severity classification, used to color the eye icons in
// the Visual Acuity Snapshot.
// ---------------------------------------------------------------------------

const SEVERE_NOTATIONS = ["CF", "HM", "PL", "NPL"];

export function classifyAcuity(value) {
  if (!value) return { label: "Not tested", tone: "muted" };

  const trimmed = value.trim();
  if (SEVERE_NOTATIONS.some((n) => trimmed.startsWith(n))) {
    return { label: "Severe", tone: "destructive" };
  }

  const match = /^6\/(\d+)/.exec(trimmed);
  if (!match) return { label: trimmed, tone: "muted" };

  const ratio = Number(match[1]) / 6;
  console.log(ratio,"ratio");
  
  if (ratio <= 1.5) return { label: "Normal", tone: "success" };
  if (ratio <= 2) return { label: "Mild", tone: "info" };
  if (ratio <= 3.9) return { label: "Moderate", tone: "warning" };
  if (ratio <= 4) return { label: "High", tone: "warning" };
  if (ratio <= 6) return { label: "severe", tone: "destructive" };
    if (ratio <= 10) return { label: "critical", tone: "destructive" };
  return { label: "critical", tone: "destructive" };
}