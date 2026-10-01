"use client";

import {
  AgeGroupChart,
  Alerts,
  BranchDetailsPanel,
  GenderChart,
  InsuranceOverview,
  QuickLinks,
  ReferralTrend,
  ReferralsByGrade,
  ReferralsByType,
  SchoolDetailsCard,
  ScreeningSummary,
  StatCard,
  TopHealthIssues,
  UpcomingFollowUps,
} from "./components/dashboard-sections";

/**
 * School / admin dashboard body — rendered below the shared <DashboardHeader />.
 */
export default function SchoolOverviewCharts({
  userAuthRole = "",
  kpiStats = [],
  selectedBranch = null,
  branchSummary = null,
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
  return (
    <>
      {/* KPI CARDS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiStats.map(({ key, title, ...cardProps }) => (
          <StatCard key={key ?? title} title={title} {...cardProps} />
        ))}
      </section>

      {userAuthRole === "admin" ? (
        <BranchDetailsPanel branch={selectedBranch} summary={branchSummary} />
      ) : null}

      {(userAuthRole === "admin" || userAuthRole === "school") &&
      selectedBranch ? (
        <SchoolDetailsCard school={selectedBranch} />
      ) : null}

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
