"use client";

import StudentFilter from "../health-checks/utilities/studentFilter";
import useStudentFilter from "./utilities/useStudentFilter";
import HealthCheckContent from "./components/HealthCheckContent";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ClipboardPlus, FileSpreadsheet, Search } from "lucide-react";
import SchoolStudentFilter from "../students/utilities/SchoolStudentFilter";
import { useAppSelector } from "@/lib/hooks";
import {
  selectAuthUser,
  selectIsPrimaryDoctorRole,
  selectUserAccount,
} from "@/lib/features/auth-slice";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useAuthRole } from "@/lib/user-role";
import { getAllSchoolBranches } from "@/lib/features/registerSchoolBranchSlice";
import { getScreeningIds, getScreeningKeys } from "@/lib/camp-utils";
import useScreeningIdMap from "@/lib/useScreeningIdMap";
import useActiveCampEvent from "@/lib/useActiveCampEvent";
import PrimaryDoctorTab from "./components/PrimaryDoctorTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const ROLE_IDS = { admin: 1, school: 2, teacher: 3 };

function ReportEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-6 my-8">
      <EmptyState
        title="No Report Data"
        description="Select a Student to get the Report"
        action={
          <Button type="button" variant="outline">
            <Search className="size-4" />
            Select Student
          </Button>
        }
      />
    </div>
  );
}

/* Shown when a camp is selected but has no screenings assigned to it. */
function NoScreeningsAssignedState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-6 my-8">
      <EmptyState
        title="No Screenings Assigned"
        description="This camp has no screenings assigned. Select a different camp to view its report."
      />
    </div>
  );
}

