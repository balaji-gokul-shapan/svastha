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
  { id: "6m", label: "6 Months", months: 6 },
  { id: "9m", label: "9 Months", months: 9 },
  { id: "12m", label: "12 Months", months: 12 },
  { id: "15m", label: "15 Months", months: 15 },
  { id: "18m", label: "18 Months", months: 18 },
  { id: "2y", label: "2 Years", months: 24 },
  { id: "4-6y", label: "4–6 Years", months: 60 },
  { id: "10-12y", label: "10–12 Years", months: 132 },
  { id: "16-18y", label: "16–18 Years", months: 204 },
];

// UIP-style per-dose schedule (grouped by age band via `ageRange`).
// KEPT FOR REFERENCE — not consumed by the current matrix UI, which expects
// the flat `vaccines` shape defined below (id/name/category/schedule).
// NOTE: ids here (hep-b1, opv-0, ipv-1, …) intentionally differ from the flat
// list and from `demoDoseRecords`; rewire the records if you adopt this shape.
export const uipScheduleGroups = [
  // uipScheduleGroups
  // INFANT (0 - 1 Years)
  // ============================================================
  {
    id: "bcg",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "Birth",
    name: "BCG",
  },
  {
    id: "hep-b1",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "Birth",
    name: "HEP B1",
  },
  {
    id: "hep-b2",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "6 Week to 10 Week",
    name: "HEP B2",
  },
  {
    id: "opv-0",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "Birth",
    name: "OPV 0",
  },
  {
    id: "ipv-1",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "6 Week to 6 Week",
    name: "IPV 1",
  },
  {
    id: "ipv-2",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "10 Week to 10 Week",
    name: "IPV 2",
  },
  {
    id: "ipv-3",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "14 Week to 18 Week",
    name: "IPV 3",
  },
  {
    id: "opv-1",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "6 Month to 6 Month",
    name: "OPV 1",
  },
  {
    id: "opv-2",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "9 Month to 9 Month",
    name: "OPV 2",
  },
  {
    id: "dtp-1",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "6 Week to 6 Week",
    name: "DTP 1",
  },
  {
    id: "dtp-2",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "10 Week to 10 Week",
    name: "DTP 2",
  },
  {
    id: "dtp-3",
    ageRange: "INFANT",
    age: "(0 - 1) Years",
    timing: "14 Week to 14 Week",
    name: "DTP 3",
  },

  // ============================================================
  // TODDLER (2 - 4 Years)
  // ============================================================
  {
    id: "hep-b3",
    ageRange: "TODDLER",
    age: "(2 - 4) Years",
    timing: "13 Month to 18 Month",
    name: "HEP B3",
  },
  {
    id: "ipv-b1",
    ageRange: "TODDLER",
    age: "(2 - 4) Years",
    timing: "12 Month to 18 Month",
    name: "IPV B1",
  },
  {
    id: "dtp-b1",
    ageRange: "TODDLER",
    age: "(2 - 4) Years",
    timing: "15 Month to 18 Month",
    name: "DTP B1",
  },

  // ============================================================
  // CHILD (5 - 12 Years)
  // ============================================================
  {
    id: "opv-3",
    ageRange: "CHILD",
    age: "(5 - 12) Years",
    timing: "4 years to 6 years",
    name: "OPV 3",
  },
  {
    id: "dtp-b2",
    ageRange: "CHILD",
    age: "(5 - 12) Years",
    timing: "4 years to 6 years",
    name: "DTP B2",
  },
];

