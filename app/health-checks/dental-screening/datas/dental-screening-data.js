// Mock data + helpers for the New Dental Assessment form.
// Swap `initialToothChart` and the dropdown option arrays for real data later —
// every shape here is what the UI expects, so the rest of the form won't need to change.

// ---------------------------------------------------------------------------
// FDI (ISO 3950) tooth numbering
// First digit = quadrant
//   1 upper-right, 2 upper-left, 3 lower-left, 4 lower-right   (permanent)
//   5 upper-right, 6 upper-left, 7 lower-left, 8 lower-right   (deciduous/primary)
// Second digit = position from the midline
//   permanent: 1 = central incisor ... 8 = third molar
//   primary  : 1 = central incisor ... 3 = canine, 4 = first molar, 5 = second molar
// ---------------------------------------------------------------------------

const QUADRANT_LABEL = {
  1: "Upper Right",
  2: "Upper Left",
  3: "Lower Left",
  4: "Lower Right",
  5: "Upper Right",
  6: "Upper Left",
  7: "Lower Left",
  8: "Lower Right",
};

const POSITION_LABEL = {
  1: "Central Incisor",
  2: "Lateral Incisor",
  3: "Canine",
  4: "First Premolar",
  5: "Second Premolar",
  6: "First Molar",
  7: "Second Molar",
  8: "Third Molar",
};

// Deciduous (baby) teeth have no premolars — the 4th/5th positions are molars,
// which are later replaced by the premolars of the permanent dentition.
const PRIMARY_POSITION_LABEL = {
  1: "Central Incisor",
  2: "Lateral Incisor",
  3: "Canine",
  4: "First Molar",
  5: "Second Molar",
};

export function getToothName(fdiNumber) {
  const [quadrant, position] = String(fdiNumber).split("").map(Number);
  const quadrantLabel = QUADRANT_LABEL[quadrant];
  if (!quadrantLabel) {
    return `Tooth ${fdiNumber}`;
  }
  const positionLabel =
    quadrant >= 5
      ? PRIMARY_POSITION_LABEL[position]
      : POSITION_LABEL[position];
  return `${quadrantLabel} ${positionLabel ?? "Unknown"}`;
}

export const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const UPPER_TEETH_POSITION = [8,7,6,5,4,3,2,1,1,2,3,4,5,6,7,8]
export const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
export const PRIMARY_TEETH_UPPER = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
export const PRIMARY_TEETH_LOWER = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];
export const UPPER_TEETH_POSITION_PRIMARY = [5, 4, 3, 2, 1, 1, 2, 3, 4, 5]
// export 

// ---------------------------------------------------------------------------
// Legend + status colors
// Tailwind classes reference the shared theme tokens where possible;
// "sealant" borrows a raw purple since it's a chart-only status, not a
// brand color used elsewhere in the app.
// ---------------------------------------------------------------------------

export const toothChartLegend = [
  { value: "healthy", label: "Healthy", colorClass: "bg-success" },
  { value: "caries", label: "Caries", colorClass: "bg-destructive" },
  { value: "filled", label: "Filled", colorClass: "bg-info" },
  { value: "missing", label: "Missing", colorClass: "bg-muted-foreground/50" },
  { value: "sealant", label: "Sealant", colorClass: "bg-purple-500" },
  { value: "other", label: "Other", colorClass: "bg-warning" },
];

export const TOOTH_STATUS_COLOR = {
  healthy: "text-success",
  caries: "text-destructive",
  filled: "text-info",
  missing: "text-muted-foreground/50",
  sealant: "text-purple-500",
  other: "text-warning",
};

// ---------------------------------------------------------------------------
// Assessment form dropdown options
// ---------------------------------------------------------------------------

export const locationOptions = ["Sunshine Public School", "Riverside Elementary", "Maple Grove Academy"];
export const examinerOptions = ["Dr. Priya Sharma", "Dr. Arjun Mehta", "Dr. Kavya Reddy"];
export const assistantOptions = ["Riya Nair", "Sanjay Kumar", "Meera Iyer"];

export const oralHygieneOptions = [
  { value: "good", label: "Good", tone: "good" },
  { value: "fair", label: "Fair", tone: "warn" },
  { value: "poor", label: "Poor", tone: "bad" },
];

export const gingivalHealthOptions = [
  { value: "healthy", label: "Healthy", tone: "good" },
  { value: "gingivitis", label: "Gingivitis", tone: "warn" },
  { value: "periodontitis", label: "Periodontitis", tone: "bad" },
];

export const plaqueOptions = [
  { value: "none", label: "None", tone: "good" },
  { value: "mild", label: "Mild", tone: "warn" },
  { value: "moderate", label: "Moderate", tone: "warn" },
  { value: "heavy", label: "Heavy", tone: "bad" },
];

export const otherFindingsOptions = [
  { id: "fluorosis", label: "Dental Fluorosis" },
  { id: "malocclusion", label: "Malocclusion" },
  { id: "toothWear", label: "Tooth Wear" },
  { id: "oralUlcer", label: "Oral Ulcer" },
  { id: "trauma", label: "Trauma" },
];

// ---------------------------------------------------------------------------
// Initial tooth chart — 32 permanent teeth.
// Every tooth not listed explicitly defaults to "healthy" (see buildChart below).
// ---------------------------------------------------------------------------

const overrides = {
  18: { status: "missing" },
  17: { status: "missing" },
  16: {
    status: "caries",
    surface: "Occlusal",
    severity: "Moderate",
    treatment: "Restoration",
  },
  26: { status: "filled", surface: "Mesial", severity: "—", treatment: "Composite filling placed" },
  24: { status: "filled", surface: "Occlusal", severity: "—", treatment: "Composite filling placed" },
  14: { status: "sealant", surface: "Occlusal", severity: "—", treatment: "Sealant applied" },
  46: {
    status: "other",
    surface: "—",
    severity: "Mild",
    treatment: "Monitor — fluorosis staining",
  },
  36: {
    status: "caries",
    surface: "Occlusal",
    severity: "Moderate",
    treatment: "Restoration",
  },
};

function buildChart() {
  return [...UPPER_TEETH, ...LOWER_TEETH].map((number) => ({
    number,
    status: "healthy",
    surface: "—",
    severity: "—",
    treatment: "No treatment needed",
    ...overrides[number],
  }));
}
export const MAX_SCORE = 5;

export function scoreTone(score) {
  if (score <= 1) return "success";
  if (score <= 3) return "warning";
  return "destructive";
}

export const TONE_BADGE_CLASS = {
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
  warning: "bg-warning/20 text-warning-foreground",
  destructive: "bg-destructive/15 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

export const TONE_BAR_CLASS = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
export const initialToothChart = buildChart();