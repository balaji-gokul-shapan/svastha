"use client";

import React, { useRef, useState } from "react";
import {
  Building2,
  GraduationCap,
  Users,
  Ruler,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AnimatedModal from "@/components/ui/AnimatedModal";
import { EmptyState } from "@/components/ui/empty-state";
import { YearPicker } from "@/components/ui/year-picker";
import { FieldLabel } from "@/components/ui/screening-fields";
import ReusableMultiSelect from "@/components/ui/ReusableMultiSelect";
import { SECTION_OPTIONS } from "@/app/settings/datas/settingsData";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { createSchoolBranches } from "@/lib/features/registerSchoolBranchSlice";
import { branchStepSchemas } from "../validation/branch-validation-schema";
import { NumberStepperField } from "@/components/ui/numberStepperField";

const steps = [
  {
    id: 1,
    title: "Branch Details",
    description: "Basic branch information",
    icon: Building2,
  },
  {
    id: 2,
    title: "Academic",
    description: "Classes and sections",
    icon: GraduationCap,
  },
  {
    id: 3,
    title: "Statistics",
    description: "Staff and students",
    icon: Users,
  },
  {
    id: 4,
    title: "Facilities",
    description: "Facilities and property",
    icon: Ruler,
  },
  {
    id: 5,
    title: "Address & Contact",
    description: "Location and contact",
    icon: MapPin,
  },
];

const EMPTY_FORM = {
  branch_name: "",
  class: "",
  section: "",
  registration_number: "",
  ceeb_code: "",
  total_teaching_staff: 0,
  total_non_teaching_staff: 0,
  total_students: 0,
  year_of_establishment: "",
  female_staff_washrooms: 0,
  male_staff_washrooms: 0,
  differently_abled_washrooms: 0,
  boys_toilets: 0,
  girls_toilets: 0,
  boys_toilets_with_washroom: 0,
  girls_toilets_with_washroom: 0,
  total_land_area_sqft: 0,
  total_building_area_sqft: 0,
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

const SchoolDetails = ({ getAllSchoolBranch }) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});

  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Academic class/section options (multi-select)
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

  const syncClassToForm = (ids) => {
    setSelectedClassIds(ids);
    setFormData((prev) => ({ ...prev, class: ids.join(", ") }));
  };

  const syncSectionToForm = (ids) => {
    setSelectedSectionIds(ids);
    setFormData((prev) => ({ ...prev, section: ids.join(", ") }));
  };

  // Shared field builders — all steps use the `TextField` UI component so
  // every input shares one label / input / error language from globals.css.
  // `required` renders the global `.field-required` asterisk; `error`
  // paints the destructive ring + `.field-error` message.
  const parseLabel = (label) => {
    const required = label.trim().endsWith("*");
    return {
      text: required ? label.replace(/\s*\*\s*$/, "") : label,
      required,
    };
  };

  const textField = (label, name, placeholder = "", extra = {}) => {
    const { text, required } = parseLabel(label);
    return (
      <TextField
        label={text}
        required={required}
        id={name}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        placeholder={placeholder}
        error={errors[name] || ""}
        {...extra}
      />
    );
  };

  const numField = (label, name, min = 0) => {
    const { text, required } = parseLabel(label);
    return (
      <NumberStepperField
        label={text}
        required={required}
        id={name}
        name={name}
        type="number"
        min={min}
        value={formData[name]}
        onChange={handleChange}
        error={errors[name] || ""}
      />
    );
  };

  const sectionTitle = (title, hint) => (
    <div className="sd-section-accent space-y-1 my-4">
      <p className="form-section-title !mb-0">{title}</p>
      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );

  const validateStep = (step) => {
    const schema = branchStepSchemas[step];
    const result = schema.safeParse(formData);

    if (!result.success) {
      const errors = Object.fromEntries(
        Object.entries(result.error.flatten().fieldErrors)
          .map(([field, messages]) => [field, messages?.[0]])
          .filter(([, message]) => Boolean(message)),
      );
      setErrors(errors);
      toast.error(Object.values(errors)[0] || "Please fix the errors.");
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((s) => Math.min(s + 1, steps.length));
  };

  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

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
    if (!payload || typeof payload !== "object")
      return "Something went wrong. Please try again.";
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
    if (isSavingRef.current) return;
    if (!validateStep(currentStep)) return;

    const payload = {
      branch_name: formData.branch_name,
      class: formData.class,
      section: formData.section,
      registration_number: formData.registration_number,
      ceeb_code: formData.ceeb_code,
      total_teaching_staff: Number(formData.total_teaching_staff) || 0,
      total_non_teaching_staff: Number(formData.total_non_teaching_staff) || 0,
      total_students: Number(formData.total_students) || 0,
      year_of_establishment: Number(formData.year_of_establishment) || 0,
      female_staff_washrooms: Number(formData.female_staff_washrooms) || 0,
      male_staff_washrooms: Number(formData.male_staff_washrooms) || 0,
      differently_abled_washrooms:
        Number(formData.differently_abled_washrooms) || 0,
      boys_toilets: Number(formData.boys_toilets) || 0,
      girls_toilets: Number(formData.girls_toilets) || 0,
      boys_toilets_with_washroom:
        Number(formData.boys_toilets_with_washroom) || 0,
      girls_toilets_with_washroom:
        Number(formData.girls_toilets_with_washroom) || 0,
      total_land_area_sqft: Number(formData.total_land_area_sqft) || 0,
      total_building_area_sqft: Number(formData.total_building_area_sqft) || 0,
      address_line_1: formData.address_line_1,
      address_line_2: formData.address_line_2,
      area: formData.area,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode,
      contact_person_name: formData.contact_person_name,
      contact_person_designation: formData.contact_person_designation,
      contact_person_phone: formData.contact_person_phone,
      contact_person_email: formData.contact_person_email,
    };

    setIsSaving(true);
    isSavingRef.current = true;

    dispatch(createSchoolBranches(payload))
      .unwrap()
      .then(() => {
        setIsSaving(false);
        isSavingRef.current = false;
        toast.success("School Branch saved successfully", {
          description: formData.branch_name
            ? `Record saved for ${formData.branch_name}`
            : undefined,
        });
        setOpen(false);
        setCurrentStep(1);
        setFormData({ ...EMPTY_FORM });
        setSelectedClassIds([]);
        setSelectedSectionIds([]);
        setErrors({});
      })
      .catch((error) => {
        setIsSaving(false);
        isSavingRef.current = false;
        toast.error("Failed to create Branch", {
          description: getBackendErrorMessage(error),
        });
      });
  };

  /* ============================================================
     STEP PROGRESS BAR + STEP PILLS
     ============================================================ */
  const progressPercent =
    ((currentStep - 1) / Math.max(steps.length - 1, 1)) * 100;

  const renderStepPills = () => {
    const nums = steps.map((_, i) => i + 1);

    return (
      <ol className="flex items-start gap-0">
        {nums.map((n, idx) => {
          const isDone = n < currentStep;
          const isActive = n === currentStep;

          return (
            <li key={n} className="flex flex-1 items-start">
              {/* Step */}
              <div className="flex flex-col items-center">
                <span
                  className={`sd-step-pill ${
                    isDone
                      ? "sd-step-pill--done"
                      : isActive
                        ? "sd-step-pill--active"
                        : "sd-step-pill--idle"
                  }`}
                >
                  {isDone ? (
                    <Check className="size-4" />
                  ) : (
                    <span className="tabular-nums">{n}</span>
                  )}
                </span>

                {/* Active step progress meter */}
                {isActive && (
                  <div className="sd-active-step-meter mt-2">
                    <div
                      className="sd-active-step-meter__fill"
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Connector */}
              {idx < steps.length - 1 && (
                <div
                  className={`sd-step-connector mt-4 flex-1 ${
                    n < currentStep
                      ? "sd-step-connector--done"
                      : "sd-step-connector--idle"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    );
  };

  const isLastStep = currentStep === steps.length;

  const getAllBranch = getAllSchoolBranch?.data?.length ?? 0;
  const branches = Array.isArray(getAllSchoolBranch?.data)
    ? getAllSchoolBranch.data
    : [];

  console.log(getAllSchoolBranch, "getAllBranch");

  const activeStep = steps[currentStep - 1];
  const ActiveIcon = activeStep.icon;

  const openModal = () => {
    setCurrentStep(1);
    setErrors({});
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      {/* <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">School Branches</h2>
          <p className="text-sm text-muted-foreground">
            {getAllBranch > 0
              ? `${getAllBranch} branch${getAllBranch > 1 ? "es" : ""} registered`
              : "No branches yet — add your first branch"}
          </p>
        </div>
        <Button onClick={openModal}>
          <Building2 className="mr-2 size-4" /> Add Branch
        </Button>
      </div> */}
      {/* <div className="flex items-start justify-between gap-4 p-5 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Campus Details
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your school profile and assigned health camps.
          </p>
        </div>
      </div> */}
      <div className="flex items-start justify-between gap-4 p-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="sd-icon-badge size-10">
            <Building2 className="size-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                School Details
              </h2>
              <Badge variant={branches.length > 0 ? "success" : "secondary"}>
                {getAllBranch > 0
                  ? `${getAllBranch} branch${getAllBranch > 1 ? "es" : ""}`
                  : "No branches"}
              </Badge>
            </div>

            <p className="field-hint mt-1 max-w-full !text-sm !leading-6">
              Create and manage your school branches, update branch information,
              and keep all school details organized in one place.
            </p>
          </div>
        </div>
        <Button type="button" onClick={openModal}>
          <Building2 className="mr-2 size-4" /> Add Branch
        </Button>
      </div>
      <Separator />

      {branches.length === 0 ? (
        // <EmptyState
        //   title="No school branches"
        //   description="Click Add Branch to register your first school branch."
        //   icon={Building2}
        //   action={<Button onClick={openModal}>Add Branch</Button>}
        // />
        <div className="sd-branch-empty">
          <EmptyState
            title="No Student Data"
            icon={Building2}
            description="Select a camp and student to view and edit general screening details."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => openModal(true)}
              >
                <Building2 className="size-4" />
                Select Student
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 p-4">
          {branches.map((b, i) => (
            <Card key={b.id ?? b.branch_name ?? i} className="p-4">
              <div className="flex items-center gap-2">
                <span className="sd-icon-badge size-9">
                  <Building2 className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {b.branch_name ?? "Unnamed branch"}
                  </p>
                  <p className="field-hint">
                    {[b.city, b.state].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
              </div>
              <dl className="sd-branch-meta">
                {b.registration_number ? (
                  <div className="sd-branch-meta__row">
                    <dt>Reg. No</dt>
                    <dd className="sd-branch-meta__value">
                      {b.registration_number}
                    </dd>
                  </div>
                ) : null}
                {b.total_students != null ? (
                  <div className="sd-branch-meta__row">
                    <dt>Students</dt>
                    <dd className="sd-branch-meta__value">
                      {b.total_students}
                    </dd>
                  </div>
                ) : null}
                {b.contact_person_name ? (
                  <div className="sd-branch-meta__row">
                    <dt>Contact</dt>
                    <dd className="sd-branch-meta__value">
                      {b.contact_person_name}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </Card>
          ))}
        </div>
      )}

      <AnimatedModal
        open={open}
        onClose={closeModal}
        maxWidth="max-w-4xl"
        showCloseButton={false}
        ariaLabel="Add school branch"
        closeOnOverlayClick={false}
      >
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ActiveIcon className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold">Add School Branch</h3>
              <p className="text-xs text-muted-foreground">
                Step {currentStep} of {steps.length} — {activeStep.title}:{" "}
                {activeStep.description}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closeModal}
            aria-label="Close"
            className="sd-icon-btn"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-3 px-6 pt-5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {renderStepPills()}
        </div>

        <form onSubmit={handleSave}>
          <div className="sd-form-scroll space-y-5 px-6 py-4">
            {currentStep === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {textField("Branch Name *", "branch_name", "e.g. Main Campus")}
                {textField(
                  "Registration Number *",
                  "registration_number",
                  "e.g. REG-2024-001",
                )}
                {textField("CEEB Code", "ceeb_code", "e.g. 123456")}
                <div>
                  <YearPicker
                    id="year_of_establishment"
                    name="year_of_establishment"
                    label="Year of Establishment"
                    labelClassName="field-label"
                    placeholder="Select year"
                    minYear={1800}
                    // withPortal
                    value={formData.year_of_establishment || ""}
                    onValueChange={(v) => {
                      setFormData((prev) => ({
                        ...prev,
                        year_of_establishment: v,
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        year_of_establishment: "",
                      }));
                    }}
                  />
                  {errors.year_of_establishment ? (
                    <p className="field-error">
                      {errors.year_of_establishment}
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="sd-classes">Classes</FieldLabel>
                    <ReusableMultiSelect
                      withPortal
                      label=""
                      value={selectedClassIds}
                      onChange={syncClassToForm}
                      options={classOptions}
                      placeholder="Select classes"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="sd-sections">Sections</FieldLabel>
                    <ReusableMultiSelect
                      withPortal
                      label=""
                      value={selectedSectionIds}
                      onChange={syncSectionToForm}
                      options={sectionOptions}
                      placeholder="Select sections"
                    />
                  </div>
                </div>
                <p className="field-hint">
                  Selected classes and sections are stored as comma-separated
                  values.
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="sd-stat-grid grid gap-4 sm:grid-cols-3">
                {numField("Teaching Staff", "total_teaching_staff")}
                {numField("Non-Teaching Staff", "total_non_teaching_staff")}
                {numField("Total Students", "total_students")}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5">
                <section>
                  {sectionTitle("Staff Washrooms")}
                  <div className="grid gap-4 sm:grid-cols-3">
                    {numField(
                      "Female Staff Washrooms",
                      "female_staff_washrooms",
                    )}
                    {numField("Male Staff Washrooms", "male_staff_washrooms")}
                    {numField(
                      "Differently-Abled Washrooms",
                      "differently_abled_washrooms",
                    )}
                  </div>
                </section>
                <section>
                  {sectionTitle("Student Toilets")}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {numField("Boys Toilets", "boys_toilets")}
                    {numField("Girls Toilets", "girls_toilets")}
                    {numField(
                      "Boys Toilets + Washroom",
                      "boys_toilets_with_washroom",
                    )}
                    {numField(
                      "Girls Toilets + Washroom",
                      "girls_toilets_with_washroom",
                    )}
                  </div>
                </section>
                <section>
                  {sectionTitle("Property (sq.ft)")}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {numField("Total Land Area", "total_land_area_sqft")}
                    {numField(
                      "Total Building Area",
                      "total_building_area_sqft",
                    )}
                  </div>
                </section>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-5">
                <Card className="p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm">Address</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 p-0 sm:grid-cols-2">
                    {textField(
                      "Address Line 1 *",
                      "address_line_1",
                      "Street address",
                    )}
                    {textField(
                      "Address Line 2",
                      "address_line_2",
                      "Suite, etc.",
                    )}
                    {textField("Area", "area", "Locality / area")}
                    {textField("City *", "city", "City")}
                    {textField("State *", "state", "State")}
                    {textField("Country *", "country", "Country")}
                    {textField("Pincode *", "pincode", "Postal code")}
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm">Contact Person</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 p-0 sm:grid-cols-2">
                    {textField("Name *", "contact_person_name", "Full name")}
                    {textField(
                      "Designation",
                      "contact_person_designation",
                      "e.g. Principal",
                    )}
                    {textField(
                      "Phone *",
                      "contact_person_phone",
                      "Phone number",
                    )}
                    {textField(
                      "Email",
                      "contact_person_email",
                      "email@example.com",
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="mr-1 size-4" /> Back
              </Button>
              {isLastStep ? (
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    "Save Branch"
                  )}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext}>
                  Next <ChevronRight className="ml-1 size-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </AnimatedModal>
    </section>
  );
};

export default SchoolDetails;
