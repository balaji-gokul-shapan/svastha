// Immunization chart data + helpers.
// This is a REPRESENTATIVE schedule for UI purposes, not a medical
// reference — swap `vaccines` for your actual/local immunization schedule
// (e.g. CDC, WHO, or your country's national schedule) before shipping.

export const studentOptions = [
  { id: 1, name: "Devvrat Guneta", dob: "2020-06-15" },
  { id: 2, name: "Aarav Mehta", dob: "2018-03-02" },
  { id: 3, name: "Ishita Sharma", dob: "2015-11-20" },
];

// Age checkpoints, in months from birth. Order matters — it's the column order.
export const ageMilestones = [
  { id: "birth", label: "Birth", months: 0 },
  { id: "6w", label: "6 Weeks", months: 1.5 },
  { id: "10w", label: "10 Weeks", months: 2.5 },
  { id: "14w", label: "14 Weeks", months: 3.5 },
  { id: "12m", label: "12 Months", months: 12 },
  { id: "15m", label: "15 Months", months: 15 },
  { id: "18m", label: "18 Months", months: 18 },
  { id: "2y", label: "2 Years", months: 24 },
  { id: "4-6y", label: "4–6 Years", months: 60 },
  { id: "10-12y", label: "10–12 Years", months: 132 },
  { id: "16-18y", label: "16–18 Years", months: 204 },
];

// Each vaccine's `schedule` lists the milestone ids it's due at — sparse on
// purpose, most vaccines only apply to a handful of checkpoints.
export const vaccines = [
  { id: "bcg", name: "BCG", category: "Tuberculosis", schedule: ["birth"] },
  { id: "hepb", name: "Hepatitis B", category: "Hepatitis", schedule: ["birth", "6w", "14w"] },
  { id: "opv", name: "OPV / IPV", category: "Polio", schedule: ["birth", "6w", "10w", "14w"] },
  { id: "dtap", name: "DTaP / Tdap", category: "Diphtheria, Tetanus, Pertussis", schedule: ["6w", "10w", "14w", "18m", "4-6y", "10-12y"] },
  { id: "hib", name: "Hib", category: "Haemophilus influenzae b", schedule: ["6w", "10w", "14w"] },
  { id: "pcv", name: "PCV", category: "Pneumococcal", schedule: ["6w", "10w", "14w"] },
  { id: "rota", name: "Rotavirus", category: "Rotavirus", schedule: ["6w", "10w", "14w"] },
  { id: "mmr", name: "MMR", category: "Measles, Mumps, Rubella", schedule: ["12m", "4-6y"] },
  { id: "varicella", name: "Varicella", category: "Chickenpox", schedule: ["15m", "4-6y"] },
  { id: "hepa", name: "Hepatitis A", category: "Hepatitis", schedule: ["12m", "18m"] },
  { id: "typhoid", name: "Typhoid", category: "Typhoid", schedule: ["2y"] },
  { id: "hpv", name: "HPV", category: "Human Papillomavirus", schedule: ["10-12y"] },
  { id: "mcv", name: "Meningococcal", category: "Meningococcal disease", schedule: ["10-12y", "16-18y"] },
];

