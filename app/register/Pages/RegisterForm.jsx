"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  MapPin,
  GitBranch,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Loader2,
  User,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TextField, TextareaField } from "@/components/ui/text-field";
import ReusableSelect from "@/components/ui/reusable-select";
import { NumberStepperField } from "@/components/ui/numberStepperField";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  schoolStepOneSchema,
  schoolStepTwoSchema,
  schoolStepThreeSchema,
  schoolStepFourSchema,
  schoolRegistrationSchema,
} from "./school-registration-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createRegisterSchool,
  resetRegisterSchoolState,
} from "@/lib/features/registerSchoolSlice";
import { YearPicker } from "@/components/ui/year-picker";
import { useQuery } from "@tanstack/react-query";

import { getPincodeDetails } from "@/lib/features/getPincode.slice";

/* ==========================================================================
   usePincodeOptions
   Looks up a pincode once 6 digits are present and returns DE-DUPED option
   lists per field, plus the best single guess for autofill.
.
   ========================================================================== */

const toOptions = (values) => values.map((value) => ({ value, label: value }));

export function usePincodeOptions(pincode) {
  const dispatch = useAppDispatch();
  const normalized = String(pincode ?? "").trim();
  const isReady = normalized.length === 6;

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["pincode-details", normalized],
  
    queryFn: () => dispatch(getPincodeDetails(normalized)).unwrap(),
    enabled: isReady,
    retry: false,
    // Postal data changes rarely — avoid refetching on every step change.
    staleTime: 1000 * 60 * 30,
  });

  /* options[key] -> [{ value, label }], distinct, source order preserved. */
  const options = useMemo(() => {
    const list = data?.options ?? [];

    const collect = (key) => {
      const seen = new Set();
      const out = [];

      list.forEach((entry) => {
        const value = String(entry?.[key] ?? "").trim();
        if (!value) return;

        const dedupeKey = value.toLowerCase();
        if (seen.has(dedupeKey)) return;

        seen.add(dedupeKey);
        out.push(value);
      });

      return out;
    };

    return {
      city: toOptions(collect("city")),
      state: toOptions(collect("state")),
      district: toOptions(collect("district")),
      area: toOptions(collect("taluk")),
    };
  }, [data]);

  /* Best-guess values, for autofilling fields the user hasn't typed into. */
  const autofill = useMemo(() => {
    if (!data) return null;

    return {
      city: String(data.city ?? "").trim(),
      state: String(data.state ?? "").trim(),
      district: String(data.district ?? "").trim(),
      area: String(data.taluk ?? "").trim(),
      country: String(data.country ?? "").trim() || "India",
    };
  }, [data]);

  const errorMessage =
    (error && typeof error === "string" ? error : null) ??
    (error?.message ?? null);

  const isBusy = isReady && (isLoading || isFetching) && !errorMessage;

  return {
    isReady,
    isBusy,
    error: errorMessage,
    options,
    autofill,
    /** Placeholder text that tells the user why the select is empty. */
    emptyPlaceholder: isReady ? "Select" : "Enter a 6-digit pincode first",
  };
}


// Step id of the optional "Branches" step — shown only when the school
// declares it has more than one location.
const BRANCH_STEP_ID = 3;

const steps = [
  {
    id: 1,
    title: "School Details",
    description: "Basic school information",
    icon: Building2,
  },
  {
    id: 2,
    title: "Contact & Address",
    description: "Location and contact details",
    icon: MapPin,
  },
  {
    id: 3,
    title: "Branches",
    description: "Add school branches",
    icon: GitBranch,
  },
  {
    id: 4,
    title: "Profile & Review",
    description: "Review registration",
    icon: FileText,
  },
];

const initialBranch = {
  branch_name: "",
  registration_number: "",
  address_line_1: "",
  address_line_2: "",
  area: "",
  city: "",
  state: "",
  district: "",
  country: "",
  pincode: "",
  contact_person_name: "",
  contact_person_designation: "",
  contact_person_phone: "",
  contact_person_email: "",
};

const initialForm = {
  school_name: "",
  ownership_type: "",
  board: "",
  total_teaching_staff: 0,
  total_non_teaching_staff: 0,
  // Kept as "" rather than a number so the untouched field fails the
  // "is required" check with a real message instead of zod's
  // "expected number, received undefined".
  total_students: "",
  year_of_establishment: "",
  ceeb_code: "",
  registration_number: "",

  address_line_1: "",
  address_line_2: "",
  contact_person_designation: "",
  contact_person_name: "",
  contact_person_phone: "",
  email: "",

  area: "",
  city: "",
  state: "",
  district: "",
  country: "India",
  pincode: "",

  branches: [],

  // Drives whether the "Branches" step is shown at all. A single-location
  // school skips it entirely; toggling it on reveals the step in the stepper.
  has_multiple_branches: false,

  school_name_with_location: "",
  school_profile: "",
  school_website_url: "",
  is_active: true,
};

/* ==========================================================================
   Registration celebration
   A purely presentational side-effect for a successful registration. It is
   deliberately kept OUT of the submit flow: it is fire-and-forget, never
   awaited, and never throws into the caller, so it cannot delay, alter or fail
   the request, the state reset or the redirect.
   ========================================================================== */

/* The brand tokens are authored as modern space-separated HSL
   ("hsl(198 83% 49%)"), but a canvas fillStyle only guarantees the legacy
   comma form, so the token is normalised before confetti uses it. */
