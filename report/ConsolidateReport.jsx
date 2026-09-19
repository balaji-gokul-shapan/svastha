"use client";

import StudentFilter from "../health-checks/utilities/studentFilter";
import useStudentFilter from "./utilities/useStudentFilter";
import HealthCheckContent from "./components/HealthCheckContent";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Save, Search } from "lucide-react";
import { toast } from "sonner";
<<<<<<< HEAD
import SchoolStudentFilter from "../students/utilities/SchoolStudentFilter";
import { useAppSelector } from "@/lib/hooks";
import { selectAuthUser, selectUserAccount } from "@/lib/features/auth-slice";
import { useMemo, useState } from "react";
import { useAuthRole } from "@/lib/user-role";

export default function ConsolidateReport() {
  const { filterProps, selectedStudent } = useStudentFilter();
  const [selectedBranch, setSelectedBranch] = useState(null);
  console.log(filterProps, "filterProps");
  // const authUser = useAppSelector(selectAuthUser);
  // console.log(authUser,"authUser");
  const selectUser = useAppSelector(selectUserAccount);
  console.log(selectUser, "selectUserAccount");

  // The signed-in account's own branch, shaped like a filter option. Used as
  // the dropdown fallback (ownBranch) AND as the report's default school
  // name/address until the user picks a branch.
  const defaultBranch = useMemo(() => {
    return {
      value: String(
        selectUser?.branch_id ??
          selectUser?.branchId ??
          selectUser?.branch?.id ??
          "",
      ).trim(),
      label: String(
        selectUser?.branch_name ??
          selectUser?.name ??
          selectUser?.school_name ??
          selectUser?.schoolName ??
          "",
      ).trim(),
      address_line_1:
        selectUser?.address_line_1 ??
        selectUser?.address_line1 ??
        selectUser?.branch?.address_line_1 ??
        null,
      address_line_2:
        selectUser?.address_line_2 ??
        selectUser?.address_line2 ??
        selectUser?.branch?.address_line_2 ??
        null,
      area: selectUser?.area ?? selectUser?.branch?.area ?? null,
      city: selectUser?.city ?? selectUser?.branch?.city ?? null,
      state: selectUser?.state ?? selectUser?.branch?.state ?? null,
      country: selectUser?.country ?? selectUser?.branch?.country ?? null,
      pincode:
        selectUser?.pincode ??
        selectUser?.pin_code ??
        selectUser?.zip ??
        selectUser?.branch?.pincode ??
        null,
    };
  }, [selectUser]);
=======

export default function ConsolidateReport() {
  const { filterProps, selectedStudent } = useStudentFilter();
>>>>>>> origin/main

  const handleSaveReport = () => {
    toast.success("Changes saved successfully");
  };

<<<<<<< HEAD
  const getRole = useAuthRole();
  console.log(getRole, "getRolesssss");

=======
>>>>>>> origin/main
  return (
    <div className="min-h-screen py-5">
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
<<<<<<< HEAD

      {getRole === "doctor" ? (
        <StudentFilter {...filterProps} />
      ) : (
        <SchoolStudentFilter
          selectRole={selectUser?.user_type_id}
          {...filterProps}
          onSelectedBranchChange={setSelectedBranch}
          ownBranch={defaultBranch}
        />
      )}
=======
      <StudentFilter {...filterProps} />
>>>>>>> origin/main

      {selectedStudent ? (
        <div className="space-y-3">
          {/* <div className="flex justify-end">
            <Button type="button" onClick={handleSaveReport}>
              <Save className="size-4" />
              Save Report
            </Button>
          </div> */}

<<<<<<< HEAD
          <HealthCheckContent
            selectUser={selectUser}
            student={selectedStudent}
            // Falls back to the account's own branch so the school name and
            // address render before the user picks one in the dropdown.
            branch={selectedBranch ?? defaultBranch}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 my-8">
=======
          <HealthCheckContent student={selectedStudent} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-6">
>>>>>>> origin/main
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
