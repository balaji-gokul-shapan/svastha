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
  Globe,
  User,
  Phone,
  Mail,
} from "lucide-react";
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const { createLoading } = useAppSelector(
    (state) => state.registerSchool,
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});


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
        : branch
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

    // Clear errors when validation succeeds
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

    if (!result.success) {
      setFormErrors(result.error.format());
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    try {
      await dispatch(createRegisterSchool(result.data)).unwrap();

      toast.success("School registered successfully! You can now sign in.");
      setForm(initialForm);
      setFormErrors({});
      setCurrentStep(1);
      dispatch(resetRegisterSchoolState());

      window.setTimeout(() => {
        router.push("/login");
      }, 600);
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
    <main className="container-page px-4 py-6 md:px-8 lg:px-12">
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

        {/* Form Card */}
        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          {/* Card Header */}
          <div className="border-b px-5 py-5 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Step {currentStep} of {steps.length}
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {steps[currentStep - 1].title}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Content */}
          <div className="p-5 md:p-8 h-[500px] overflow-auto">
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
              <Review form={form} updateField={updateField} />
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 1}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-5 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Continue
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    Register School
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   STEP 1
========================================================= */
const getError = (errors, field) => {
  return errors?.[field]?._errors?.[0] || "";
};
function SchoolDetails({ form, updateField, errors }) {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Building2}
        title="Basic Information"
        description="Enter the basic details of your school."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field
          label="School Name"
          required
          error={getError(errors, "school_name")}
          className="md:col-span-2"
        >
          <Input
            value={form.school_name}
            onChange={(e) => updateField("school_name", e.target.value)}
            placeholder="Enter school name"
          />
        </Field>

        <Field
          label="Ownership Type"
          required
          error={getError(errors, "ownership_type")}
        >
          <Select
            value={form.ownership_type}
            onChange={(value) => updateField("ownership_type", value)}
            options={[
              ["Private", "Private"],
              ["Government", "Government"],
              ["Aided", "Aided"],
              ["Trust", "Trust"],
            ]}
            placeholder="Select ownership"
          />
        </Field>

        <Field
          label="Board"
          required
          error={getError(errors, "board")}
        >
          <Select
            value={form.board}
            onChange={(value) => updateField("board", value)}
            options={[
              ["CBSE", "CBSE"],
              ["ICSE", "ICSE"],
              ["State Board", "State Board"],
              ["IB", "IB"],
              ["Other", "Other"],
            ]}
            placeholder="Select board"
          />
        </Field>

        <Field
          label="Registration Number"
          required
          error={getError(errors, "registration_number")}
        >
          <Input
            value={form.registration_number}
            onChange={(e) =>
              updateField("registration_number", e.target.value)
            }
            placeholder="Enter registration number"
          />
        </Field>

        <Field label="CEEB Code">
          <Input
            value={form.ceeb_code}
            onChange={(e) => updateField("ceeb_code", e.target.value)}
            placeholder="Enter CEEB code"
          />
        </Field>

        <Field label="Teaching Staff">
          <Input
            type="number"
            min="0"
            value={form.total_teaching_staff}
            onChange={(e) =>
              updateField("total_teaching_staff", Number(e.target.value))
            }
          />
        </Field>

        <Field label="Non-Teaching Staff">
          <Input
            type="number"
            min="0"
            value={form.total_non_teaching_staff}
            onChange={(e) =>
              updateField("total_non_teaching_staff", Number(e.target.value))
            }
          />
        </Field>
      </div>
    </div>
  );
}


/* =========================================================
   STEP 2
========================================================= */