function toLegacyHsl(value, fallback) {
  const parts = String(value ?? "").trim().split(/[\s,]+/).filter(Boolean);

  if (parts.length !== 3) {
    return fallback;
  }

  const [hue, saturation, lightness] = parts;
  const isValid =
    /^-?[\d.]+$/.test(hue) &&
    /^[\d.]+%$/.test(saturation) &&
    /^[\d.]+%$/.test(lightness);

  return isValid ? `hsl(${hue}, ${saturation}, ${lightness})` : fallback;
}

function celebrateRegistration() {
  if (typeof window === "undefined") {
    return;
  }

  // Someone who has asked the OS for calm UI gets the success toast only.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const styles = window.getComputedStyle(document.documentElement);

  const colors = [
    toLegacyHsl(
      styles.getPropertyValue("--brand-blue"),
      "hsl(198, 83%, 49%)",
    ),
    toLegacyHsl(
      styles.getPropertyValue("--brand-green"),
      "hsl(142, 62%, 65%)",
    ),
    "hsl(38, 92%, 50%)",
    "hsl(350, 89%, 60%)",
    "#ffffff",
  ];

  const burst = {
    colors,
    spread: 70,
    startVelocity: 45,
    ticks: 220,
    zIndex: 9999,
    disableForReducedMotion: true,
  };

  // One central burst plus two angled side cannons, so it reads as a
  // celebration rather than a single pop.
  void confetti({
    ...burst,
    particleCount: 90,
    scalar: 1.05,
    origin: { x: 0.5, y: 0.6 },
  });
  void confetti({
    ...burst,
    particleCount: 45,
    angle: 60,
    origin: { x: 0.15, y: 0.75 },
  });
  void confetti({
    ...burst,
    particleCount: 45,
    angle: 120,
    origin: { x: 0.85, y: 0.75 },
  });
}