export default function ConsolidateReport() {
  const dispatch = useDispatch();
  useScreeningIdMap();
  const {
    filterProps,
    doctorFilterProps,
    selectedStudent,
    selectedCamp,
    assignedEvents,
    classFilter,
    sectionFilter,
  } = useStudentFilter();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [activeTab, setActiveTab] = useState("single-report");
  const selectUser = useAppSelector(selectUserAccount);
  const getRole = useAuthRole();
  const isPrimaryDoctorRole = useAppSelector(selectIsPrimaryDoctorRole);
  const [selectedSchoolBranch, setSelectedSchoolBranch] = useState(null);

  const activeCampEvent = useActiveCampEvent({
    assignedEvents,
    selectedCamp,
    campSelection: doctorFilterProps?.campSelection,
    branchId:
      selectedSchoolBranch?.id ??
      selectedSchoolBranch?.branch_id ??
      filterProps?.formData?.branchName,
    branchLabel: selectedSchoolBranch?.branch_name,
  });

  const isPrimaryDoctor = activeCampEvent?.primary_doctor === Number(1);
  console.log(activeCampEvent,"activeCampEvent");
  

  const assignedScreeningIds = getScreeningIds(activeCampEvent);
  const assignedScreeningKeys = getScreeningKeys(activeCampEvent);

  const hasUnknownScreeningIds =
    assignedScreeningIds.length > 0 && assignedScreeningKeys.length === 0;

  if (hasUnknownScreeningIds) {
    console.warn(
      "[ConsolidateReport] Camp carries screening ids that map to no known screening:",
      assignedScreeningIds,
    );
  }

  const { data: ownBranchRecord } = useQuery({
    queryKey: ["getSchoolBranch"],
    queryFn: () => dispatch(getAllSchoolBranches()).unwrap(),
    enabled: getRole !== "doctor" && Boolean(getRole),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  console.log(getRole);
  

  const defaultBranch = useMemo(() => {
    const record = ownBranchRecord?.data ?? ownBranchRecord ?? null;

    const firstDefined = (...values) => {
      const found = values.find(
        (value) => value != null && String(value).trim() !== "",
      );
      return found ?? null;
    };

    return {
      value: String(
        selectUser?.branch_id ??
          selectUser?.branchId ??
          selectUser?.branch?.id ??
          record?.id ??
          "",
      ).trim(),
      label: String(
        record?.branch_name ??
          record?.name ??
          selectUser?.branch_name ??
          selectUser?.name ??
          selectUser?.school_name ??
          selectUser?.schoolName ??
          "",
      ).trim(),
      address_line_1: firstDefined(
        record?.address_line_1,
        record?.address_line1,
        selectUser?.address_line_1,
        selectUser?.address_line1,
        selectUser?.branch?.address_line_1,
      ),
      address_line_2: firstDefined(
        record?.address_line_2,
        record?.address_line2,
        selectUser?.address_line_2,
        selectUser?.address_line2,
        selectUser?.branch?.address_line_2,
      ),
      area: firstDefined(
        record?.area,
        selectUser?.area,
        selectUser?.branch?.area,
      ),
      city: firstDefined(
        record?.city,
        selectUser?.city,
        selectUser?.branch?.city,
      ),
      state: firstDefined(
        record?.state,
        selectUser?.state,
        selectUser?.branch?.state,
      ),
      country: firstDefined(
        record?.country,
        selectUser?.country,
        selectUser?.branch?.country,
      ),
      pincode: firstDefined(
        record?.pincode,
        record?.pin_code,
        selectUser?.pincode,
        selectUser?.pin_code,
        selectUser?.zip,
        selectUser?.branch?.pincode,
      ),
    };
  }, [selectUser, ownBranchRecord]);

  console.log(ownBranchRecord,ownBranchRecord);
  

  return (
    <div className="min-h-screen">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="single-report"
        className="w-full"
      >
        <div className="sticky top-14 z-10 flex flex-col gap-3 p-2 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
          <div className="w-full">
            <h1 className=" text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              Health Check Report
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Academic Year: {"2026-2027"}
            </p>
          </div>

          {(isPrimaryDoctor || isPrimaryDoctorRole) && (
            // <div className="">
            <TabsList className="grid w-full grid-cols-2 md:w-9/12">
              <TabsTrigger
                value="single-report"
                title="Single Report"
                className={cn(
                  "min-w-0 gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  "text-muted-foreground hover:bg-muted hover:text-foreground",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500",
                  "data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <ClipboardPlus className="size-4 shrink-0" />
                <span className="min-w-0 truncate">Single Report</span>
              </TabsTrigger>

              <TabsTrigger
                value="report-table"
                title="All Student Reports"
                className={cn(
                  "min-w-0 gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  "text-muted-foreground hover:bg-muted hover:text-foreground",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500",
                  "data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <FileSpreadsheet className="size-4 shrink-0" />
                <span className="min-w-0 truncate">All Student Reports</span>
              </TabsTrigger>
            </TabsList>

            // </div>
          )}
          {/* <TabsList className="grid w-full grid-cols-2 md:w-9/12">
            <TabsTrigger
              value="single-report"
              title="Single Report"
              className="min-w-0 gap-2"
            >
              <ClipboardPlus className="size-4 shrink-0" />
              <span className="min-w-0 truncate">Single Report</span>
            </TabsTrigger>

            <TabsTrigger
              value="report-table"
              title="All Student Reports"
              className="min-w-0 gap-2"
            >
              <FileSpreadsheet className="size-4 shrink-0" />
              <span className="min-w-0 truncate">All Student Reports</span>
            </TabsTrigger>

            <TabsTrigger
              value="primary-doctor"
              title="Primary Doctor"
              className="min-w-0 gap-2"
            >
              <Stethoscope className="size-4 shrink-0" />
              <span className="min-w-0 truncate">Primary Doctor</span>
            </TabsTrigger>
          </TabsList> */}
        </div>

        {/* {getRole === "doctor" ? (
          activeTab !== "report-table" ? (
            <StudentFilter {...filterProps} />
          ) : null
        ) : activeTab !== "report-table" ? (
          <SchoolStudentFilter
            selectRole={selectUser?.user_type_id ?? ROLE_IDS[getRole]}
            {...filterProps}
            onSelectedBranchChange={setSelectedBranch}
            ownBranch={defaultBranch}
          />
        ) : null} */}
        {getRole === "doctor" ? (

          <StudentFilter {...filterProps} {...doctorFilterProps} />
        ) : (
          <SchoolStudentFilter
            selectRole={selectUser?.user_type_id ?? ROLE_IDS[getRole]}
            classSectionPrivileges={
              selectUser?.previleges ?? selectUser?.privileges
            }
            {...filterProps}
            selectedSchoolBranch={selectedSchoolBranch}
            setSelectedSchoolBranch={setSelectedSchoolBranch}
            {...doctorFilterProps}
            onSelectedBranchChange={setSelectedBranch}
            ownBranch={defaultBranch}
          />
        )}
        {/* Tab content — every <TabsContent> is a direct child of <Tabs>. */}
        <TabsContent value="single-report">
          {hasUnknownScreeningIds ? (
            <NoScreeningsAssignedState />
          ) : selectedStudent ? (
            <div className="space-y-3">
              <HealthCheckContent
                selectUser={selectUser}
                selectedSchoolBranch={selectedSchoolBranch}
                setSelectedSchoolBranch={setSelectedSchoolBranch}
                student={selectedStudent}
                branch={
                  selectedSchoolBranch ?? selectedBranch ?? defaultBranch
                }
                camp={selectedCamp}
                activeEvent={activeCampEvent}
                assignedScreeningIds={assignedScreeningIds}
                {...filterProps}
              />
            </div>
          ) : (
            <ReportEmptyState />
          )}
        </TabsContent>

        <TabsContent value="report-table">
          {/* {selectedStudent ? ( */}
          {hasUnknownScreeningIds ? (
            <NoScreeningsAssignedState />
          ) : (
            <div className="space-y-3">
              {/* <HealthCheckContent
                  selectUser={selectUser}
                  student={selectedStudent}
                  branch={defaultBranch ?? selectedBranch}
                  camp={selectedCamp}
                /> */}
              <PrimaryDoctorTab
                event={activeCampEvent}
                camp={selectedCamp}
                student={selectedStudent}
                assignedScreeningIds={assignedScreeningIds}
                assignedScreeningKeys={assignedScreeningKeys}
                classFilter={classFilter}
                sectionFilter={sectionFilter}
              />
            </div>
          )}
          {/* ) : ( */}
          {/* <ReportEmptyState /> */}
          {/* )} */}
        </TabsContent>

        {/* <TabsContent value="primary-doctor">
          <div className="space-y-3">
            <PrimaryDoctorTab
              event={activeCampEvent}
              camp={selectedCamp}
              student={selectedStudent}
            />
          </div>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