function ContactAddress({ form, updateField, errors }) {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={MapPin}
        title="Contact & Address"
        description="Provide school location and primary contact details."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field
          label="Address Line 1"
          required
          error={getError(errors, "address_line_1")}
          className="md:col-span-2"
        >
          <Input
            value={form.address_line_1}
            onChange={(e) => updateField("address_line_1", e.target.value)}
            placeholder="Building / street address"
          />
        </Field>

        <Field
          label="Address Line 2"
          error={getError(errors, "address_line_2")}
        >
          <Input
            value={form.address_line_2}
            onChange={(e) => updateField("address_line_2", e.target.value)}
            placeholder="Apartment, landmark, etc."
          />
        </Field>

        <Field label="Area">
          <Input
            value={form.area}
            onChange={(e) => updateField("area", e.target.value)}
            placeholder="Enter area"
          />
        </Field>

        <Field
          label="City"
          required
          error={getError(errors, "city")}
        >
          <Input
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="Enter city"
          />
        </Field>

        <Field
          label="State"
          required
          error={getError(errors, "state")}
        >
          <Input
            value={form.state}
            onChange={(e) => updateField("state", e.target.value)}
            placeholder="Enter state"
          />
        </Field>

        <Field label="Country">
          <Input
            value={form.country}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="Enter country"
          />
        </Field>

        <Field
          label="Pincode"
          required
          error={getError(errors, "pincode")}
        >
          <Input
            value={form.pincode}
            onChange={(e) => updateField("pincode", e.target.value)}
            placeholder="Enter pincode"
          />
        </Field>
      </div>

      <div className="rounded-xl border bg-muted/20 p-4 md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="size-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              Primary Contact Person
            </h3>

            <p className="text-xs text-muted-foreground">
              Person responsible for school communication
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Contact Person Name"
            required
            error={getError(errors, "contact_person_name")}
          >
            <Input
              value={form.contact_person_name}
              onChange={(e) =>
                updateField("contact_person_name", e.target.value)
              }
              placeholder="Full name"
            />
          </Field>

          <Field label="Designation">
            <Input
              value={form.contact_person_designation}
              onChange={(e) =>
                updateField("contact_person_designation", e.target.value)
              }
              placeholder="Principal / Manager"
            />
          </Field>

          <Field
            label="Phone"
            required
            error={getError(errors, "contact_person_phone")}
          >
            <Input
              value={form.contact_person_phone}
              onChange={(e) =>
                updateField("contact_person_phone", e.target.value)
              }
              placeholder="+91 XXXXX XXXXX"
            />
          </Field>

          <Field
            label="Email"
            required
            error={getError(errors, "email")}
          >
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="school@example.com"
            />
          </Field>
        </div>
      </div>
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
      <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <SectionTitle
          icon={GitBranch}
          title="School Branches"
          description="Add branches associated with this school."
        />

        <button
          type="button"
          onClick={addBranch}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add Branch
        </button>
      </div>

      {form.branches.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <GitBranch className="mx-auto size-10 text-muted-foreground" />

          <h3 className="mt-3 text-sm font-semibold">No branches added</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Click "Add Branch" to add a school branch.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {form.branches.map((branch, index) => (
            <div key={index} className="rounded-xl border p-4 md:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Branch {index + 1}</h3>

                  <p className="text-xs text-muted-foreground">
                    Branch information
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={Boolean(armed[index])}
                      onChange={() => toggleArm(index)}
                      className="size-4 accent-destructive"
                    />
                    Delete
                  </label>

                  {armed[index] && (
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="inline-flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition hover:bg-destructive/20"
                      aria-label={`Delete Branch ${index + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <BranchField
                  label="Branch Name"
                  value={branch.branch_name}
                  error={getBranchError(index, "branch_name")}
                  onChange={(value) =>
                    updateBranch(index, "branch_name", value)
                  }
                />

                <BranchField
                  label="Registration Number"
                  value={branch.registration_number}
                  error={getBranchError(index, "registration_number")}
                  onChange={(value) =>
                    updateBranch(index, "registration_number", value)
                  }
                />

                <BranchField
                  label="Address Line 1"
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

                <BranchField
                  label="Area"
                  value={branch.area}
                  error={getBranchError(index, "area")}
                  onChange={(value) => updateBranch(index, "area", value)}
                />

                <BranchField
                  label="City"
                  value={branch.city}
                  error={getBranchError(index, "city")}
                  onChange={(value) => updateBranch(index, "city", value)}
                />

                <BranchField
                  label="State"
                  value={branch.state}
                  error={getBranchError(index, "state")}
                  onChange={(value) => updateBranch(index, "state", value)}
                />

                <BranchField
                  label="Country"
                  value={branch.country}
                  error={getBranchError(index, "country")}
                  onChange={(value) => updateBranch(index, "country", value)}
                />

                <BranchField
                  label="Pincode"
                  value={branch.pincode}
                  error={getBranchError(index, "pincode")}
                  onChange={(value) => updateBranch(index, "pincode", value)}
                />

                <BranchField
                  label="Contact Person"
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
                  value={branch.contact_person_phone}
                  error={getBranchError(index, "contact_person_phone")}
                  onChange={(value) =>
                    updateBranch(index, "contact_person_phone", value)
                  }
                />

                <BranchField
                  label="Contact Email"
                  value={branch.contact_person_email}
                  error={getBranchError(index, "contact_person_email")}
                  onChange={(value) =>
                    updateBranch(index, "contact_person_email", value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STEP 4
========================================================= */

function Review({ form, updateField }) {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={FileText}
        title="Profile & Review"
        description="Complete your school profile and verify the information."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="School Name With Location">
          <Input
            value={form.school_name_with_location}
            onChange={(e) =>
              updateField("school_name_with_location", e.target.value)
            }
            placeholder="Example: ABC School, Chennai"
          />
        </Field>

        <Field label="School Website">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              className="pl-9"
              value={form.school_website_url}
              onChange={(e) =>
                updateField("school_website_url", e.target.value)
              }
              placeholder="https://example.com"
            />
          </div>
        </Field>

        <Field label="School Profile" className="md:col-span-2">
          <textarea
            value={form.school_profile}
            onChange={(e) => updateField("school_profile", e.target.value)}
            rows={5}
            placeholder="Write a short description about the school..."
            className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
      </div>

      {/* Review */}
      <div>
        <h3 className="mb-4 text-base font-semibold">Registration Summary</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      {/* Active Status */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4">
        <div>
          <p className="text-sm font-semibold">School Status</p>

          <p className="text-xs text-muted-foreground">
            Enable the school immediately after registration.
          </p>
        </div>

        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => updateField("is_active", e.target.checked)}
          className="size-4 accent-primary"
        />
      </label>
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
      <label className="mb-2 block text-sm font-medium">
        {label}

        {required && <span className="ml-1 text-destructive">*</span>}
      </label>

      {children}

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function BranchField({ label, value, onChange, error }) {
  return (
    <Field label={label}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
      />

      {error && (
        <p className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </Field>
  );
}


function Input(props) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 ${props.className || ""}`}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <ShadSelect
      value={value || undefined}
      onValueChange={(selectedValue) => onChange(selectedValue)}
    >
      <SelectTrigger className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(([itemValue, label]) => (
          <SelectItem key={itemValue} value={itemValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadSelect>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 truncate text-sm font-medium">{value || "-"}</p>
    </div>
  );
}
