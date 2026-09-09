"use client";

import React, { useState } from "react";
import AnimatedModal from "@/components/ui/AnimatedModal";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/text-field";

import {
  Activity,
  Check,
  Ear,
  Eye,
  HeartPlus,
  Send,
  Smile,
  SquareActivity,
  Stethoscope,
  X,
} from "lucide-react";
import ReusableSelect from "@/components/ui/reusable-select";

const SCREENING_TYPES = [
  {
    id: 1,
    name: "General Screening",
    description: "General health and physical assessment",
    className: {
      border: "border-domain-physical",
      selectedBg: "bg-domain-physical/5",
      ring: "ring-domain-physical",
      iconBg: "bg-domain-physical",
      iconText: "text-domain-physical-foreground",
    },
    icon: Activity,
  },
  {
    id: 2,
    name: "ENT",
    description: "Ear, nose and throat assessment",
    className: {
      border: "border-domain-vision",
      selectedBg: "bg-domain-vision/5",
      ring: "ring-domain-vision",
      iconBg: "bg-domain-vision",
      iconText: "text-domain-vision-foreground",
    },
    icon: Stethoscope,
  },
  {
    id: 3,
    name: "Dental",
    description: "Oral and dental health assessment",
    className: {
      border: "border-domain-hearing",
      selectedBg: "bg-domain-hearing/5",
      ring: "ring-domain-hearing",
      iconBg: "bg-domain-hearing",
      iconText: "text-domain-hearing-foreground",
    },
    icon: Smile,
  },
  {
    id: 4,
    name: "Hearing",
    description: "Hearing ability assessment",
    className: {
      border: "border-domain-oral",
      selectedBg: "bg-domain-oral/5",
      ring: "ring-domain-oral",
      iconBg: "bg-domain-oral",
      iconText: "text-domain-oral-foreground",
    },
    icon: Ear,
  },
  {
    id: 5,
    name: "Vision",
    description: "Eye and vision assessment",
    className: {
      border: "border-domain-immunization",
      selectedBg: "bg-domain-immunization/5",
      ring: "ring-domain-immunization",
      iconBg: "bg-domain-immunization",
      iconText: "text-domain-immunization-foreground",
    },
    icon: Eye,
  },
];

const SCHOOL_OPTIONS = [
  {
    label: "Svastha International School",
    value: "1",
  },
  {
    label: "Svastha Public School",
    value: "2",
  },
];

const BRANCH_OPTIONS = [
  {
    label: "Main Branch",
    value: "1",
  },
  {
    label: "Chennai Branch",
    value: "2",
  },
];

