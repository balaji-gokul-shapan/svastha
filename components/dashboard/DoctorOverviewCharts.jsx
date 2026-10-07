"use client";

import * as React from "react";

import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  Stethoscope,
} from "lucide-react";
import { normalizeEvents, buildDoctorStats } from "@/lib/dashboard-stats";
import {
  AgeGroupChart,
  Alerts,
  GenderChart,
  InsuranceOverview,
  QuickLinks,
  ReferralTrend,
  ReferralsByGrade,
  ReferralsByType,
  ScreeningSummary,
  StatCard,
  TopHealthIssues,
  UpcomingFollowUps,
} from "./components/dashboard-sections";

/**
 * Doctor dashboard body — rendered below the shared <DashboardHeader />.
 *
 * Only the KPI row is doctor-specific (built from the doctor's assigned camps);
 * the screening/analytics panels are identical for every role, so they stay
 * here rather than being duplicated in the school dashboard.
 */
export default function DoctorOverviewCharts({
  assignedEvents = [],
  totalStudents = 0,
  maleStudents = 0,
  femaleStudents = 0,
  otherStudents = 0,
  ageGroups = {},
  averageAge = 0,
  generalScreeningRecord = [],
  hearingScreeningRecord = [],
  dentalScreeningRecord = [],
  visionScreeningRecord = [],
  screeningLoading = false,
  screeningError = null,
  getStudentByEventLoading = false,
  getStudentByEventError = null,
}) {
  const allEvents = React.useMemo(
    () => normalizeEvents(assignedEvents?.data ?? assignedEvents),
    [assignedEvents],
  );

  const kpiStats = React.useMemo(() => {
    const meta = {
      events: {
        icon: CalendarDays,
        tone: "blue",
        subtitle: "View all events",
        trend: "",
      },
      schools: {
        icon: Building2,
        tone: "green",
        subtitle: "View schools",
        trend: "",
      },
      doctors: {
        icon: Stethoscope,
        tone: "purple",
        subtitle: "View doctors",
        trend: "",
      },
      upcoming: {
        icon: ClipboardCheck,
        tone: "orange",
        subtitle: "View schedule",
        trend: "",
      },
    };

    return buildDoctorStats(allEvents).map((row) => ({
      ...row,
      ...meta[row.key],
    }));
  }, [allEvents]);

  return (
    <>
      {/* KPI CARDS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {kpiStats.map(({ key, title, ...cardProps }) => (
          <StatCard key={key ?? title} title={title} {...cardProps} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AgeGroupChart
          ageGroups={ageGroups}
          averageAge={averageAge}
          totalStudents={totalStudents}
          loading={getStudentByEventLoading}
          error={getStudentByEventError}
        />

        <GenderChart
          maleStudents={maleStudents}
          femaleStudents={femaleStudents}
          otherStudents={otherStudents}
          totalStudents={totalStudents}
          loading={getStudentByEventLoading}
          error={getStudentByEventError}
        />
      </section>

      {/* ROW 1 */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ScreeningSummary
          generalScreeningRecord={generalScreeningRecord}
          hearingScreeningRecord={hearingScreeningRecord}
          dentalScreeningRecord={dentalScreeningRecord}
          visionScreeningRecord={visionScreeningRecord}
          totalStudents={totalStudents}
          loading={screeningLoading}
          error={screeningError}
        />

        <ReferralsByType
          generalScreeningRecord={generalScreeningRecord}
          hearingScreeningRecord={hearingScreeningRecord}
          dentalScreeningRecord={dentalScreeningRecord}
          visionScreeningRecord={visionScreeningRecord}
          loading={screeningLoading}
          error={screeningError}
        />

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
    </>
  );
}
