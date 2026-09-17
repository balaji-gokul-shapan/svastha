"use client";

import StudentFilter from "../health-checks/utilities/studentFilter";
import useStudentFilter from "./utilities/useStudentFilter";
import HealthCheckContent from "./components/HealthCheckContent";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Save, Search } from "lucide-react";
import { toast } from "sonner";
import SchoolStudentFilter from "../students/utilities/SchoolStudentFilter";
import { useAppSelector } from "@/lib/hooks";
import { selectAuthUser, selectUserAccount } from "@/lib/features/auth-slice";
import { getSchoolBranch } from "@/lib/features/registerSchoolBranchSlice";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useAuthRole } from "@/lib/user-role";

// Numeric role ids expected by SchoolStudentFilter's internal map
// ({ 1: "admin", 2: "school", 3: "teacher" }). Used as a fallback when the
// account object doesn't carry a user_type_id.
const ROLE_IDS = { admin: 1, school: 2, teacher: 3 };

export default function ConsolidateReport() {
  const dispatch = useDispatch();
  const { filterProps, selectedStudent } = useStudentFilter();
  const [selectedBranch, setSelectedBranch] = useState(null);
  console.log(filterProps, "filterProps");
  const authUser = useAppSelector(selectAuthUser);
  console.log(authUser,"authUse2222r");
  const selectUser = useAppSelector(selectUserAccount);
  console.log(selectUser, "selectUserAccount");

  const getRole = useAuthRole();
  const {
    data: ownBranchRecord,
    error: ownBranchError,
    status: ownBranchStatus,
    isLoading: ownBranchLoading,
  } = useQuery({
    queryKey: ["getSchoolBranch"],
    queryFn: () => dispatch(getSchoolBranch()).unwrap(),
    // Any signed-in non-doctor account may fetch its own branch profile.
    // Gating on an explicit role list breaks when useAuthRole resolves to a
    // different string ("school_account", "" while the session loads, …).
    enabled: getRole !== "doctor" && Boolean(getRole),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  
  
  console.log(ownBranchRecord,"ownBranchRecord");
  

  const defaultBranch = useMemo(() => {
    const record = ownBranchRecord?.data ?? ownBranchRecord ?? null;
    console.log(record,"recordsss");
    
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
      area: firstDefined(record?.area, selectUser?.area, selectUser?.branch?.area),
      city: firstDefined(record?.city, selectUser?.city, selectUser?.branch?.city),
      state: firstDefined(record?.state, selectUser?.state, selectUser?.branch?.state),
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

  const handleSaveReport = () => {
    toast.success("Changes saved successfully");
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sf text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Health Check Report
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Academic Year: {"2026-2027"}
          </p>
        </div>
      </div>

      {getRole === "doctor" ? (
        <StudentFilter {...filterProps} />
      ) : (
        <SchoolStudentFilter
          // SchoolStudentFilter maps { 1: admin, 2: school, 3: teacher } — fall
          // back to the resolved role string when the account object carries
          // no user_type_id, so school accounts still get the School Name
          // dropdown and the branch queries enabled.
          selectRole={selectUser?.user_type_id ?? ROLE_IDS[getRole]}
          {...filterProps}
          onSelectedBranchChange={setSelectedBranch}
          ownBranch={defaultBranch}
        />
      )}

      {selectedStudent ? (
        <div className="space-y-3">
          {/* <div className="flex justify-end">
            <Button type="button" onClick={handleSaveReport}>
              <Save className="size-4" />
              Save Report
            </Button>
          </div> */}

          <HealthCheckContent
            selectUser={selectUser}
            student={selectedStudent}
            // Falls back to the account's own branch so the school name and
            // address render before the user picks one in the dropdown.
            branch={defaultBranch ?? selectedBranch }
          />
        </div>
      ) : (
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
      )}
    </div>
  );
}
