// import React from "react";
// import { Building2, GraduationCap, Users, CalendarDays } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/text-field";
// import { Input } from "@/components/ui/input";

// const SchoolDetails = () => {
//   return (
//     <section className="overflow-hidden rounded-xl border border-border bg-card">
//       {/* Header */}
//       <div className="border-b border-border p-5">
//         <div className="flex items-center gap-3">
//           <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
//             <Building2 className="size-5" />
//           </div>

//           <div>
//             <h2 className="text-xl font-semibold text-foreground">
//               School Configuration
//             </h2>

//             <p className="mt-1  text-sm leading-6 text-muted-foreground">
//               Create and manage your school branches, update school details,
//               and keep your school information organized in one place.
//             </p>
//           </div>
//         </div>
//       </div>

//     </section>
//   );
// };

// export default SchoolDetails;

"use client";

import React, { useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  GraduationCap,
  IdCard,
  Search,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label, TextField } from "@/components/ui/text-field";
import { Input } from "@/components/ui/input";
import AnimatedModal from "@/components/ui/AnimatedModal";
import { EmptyState } from "@/components/ui/empty-state";
import { YearPicker } from "@/components/ui/year-picker";
import ReusableMultiSelect from "@/components/ui/ReusableMultiSelect";
import { SECTION_OPTIONS } from "@/app/settings/datas/settingsData";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { createSchoolBranches } from "@/lib/features/registerSchoolBranchSlice";

