"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, UserRound, X } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  registerStudent,
  resetRegisterStudentState,
} from "@/lib/features/registerStudentSlice";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const INITIAL_FORM_VALUES = {
  student_name: "",
  gender: "",
  dob: "",
  academic_year: "",
  class: "",
  sec: "",
  school_registration_number: "",
  admission_number: "",
  student_aadhaar_number: "",
  father_name: "",
  father_contact_number: "",
  father_aadhaar_number: "",
  mother_name: "",
  mother_contact_number: "",
  mother_aadhaar_number: "",
  school_id: "",
};

function Field({ id, label, required = false, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

export default function AddStudentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profileInputRef = useRef(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const { loading, success, error } = useAppSelector(
    (state) => state.registerStudent,
  );

  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);

  const clearProfileImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setProfileImageFile(null);
    setImagePreviewUrl("");
    if (profileInputRef.current) {
      profileInputRef.current.value = "";
    }
  };

  // Optional — the student can be registered without a photo.
  const openProfilePicker = () => {
    profileInputRef.current?.click();
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    setImageError("");

    if (!file) {
      clearProfileImage();
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Profile image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setProfileImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (event) => {
    setFormValues((prev) => ({ ...prev, gender: event.target.value }));
  };

  const validate = () => {
    if (!formValues.student_name.trim()) return "Student name is required.";
    if (!formValues.gender) return "Please select a gender.";
    if (!formValues.dob) return "Date of birth is required.";
    if (!formValues.academic_year.trim())
      return "Academic year is required (e.g. 2026-2027).";
    if (!formValues.class.trim()) return "Class is required.";
    if (!formValues.sec.trim()) return "Section is required.";
    if (!formValues.school_registration_number.trim())
      return "School registration number is required.";

    const schoolId = Number(formValues.school_id);
    if (!Number.isInteger(schoolId) || schoolId < 1)
      return "A valid numeric School ID is required.";

    for (const aadhaarField of [
      "student_aadhaar_number",
      "father_aadhaar_number",
      "mother_aadhaar_number",
    ]) {
      const value = formValues[aadhaarField].trim();
      if (value && !/^\d{12}$/.test(value)) {
        return "Aadhaar numbers must be exactly 12 digits.";
      }
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await dispatch(
        registerStudent({
          student: formValues,
          profileImage: profileImageFile, // optional — may be null
        }),
      ).unwrap();

      toast.success("Student registered successfully.");
      setFormValues(INITIAL_FORM_VALUES);
      clearProfileImage();
      dispatch(resetRegisterStudentState());

      window.setTimeout(() => {
        router.push("/students");
      }, 600);
    } catch (submitError) {
      toast.error(
        typeof submitError === "string"
          ? submitError
          : submitError?.message || "Unable to register the student.",
      );
    }
  };
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-sf text-2xl font-bold text-foreground">
          Add Student
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter student details below to create a new record.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6"
      >
        <Accordion defaultValue={["personal", "academic"]} multiple className="space-y-3">
          <AccordionItem value="personal">
            <AccordionTrigger className="bg-muted">Personal Information</AccordionTrigger>
            <AccordionContent>
              <div className="">
                 <div className="flex flex-col items-center gap-3 p-5">
                   <p className="text-sm font-medium text-foreground">
                     {profileImageFile
                       ? "Profile photo selected"
                       : "Profile Photo (optional)"}
                   </p>
                 <button
                   type="button"
                   onClick={openProfilePicker}
                   aria-label="Upload profile image"
                   className="group relative size-24 rounded-full border border-dashed border-foreground/25 bg-background transition-colors hover:border-primary/50"
                 >
                   {imagePreviewUrl ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img
                       src={imagePreviewUrl}
                       alt="Profile preview"
                       className="size-full rounded-full object-cover"text-xs text-muted-foreground
                     />
                   ) : (
                     <span className="flex size-full items-center justify-center text-muted-foreground">
                       <UserRound className="size-10" />
                     </span>
                   )}

                   <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 text-background opacity-0 transition-opacity group-hover:opacity-100">
                     <Camera className="size-6" />
                   </span>

                   {profileImageFile ? (
                     <span
                       role="button"
                       tabIndex={0}
                       onClick={(event) => {
                         event.stopPropagation();
                         clearProfileImage();
                       }}
                       onKeyDown={(event) => {
                         if (event.key === "Enter" || event.key === " ") {
                           event.stopPropagation();
                           clearProfileImage();
                         }
                       }}
                       aria-label="Remove selected profile image"
                       className="absolute right-0 top-0 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
                     >
                       <X className="size-3" />
                     </span>
                   ) : null}
                 </button>

                 {/* Hidden file input — opened via the avatar click */}
                 <Input
                   ref={profileInputRef}
                   id="profile-image-upload"
                   name="profileImage"
                   type="file"
                   accept="image/*"
                   onChange={handleProfileImageUpload}
                   className="hidden"
                 />

                 <div className="space-y-1 text-center">
                  
                   <p className="text-xs text-muted-foreground">
                     {profileImageFile
                       ? ``
                       : "Click the avatar to upload · JPG, PNG, or WEBP up to 5 MB"}
                   </p>
                 </div>

                 {imageError ? (
                   <p className="text-xs text-destructive">{imageError}</p>
                 ) : null}
               </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                
                <Field id="student-name" label="Student Name" required>
                  <Input
                    id="student-name"
                    name="student_name"
                    type="text"
                    placeholder="Enter full name"
                    value={formValues.student_name}
                    onChange={handleChange}
                  />
                </Field>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground">
                    Gender<span className="text-destructive"> *</span>
                  </p>
                  <RadioGroup className="grid grid-cols-3 gap-2" aria-label="Gender">
                    {GENDER_OPTIONS.map((option) => (
                      <RadioGroupItem
                        key={option}
                        id={`gender-${option.toLowerCase()}`}
                        name="gender"
                        value={option}
                        checked={formValues.gender === option}
                        onChange={handleGenderChange}
                      >
                        {option}
                      </RadioGroupItem>
                    ))}
                  </RadioGroup>
                </div>

                <Field id="dob" label="Date of Birth" required>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formValues.dob}
                    onChange={handleChange}
                  />
                </Field>

                <Field id="student-aadhaar" label="Student Aadhaar Number">
                  <Input
                    id="student-aadhaar"
                    name="student_aadhaar_number"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                    value={formValues.student_aadhaar_number}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="academic">
            <AccordionTrigger className="bg-muted">Academic Details</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="academic-year" label="Academic Year" required>
                  <Input
                    id="academic-year"
                    name="academic_year"
                    type="text"
                    placeholder="2026-2027"
                    value={formValues.academic_year}
                    onChange={handleChange}
                  />
                </Field>

                <Field id="class" label="Class" required>
                  <Input
                    id="class"
                    name="class"
                    type="text"
                    placeholder="e.g. V"
                    value={formValues.class}
                    onChange={handleChange}
                  />
                </Field>

                <Field id="sec" label="Section" required>
                  <Input
                    id="sec"
                    name="sec"
                    type="text"
                    placeholder="e.g. A"
                    value={formValues.sec}
                    onChange={handleChange}
                  />
                </Field>

                <Field
                  id="school-registration-number"
                  label="School Registration Number"
                  required
                >
                  <Input
                    id="school-registration-number"
                    name="school_registration_number"
                    type="text"
                    placeholder="SCH-0000"
                    value={formValues.school_registration_number}
                    onChange={handleChange}
                  />
                </Field>

                <Field id="admission-number" label="Admission Number">
                  <Input
                    id="admission-number"
                    name="admission_number"
                    type="text"
                    placeholder="ADM-0000"
                    value={formValues.admission_number}
                    onChange={handleChange}
                  />
                </Field>

                <Field id="school-id" label="School ID" required>
                  <Input
                    id="school-id"
                    name="school_id"
                    type="number"
                    min={1}
                    placeholder="e.g. 1"
                    value={formValues.school_id}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="guardian">
            <AccordionTrigger className="bg-muted">Parent / Guardian Details</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="father-name" label="Father Name">
                  <Input
                    id="father-name"
                    name="father_name"
                    type="text"
                    placeholder="Father's full name"
                    value={formValues.father_name}
                    onChange={handleChange}
                  />
                </Field>

                <Field id="father-contact" label="Father Contact Number">
                  <Input
                    id="father-contact"
                    name="father_contact_number"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formValues.father_contact_number}
                    onChange={handleChange}
                  />
                </Field>

                <Field id="father-aadhaar" label="Father Aadhaar Number">
                  <Input
                    id="father-aadhaar"
                    name="father_aadhaar_number"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                    value={formValues.father_aadhaar_number}
                    onChange={handleChange}
                  />
                </Field>

                <Field id="mother-name" label="Mother Name">
                  <Input
                    id="mother-name"
                    name="mother_name"
                    type="text"
                    placeholder="Mother's full name"
                    value={formValues.mother_name}
                    onChange={handleChange}
                  />
                </Field>

                <Field id="mother-contact" label="Mother Contact Number">
                  <Input
                    id="mother-contact"
                    name="mother_contact_number"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formValues.mother_contact_number}
                    onChange={handleChange}
                  />
                </Field>

                <Field id="mother-aadhaar" label="Mother Aadhaar Number">
                  <Input
                    id="mother-aadhaar"
                    name="mother_aadhaar_number"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                    value={formValues.mother_aadhaar_number}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Link href="/students">
            <Button variant="outline" size="default" type="button" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button variant="default" size="default" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : success ? (
              "Saved!"
            ) : (
              "Save Student"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
﻿// placeholder
