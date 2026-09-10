"use client";

import React, { useRef, useState } from "react";
import AnimatedModal from "@/components/ui/AnimatedModal";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/ui/text-field";
import { toast } from "sonner";

import {
  Activity,
  Check,
  Ear,
  Eye,
  HeartPlus,
  Loader2,
  ScanHeart,
  Send,
  Smile,
  SquareActivity,
  Stethoscope,
  X,
} from "lucide-react";
import ReusableSelect from "@/components/ui/reusable-select";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { getAllScreeningTypes } from "@/lib/features/getAllScreeningTypes";
import ToothIcon from "@/app/health-checks/dental-screening/asset/toothIcon";
import {
  createScreening,
  getAllScreening,
} from "@/lib/features/registerScreeningSlice";
import { screeningSchema } from "../validation/screening-validation-schema";

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
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const dispatch = useDispatch();
  const {
    data: masterScreeningData = [],
    isLoading: masterScreeningDataLoading,
    error: masterScreeningQueryError,
  } = useQuery({
    queryKey: ["masterScreeningData"],
    queryFn: () => dispatch(getAllScreeningTypes()).unwrap(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: getAllScreeningData = [] } = useQuery({
    queryKey: ["getAllScreening"],
    queryFn: () => dispatch(getAllScreening()).unwrap(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log(getAllScreeningData, "getAllScreeningData");

  //   const {
  //   data: createScreeningData = [],
  //   isLoading: createScreeningLoading,
  //   error: createScreeningError,
  // } = useQuery({
  //   queryKey: ["createScreening"],
  //   queryFn: () =>
  //     dispatch(
  //       createScreening
  //     ).unwrap(),
  //   enabled: false,
  // });

  const SCREENING_STYLES = {
    "General Screening": {
      border: "border-domain-physical",
      selectedBg: "bg-domain-physical/5",
      ring: "ring-domain-physical",
      iconBg: "bg-domain-physical",
      iconText: "text-domain-physical-foreground",
    },

    "ENT Screening": {
      border: "border-domain-vision",
      selectedBg: "bg-domain-vision/5",
      ring: "ring-domain-vision",
      iconBg: "bg-domain-vision",
      iconText: "text-domain-vision-foreground",
    },

    "Dental Screening": {
      border: "border-domain-hearing",
      selectedBg: "bg-domain-hearing/5",
      ring: "ring-domain-hearing",
      iconBg: "bg-domain-hearing",
      iconText: "text-domain-hearing-foreground",
    },

    "Hear Screening": {
      border: "border-domain-oral",
      selectedBg: "bg-domain-oral/5",
      ring: "ring-domain-oral",
      iconBg: "bg-domain-oral",
      iconText: "text-domain-oral-foreground",
    },

    "Vision Screening": {
      border: "border-domain-immunization",
      selectedBg: "bg-domain-immunization/5",
      ring: "ring-domain-immunization",
      iconBg: "bg-domain-immunization",
      iconText: "text-domain-immunization-foreground",
    },
  };
  const SCREENING_ICONS = {
    "General Screening": Activity,
    "ENT Screening": Stethoscope,
    "Dental Screening": ToothIcon,
    "Hear Screening": Ear,
    "Vision Screening": Eye,
  };

  const SCREENING_DESCRIPTION = {
    "General Screening":
      "Assess overall health, physical condition, growth, and general well-being of students",
    "ENT Screening":
      "Evaluate ear, nose, and throat health to identify common ENT-related concerns.",
    "Dental Screening":
      "Check oral health, dental hygiene, and identify common dental conditions or concerns.",
    "Hear Screening":
      "Screen students for hearing difficulties and identify potential hearing-related concerns.",
    "Vision Screening":
      "Assess visual acuity and identify possible vision problems that may affect students' learning.",
  };

  const rawScreeningTypes = Array.isArray(masterScreeningData)
    ? masterScreeningData
    : (masterScreeningData?.data ?? masterScreeningData?.screeningTypes ?? []);

  const SCREENING_TYPES = rawScreeningTypes.map((screening) => ({
    ...screening,
    icon: SCREENING_ICONS[screening.screening_type],
    description: SCREENING_DESCRIPTION[screening.screening_type],
    className: SCREENING_STYLES[screening.screening_type] ?? {
      border: "border-border",
      selectedBg: "bg-card",
      ring: "ring-border",
      iconBg: "bg-muted",
      iconText: "text-muted-foreground",
    },
  }));

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Block re-entry: if a save is already in flight, ignore the click.
    // isSaving state updates async so it can't stop a second click in the same tick.
    if (isSavingRef.current) {
      return;
    }

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

    const formValues = {
      school_id,
      branch_id,
      total_classes,
      total_sections,
      screening_type_ids,
    };

    const result = screeningSchema.safeParse(formValues);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      // Reduce to { fieldName: firstMessage } for inline display.
      const firstPerField = Object.fromEntries(
        Object.entries(errors)
          .map(([field, messages]) => [field, messages?.[0]])
          .filter(([, message]) => Boolean(message)),
      );

      setErrors(firstPerField);

      const firstError = Object.values(firstPerField).find(Boolean);
      toast.error(firstError || "Please fill all required fields.");

      return;
    }

    setIsSaving(true);
    isSavingRef.current = true;

    try {
      await dispatch(createScreening(payload)).unwrap();

      toast.success("Screening request created successfully", {
        description: "Your screening request has been submitted.",
      });

      setOpen(false);

      setFormData({
        school_id: "",
        branch_id: "",
        total_classes: "",
        total_sections: "",
        screening_type_ids: [],
      });
      setErrors({});
    } catch (error) {
      console.error("Failed to create screening request:", error);

      // Extract backend error message for the toast.
      let message = "Failed to create screening request. Please try again.";
      if (typeof error === "string") {
        message = error;
      } else if (error && typeof error === "object") {
        const fieldMessages = Object.values(error.errors ?? {})
          .flatMap((messages) =>
            Array.isArray(messages) ? messages : [messages],
          )
          .filter(Boolean);
        message = fieldMessages[0] ?? error.message ?? error.error ?? message;
      }

      toast.error("Failed to create screening request", {
        description: message,
      });
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
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
                    {/* <Label htmlFor="total_classes">Total Classes</Label> */}

                    <TextField
                    label="Total Classes"
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
                    {/* <Label htmlFor="total_sections">Total Sections</Label> */}

                    <TextField
                    label="Total Sections"
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
                  {masterScreeningDataLoading ? (
                    <div className="flex min-h-28 items-center justify-center rounded-xl border border-border bg-card">
                      <Loader2 className="size-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    SCREENING_TYPES.map((screening) => {
                      const Icon = screening.icon ?? ScanHeart;
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
                              {screening.screening_type}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {screening.description}
                            </p>
                          </div>

                          {/* Selected */}
                          {isSelected && (
                            <div className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-3" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
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

              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </AnimatedModal>
    </>
  );
};

export default ScreeningPage;
