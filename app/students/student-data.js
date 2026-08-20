export const studentRecords = [
  {
    studentId: "STU-2401",
    name: "Aaditya Raman",
    grade: "VII-A",
    guardian: "Priya Raman",
    guardianPhone: "+91 90000 11101",
    status: "Active",
    notes: "Regular health screening completed.",
  },
  {
    studentId: "STU-2402",
    name: "Nisha Verma",
    grade: "VIII-B",
    guardian: "Rahul Verma",
    guardianPhone: "+91 90000 11102",
    status: "Pending",
    notes: "Awaiting vaccination records.",
  },
  {
    studentId: "STU-2403",
    name: "Kavin S",
    grade: "VI-C",
    guardian: "Shanthi K",
    guardianPhone: "+91 90000 11103",
    status: "Active",
    notes: "No follow-up required.",
  },
  {
    studentId: "STU-2404",
    name: "Meera Joshi",
    grade: "IX-A",
    guardian: "Anil Joshi",
    guardianPhone: "+91 90000 11104",
    status: "Follow-up",
    notes: "Dental follow-up scheduled next month.",
  },
  {
    studentId: "STU-2405",
    name: "Vihaan Kapoor",
    grade: "X-B",
    guardian: "Sonal Kapoor",
    guardianPhone: "+91 90000 11105",
    status: "Active",
    notes: "Participates in athletics.",
  },
  {
    studentId: "STU-2406",
    name: "Harini P",
    grade: "V-A",
    guardian: "Pradeep P",
    guardianPhone: "+91 90000 11106",
    status: "Pending",
    notes: "Guardian document verification pending.",
  },
  {
    studentId: "STU-2407",
    name: "Arjun Menon",
    grade: "VIII-A",
    guardian: "Neha Menon",
    guardianPhone: "+91 90000 11107",
    status: "Active",
    notes: "Cleared all annual health checks.",
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getStudentIdentifier(student) {
  return student?.studentId ?? student?.id ?? null;
}

export function getStudentSlug(student) {
  const identifier = getStudentIdentifier(student);

  if (identifier === null || identifier === undefined) {
    return "";
  }

  return String(identifier).toLowerCase();
}

export function getStudentById(studentId) {
  return studentRecords.find((student) => student.studentId === studentId) ?? null;
}

export function getStudentBySlug(slug) {
  return studentRecords.find((student) => getStudentSlug(student) === slug) ?? null;
}