// Demo dose records — replace with fetched records for a real student.
export const demoDoseRecords = [
  { vaccineId: "bcg", milestoneId: "birth", dateGiven: "2020-06-16", batch: "BCG-2020-114", administeredBy: "Dr. Priya Sharma" },
  { vaccineId: "hepb", milestoneId: "birth", dateGiven: "2020-06-16", batch: "HB-2020-021", administeredBy: "Dr. Priya Sharma" },
  { vaccineId: "hepb", milestoneId: "6w", dateGiven: "2020-07-28", batch: "HB-2020-098", administeredBy: "Dr. Arjun Mehta" },
  { vaccineId: "hepb", milestoneId: "14w", dateGiven: "2020-09-22", batch: "HB-2020-155", administeredBy: "Dr. Arjun Mehta" },
  { vaccineId: "opv", milestoneId: "birth", dateGiven: "2020-06-16", batch: "OPV-2020-011", administeredBy: "Dr. Priya Sharma" },
  { vaccineId: "opv", milestoneId: "6w", dateGiven: "2020-07-28", batch: "OPV-2020-076", administeredBy: "Dr. Arjun Mehta" },
  { vaccineId: "opv", milestoneId: "10w", dateGiven: "2020-08-25", batch: "OPV-2020-102", administeredBy: "Dr. Arjun Mehta" },
  { vaccineId: "opv", milestoneId: "14w", dateGiven: "2020-09-22", batch: "OPV-2020-140", administeredBy: "Dr. Arjun Mehta" },
  { vaccineId: "dtap", milestoneId: "6w", dateGiven: "2020-07-28", batch: "DT-2020-063", administeredBy: "Dr. Arjun Mehta" },
  { vaccineId: "dtap", milestoneId: "10w", dateGiven: "2020-08-25", batch: "DT-2020-091", administeredBy: "Dr. Arjun Mehta" },
  { vaccineId: "dtap", milestoneId: "14w", dateGiven: "2020-09-22", batch: "DT-2020-133", administeredBy: "Dr. Arjun Mehta" },
  { vaccineId: "dtap", milestoneId: "18m", dateGiven: "2021-12-20", batch: "DT-2021-284", administeredBy: "Dr. Kavya Reddy" },
  { vaccineId: "hib", milestoneId: "6w", dateGiven: "2020-07-28", batch: "HIB-2020-060" },
  { vaccineId: "hib", milestoneId: "10w", dateGiven: "2020-08-25", batch: "HIB-2020-089" },
  { vaccineId: "hib", milestoneId: "14w", dateGiven: "2020-09-22", batch: "HIB-2020-131" },
  { vaccineId: "pcv", milestoneId: "6w", dateGiven: "2020-07-28", batch: "PCV-2020-058" },
  { vaccineId: "pcv", milestoneId: "10w", dateGiven: "2020-08-25", batch: "PCV-2020-087" },
  { vaccineId: "rota", milestoneId: "6w", dateGiven: "2020-07-28", batch: "ROT-2020-055" },
  { vaccineId: "rota", milestoneId: "10w", dateGiven: "2020-08-25", batch: "ROT-2020-084" },
  { vaccineId: "rota", milestoneId: "14w", dateGiven: "2020-09-22", batch: "ROT-2020-128" },
  { vaccineId: "mmr", milestoneId: "12m", dateGiven: "2021-06-20", batch: "MMR-2021-201" },
  { vaccineId: "varicella", milestoneId: "15m", dateGiven: "2021-09-18", batch: "VAR-2021-233" },
  { vaccineId: "hepa", milestoneId: "12m", dateGiven: "2021-06-20", batch: "HEA-2021-199" },
  { vaccineId: "hepa", milestoneId: "18m", dateGiven: "2021-12-20", batch: "HEA-2021-282" },
  { vaccineId: "typhoid", milestoneId: "2y", dateGiven: "2022-07-01", batch: "TYP-2022-045" },
  // pcv/14w, dtap/4-6y & 10-12y, mmr/4-6y, varicella/4-6y, hpv, mcv: no
  // records — these are what the "due / overdue / upcoming" logic below
  // will classify.
];

// ---------------------------------------------------------------------------
// Age + status calculation
// ---------------------------------------------------------------------------

export function ageInMonths(dob, atDate = new Date()) {
  const birth = new Date(dob);
  const now = new Date(atDate);
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

export function formatAge(months) {
  const years = Math.floor(months / 12);
  const remMonths = Math.round(months % 12);
  if (years === 0) return `${remMonths} mo`;
  if (remMonths === 0) return `${years} yr`;
  return `${years} yr ${remMonths} mo`;
}

// Status for one vaccine/milestone cell:
// "given" | "due" | "overdue" | "upcoming"
export function cellStatus({ ageMonths, milestoneMonths, record }) {
  if (record) return "given";
  const diff = ageMonths - milestoneMonths;
  if (diff < -0.5) return "upcoming";
  if (diff <= 1) return "due"; // within ~1 month of the checkpoint, not yet overdue
  return "overdue";
}

export const STATUS_META = {
  given: { label: "Given", tone: "success" },
  due: { label: "Due Now", tone: "warning" },
  overdue: { label: "Overdue", tone: "destructive" },
  upcoming: { label: "Upcoming", tone: "muted" },
};