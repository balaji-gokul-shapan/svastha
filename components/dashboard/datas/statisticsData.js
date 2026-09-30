import {
  Users,
  ClipboardCheck,
  Stethoscope,
  Hospital,
  Building2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  FileBarChart,
} from "lucide-react";

export const schoolFoudationalStats = [
  {
    key: "students",
    title: "Total Students",
    value: "0",
    subtitle: "Students in assigned events",
    icon: Users,
    trend: "Assigned events",
    tone: "blue",
  },
  {
    key: "teachingStaff",
    title: "Teaching Staff",
    value: "0",
    subtitle: "Staff in assigned events",
    icon: Users,
    trend: "Assigned events",
    tone: "green",
  },
  {
    key: "nonTeachingStaff",
    title: "Non-Teaching Staff",
    value: "0",
    subtitle: "Staff in assigned events",
    icon: Users,
    trend: "Assigned events",
    tone: "green",
  },
  {
    title: "Active Doctors",
    value: "86",
    subtitle: "View active doctors",
    icon: Stethoscope,
    trend: "+8.4%",
    tone: "purple",
  },
  {
    title: "Completed Screenings",
    value: "11,750",
    subtitle: "View screening report",
    icon: ClipboardCheck,
    trend: "94.7%",
    tone: "cyan",
  },
];

export const stats = [
  {
    title: "Total Students",
    value: "12,540",
    subtitle: "View all students",
    icon: Users,
    trend: "+4.2%",
    tone: "blue",
  },
  {
    title: "Screenings Completed",
    value: "11,750",
    subtitle: "View details",
    icon: ClipboardCheck,
    trend: "94.70%",
    tone: "green",
  },
  {
    title: "Pending Screenings",
    value: "790",
    subtitle: "View list",
    icon: Stethoscope,
    trend: "-3.20%",
    tone: "orange",
  },
  {
    title: "Total Referrals",
    value: "486",
    subtitle: "View all referrals",
    icon: Hospital,
    trend: "3.88%",
    tone: "purple",
  },
  {
    title: "Overdue Referrals",
    value: "32",
    subtitle: "View overdue",
    icon: AlertTriangle,
    trend: "2.4%",
    tone: "red",
  },
  {
    title: "Insurance Coverage",
    value: "95.20%",
    subtitle: "View insurance",
    icon: ShieldCheck,
    trend: "95.20%",
    tone: "cyan",
  },
];

export const screeningData = [
  {
    name: "Physical Exam",
    value: 11750,
    percentage: "94.70%",
  },
  {
    name: "Vision Screening",
    value: 11250,
    percentage: "90.00%",
  },
  {
    name: "Hearing Screening",
    value: 10980,
    percentage: "87.60%",
  },
  {
    name: "Dental Screening",
    value: 10800,
    percentage: "86.20%",
  },
  {
    name: "ENT Screening",
    value: 9450,
    percentage: "75.45%",
  },
  {
    name: "Immunization",
    value: 11500,
    percentage: "91.67%",
  },
];

export const referralData = [
  {
    name: "Vision",
    value: 156,
  },
  {
    name: "Dental",
    value: 148,
  },
  {
    name: "ENT",
    value: 78,
  },
  {
    name: "Hearing",
    value: 28,
  },
  {
    name: "Medical",
    value: 62,
  },
  {
    name: "Others",
    value: 14,
  },
];

export const gradeData = [
  {
    grade: "Grade 1",
    level: "Critical",
    value: 18,
    percentage: "3.70%",
    tone: "red",
  },
  {
    grade: "Grade 2",
    level: "High",
    value: 126,
    percentage: "25.93%",
    tone: "orange",
  },
  {
    grade: "Grade 3",
    level: "Moderate",
    value: 210,
    percentage: "43.21%",
    tone: "yellow",
  },
  {
    grade: "Grade 4",
    level: "Preventive",
    value: 132,
    percentage: "27.16%",
    tone: "green",
  },
];

export const referralTrend = [
  { month: "Dec 23", value: 45 },
  { month: "Jan 24", value: 62 },
  { month: "Feb 24", value: 55 },
  { month: "Mar 24", value: 70 },
  { month: "Apr 24", value: 88 },
  { month: "May 24", value: 93 },
];

export const healthIssues = [
  {
    name: "Dental Caries",
    value: 168,
    percentage: "30.45%",
  },
  {
    name: "Refractive Errors",
    value: 110,
    percentage: "23.52%",
  },
  {
    name: "ENT Disorders",
    value: 78,
    percentage: "16.09%",
  },
  {
    name: "Hearing Loss",
    value: 62,
    percentage: "12.78%",
  },
  {
    name: "Obesity / Overweight",
    value: 45,
    percentage: "9.26%",
  },
  {
    name: "Anemia",
    value: 21,
    percentage: "4.32%",
  },
  {
    name: "Others",
    value: 18,
    percentage: "3.70%",
  },
];

export const followUps = [
  {
    student: "Arav Sharma",
    type: "ENT",
    grade: "Grade 2",
    date: "22 May 2024",
    status: "Due Soon",
  },
  {
    student: "Diya Verma",
    type: "Vision",
    grade: "Grade 2",
    date: "23 May 2024",
    status: "Due Soon",
  },
  {
    student: "Ruhan Nair",
    type: "Dental",
    grade: "Grade 1",
    date: "21 May 2024",
    status: "Overdue",
  },
  {
    student: "Neha Singh",
    type: "Hearing",
    grade: "Grade 3",
    date: "28 May 2024",
    status: "Scheduled",
  },
  {
    student: "Kabir Shah",
    type: "ENT",
    grade: "Grade 2",
    date: "27 May 2024",
    status: "Scheduled",
  },
];

export const alerts = [
  {
    type: "danger",
    title: "32 referrals are overdue.",
    description: "Review pending referral actions.",
    time: "10 mins ago",
  },
  {
    type: "warning",
    title: "790 students are due for health screening.",
    description: "Schedule screenings for pending students.",
    time: "1 hour ago",
  },
  {
    type: "info",
    title: "14 insurance policies will expire in 30 days.",
    description: "Review policies to avoid claim issues.",
    time: "2 hours ago",
  },
];

export const insuranceData = [
  {
    title: "Active Policies",
    value: "11,930",
    percentage: "95.20%",
    icon: ShieldCheck,
    tone: "blue",
  },
  {
    title: "Claims Submitted",
    value: "342",
    percentage: "This Year",
    icon: FileText,
    tone: "green",
  },
  {
    title: "Claims Approved",
    value: "268",
    percentage: "78.35%",
    icon: CheckCircle2,
    tone: "orange",
  },
  {
    title: "Claims Rejected",
    value: "74",
    percentage: "21.64%",
    icon: XCircle,
    tone: "red",
  },
];

export const quickLinks = [
  {
    title: "Health Reports",
    icon: FileBarChart,
    tone: "purple",
    link: "/report",
  },
  // {
  //   title: "Referral Tracking",
  //   icon: Hospital,
  //   tone: "orange",
  //   link: "/referral-tracking",
  // },
  // {
  //   title: "Insurance Policies",
  //   icon: ShieldCheck,
  //   tone: "green",
  //   link: "/insurance-policies",
  // },
  // {
  //   title: "Claims Status",
  //   icon: FileText,
  //   tone: "blue",
  //   link: "/claims-status",
  // },
  {
    title: "Immunization Report",
    icon: ClipboardCheck,
    tone: "green",
    link: "/health-checks/immunization",
  },
  // {
  //   title: "Student Directory",
  //   icon: Users,
  //   tone: "purple",
  //   link: "/students",
  // },
];
