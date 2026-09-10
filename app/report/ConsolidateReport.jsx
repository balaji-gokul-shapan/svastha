"use client";

import StudentFilter from "../health-checks/utilities/studentFilter";
import useStudentFilter from "./utilities/useStudentFilter";
import HealthCheckContent from "./components/HealthCheckContent";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Save, Search } from "lucide-react";
import { toast } from "sonner";

export default function ConsolidateReport() {
  const { filterProps, selectedStudent } = useStudentFilter();

  const handleSaveReport = () => {
    toast.success("Changes saved successfully");
  };

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
      <StudentFilter {...filterProps} />

      {selectedStudent ? (
        <div className="space-y-3">
          {/* <div className="flex justify-end">
            <Button type="button" onClick={handleSaveReport}>
              <Save className="size-4" />
              Save Report
            </Button>
          </div> */}

          <HealthCheckContent student={selectedStudent} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-6">
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
