export const REPORT_SECTIONS = [
  { id: "student_info", label: "Student Information", defaultOn: true },
  { id: "vitals", label: "Vitals & Growth", defaultOn: true },
  { id: "vision", label: "Vision Screening", defaultOn: true },
  { id: "hearing", label: "Hearing Screening", defaultOn: true },
  { id: "dental", label: "Dental Screening", defaultOn: true },
  { id: "ent", label: "ENT Screening", defaultOn: false },
  { id: "immunization", label: "Immunization Status", defaultOn: true },
  {
    id: "recommendations",
    label: "Recommendations & Sign-off",
    defaultOn: true,
  },
];

export const settingsNav = [
  {
    id: "my-details",
    label: "My details",
    roles: [],
  },
  {
    id: "profile",
    label: "Profile",
    roles: [],
  },
  {
    id: "SchoolDetails",
    label: "School Details",
    roles: ["admin", "school_admin", "school"],
  },
  {
    id: "campDetails",
    label: "Campus Details",
    roles: ["admin", "school_admin"],
  },
  {
    id: "appearance",
    label: "Appearance",
    roles: [],
  },
  {
    id: "team",
    label: "Team",
    roles: ["admin", "school_admin", "school"],
  },
  {
    id: "report",
    label: "Report",
    roles: ["admin", "school_admin", "school"],
  },
  {
    id: "screening",
    label: "Screening",
    roles: ["admin", "school_admin", "school"],
  },
  {
    id: "applications",
    label: "Applications",
    roles: ["admin"],
  },
  {
    id: "api",
    label: "API",
    roles: ["admin"],
  },
];

export const initialAccounts = [
  {
    id: 1,
    name: "Arjun Kumar",
    designation: "School Administrator",
    status: "active",
  },
  {
    id: 2,
    name: "Priya Sharma",
    designation: "Medical Officer",
    status: "active",
  },
  {
    id: 3,
    name: "Rahul Verma",
    designation: "Teacher",
    status: "inactive",
  },
  {
    id: 4,
    name: "Kavin S",
    designation: "Lab Technician",
    status: "active",
  },
  {
    id: 5,
    name: "Meera Joshi",
    designation: "Counselor",
    status: "inactive",
  },
];

// Team account options.
export const USER_TYPE_OPTIONS = [
  { value: "1", label: "Admin" },
  { value: "2", label: "Staff" },
  { value: "3", label: "Teacher" },
  { value: "4", label: "Accountant" },
];

export const PRIVILEGE_OPTIONS = [
  { value: "full-access", label: "Full Access" },
  { value: "view-only", label: "View Only" },
  { value: "manage-students", label: "Manage Students" },
  { value: "manage-staff", label: "Manage Staff" },
  { value: "manage-branches", label: "Manage Branches" },
];

// Mock class/section data — Grade 1–12, Sections A/B/C = 36 records.
// Replace with a real API call once you have one; the shape
// ({ value, label }) is exactly what ReusableMultiSelect expects.

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B", "C", "D", "E", "F"];

export const SECTION_OPTIONS = GRADES.flatMap((grade) =>
  SECTIONS.map((section) => ({
    value: `grade-${grade}-${section.toLowerCase()}`,
    label: `Grade ${grade} - ${section}`,
  })),
);

// Simulates a paginated, searchable API endpoint — swap this function's
// body for a real `fetch`/axios call to your backend. The signature
// (pageParam, search) -> { items, nextPage } is what the useInfiniteQuery
// hook below expects.
const PAGE_SIZE = 10;

export async function fetchSectionsPage({ pageParam = 1, search = "" }) {
  // Simulated network latency so loading states are visible in dev.
  await new Promise((resolve) => setTimeout(resolve, 400));

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? SECTION_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(keyword))
    : SECTION_OPTIONS;

  const start = (pageParam - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);
  const nextPage = start + PAGE_SIZE < filtered.length ? pageParam + 1 : undefined;

  return { items, nextPage, total: filtered.length };
}