const SchoolDetails = ({ getAllSchoolBranch }) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    branch_name: "",
    class: "",
    section: "",
    registration_number: "",
    ceeb_code: "",
    total_teaching_staff: 0,
    total_non_teaching_staff: 0,
    total_students: 0,
    year_of_establishment: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //school branch createSchoolBranches //
  // const {
  //   data: createSchoolBranch = {},
  //   isLoading: createSchoolBranchLoading,
  //   error: createSchoolBranchError,
  // } = useQuery({
  //   queryKey: ["createSchoolbranch"],
  //   queryFn: () => dispatch(createSchoolBranches()).unwrap(),
  //   staleTime: 5 * 60 * 1000,
  //   refetchOnWindowFocus: false,
  // });

  function getBackendErrorMessage(error) {
    let payload = error;

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        return /<!doctype html|<html[\s>]/i.test(payload) ||
          payload.length > 240
          ? "Unable to save school details. Please try again."
          : payload;
      }
    }

    if (!payload || typeof payload !== "object") {
      return "Something went wrong. Please try again.";
    }

    const fieldMessages = Object.values(payload.errors ?? {})
      .flatMap((messages) => (Array.isArray(messages) ? messages : [messages]))
      .filter(Boolean);

    const message =
      fieldMessages[0] ??
      payload.message ??
      payload.error ??
      payload.detail ??
      "Something went wrong. Please try again.";
    return /<!doctype html|<html[\s>]/i.test(String(message)) ||
      String(message).length > 240
      ? "Unable to save school details. Please try again."
      : String(message);
  }

  const handleSave = (e) => {
    e.preventDefault();
    if (isSavingRef.current) {
      return;
    }

    console.log("School Details:", formData);

    const payload = {
      branch_name: formData?.branch_name,
      class: formData?.class,
      section: formData?.section,
      registration_number: formData?.registration_number,
      ceeb_code: formData?.ceeb_code,
      total_teaching_staff: Number(formData?.total_teaching_staff),
      total_non_teaching_staff: Number(formData?.total_non_teaching_staff),
      total_students: Number(formData?.total_students),
      year_of_establishment: Number(formData?.year_of_establishment),
    };

    // API call here
    // dispatch(createSchool(formData));
    setIsSaving(true);

    dispatch(createSchoolBranches(payload))
      .unwrap()
      .then(() => {
        setIsSaving(false);

        toast.success("School Branch saved successfully", {
          description: formData.branch_name
            ? `Record saved for ${formData.branch_name}`
            : undefined,
        });
      })
      .catch((error) => {
        setIsSaving(false);
        console.error("Unable to create Branch:", error);

        toast.error("Failed to create Branch", {
          description: getBackendErrorMessage(error),
        });
      });

    setOpen(false);
  };

  // Academic Structure — Class & Section multi-select options.
  // Derived from SECTION_OPTIONS ("Grade {g} - {s}") into two independent lists.
  const classOptions = SECTION_OPTIONS.map((opt) => {
    const grade = opt.label.match(/(\d+)/)?.[1];
    return grade ? { value: `${grade}`, label: `${grade}` } : null;
  })
    .filter(Boolean)
    .filter((opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i);

  const sectionOptions = SECTION_OPTIONS.map((opt) => {
    const section = opt.label.split(" - ")[1];
    return section ? { value: section, label: section } : null;
  })
    .filter(Boolean)
    .filter((opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i);

  // if (!sectionOptions.some((o) => o.value === "D")) {
  //   sectionOptions.push({ value: "D", label: "D" });
  // }

  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);

  const syncClassToForm = (ids) => {
    setSelectedClassIds(ids);
    setFormData((prev) => ({
      ...prev,
      class: ids.join(", "),
    }));
  };

  const syncSectionToForm = (ids) => {
    setSelectedSectionIds(ids);
    setFormData((prev) => ({
      ...prev,
      section: ids.join(", "),
    }));
  };

  const getAllBranch = getAllSchoolBranch?.data?.length ?? 0;
  console.log(getAllBranch, "getAllBranch");

  return (
    <>
      {/* ================= School Configuration Card ================= */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                School Configuration
              </h2>

              <p className="mt-1 max-w-9/10 text-sm leading-6 text-muted-foreground">
                Create and manage your school branches, update school details,
                and keep your school information organized in one place.
              </p>
            </div>
          </div>

          {/* Trigger Button */}
          {getAllBranch > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full gap-2 sm:w-auto"
              onClick={() => setOpen(true)}
            >
              <Building2 className="size-5" />
              Create School Branch
            </Button>
          )}
        </div>
      </section>
      {getAllBranch === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-6">
          <EmptyState
            title="No School Branches Yet"
            description="Create a school branch to get started and manage its details."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(true)}
              >
                <Building2 className="size-4" />
                Create School Branch
              </Button>
            }
          />
        </div>
      )}

      {/* ================= Modal ================= */}
      <AnimatedModal
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="School Configuration"
      >
        <div className="relative flex max-h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {/* Close Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 z-20"
            aria-label="Close school configuration"
          >
            <X className="size-4" />
          </Button>

          {/* ================= Modal Header ================= */}
          <div className="shrink-0 border-b px-5 py-4 pr-14 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>

              <div>
                <h2
                  id="school-configuration-title"
                  className="text-lg font-bold text-foreground"
                >
                  Create School Branch
                </h2>

                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                  Add your school branch details, academic structure, and school
                  statistics.
                </p>
              </div>
            </div>
          </div>

          {/* ================= Form ================= */}
          <form
            onSubmit={handleSave}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <div className="space-y-7 px-5 py-5 sm:px-7">
              {/* ================= Branch Details ================= */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Branch Details
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Basic information about your school branch.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Branch Name */}
                  <div className="space-y-2">
                    {/* <Label htmlFor="branch_name">
                      Branch Name <span className="text-destructive">*</span>
                    </Label> */}

                    <TextField
                      label="Branch Name"
                      labelClassName="text-foreground text-sm"
                      id="branch_name"
                      name="branch_name"
                      value={formData.branch_name}
                      onChange={handleChange}
                      placeholder="e.g. Chennai Main Branch"
                      required
                    />
                  </div>

                  {/* Registration Number */}
                  <div className="space-y-2">
                    {/* <Label htmlFor="registration_number">
                      Registration Number
                    </Label> */}

                    <TextField
                      label="Registration Number"
                      labelClassName="text-foreground text-sm"
                      id="registration_number"
                      name="registration_number"
                      value={formData.registration_number}
                      onChange={handleChange}
                      placeholder="e.g. SCH-2026-001"
                    />
                  </div>

                  {/* CEEB Code */}
                  <div className="space-y-2">
                    {/* <Label htmlFor="ceeb_code">CEEB Code</Label> */}

                    <TextField
                      label="CEEB Code"
                      labelClassName="text-foreground text-sm"
                      id="ceeb_code"
                      name="ceeb_code"
                      value={formData.ceeb_code}
                      onChange={handleChange}
                      placeholder="Enter CEEB code"
                    />
                  </div>

                  {/* Establishment Year */}
                  <div className="space-y-2">
                    {/* <Label htmlFor="year_of_establishment">
                      Year of Establishment
                    </Label> */}
                    <YearPicker
                      label="Year of Establishment"
                      labelClassName="text-foreground text-sm"
                      id="year_of_establishment"
                      name="year_of_establishment"
                      value={formData.year_of_establishment}
                      onValueChange={(val) =>
                        setFormData({ ...formData, year_of_establishment: val })
                      }
                      placeholder="e.g. 1998"
                      allowFutureYears={false}
                    />

                    {/* <YearPicker
                      label="Year of Establishment"
                      labelClassName="text-foreground text-sm"
                      id="year_of_establishment"
                      name="year_of_establishment"
                      value={formData.year_of_establishment}
                      onValueChange={(val) =>
                        setFormData({ ...formData, year_of_establishment: val })
                      }
                      placeholder="e.g. 1998"
                      className="pl-9"
                    /> */}
                    {/* <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <TextField
                        label="Year of Establishment"
                        labelClassName="text-foreground text-sm"
                        id="year_of_establishment"
                        name="year_of_establishment"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        value={formData.year_of_establishment}
                        onChange={handleChange}
                        placeholder="e.g. 1998"
                        className="pl-9"
                      />
                    </div> */}
                  </div>
                </div>
              </section>

              {/* ================= Academic Structure ================= */}
              <section className="border-t border-border pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <GraduationCap className="size-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Academic Structure
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Configure the class and section for this branch.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <ReusableMultiSelect
                      label="Class"
                      options={classOptions}
                      value={selectedClassIds}
                      onChange={syncClassToForm}
                      placeholder="Select class(es)"
                      searchPlaceholder="Search classes or add new class..."
                    />
                  </div>
                  <div className="space-y-2">
                    <ReusableMultiSelect
                      label="Section"
                      options={sectionOptions}
                      value={selectedSectionIds}
                      onChange={syncSectionToForm}
                      placeholder="Select section(s)"
                      searchPlaceholder="Search sections or add new sections..."
                      allowCreate
                      allowEdit
                      allowDelete
                    />
                  </div>
                </div>
                {/* <ClassSectionManager class={formData.class} section={formData.section}/> */}
              </section>

              {/* ================= School Statistics ================= */}
              <section className="border-t border-border pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="size-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      School Statistics
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Enter the current staff and student count.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Teaching Staff */}
                  <div className="space-y-2">
                    <Label htmlFor="total_teaching_staff">Teaching Staff</Label>

                    <Input
                      id="total_teaching_staff"
                      name="total_teaching_staff"
                      type="number"
                      min="0"
                      value={formData.total_teaching_staff}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Non Teaching Staff */}
                  <div className="space-y-2">
                    <Label htmlFor="total_non_teaching_staff">
                      Non-Teaching Staff
                    </Label>

                    <Input
                      id="total_non_teaching_staff"
                      name="total_non_teaching_staff"
                      type="number"
                      min="0"
                      value={formData.total_non_teaching_staff}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Students */}
                  <div className="space-y-2">
                    <Label htmlFor="total_students">Total Students</Label>

                    <Input
                      id="total_students"
                      name="total_students"
                      type="number"
                      min="0"
                      value={formData.total_students}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>

              {/* ================= Information ================= */}
              <section className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <IdCard className="mt-0.5 size-4 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      School information
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Verify the branch, academic structure, and school
                      statistics before saving.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* ================= Footer ================= */}
            <div className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-2 border-t bg-card px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
                Cancel
              </Button>

              <Button type="submit">
                <Building2 className="size-4" />
                Save School Details
              </Button>
            </div>
          </form>
        </div>
      </AnimatedModal>
    </>
  );
};

export default SchoolDetails;
