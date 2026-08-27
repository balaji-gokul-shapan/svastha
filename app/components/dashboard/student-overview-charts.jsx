// "use client";

// import * as React from "react";
// import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from "recharts";

// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";

// const chartConfig = {
//   active: { label: "Active", color: "var(--chart-active)" },
//   pending: { label: "Pending", color: "var(--chart-pending)" },
//   followUp: { label: "Follow-up", color: "var(--chart-follow-up)" },
//   students: { label: "Students", color: "var(--chart-students)" },
// };

// const gradeBarColors = [
//   "var(--chart-grade-1)",
//   "var(--chart-grade-2)",
//   "var(--chart-grade-3)",
//   "var(--chart-grade-4)",
//   "var(--chart-grade-5)",
//   "var(--chart-grade-6)",
//   "var(--chart-grade-7)",
// ];

// const statusKeyMap = {
//   Active: "active",
//   Pending: "pending",
//   "Follow-up": "followUp",
// };

// export function StudentOverviewCharts({ students }) {
//   const statusData = React.useMemo(() => {
//     const counts = {
//       Active: 0,
//       Pending: 0,
//       "Follow-up": 0,
//     };

//     students.forEach((student) => {
//       if (counts[student.status] !== undefined) {
//         counts[student.status] += 1;
//       }
//     });

//     return Object.entries(counts).map(([status, total]) => ({
//       status,
//       total,
//       key: statusKeyMap[status],
//     }));
//   }, [students]);

//   const gradeData = React.useMemo(() => {
//     const gradeCounts = new Map();

//     students.forEach((student) => {
//       gradeCounts.set(student.grade, (gradeCounts.get(student.grade) ?? 0) + 1);
//     });

//     return Array.from(gradeCounts.entries())
//       .map(([grade, students]) => ({ grade, students }))
//       .sort((a, b) => a.grade.localeCompare(b.grade));
//   }, [students]);

//   return (
//     <section className="grid gap-4 lg:grid-cols-2">
//       <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
//         <div className="mb-3">
//           <h3 className="text-sm font-semibold text-foreground">Student Status</h3>
//           <p className="text-xs text-muted-foreground">Distribution by health workflow state</p>
//         </div>

//         <ChartContainer id="students-status" className="h-64 w-full" config={chartConfig}>
//           <PieChart>
//             <ChartTooltip content={<ChartTooltipContent />} />
//             <Pie data={statusData} dataKey="total" nameKey="status" innerRadius={58} outerRadius={86}>
//               {statusData.map((entry) => (
//                 <Cell key={entry.status} fill={`var(--color-${entry.key})`} />
//               ))}
//             </Pie>
//           </PieChart>
//         </ChartContainer>
//       </article>

//       <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
//         <div className="mb-3">
//           <h3 className="text-sm font-semibold text-foreground">Students by Grade</h3>
//           <p className="text-xs text-muted-foreground">Current student count in each class section</p>
//         </div>

//         <ChartContainer id="students-grade" className="h-64 w-full" config={chartConfig}>
//           <BarChart data={gradeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
//             <CartesianGrid vertical={false} strokeDasharray="3 3" />
//             <XAxis dataKey="grade" tickLine={false} axisLine={false} tickMargin={8} />
//             <ChartTooltip content={<ChartTooltipContent />} />
//             <Bar dataKey="students" name="Students" radius={[6, 6, 0, 0]}>
//               {gradeData.map((item, index) => (
//                 <Cell key={item.grade} fill={gradeBarColors[index % gradeBarColors.length]} />
//               ))}
//             </Bar>
//           </BarChart>
//         </ChartContainer>
//       </article>
//     </section>
//   );
// }
"use client";

import * as React from "react";

