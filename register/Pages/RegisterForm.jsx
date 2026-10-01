"use client";

import React, { useState } from "react";
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
import { TextareaField, TextField } from "@/components/ui/text-field";
import { RegistrationSuccess } from "@/components/register/registration-success-dialog";

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
  country: "India",
  pincode: "",

  branches: [],

  school_name_with_location: "",
  school_profile: "",
  school_website_url: "",
  is_active: true,
};

export default function SchoolRegistrationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { createLoading } = useAppSelector((state) => state.registerSchool);

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});
  // Holds what the success dialog needs to describe what was just created.
  // Null means the dialog is closed.
  const [registeredSchool, setRegisteredSchool] = useState(null);


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

    setFormErrors({});

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Final gate — validate the COMPLETE form, not just step 4.
    const result = schoolRegistrationSchema.safeParse(form);
      console.log(result,"result");
      
    if (!result.success) {
      setFormErrors(result.error.format());
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    try {
      await dispatch(createRegisterSchool(result.data)).unwrap();

      toast.success("School registered successfully! You can now sign in.");

      // Capture what was created BEFORE the form is reset below - after
      // `setForm(initialForm)` these values are gone.
      const createdName =
        result.data?.school_name ||
        result.data?.school_name_with_location ||
        "";
      const createdBranchCount = Array.isArray(result.data?.branches)
        ? result.data.branches.length
        : 0;

      setForm(initialForm);
      setFormErrors({});
      setCurrentStep(1);
      dispatch(resetRegisterSchoolState());

      // Show the confirmation instead of silently bouncing to /login.
      setRegisteredSchool({
        schoolName: createdName,
        branchCount: createdBranchCount,
      });
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

  return (
    <main className="container-page px-4 py-6 md:px-8 lg:px-12 h-full overflow-auto no-scrollbar">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                School Registration
              </h1>

              <p className="text-sm text-muted-foreground">
                Register your school and branch information
              </p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8 rounded-2xl border bg-background p-4 shadow-sm md:p-6">
          <div className="flex items-start justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;

              const completed = currentStep > step.id;
              const active = currentStep === step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex min-w-0 flex-1 flex-col items-center">
                    <div
                      className={`
                        flex size-10 items-center justify-center rounded-full
                        border-2 transition-all
                        ${
                          completed
                            ? "border-primary bg-primary text-primary-foreground"
                            : active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-muted-foreground/30 bg-background text-muted-foreground"
                        }
                      `}
                    >
                      {completed ? (
                        <Check className="size-5" />
                      ) : (
                        <Icon className="size-5" />
                      )}
                    </div>

                    <div className="mt-2 hidden text-center sm:block">
                      <p
                        className={`text-sm font-semibold ${
                          active || completed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>

                    <p className="mt-2 text-xs font-medium sm:hidden">
                      {step.id}/{steps.length}
                    </p>
                  </div>

                  {index !== steps.length - 1 && (
                    <div className="mt-5 h-0.5 flex-1 bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: currentStep > step.id ? "100%" : "0%",
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Card — ui Card */}
        <Card className="overflow-hidden rounded-xl shadow-sm sm:rounded-2xl">
          {/* Card Header */}
          <div className="border-b px-4 py-4 sm:px-6 sm:py-5 md:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary sm:text-xs">
              Step {currentStep} of {steps.length}
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-tight text-balance sm:text-xl md:text-2xl">
              {steps[currentStep - 1].title}
            </h2>

            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
              {steps[currentStep - 1].description}
            </p>
          </div>

          <CardContent className="p-4 sm:p-6 md:p-8 min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] md:max-h-[calc(100dvh-340px)] md:overflow-y-auto md:overscroll-contain">
            {currentStep === 1 && (
              <SchoolDetails
                form={form}
                updateField={updateField}
                errors={formErrors}
              />
            )}

            {currentStep === 2 && (
              <ContactAddress
                form={form}
                updateField={updateField}
                errors={formErrors}
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
              <Review form={form} updateField={updateField} errors={formErrors} />
            )}
          </CardContent>

          {/* Footer - stacks full-width on mobile, inline on sm+ */}
          <CardContent className="flex flex-col-reverse gap-2.5 border-t bg-muted/20 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4 md:px-8">
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

            {currentStep < steps.length ? (
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

      <RegistrationSuccess
        open={Boolean(registeredSchool)}
        onOpenChange={(next) => {
          if (!next) setRegisteredSchool(null);
        }}
        schoolName={registeredSchool?.schoolName}
        branchCount={registeredSchool?.branchCount}
        onGoToLogin={() => {
          setRegisteredSchool(null);
          router.push("/login");
        }}
      />
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
function SchoolDetails({ form, updateField, errors }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionTitle
        icon={Building2}
        title="Basic Information"
        description="Enter the basic details of your school."
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        <TextField
          id="reg-school-name"
          label="School Name"
          required
          value={form.school_name}
          onChange={(e) => updateField("school_name", e.target.value)}
          placeholder="Enter school name"
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
            placeholder="Select ownership"
          />
        </UiSelectField>

        <UiSelectField
          label="Board"
          required
          error={getError(errors, "board")}
        >
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
            placeholder="Select board"
          />
        </UiSelectField>

        <TextField
          id="reg-number"
          label="Registration Number"
          required
          value={form.registration_number}
          onChange={(e) => updateField("registration_number", e.target.value)}
          placeholder="Enter registration number"
          error={getError(errors, "registration_number") || undefined}
        />

        <TextField
          id="reg-ceeb"
          label="CEEB Code"
          value={form.ceeb_code}
          onChange={(e) => updateField("ceeb_code", e.target.value)}
          placeholder="Enter CEEB code"
          error={getError(errors, "ceeb_code") || undefined}
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
  );
}

/* =========================================================
   STEP 2
========================================================= */

function ContactAddress({ form, updateField, errors }) {
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
          id="reg-area"
          label="Area"
          value={form.area}
          onChange={(e) => updateField("area", e.target.value)}
          placeholder="Enter area"
          error={getError(errors, "area") || undefined}
        />

        <TextField
          id="reg-city"
          label="City"
          required
          value={form.city}
          onChange={(e) => updateField("city", e.target.value)}
          placeholder="Enter city"
          error={getError(errors, "city") || undefined}
        />

        <TextField
          id="reg-state"
          label="State"
          required
          value={form.state}
          onChange={(e) => updateField("state", e.target.value)}
          placeholder="Enter state"
          error={getError(errors, "state") || undefined}
        />

        <TextField
          id="reg-country"
          label="Country"
          value={form.country}
          onChange={(e) => updateField("country", e.target.value)}
          placeholder="Enter country"
          error={getError(errors, "country") || undefined}
        />

        <TextField
          id="reg-pincode"
          label="Pincode"
          required
          inputMode="numeric"
          maxLength={6}
          value={form.pincode}
          onChange={(e) =>
            updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="e.g. 600001"
          error={getError(errors, "pincode") || undefined}
        />
      </div>

      <Card className="bg-muted/20">
        <CardContent className="pt-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="size-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold">Primary Contact Person</h3>

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
            onChange={(e) => updateField("contact_person_name", e.target.value)}
            placeholder="Full name"
            error={getError(errors, "contact_person_name") || undefined}
          />

          <TextField
            id="reg-contact-designation"
            label="Designation"
            value={form.contact_person_designation}
            onChange={(e) => updateField("contact_person_designation", e.target.value)}
            placeholder="Principal / Manager"
            error={getError(errors, "contact_person_designation") || undefined}
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
    </div>
  );
}

/* =========================================================
   STEP 3
========================================================= */

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

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextField
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

                <TextField
                  label="Registration Number"
                  required
                  value={branch.registration_number}
                  error={getBranchError(index, "registration_number")}
                  onChange={(value) =>
                    updateBranch(index, "registration_number", value)
                  }
                />

                <TextField
                  label="Address Line 1"
                  required
                  value={branch.address_line_1}
                  error={getBranchError(index, "address_line_1")}
                  onChange={(value) =>
                    updateBranch(index, "address_line_1", value)
                  }
                />

                <TextField
                  label="Address Line 2"
                  value={branch.address_line_2}
                  error={getBranchError(index, "address_line_2")}
                  onChange={(value) =>
                    updateBranch(index, "address_line_2", value)
                  }
                />

                <TextField
                  label="Area"
                  value={branch.area}
                  error={getBranchError(index, "area")}
                  onChange={(value) => updateBranch(index, "area", value)}
                />

                <TextField
                  label="City"
                  required
                  value={branch.city}
                  error={getBranchError(index, "city")}
                  onChange={(value) => updateBranch(index, "city", value)}
                />

                <TextField
                  label="State"
                  required
                  value={branch.state}
                  error={getBranchError(index, "state")}
                  onChange={(value) => updateBranch(index, "state", value)}
                />

                <TextField
                  label="Country"
                  required
                  value={branch.country}
                  error={getBranchError(index, "country")}
                  onChange={(value) => updateBranch(index, "country", value)}
                />

                <TextField
                  label="Pincode"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={branch.pincode}
                  error={getBranchError(index, "pincode")}
                  onChange={(value) =>
                    updateBranch(index, "pincode", value.replace(/\D/g, "").slice(0, 6))
                  }
                />

                <TextField
                  label="Contact Person"
                  required
                  value={branch.contact_person_name}
                  error={getBranchError(index, "contact_person_name")}
                  onChange={(value) =>
                    updateBranch(index, "contact_person_name", value)
                  }
                />

                <TextField
                  label="Designation"
                  value={branch.contact_person_designation}
                  error={getBranchError(index, "contact_person_designation")}
                  onChange={(value) =>
                    updateBranch(index, "contact_person_designation", value)
                  }
                />

                <TextField
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

                <TextField
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
          onChange={(e) =>
            updateField("school_website_url", e.target.value)
          }
          placeholder="https://example.com"
          error={getError(errors, "school_website_url") || undefined}
        />

        <Field label="School Profile" className="md:col-span-2">
          <TextareaField
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
      <Card>
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
      </Card>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>

      <div>
        <h3 className="text-base font-semibold">{title}</h3>

        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
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

function BranchField({ label, value, onChange, error, id, type, inputMode, placeholder, ...rest }) {
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
