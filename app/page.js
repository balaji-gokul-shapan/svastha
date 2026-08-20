// import { StudentOverviewCharts } from "./components/dashboard/student-overview-charts";
// import { studentRecords } from "./students/student-data";

import MasterDashboard from "./components/dashboard/page";
import StudentOverviewCharts from "./components/dashboard/student-overview-charts";

export default function Home() {
  return (
    <section className="space-y-5">
      {/* <h2 className="font-display text-2xl font-semibold text-foreground">Dashboard</h2>
      <p className="text-sm text-muted-foreground">
        Welcome to Svastha. Use the sidebar to navigate modules.
      </p> */}
      <MasterDashboard/>
{/* <StudentOverviewCharts/> */}
      {/* <StudentOverviewCharts students={studentRecords} /> */}
    </section>
  );
}