import {
  AlertTriangle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileBarChart,
  FileText,
  HeartPulse,
  Hospital,
  Info,
  ShieldCheck,
  Stethoscope,
  Users,
  XCircle,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HealthWorkerFormOutlineIcon from "@iconify-react/healthicons/health-worker-form-outline";

/* ============================================================
   DASHBOARD DATA
============================================================ */

const stats = [
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

const screeningData = [
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

const referralData = [
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

const gradeData = [
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

const referralTrend = [
  { month: "Dec 23", value: 45 },
  { month: "Jan 24", value: 62 },
  { month: "Feb 24", value: 55 },
  { month: "Mar 24", value: 70 },
  { month: "Apr 24", value: 88 },
  { month: "May 24", value: 93 },
];

const healthIssues = [
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

const followUps = [
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

const alerts = [
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

const insuranceData = [
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

const quickLinks = [
  {
    title: "Health Reports",
    icon: FileBarChart,
    tone: "purple",
  },
  {
    title: "Referral Tracking",
    icon: Hospital,
    tone: "orange",
  },
  {
    title: "Insurance Policies",
    icon: ShieldCheck,
    tone: "green",
  },
  {
    title: "Claims Status",
    icon: FileText,
    tone: "blue",
  },
  {
    title: "Immunization Report",
    icon: ClipboardCheck,
    tone: "green",
  },
  {
    title: "Student Directory",
    icon: Users,
    tone: "purple",
  },
];

/* ============================================================
   MAIN DASHBOARD
============================================================ */

export default function StudentOverviewCharts({ user }) {
  console.log(user, "authUser");

  return (
    <main className="min-h-screen ">
      <div className=" space-y-5 p-4 md:p-6">
        {/* HEADER */}
        <DashboardHeader user={user} />

        {/* KPI CARDS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </section>

        {/* ROW 1 */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <ScreeningSummary />

          <ReferralsByType />

          <ReferralsByGrade />
        </section>

        {/* ROW 2 */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <ReferralTrend />

          <TopHealthIssues />

          <InsuranceOverview />
        </section>

        {/* ROW 3 */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <UpcomingFollowUps />

          <Alerts />

          <QuickLinks />
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   HEADER
============================================================ */

function DashboardHeader({ user }) {
  const NormaliseName =
    user.emp_name.charAt(0).toUpperCase() + user.emp_name.slice(1);
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          Welcome back, {NormaliseName}
        </h1>

        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening in your school today.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" className="justify-center gap-2">
          <CalendarDays className="size-4" />
          Today, 20 May 2024
        </Button>

        <Button className="gap-2">
          <FileBarChart className="size-4" />
          Export Report
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ title, value, subtitle, icon: Icon, trend, tone }) {
  const styles = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-green-500/10 text-green-600",
    orange: "bg-orange-500/10 text-orange-600",
    purple: "bg-purple-500/10 text-purple-600",
    red: "bg-red-500/10 text-red-600",
    cyan: "bg-cyan-500/10 text-cyan-600",
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${styles[tone]}`}
          >
            <Icon className="size-5" />
          </div>

          <Badge variant="secondary" className="text-[10px]">
            {trend}
          </Badge>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>

          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>

          <button className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            {subtitle}
            <ArrowRight className="size-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   SCREENING SUMMARY
============================================================ */

function ScreeningSummary() {
  const total = screeningData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="flex size-8 items-center justify-center rounded-lg bg-success/10">
            <HealthWorkerFormOutlineIcon className="size-4 text-success" />
          </span>
          Health Screening Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col">
          <div className="relative size-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={screeningData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {screeningData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        [
                          "#22c55e",
                          "#3b82f6",
                          "#f59e0b",
                          "#ef4444",
                          "#8b5cf6",
                          "#06b6d4",
                        ][index]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold">11,750</span>
              <span className="text-[10px] text-muted-foreground">
                Completed
              </span>
            </div>
          </div>

          <div className="w-full space-y-2">
            {screeningData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: [
                        "#22c55e",
                        "#3b82f6",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                        "#06b6d4",
                      ][index],
                    }}
                  />

                  <span className="truncate">{item.name}</span>
                </div>

                <span className="shrink-0 text-muted-foreground">
                  {item.percentage}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          Total Students:{" "}
          <span className="font-semibold text-foreground">12,540</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   REFERRALS BY TYPE
============================================================ */

function ReferralsByType() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Referrals by Type</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative mx-auto size-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={referralData}
                dataKey="value"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={2}
              >
                {referralData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      [
                        "#2563eb",
                        "#f97316",
                        "#22c55e",
                        "#8b5cf6",
                        "#ef4444",
                        "#06b6d4",
                      ][index]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">486</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {referralData.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor: [
                      "#2563eb",
                      "#f97316",
                      "#22c55e",
                      "#8b5cf6",
                      "#ef4444",
                      "#06b6d4",
                    ][index],
                  }}
                />
                {item.name}
              </div>

              <span className="text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </div>

        <ViewLink text="View all referrals" />
      </CardContent>
    </Card>
  );
}

/* ============================================================
   REFERRALS BY GRADE
============================================================ */

function ReferralsByGrade() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Referrals by Grade</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {gradeData.map((item) => {
            const tone = {
              red: "border-red-500/20 bg-red-500/5 text-red-600",
              orange: "border-orange-500/20 bg-orange-500/5 text-orange-600",
              yellow: "border-yellow-500/20 bg-yellow-500/5 text-yellow-600",
              green: "border-green-500/20 bg-green-500/5 text-green-600",
            };

            return (
              <div
                key={item.grade}
                className={`rounded-xl border p-4 text-center ${tone[item.tone]}`}
              >
                <p className="text-xs font-semibold">{item.grade}</p>

                <p className="mt-1 text-[10px] opacity-80">{item.level}</p>

                <p className="mt-2 text-2xl font-bold">{item.value}</p>

                <p className="mt-1 text-[10px] opacity-80">{item.percentage}</p>
              </div>
            );
          })}
        </div>

        <ViewLink text="View grade details" />
      </CardContent>
    </Card>
  );
}

/* ============================================================
   REFERRAL TREND
============================================================ */

function ReferralTrend() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Referrals Trend</CardTitle>

        <ViewLink text="View report" />
      </CardHeader>

      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={referralTrend}>
              <defs>
                <linearGradient
                  id="referralGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />

                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border"
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                fill="url(#referralGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   TOP HEALTH ISSUES
============================================================ */

function TopHealthIssues() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Top Health Issues</CardTitle>

        <ViewLink text="View report" />
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {healthIssues.map((item) => (
            <div key={item.name}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate">{item.name}</span>

                <span className="shrink-0 text-muted-foreground">
                  {item.value} ({item.percentage})
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(item.value / 1.7, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   INSURANCE
============================================================ */

function InsuranceOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Insurance & Claims Overview</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {insuranceData.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border/70 bg-muted/20 p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[10px] text-muted-foreground">
                    {item.title}
                  </p>

                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              </div>

              <p className="mt-2 text-[10px] text-muted-foreground">
                {item.percentage}
              </p>
            </div>
          ))}
        </div>

        <ViewLink text="View claims" />
      </CardContent>
    </Card>
  );
}

/* ============================================================
   FOLLOW UPS
============================================================ */

function UpcomingFollowUps() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Upcoming Follow-ups</CardTitle>

        <ViewLink text="View all" />
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-xs">
            <thead className="bg-muted/40">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Student Name</th>

                <th className="px-4 py-3 font-medium">Referral Type</th>

                <th className="px-4 py-3 font-medium">Grade</th>

                <th className="px-4 py-3 font-medium">Follow-up Date</th>

                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {followUps.map((item) => (
                <tr key={item.student} className="border-t border-border/60">
                  <td className="px-4 py-3 font-medium">{item.student}</td>

                  <td className="px-4 py-3">{item.type}</td>

                  <td className="px-4 py-3">{item.grade}</td>

                  <td className="px-4 py-3">{item.date}</td>

                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   ALERTS
============================================================ */

function Alerts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Bell className="size-4" />

        <CardTitle className="text-sm">Alerts & Notifications</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {alerts.map((item, index) => {
          const icons = {
            danger: XCircle,
            warning: AlertTriangle,
            info: Info,
          };

          const colors = {
            danger: "text-red-500 bg-red-500/10",
            warning: "text-orange-500 bg-orange-500/10",
            info: "text-blue-500 bg-blue-500/10",
          };

          const Icon = icons[item.type];

          return (
            <div key={index} className="flex gap-3">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${colors[item.type]}`}
              >
                <Icon className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">{item.title}</p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <span className="shrink-0 text-[9px] text-muted-foreground">
                {item.time}
              </span>
            </div>
          );
        })}

        <ViewLink text="View all alerts" />
      </CardContent>
    </Card>
  );
}

/* ============================================================
   QUICK LINKS
============================================================ */

function QuickLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Quick Links</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                className="group flex min-h-[80px] flex-col items-center justify-center gap-2 rounded-xl border border-border/70 bg-muted/10 p-3 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:scale-105">
                  <Icon className="size-4" />
                </div>

                <span className="text-center text-[10px] font-medium">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const styles = {
    "Due Soon": "bg-orange-500/10 text-orange-600",
    Overdue: "bg-red-500/10 text-red-600",
    Scheduled: "bg-blue-500/10 text-blue-600",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-medium ${
        styles[status] || "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

/* ============================================================
   VIEW LINK
============================================================ */

function ViewLink({ text }) {
  return (
    <button className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
      {text}
      <ArrowRight className="size-3" />
    </button>
  );
}