export default function SchoolRegistrationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { createLoading } = useAppSelector((state) => state.registerSchool);

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const visibleSteps = useMemo(
    () =>
      form.has_multiple_branches
        ? steps
        : steps.filter((step) => step.id !== BRANCH_STEP_ID),
    [form.has_multiple_branches],
  );

  /* If the user is ON the branches step and switches the toggle off (only
     reachable via Back), move them somewhere valid instead of stranding them
     on a step that is no longer rendered. This is a render-phase adjustment
     (the pattern React recommends over an effect): when `visibleSteps`
     changes we re-check validity and correct `currentStep` before painting,
     so the hidden step is never rendered for a frame. */
  const [visibleStepsForBranchToggle, setVisibleStepsForBranchToggle] =
    useState(visibleSteps);

  if (visibleStepsForBranchToggle !== visibleSteps) {
    setVisibleStepsForBranchToggle(visibleSteps);

    if (
      currentStep === BRANCH_STEP_ID &&
      !visibleSteps.some((step) => step.id === currentStep)
    ) {
      setCurrentStep(visibleSteps[visibleSteps.length - 1]?.id ?? 1);
    }
  }

  // The active step object, resolved by id (not index) so hidden steps are safe.
  const activeStep =
    visibleSteps.find((step) => step.id === currentStep) ?? visibleSteps[0];

  // Position within the VISIBLE list (1-based). Ids stay 1..4 even when the
  // Branches step is hidden, so the raw id would print "Step 3 of 3".
  const currentStepIndex = Math.max(
    1,
    visibleSteps.findIndex((step) => step.id === currentStep) + 1,
  );

  const isLastStep = currentStep === visibleSteps[visibleSteps.length - 1]?.id;

  // const updateField = (field, value) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));

  //   setErrors((prev) => ({
  //     ...prev,
  //     [field]: "",
  //   }));
  // };
  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateBranch = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) =>
        i === index
          ? {
              ...branch,
              [field]: value,
            }
          : branch,
      ),
    }));

    setFormErrors((prev) => {
      if (!prev?.branches?.[index]?.[field]) {
        return prev;
      }

      const next = {
        ...prev,
        branches: {
          ...prev.branches,
        },
      };

      next.branches[index] = {
        ...next.branches[index],
      };

      delete next.branches[index][field];

      return next;
    });
  };

  const addBranch = () => {
    setForm((prev) => ({
      ...prev,
      branches: [...prev.branches, { ...initialBranch }],
    }));
  };

  const removeBranch = (index) => {
    setForm((prev) => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index),
    }));
  };

  const toggleMultipleBranches = (next) => {
    const value = Boolean(next);

    setForm((prev) => ({
      ...prev,
      has_multiple_branches: value,
      // Turning it off while branches exist would leave data behind that the
      // user can no longer reach (the Branches step is hidden), so clear it.
      branches: !value && prev.branches.length ? [] : prev.branches,
    }));

    setFormErrors((prev) => {
      if (!prev?.has_multiple_branches) return prev;

      const next2 = { ...prev };
      delete next2.has_multiple_branches;
      return next2;
    });

    if (!value && form.branches.length) {
      toast.info(
        "Added branches were cleared because multi-branch was turned off.",
      );
    }
  };

  const validateStep = () => {
    let schema;
    let values;

    switch (currentStep) {
      case 1:
        schema = schoolStepOneSchema;

        values = {
          school_name: form.school_name,
          ownership_type: form.ownership_type,
          board: form.board,
          registration_number: form.registration_number,
          ceeb_code: form.ceeb_code,
          total_students: form.total_students,
          year_of_establishment: form.year_of_establishment,
          total_teaching_staff: form.total_teaching_staff,
          total_non_teaching_staff: form.total_non_teaching_staff,
        };

        break;

      case 2:
        schema = schoolStepTwoSchema;

        values = {
          address_line_1: form.address_line_1,
          address_line_2: form.address_line_2,
          area: form.area,
          city: form.city,
          state: form.state,
          district: form.district,
          country: form.country,
          pincode: form.pincode,
          contact_person_name: form.contact_person_name,
          contact_person_designation: form.contact_person_designation,
          contact_person_phone: form.contact_person_phone,
          email: form.email,
        };

        break;

      case 3:
        schema = schoolStepThreeSchema;

        values = {
          branches: form.branches,
        };

        break;

      case 4:
        schema = schoolStepFourSchema;

        values = {
          school_name_with_location: form.school_name_with_location,

          school_profile: form.school_profile,

          school_website_url: form.school_website_url,

          is_active: form.is_active,
        };

        break;

      default:
        return true;
    }

    const result = schema.safeParse(values);

    if (!result.success) {
      const fieldErrors = result.error.format();

      console.log("Validation Errors:", fieldErrors);

      setFormErrors(fieldErrors);

      return false;
    }

    // Clear errors when validation succeeds
    setFormErrors({});

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    // Advance through the VISIBLE steps only, so "Continue" from Contact
    // jumps straight to Review when the Branches step is hidden.
    const index = visibleSteps.findIndex((step) => step.id === currentStep);
    const next = visibleSteps[index + 1];

    if (next) setCurrentStep(next.id);
  };

  const previousStep = () => {
    const index = visibleSteps.findIndex((step) => step.id === currentStep);
    const prev = visibleSteps[index - 1];

    if (prev) setCurrentStep(prev.id);
  };

  const handleSubmit = async () => {
    // Final gate — validate the COMPLETE form, not just step 4.
    const result = schoolRegistrationSchema.safeParse(form);

    if (!result.success) {
      setFormErrors(result.error.format());
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    try {
      await dispatch(createRegisterSchool(result.data)).unwrap();

      // Celebration only - fire-and-forget, so the flow below is untouched.
      celebrateRegistration();

      toast.success("School registered successfully! You can now sign in.");
      setForm(initialForm);
      setFormErrors({});
      setCurrentStep(1);
      dispatch(resetRegisterSchoolState());

      // window.setTimeout(() => {
      //   router.push("/login");
      // }, 1000);
    } catch (submitError) {
      toast.error(
        typeof submitError === "string"
          ? submitError
          : submitError?.message || "Unable to register the school.",
      );
    }
  };
  const getBranchError = (index, field) => {
    return errors?.branches?.[index]?.[field]?._errors?.[0] || "";
  };


  const {
    isReady: pincodeReady,
    isBusy: pincodeLoading,
    error: pincodeError,
    options: pincodeFieldOptions,
    autofill: pincodeAutofill,
  } = usePincodeOptions(form.pincode);

  const lastFilledRef = useRef({});

  useEffect(() => {
    if (!pincodeReady || !pincodeAutofill || pincodeError) return;

    setForm((prev) => {
      const next = { ...prev };
      let changed = false;

      Object.entries(pincodeAutofill).forEach(([field, value]) => {
        const clean = String(value ?? "").trim();
        if (!clean) return;

        const current = String(prev[field] ?? "").trim();
        if (current && current !== lastFilledRef.current[field]) return;

        if (current !== clean) {
          next[field] = clean;
          changed = true;
        }
        lastFilledRef.current[field] = clean;
      });

      return changed ? next : prev;
    });
  }, [pincodeAutofill, pincodeError, pincodeReady]);

  return (
    <main className="container-page relative flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden px-3 py-3 sm:px-6 sm:py-5 md:px-8 lg:px-12">
      {/* Ambient brand wash — purely decorative, sits behind all content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_70%)]"
      />

      {/* flex column + min-h-0 is what lets the Card body claim the leftover
          height and scroll INSIDE it, keeping the footer always on screen. */}
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
        {/* Header */}
        <div className="mb-4 shrink-0 sm:mb-5 md:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-brand-green text-primary-foreground shadow-lg shadow-primary/20">
                <Building2 className="size-6" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-balance sm:text-2xl md:text-3xl">
                  School Registration
                </h1>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  Register your school and branch information
                </p>
              </div>
            </div>

            {/* Live progress read-out — mirrors currentStep, no new state. */}
            <div className="flex shrink-0 items-center gap-3 self-start rounded-full border bg-card/80 px-4 py-2 shadow-sm backdrop-blur sm:self-auto">
              <div className="flex items-center gap-1.5">
                {visibleSteps.map((step) => (
                  <span
                    key={step.id}
                    aria-hidden="true"
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step.id <= currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <span className="whitespace-nowrap text-xs font-semibold text-foreground">
                Step {currentStepIndex} of {visibleSteps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <nav
          aria-label="Registration progress"
          className="mb-4 shrink-0 overflow-hidden rounded-2xl border bg-card shadow-sm sm:mb-5 md:mb-6"
        >
          {/* Mobile: compact single track */}
          <div className="px-4 py-4 sm:hidden">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">
                Step {currentStepIndex} of {visibleSteps.length}
              </p>

              <p className="text-xs text-muted-foreground">
                {activeStep.title}
              </p>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-brand-green transition-[width] duration-500 ease-out"
                style={{
                  width: `${(currentStepIndex / visibleSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* sm+: full step nodes with labels */}
          <div className="hidden px-6 py-5 sm:block md:px-8 md:py-6">
            <ol className="flex items-start">
              {visibleSteps.map((step, index) => {
                const Icon = step.icon;

                const completed = currentStep > step.id;
                const active = currentStep === step.id;

                return (
                  <React.Fragment key={step.id}>
                    <li
                      aria-current={active ? "step" : undefined}
                      className="flex min-w-0 flex-1 flex-col items-center"
                    >
                      <div
                        className={`flex size-11 items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                          completed
                            ? "border-transparent bg-gradient-to-br from-primary to-brand-green text-primary-foreground shadow-md shadow-primary/25"
                            : active
                              ? "scale-105 border-primary bg-primary/10 text-primary shadow-sm ring-4 ring-primary/10"
                              : "border-border bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {completed ? (
                          <Check className="size-5" />
                        ) : (
                          <Icon className="size-5" />
                        )}
                      </div>

                      <p
                        className={`mt-2.5 text-center text-sm font-semibold transition-colors ${
                          active
                            ? "text-foreground"
                            : completed
                              ? "text-foreground/80"
                              : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </p>

                      <p className="mt-0.5 hidden text-center text-xs text-muted-foreground md:block">
                        {step.description}
                      </p>
                    </li>

                    {index !== visibleSteps.length - 1 && (
                      <li
                        aria-hidden="true"
                        className="mt-[22px] h-0.5 min-w-6 flex-1 overflow-hidden rounded-full bg-muted"
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-brand-green transition-[width] duration-500 ease-out"
                          style={{
                            width: currentStep > step.id ? "100%" : "0%",
                          }}
                        />
                      </li>
                    )}
                  </React.Fragment>
                );
              })}
            </ol>
          </div>
        </nav>

        {/* Form Card — ui Card */}
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-border/60 shadow-sm">
          <div className="flex shrink-0 items-center gap-3 border-b bg-card px-4 py-3 sm:gap-3.5 sm:px-6 sm:py-4 md:px-8">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {(() => {
                const ActiveIcon = activeStep.icon;
                return <ActiveIcon className="size-5" />;
              })()}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary sm:text-xs">
                Step {currentStepIndex} of {visibleSteps.length}
              </p>

              <h2 className="mt-0.5 truncate text-base font-semibold tracking-tight text-balance sm:text-lg md:text-xl">
                {activeStep.title}
              </h2>

              <p className="mt-0.5 hidden text-[13px] leading-relaxed text-muted-foreground sm:block">
                {activeStep.description}
              </p>
            </div>
          </div>

          <CardContent className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 md:p-6 lg:p-7">
            {currentStep === 1 && (
              <SchoolDetails
                form={form}
                updateField={updateField}
                errors={formErrors}
                toggleMultipleBranches={toggleMultipleBranches}
              />
            )}

            {currentStep === 2 && (
              <ContactAddress
                form={form}
                updateField={updateField}
                errors={formErrors}
                pincodeOptions={pincodeFieldOptions}
                pincodeLoading={pincodeLoading}
                pincodeError={pincodeError}
                pincodeReady={pincodeReady}
              />
            )}

            {currentStep === 3 && (
              <Branches
                form={form}
                addBranch={addBranch}
                updateBranch={updateBranch}
                removeBranch={removeBranch}
                errors={formErrors}
              />
            )}

            {currentStep === 4 && (
              <Review
                form={form}
                updateField={updateField}
                errors={formErrors}
              />
            )}
          </CardContent>

          {/* Footer — always on screen because the card is a fixed-height flex
              column and this row is shrink-0; only the body above scrolls.
              Stacks full-width on phones, inline from sm up. */}
          <CardContent className="flex shrink-0 flex-col-reverse gap-2 border-t bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-3.5 md:px-8">
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1}
              className="h-11 w-full sm:h-10 sm:w-auto"
            >
              <ChevronLeft className="size-4 shrink-0" />
              Back
            </Button>

            {!isLastStep ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-11 w-full sm:h-10 sm:w-auto"
              >
                Continue
                <ChevronRight className="size-4 shrink-0" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={createLoading}
                className="h-11 w-full sm:h-10 sm:w-auto"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Check className="size-4 shrink-0" />
                    Register School
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

/* =========================================================
   STEP 1 — ui/components: TextField, ReusableSelect, NumberStepperField
========================================================= */
const getError = (errors, field) => {
  return errors?.[field]?._errors?.[0] || "";
};

function UiSelectField({ label, required, error, children }) {
  return (
    <div>
      {label ? (
        <span className="field-label mb-2">
          {label}
          {required ? <span className="field-required">*</span> : null}
        </span>
      ) : null}
      {children}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
function SchoolDetails({ form, updateField, errors, toggleMultipleBranches }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <SectionTitle
        icon={Building2}
        title="Basic Information"
        description="Enter the basic details of your school."
      />
      <div
          role="group"
          onClick={() =>
            toggleMultipleBranches(!form.has_multiple_branches)
          }
          className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-colors hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring/50 ${
            form.has_multiple_branches
              ? "border-primary/40 bg-primary/5"
              : "border-border bg-muted/30 hover:bg-muted/50"
          }`}
        >
          <span
            className="shrink-0"
            onClick={(event) => event.stopPropagation()}
          >
            <Switch
              id="has_multiple_branches"
              checked={Boolean(form.has_multiple_branches)}
              onCheckedChange={toggleMultipleBranches}
              aria-label="This school has multiple branches"
              className="mt-0.5"
            />
          </span>

          <div className="min-w-0">
            <label
              htmlFor="has_multiple_branches"
              className="block cursor-pointer text-sm font-medium text-foreground"
            >
              This school has multiple branches
            </label>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {form.has_multiple_branches
                ? "A “Branches” step has been added to your registration. Add each campus with its own address and contact details."
                : "Turn this on if your school runs more than one campus. Single-location schools can skip the branches step."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        <TextField
          id="reg-school-name"
          label="School Name"
          required
          value={form.school_name}
          onChange={(e) => updateField("school_name", e.target.value)}
          placeholder="eg. Springfield High School"
          error={getError(errors, "school_name") || undefined}
          className="md:col-span-2"
        />

        <UiSelectField
          label="Ownership Type"
          required
          error={getError(errors, "ownership_type")}
        >
          <ReusableSelect
            withPortal
            value={form.ownership_type}
            onChange={(value) => updateField("ownership_type", value)}
            options={[
              { value: "Private", label: "Private" },
              { value: "Government", label: "Government" },
              { value: "Aided", label: "Aided" },
              { value: "Trust", label: "Trust" },
            ]}
            placeholder="Select ownership (eg. Private, Government)"
          />
        </UiSelectField>

        <UiSelectField label="Board" required error={getError(errors, "board")}>
          <ReusableSelect
            withPortal
            value={form.board}
            onChange={(value) => updateField("board", value)}
            options={[
              { value: "CBSE", label: "CBSE" },
              { value: "ICSE", label: "ICSE" },
              { value: "State Board", label: "State Board" },
              { value: "IB", label: "IB" },
              { value: "Other", label: "Other" },
            ]}
            placeholder="Select board (eg. CBSE, ICSE)"
          />
        </UiSelectField>

        <TextField
          id="reg-number"
          label="Registration Number"
          required
          value={form.registration_number}
          onChange={(e) => updateField("registration_number", e.target.value)}
         placeholder="e.g. SCH/TN/2026/00125"
          error={getError(errors, "registration_number") || undefined}
        />

        <TextField
          id="reg-ceeb"
          label="CEEB Code"
          value={form.ceeb_code}
          onChange={(e) => updateField("ceeb_code", e.target.value)}
          placeholder="eg. 12345"
          error={getError(errors, "ceeb_code") || undefined}
        />

        {/* <TextField
          id="year-of-establishment"
          label="Year of Establishment"
          value={form.year_of_establishment}
          onChange={(e) => updateField("year_of_establishment", e.target.value)}
          placeholder="Enter year of establishment"
          error={getError(errors, "year_of_establishment") || undefined}
        /> */}
        <YearPicker
          id="year_of_establishment"
          name="year_of_establishment"
          label="Year of Establishment"
          labelClassName="field-label"
          placeholder="Select year"
          minYear={1800}
          // withPortal
          value={form.year_of_establishment || ""}
          onValueChange={(v) => {
            updateField("year_of_establishment", v);
          }}
        />

        {/* 1-up on phones — three steppers side by side is unusable there. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberStepperField
            label="Total Number of Students"
            name="total_students"
            required
            min={0}
            value={form.total_students}
            onChange={(e) =>
              updateField("total_students", Number(e.target.value))
            }
            error={getError(errors, "total_students") || undefined}
          />
          <NumberStepperField
            label="Teaching Staff"
            name="total_teaching_staff"
            required
            min={0}
            value={form.total_teaching_staff}
            onChange={(e) =>
              updateField("total_teaching_staff", Number(e.target.value))
            }
            error={getError(errors, "total_teaching_staff") || undefined}
          />

          <NumberStepperField
            label="Non-Teaching Staff"
            name="total_non_teaching_staff"
            required
            min={0}
            value={form.total_non_teaching_staff}
            onChange={(e) =>
              updateField("total_non_teaching_staff", Number(e.target.value))
            }
            error={getError(errors, "total_non_teaching_staff") || undefined}
          />
        </div>

        
      </div>
    </div>
  );
}

/* =========================================================
   STEP 2
========================================================= */

function ContactAddress({
  form,
  updateField,
  errors,
  pincodeOptions = {},
  pincodeLoading = false,
  pincodeError = null,
  pincodeReady = false,
}) {
  const areaOptions = pincodeOptions.area ?? [];
  const cityOptions = pincodeOptions.city ?? [];
  const stateOptions = pincodeOptions.state ?? [];
  const districtOptions = pincodeOptions.district ?? [];
  const emptyHint = pincodeReady ? "Select" : "Enter a 6-digit pincode first";

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionTitle
        icon={MapPin}
        title="Contact & Address"
        description="Provide school location and primary contact details."
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        <TextField
          id="reg-address-1"
          label="Address Line 1"
          required
          value={form.address_line_1}
          onChange={(e) => updateField("address_line_1", e.target.value)}
          placeholder="Building / street address"
          error={getError(errors, "address_line_1") || undefined}
          className="md:col-span-2"
        />

        <TextField
          id="reg-address-2"
          label="Address Line 2"
          value={form.address_line_2}
          onChange={(e) => updateField("address_line_2", e.target.value)}
          placeholder="Apartment, landmark, etc."
          error={getError(errors, "address_line_2") || undefined}
        />

        <TextField
          id="reg-pincode"
          label="Pincode"
          required
          inputMode="numeric"
          maxLength={6}
          value={form.pincode}
          onChange={(e) =>
            updateField(
              "pincode",
              e.target.value.replace(/\D/g, "").slice(0, 6),
            )
          }
          placeholder="e.g. 600001"
          error={getError(errors, "pincode") || undefined}
        />

        {/* Lookup status line — the selects below populate from this pincode. */}
        {pincodeReady ? (
          <p
            className={`col-span-full -mt-1 text-xs ${
              pincodeError ? "text-destructive" : "text-muted-foreground"
            }`}
            role="status"
            aria-live="polite"
          >
            {pincodeError
              ? pincodeError
              : pincodeLoading
                ? "Looking up pincode…"
                : ""}
          </p>
        ) : null}

        <Field label="Area / Taluk" error={getError(errors, "area")}>
          <ReusableSelect
            value={form.area}
            onChange={(value) => updateField("area", value)}
            options={areaOptions}
            placeholder={areaOptions.length ? "Select area" : emptyHint}
            disabled={!areaOptions.length}
            withPortal
          />
        </Field>

        <Field label="City" required error={getError(errors, "city")}>
          <ReusableSelect
            value={form.city}
            onChange={(value) => updateField("city", value)}
            options={cityOptions}
            placeholder={cityOptions.length ? "Select city" : emptyHint}
            disabled={!cityOptions.length}
            withPortal
          />
        </Field>

        <Field label="District" error={getError(errors, "district")}>
          <ReusableSelect
            value={form.district}
            onChange={(value) => updateField("district", value)}
            options={districtOptions}
            placeholder={districtOptions.length ? "Select district" : emptyHint}
            disabled={!districtOptions.length}
            withPortal
          />
        </Field>

        <Field label="State" required error={getError(errors, "state")}>
          <ReusableSelect
            value={form.state}
            onChange={(value) => updateField("state", value)}
            options={stateOptions}
            placeholder={stateOptions.length ? "Select state" : emptyHint}
            disabled={!stateOptions.length}
            withPortal
          />
        </Field>

        <Field label="Country" error={getError(errors, "country")}>
          <ReusableSelect
            value={form.country}
            onChange={(value) => updateField("country", value)}
            options={[{ value: "India", label: "India" }]}
            placeholder="Select country"
            withPortal
          />
        </Field>
      </div>

     <div className="grid grid-cols-2 gap-2">
       <Card className="bg-muted/20">
        <CardContent className="pt-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="size-4" />
            </div>

            <div>
              <h3 className="text-sm font-semibold">Primary Contact Person  (Correspondent)</h3>
              <p className="text-xs text-muted-foreground">
                Person responsible for school communication
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <TextField
              id="reg-contact-name"
              label="Contact Person Name"
              required
              value={form.contact_person_name}
              onChange={(e) =>
                updateField("contact_person_name", e.target.value)
              }
              placeholder="Full name"
              error={getError(errors, "contact_person_name") || undefined}
            />

            <TextField
              id="reg-contact-designation"
              label="Designation"
              value={"Correspondent" || form.contact_person_designation}
              onChange={(e) =>
                updateField("contact_person_designation", e.target.value)
              }
              placeholder="Correspondent"
              error={
                getError(errors, "contact_person_designation") || undefined
              }
              readOnly
            />

            <TextField
              id="reg-contact-phone"
              label="Phone"
              required
              type="tel"
              inputMode="tel"
              maxLength={15}
              value={form.contact_person_phone}
              onChange={(e) =>
                updateField(
                  "contact_person_phone",
                  e.target.value.replace(/[^\d+\s()-]/g, "").slice(0, 15),
                )
              }
              placeholder="+91 XXXXX XXXXX"
              error={getError(errors, "contact_person_phone") || undefined}
            />

            <TextField
              id="reg-contact-email"
              label="Email"
              required
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="school@example.com"
              error={getError(errors, "email") || undefined}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-muted/20">
        <CardContent className="pt-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="size-4" />
            </div>

            <div>
              <h3 className="text-sm font-semibold">Secondary Contact Person  (Principal)</h3>
              <p className="text-xs text-muted-foreground">
                Person responsible for school communication
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <TextField
              id="reg-secondary-contact-name"
              label="Contact Person Name"
              required
              value={form.secondary_contact_person_name}
              onChange={(e) =>
                updateField("secondary_contact_person_name", e.target.value)
              }
              placeholder="Full name"
              error={getError(errors, "secondary_contact_person_name") || undefined}
            />

            <TextField
              id="reg-secondary-contact-designation"
              label="Designation"
              value={"Principal" || form.secondary_contact_person_designation}
              onChange={(e) =>
                updateField("secondary_contact_person_designation", e.target.value)
              }
              placeholder="Principal"
              readOnly
              error={
                getError(errors, "secondary_contact_person_designation") || undefined
              }
            />

            <TextField
              id="reg-secondary-contact-phone"
              label="Phone"
              required
              type="tel"
              inputMode="tel"
              maxLength={15}
              value={form.secondary_contact_person_phone}
              onChange={(e) =>
                updateField(
                  "secondary_contact_person_phone",
                  e.target.value.replace(/[^\d+\s()-]/g, "").slice(0, 15),
                )
              }
              placeholder="+91 XXXXX XXXXX"
              error={getError(errors, "secondary_contact_person_phone") || undefined}
            />

            <TextField
              id="reg-secondary-contact-email"
              label="Email"
              required
              type="email"
              value={form.secondary_contact_person_email}
              onChange={(e) => updateField("secondary_contact_person_email", e.target.value)}
              placeholder="school@example.com"
              error={getError(errors, "secondary_contact_person_email") || undefined}
            />
          </div>
        </CardContent>
      </Card>
     </div>
    </div>
  );
}

/* =========================================================
   STEP 3
========================================================= */

/* One branch's address block.

   A separate component (rather than inline inside the .map) is REQUIRED:
   each branch has its own pincode, and React hooks cannot be called in a
   loop. Rendering one per branch gives each its own usePincodeOptions
   instance, so two branches can hold different pincodes and independent
   option lists. */
function BranchAddressFields({ index, branch, updateBranch, getError }) {
  const { isReady, isBusy, error, options, autofill } =
    usePincodeOptions(branch.pincode);

  /* Same "don't stomp manual edits" rule as the school address. */
  const lastFilledRef = useRef({});

  useEffect(() => {
    if (!isReady || !autofill || error) return;

    Object.entries(autofill).forEach(([field, value]) => {
      const clean = String(value ?? "").trim();
      if (!clean) return;

      const current = String(branch[field] ?? "").trim();
      if (current && current !== lastFilledRef.current[field]) return;
      if (current === clean) return;

      updateBranch(index, field, clean);
      lastFilledRef.current[field] = clean;
    });
    // branch is read for comparison only; including it would re-run this on
    // every keystroke the autofill itself causes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autofill, error, isReady, index, updateBranch]);

  const areaOptions = options.area ?? [];
  const cityOptions = options.city ?? [];
  const stateOptions = options.state ?? [];
  const districtOptions = options.district ?? [];
  const emptyHint = isReady ? "Select" : "Enter a 6-digit pincode first";

  return (
    <>
      <div className="col-span-full -mt-1 text-xs">
        {error ? (
          <p className="text-destructive" role="status" aria-live="polite">
            {error}
          </p>
        ) : isBusy ? (
          <p className="text-muted-foreground" role="status" aria-live="polite">
            Looking up pincode…
          </p>
        ) : null}
      </div>

      <Field label="Area / Taluk" error={getError("area")}>
        <ReusableSelect
          value={branch.area}
          onChange={(value) => updateBranch(index, "area", value)}
          options={areaOptions}
          placeholder={areaOptions.length ? "Select area" : emptyHint}
          disabled={!areaOptions.length}
          withPortal
        />
      </Field>

      <Field label="City" required error={getError("city")}>
        <ReusableSelect
          value={branch.city}
          onChange={(value) => updateBranch(index, "city", value)}
          options={cityOptions}
          placeholder={cityOptions.length ? "Select city" : emptyHint}
          disabled={!cityOptions.length}
          withPortal
        />
      </Field>

      <Field label="District" error={getError("district")}>
        <ReusableSelect
          value={branch.district}
          onChange={(value) => updateBranch(index, "district", value)}
          options={districtOptions}
          placeholder={districtOptions.length ? "Select district" : emptyHint}
          disabled={!districtOptions.length}
          withPortal
        />
      </Field>

      <Field label="State" required error={getError("state")}>
        <ReusableSelect
          value={branch.state}
          onChange={(value) => updateBranch(index, "state", value)}
          options={stateOptions}
          placeholder={stateOptions.length ? "Select state" : emptyHint}
          disabled={!stateOptions.length}
          withPortal
        />
      </Field>

      <Field label="Country" required error={getError("country")}>
        <ReusableSelect
          value={branch.country}
          onChange={(value) => updateBranch(index, "country", value)}
          options={[{ value: "India", label: "India" }]}
          placeholder="Select country"
          withPortal
        />
      </Field>
    </>
  );
}

function Branches({ form, addBranch, updateBranch, removeBranch, errors }) {
  // "Arm to delete" — each card's checkbox reveals its own delete button.
  const [armed, setArmed] = useState({});
  const getBranchError = (index, field) => {
    return errors?.branches?.[index]?.[field]?._errors?.[0] || "";
  };

  const toggleArm = (index) =>
    setArmed((prev) => ({ ...prev, [index]: !prev[index] }));

  // Removes the branch, then re-indexes the armed flags so the correct
  // cards stay armed after a deletion shifts every following index down.
  const handleRemove = (index) => {
    removeBranch(index);
    setArmed((prev) => {
      const next = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (!value) return;
        const i = Number(key);
        if (i === index) return;
        next[i > index ? i - 1 : i] = true;
      });
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-muted/20">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <SectionTitle
            icon={GitBranch}
            title="School Branches"
            description="Add branches associated with this school."
          />

          <Button
            type="button"
            onClick={addBranch}
            className="w-full shrink-0 sm:w-auto"
          >
            <Plus className="size-4" />
            Add Branch
          </Button>
        </CardContent>
      </Card>

      {form.branches.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <GitBranch className="mx-auto size-10 text-muted-foreground" />

            <h3 className="mt-3 text-sm font-semibold">No branches added</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Click &rdquo;Add Branch&rdquo; to add a school branch.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {form.branches.map((branch, index) => (
            <Card key={index}>
              <CardContent className="pt-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Branch {index + 1}</h3>

                    <p className="text-xs text-muted-foreground">
                      Branch information
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={Boolean(armed[index])}
                        onCheckedChange={() => toggleArm(index)}
                        aria-label={`Arm delete Branch ${index + 1}`}
                      />
                      Delete
                    </label>

                    {armed[index] && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemove(index)}
                        aria-label={`Delete Branch ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                  <BranchField
                    label="Branch Name"
                    required
                    value={branch.branch_name}
                    error={getBranchError(index, "branch_name")}
                    onChange={(value) =>
                      updateBranch(index, "branch_name", value)
                    }
                  />

                  <BranchField
                    label="Registration Number"
                    required
                    value={branch.registration_number}
                    error={getBranchError(index, "registration_number")}
                    onChange={(value) =>
                      updateBranch(index, "registration_number", value)
                    }
                  />

                  <BranchField
                    label="Address Line 1"
                    required
                    value={branch.address_line_1}
                    error={getBranchError(index, "address_line_1")}
                    onChange={(value) =>
                      updateBranch(index, "address_line_1", value)
                    }
                  />

                  <BranchField
                    label="Address Line 2"
                    value={branch.address_line_2}
                    error={getBranchError(index, "address_line_2")}
                    onChange={(value) =>
                      updateBranch(index, "address_line_2", value)
                    }
                  />

                  {/* Area / City / District / State / Country are driven by this
                      branch's own pincode, so they live in their own component. */}
                  <BranchAddressFields
                    index={index}
                    branch={branch}
                    updateBranch={updateBranch}
                    getError={(field) => getBranchError(index, field)}
                  />

                  <BranchField
                    label="Pincode"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={branch.pincode}
                    error={getBranchError(index, "pincode")}
                    onChange={(value) =>
                      updateBranch(
                        index,
                        "pincode",
                        value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                  />

                  <BranchField
                    label="Contact Person"
                    required
                    value={branch.contact_person_name}
                    error={getBranchError(index, "contact_person_name")}
                    onChange={(value) =>
                      updateBranch(index, "contact_person_name", value)
                    }
                  />

                  <BranchField
                    label="Designation"
                    value={branch.contact_person_designation}
                    error={getBranchError(index, "contact_person_designation")}
                    onChange={(value) =>
                      updateBranch(index, "contact_person_designation", value)
                    }
                  />

                  <BranchField
                    label="Phone"
                    type="tel"
                    inputMode="tel"
                    maxLength={15}
                    required
                    value={branch.contact_person_phone}
                    error={getBranchError(index, "contact_person_phone")}
                    onChange={(value) =>
                      updateBranch(
                        index,
                        "contact_person_phone",
                        value.replace(/[^\d+\s()-]/g, "").slice(0, 15),
                      )
                    }
                  />

                  <BranchField
                    label="Contact Email"
                    required
                    value={branch.contact_person_email}
                    error={getBranchError(index, "contact_person_email")}
                    onChange={(value) =>
                      updateBranch(index, "contact_person_email", value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STEP 4
========================================================= */

function Review({ form, updateField, errors }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionTitle
        icon={FileText}
        title="Profile & Review"
        description="Complete your school profile and verify the information."
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        <TextField
          id="reg-name-location"
          label="School Name With Location"
          value={form.school_name_with_location}
          onChange={(e) =>
            updateField("school_name_with_location", e.target.value)
          }
          placeholder="Example: ABC School, Chennai"
          error={getError(errors, "school_name_with_location") || undefined}
        />

        <TextField
          id="reg-website"
          label="School Website"
          type="url"
          inputMode="url"
          value={form.school_website_url}
          onChange={(e) => updateField("school_website_url", e.target.value)}
          placeholder="https://example.com"
          error={getError(errors, "school_website_url") || undefined}
        />

        <div className="md:col-span-2">
          <TextareaField
            id="reg-profile"
            label="School Profile"
            required
            value={form.school_profile}
            onChange={(e) => updateField("school_profile", e.target.value)}
            rows={5}
            placeholder="Write a short description about the school..."
            textareaClassName="resize-y bg-background"
          />
          {getError(errors, "school_profile") ? (
            <p className="field-error">{getError(errors, "school_profile")}</p>
          ) : null}
        </div>
      </div>

      {/* Review */}
      <div>
        <h3 className="mb-4 text-base font-semibold">Registration Summary</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryItem label="School Name" value={form.school_name} />

          <SummaryItem label="Ownership" value={form.ownership_type} />

          <SummaryItem label="Board" value={form.board} />

          <SummaryItem
            label="Registration Number"
            value={form.registration_number}
          />

          <SummaryItem label="City" value={form.city} />

          <SummaryItem label="State" value={form.state} />

          <SummaryItem
            label="Contact Person"
            value={form.contact_person_name}
          />

          <SummaryItem label="Contact Email" value={form.email} />

          <SummaryItem
            label="Branches"
            value={`${form.branches.length} Branch${
              form.branches.length !== 1 ? "es" : ""
            }`}
          />

          <SummaryItem
            label="Teaching Staff"
            value={form.total_teaching_staff}
          />
        </div>
      </div>

      {/* Active Status — ui Switch */}
      {/* <Card>
        <CardContent className="flex cursor-pointer items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm font-semibold">School Status</p>

            <p className="text-xs text-muted-foreground">
              Enable the school immediately after registration.
            </p>
          </div>

          <Switch
            checked={form.is_active}
            onCheckedChange={(checked) => updateField("is_active", checked)}
            aria-label="School active status"
          />
        </CardContent>
      </Card> */}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-brand-green/10 text-primary ring-1 ring-inset ring-primary/10">
        <Icon className="size-5" />
      </div>

      <div className="min-w-0">
        <h3 className="text-base font-semibold tracking-tight sm:text-lg">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({ label, required, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="field-label mb-2">
        {label}

        {required && <span className="field-required">*</span>}
      </label>

      {children}

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function BranchField({
  label,
  value,
  onChange,
  error,
  id,
  type,
  inputMode,
  placeholder,
  ...rest
}) {
  return (
    <TextField
      id={id}
      type={type}
      inputMode={inputMode}
      label={label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? `Enter ${String(label ?? "").toLowerCase()}`}
      error={error || undefined}
      {...rest}
    />
  );
}

export { Field as RegisterField };

function SummaryItem({ label, value }) {
  return (
    <Card className="bg-muted/20">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="mt-1 truncate text-sm font-medium">{value || "-"}</p>
      </CardContent>
    </Card>
  );
}