// Each vaccine's `schedule` lists the milestone ids it's due at — sparse on
// purpose, most vaccines only apply to a handful of checkpoints.
// This is the shape consumed by ImmunizationMatrix and the page stats.
export const vaccines = [
 {
    id: "bcg",
    name: "BCG",
    category: "Tuberculosis",
    schedule: ["birth"],
  },

  {
    id: "hepb1",
    name: "Hepatitis B1",
    category: "Hepatitis",
    schedule: ["birth"],
  },

  {
    id: "hepb2",
    name: "Hepatitis B2",
    category: "Hepatitis",
    schedule: ["6w", "10w"],
  },

  {
    id: "opv",
    name: "OPV 0",
    category: "Polio",
    schedule: ["birth"],
  },

  {
    id: "ipv1",
    name: "IPV 1",
    category: "Polio",
    schedule: ["6w"],
  },

  {
    id: "ipv2",
    name: "IPV 2",
    category: "Polio",
    schedule: ["10w"],
  },

  {
    id: "ipv3",
    name: "IPV 3",
    category: "Polio",
    schedule: ["14w"],
  },

  {
    id: "opv1",
    name: "OPV 1",
    category: "Polio",
    schedule: ["6m"],
  },

  {
    id: "opv2",
    name: "OPV 2",
    category: "Polio",
    schedule: ["9m"],
  },

  {
    id: "dtp1",
    name: "DTP 1",
    category: "Diphtheria, Tetanus, Pertussis",
    schedule: ["6w"],
  },

  {
    id: "dtp2",
    name: "DTP 2",
    category: "Diphtheria, Tetanus, Pertussis",
    schedule: ["10w"],
  },

  {
    id: "dtp3",
    name: "DTP 3",
    category: "Diphtheria, Tetanus, Pertussis",
    schedule: ["14w"],
  },

  {
    id: "hepb3",
    name: "Hepatitis B3",
    category: "Hepatitis",
    schedule: ["13m", "18m"],
  },

  {
    id: "ipvb1",
    name: "IPV B1",
    category: "Polio",
    schedule: ["12m", "18m"],
  },

  {
    id: "dtpb1",
    name: "DTP B1",
    category: "Diphtheria, Tetanus, Pertussis",
    schedule: ["15m", "18m"],
  },

  {
    id: "opv3",
    name: "OPV 3",
    category: "Polio",
    schedule: ["4-6y"],
  },

  {
    id: "dtpb2",
    name: "DTP B2",
    category: "Diphtheria, Tetanus, Pertussis",
    schedule: ["4-6y"],
  },

  
  // { id: "hib", name: "Hib", category: "Haemophilus influenzae b", schedule: ["6w", "10w", "14w"] },
  // { id: "pcv", name: "PCV", category: "Pneumococcal", schedule: ["6w", "10w", "14w"] },
  // { id: "rota", name: "Rotavirus", category: "Rotavirus", schedule: ["6w", "10w", "14w"] },
  // { id: "mmr", name: "MMR", category: "Measles, Mumps, Rubella", schedule: ["12m", "4-6y"] },
  // { id: "varicella", name: "Varicella", category: "Chickenpox", schedule: ["15m", "4-6y"] },
  // { id: "hepa", name: "Hepatitis A", category: "Hepatitis", schedule: ["12m", "18m"] },
  // { id: "typhoid", name: "Typhoid", category: "Typhoid", schedule: ["2y"] },
  // { id: "hpv", name: "HPV", category: "Human Papillomavirus", schedule: ["10-12y"] },
  // { id: "mcv", name: "Meningococcal", category: "Meningococcal disease", schedule: ["10-12y", "16-18y"] },
];

// Demo dose records — replace with fetched records for a real student.
export const demoDoseRecords = [
  { vaccineId: "bcg", milestoneId: "birth", dateGiven: "2020-06-16", batch: "BCG-2020-114", administeredBy: "Dr. Priya Sharma" },
  { vaccineId: "hepb1", milestoneId: "birth", dateGiven: "2020-06-16", batch: "HB-2020-021", administeredBy: "Dr. Priya Sharma" },
  { vaccineId: "hepb2", milestoneId: "6w", dateGiven: "2020-07-28", batch: "HB-2020-098", administeredBy: "Dr. Arjun Mehta" },
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
  //
  // Orphaned after the per-dose vaccine split (ignored by the chart because
  // the vaccineId no longer exists or the milestone isn't in that vaccine's
  // schedule): hepb/14w, opv/6w, opv/10w, opv/14w.
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