const ScreeningPage = () => {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    school_id: "",
    branch_id: "",
    total_classes: "",
    total_sections: "",
    screening_type_ids: [],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const toggleScreeningType = (id) => {
    setFormData((prev) => ({
      ...prev,
      screening_type_ids: prev.screening_type_ids.includes(id)
        ? prev.screening_type_ids.filter((item) => item !== id)
        : [...prev.screening_type_ids, id],
    }));

    setErrors((prev) => ({
      ...prev,
      screening_type_ids: "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.school_id) {
      newErrors.school_id = "Please select a school";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Please select a branch";
    }

    if (!formData.total_classes) {
      newErrors.total_classes = "Enter total number of classes";
    }

    if (!formData.total_sections) {
      newErrors.total_sections = "Enter total number of sections";
    }

    if (formData.screening_type_ids.length === 0) {
      newErrors.screening_type_ids = "Select at least one screening type";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const payload = {
      school_id: Number(formData.school_id),
      branch_id: Number(formData.branch_id),
      total_classes: Number(formData.total_classes),
      total_sections: Number(formData.total_sections),
      screening_type_ids: formData.screening_type_ids,
    };

    console.log("Screening Request Payload:", payload);

    // API call here
    // dispatch(createScreeningRequest(payload));

    setOpen(false);

    setFormData({
      school_id: "",
      branch_id: "",
      total_classes: "",
      total_sections: "",
      screening_type_ids: [],
    });
  };

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        {/* ================= Header ================= */}
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SquareActivity className="size-5" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Screening Configuration
              </h2>

              <p className="mt-1 max-w-9/10 text-sm leading-6 text-muted-foreground">
                Configure screening types, update screening options, and manage
                the settings used throughout your school health assessments.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="shrink-0 gap-2"
            onClick={() => setOpen(true)}
          >
            <Send className="size-4" />
            Request Screening
          </Button>
        </div>

        {/* ================= Empty State ================= */}
        <div className="p-5">
          <div className="rounded-xl border border-dashed border-border bg-card p-6">
            <EmptyState
              title="No Screening Requests Yet"
              description="Create your first screening request and choose the health assessments required for your school."
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(true)}
                >
                  <HeartPlus className="size-4" />
                  Create Screening Request
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* ================= Modal ================= */}
      <AnimatedModal
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="Create Screening Request"
      >
        <div className="relative flex max-h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {/* Close */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 z-20"
            aria-label="Close screening request"
          >
            <X className="size-4" />
          </Button>

          {/* ================= Modal Header ================= */}
          <div className="shrink-0 border-b px-5 py-4 pr-14 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HeartPlus className="size-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Create Screening Request
                </h2>

                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                  Select the school, branch, screening coverage, and health
                  assessments required for this screening request.
                </p>
              </div>
            </div>
          </div>

          {/* ================= Form ================= */}
          <form
            onSubmit={handleSubmit}
            className="min-h-0 flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-7">
              {/* ================= School Information ================= */}
              <section>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    School Information
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Select the school and branch where the screening will be
                    conducted.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* School */}
                  <div className="space-y-1.5">
                    <ReusableSelect
                      label="School"
                      value={formData.school_id}
                      onChange={(value) => handleChange("school_id", value)}
                      options={SCHOOL_OPTIONS}
                      placeholder="Select school"
                    />

                    {errors.school_id ? (
                      <p className="text-xs text-destructive">
                        {errors.school_id}
                      </p>
                    ) : null}
                  </div>

                  {/* Branch */}
                  <div className="space-y-1.5">
                    <ReusableSelect
                      label="Branch"
                      value={formData.branch_id}
                      onChange={(value) => handleChange("branch_id", value)}
                      options={BRANCH_OPTIONS}
                      placeholder="Select branch"
                    />

                    {errors.branch_id ? (
                      <p className="text-xs text-destructive">
                        {errors.branch_id}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* ================= Screening Coverage ================= */}
              <section className="border-t border-border pt-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Screening Coverage
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter the total number of classes and sections included in
                    this screening request.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Total Classes */}
                  <div className="space-y-1.5">
                    <Label htmlFor="total_classes">Total Classes</Label>

                    <Input
                      id="total_classes"
                      type="number"
                      min="1"
                      value={formData.total_classes}
                      onChange={(event) =>
                        handleChange("total_classes", event.target.value)
                      }
                      placeholder="e.g. 12"
                    />

                    {errors.total_classes ? (
                      <p className="text-xs text-destructive">
                        {errors.total_classes}
                      </p>
                    ) : null}
                  </div>

                  {/* Total Sections */}
                  <div className="space-y-1.5">
                    <Label htmlFor="total_sections">Total Sections</Label>

                    <Input
                      id="total_sections"
                      type="number"
                      min="1"
                      value={formData.total_sections}
                      onChange={(event) =>
                        handleChange("total_sections", event.target.value)
                      }
                      placeholder="e.g. 24"
                    />

                    {errors.total_sections ? (
                      <p className="text-xs text-destructive">
                        {errors.total_sections}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* ================= Screening Types ================= */}
              <section className="border-t border-border pt-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Screening Types
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Select one or more health screenings to include in this
                    request.
                  </p>
                </div>

                {/* Screening Type Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {SCREENING_TYPES.map((screening) => {
                    const Icon = screening.icon;

                    const isSelected = formData.screening_type_ids.includes(
                      screening.id,
                    );

                    return (
                      <button
                        key={screening.id}
                        type="button"
                        onClick={() => toggleScreeningType(screening.id)}
                        className={[
                          "group relative flex min-h-28 items-start gap-3 rounded-xl border p-4 text-left transition-all",
                          "hover:border-primary/50 hover:bg-primary/5",

                          isSelected
                            ? [
                                screening.className.border,
                                screening.className.selectedBg,
                                "ring-1",
                                screening.className.ring,
                              ].join(" ")
                            : "border-border bg-card",
                        ].join(" ")}
                      >
                        {/* Icon */}
                        <div
                          className={[
                            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",

                            isSelected
                              ? [
                                  screening.className.iconBg,
                                  screening.className.iconText,
                                ].join(" ")
                              : "bg-muted text-muted-foreground group-hover:text-primary",
                          ].join(" ")}
                        >
                          <Icon className="size-4" />
                        </div>
                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {screening.name}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {screening.description}
                          </p>
                        </div>

                        {/* Selected */}
                        {isSelected ? (
                          <div className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3" />
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {errors.screening_type_ids ? (
                  <p className="mt-3 text-xs text-destructive">
                    {errors.screening_type_ids}
                  </p>
                ) : null}

                {/* Selected Count */}
                <div className="mt-4 rounded-lg bg-muted/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Selected screening types:{" "}
                    <span className="font-semibold text-foreground">
                      {formData.screening_type_ids.length}
                    </span>
                  </p>
                </div>
              </section>
            </div>

            {/* ================= Footer ================= */}
            <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
                Cancel
              </Button>

              <Button type="submit">
                <Send className="size-4" />
                Submit Request
              </Button>
            </div>
          </form>
        </div>
      </AnimatedModal>
    </>
  );
};

export default ScreeningPage;
