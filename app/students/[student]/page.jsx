"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  GraduationCap,
  ImagePlus,
  X,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { getAllStudent } from "@/lib/features/getAllStudentSlice";
import { updateStudent } from "@/lib/features/updateStudentSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import HealthCheckModal from "@/components/students/health-check-modal";
import { getStudentSlug } from "../student-data";
import { getInitials } from "../students-data-table";

function statusToneClass(status) {
  const s = (status ?? "").toLowerCase();
  if (["active", "approved", "confirmed"].includes(s))
    return "bg-success/15 text-success";
  if (["pending", "in review"].includes(s))
    return "bg-warning/20 text-warning-foreground";
  if (["inactive", "rejected", "suspended"].includes(s))
    return "bg-destructive/15 text-destructive";
  return "bg-muted text-muted-foreground";
}

function calculateAgeFromDob(dobValue) {
  if (!dobValue) {
    return "";
  }

  const dob = new Date(`${dobValue}T00:00:00`);
  if (Number.isNaN(dob.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "";
}

function getProfileImageUrl(student) {
  if (!student || typeof student !== "object") {
    return "";
  }

  const candidates = [
    student.profileImage,
    student.profile_image,
    student.student_image,
    student.image,
    student.photo,
    student.avatar,
  ];

  const imageUrl = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return imageUrl?.trim() ?? "";
}

function getStudentIdentifier(student) {
  if (!student || typeof student !== "object") {
    return "";
  }

  const candidate =
    student.id ??
    student.studentId ??
    student.school_registration_number ??
    student.admission_number;

  return String(candidate ?? "").trim();
}

function Field({ id, label, name, defaultValue, type = "text", disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
      />
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" strokeWidth={2.25} />
        </span>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

export default function StudentDetailPage() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { studentData, loading, error } = useAppSelector(
    (state) => state.getAllStudent,
  );
  const studentSlug = decodeURIComponent(
    pathname.split("/").filter(Boolean).at(-1) ?? "",
  );
  const students = React.useMemo(
    () => (Array.isArray(studentData) ? studentData : []),
    [studentData],
  );

  React.useEffect(() => {
    if (students.length > 0) {
      return;
    }

    dispatch(getAllStudent({ page: 1, limit: 1000 }));
  }, [dispatch, students.length]);

  const student = React.useMemo(
    () => students.find((item) => getStudentSlug(item) === studentSlug) ?? null,
    [students, studentSlug],
  );
  console.log(student,"stud");
  
  const [dobOverride, setDobOverride] = React.useState(null);
  const profileImageUrl = React.useMemo(() => getProfileImageUrl(student), [student]);
  const [erroredImageUrl, setErroredImageUrl] = React.useState("");
  const [uploadedImageFile, setUploadedImageFile] = React.useState(null);
  const [uploadError, setUploadError] = React.useState("");
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const uploadedImagePreviewUrl = React.useMemo(() => {
    if (!uploadedImageFile) {
      return "";
    }

    return URL.createObjectURL(uploadedImageFile);
  }, [uploadedImageFile]);
  const showProfileImage =
    Boolean(uploadedImagePreviewUrl || profileImageUrl) &&
    erroredImageUrl !== (uploadedImagePreviewUrl || profileImageUrl);
  const displayedImageUrl = uploadedImagePreviewUrl || profileImageUrl;

  React.useEffect(() => {
    return () => {
      if (uploadedImagePreviewUrl) {
        URL.revokeObjectURL(uploadedImagePreviewUrl);
      }
    };
  }, [uploadedImagePreviewUrl]);

  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0] ?? null;
    setUploadError("");

    if (!file) {
      setUploadedImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file.");
      setUploadedImageFile(null);
      return;
    }

    const maxFileSizeInBytes = 100 * 1024 * 1024;
    if (file.size > maxFileSizeInBytes) {
      setUploadError("Image size must be 100MB or less.");
      setUploadedImageFile(null);
      return;
    }

    setErroredImageUrl("");
    setUploadedImageFile(file);
  };

  const clearUploadedImage = () => {
    setUploadedImageFile(null);
    setUploadError("");
  };

  const updateStudentMutation = useMutation({
    mutationFn: async ({ studentId, studentData: payload }) =>
      dispatch(
        updateStudent({
          studentId,
          studentData: payload,
        }),
      ).unwrap(),
    onSuccess: () => {
      setIsImageModalOpen(false);
      dispatch(getAllStudent({ page: 1, limit: 1000 }));
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!student) {
      return;
    }

    const studentId = getStudentIdentifier(student);

    if (!studentId) {
      return;
    }

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    // DatePicker is controlled; force latest selected value into payload.
    formData.set("dob", dobValue ?? "");
    formData.set("age", ageValue ?? "");

    if (uploadedImageFile) {
      formData.set("profileImage", uploadedImageFile);
    }

    updateStudentMutation.reset();
    await updateStudentMutation.mutateAsync({
      studentId,
      studentData: formData,
    });
  };
   

  if (loading && !student) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading student details...
      </p>
    );
  }

  if (error && !student) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!student) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Student Not Found
            </h2>
            <p className="text-sm text-muted-foreground">
              No student record matched this URL.
            </p>
          </div>
          <Link href="/students">
            <Button variant="outline">Back to Students</Button>
          </Link>
        </div>
      </section>
    );
  }

  const dobValue = dobOverride ?? student.dob ?? "";
  const ageValue = calculateAgeFromDob(dobValue);

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Student Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Viewing details for {student.name} (
            {student.studentId ?? student.id}).
          </p>
        </div>
        <Link href="/students">
          <Button variant="outline">
            <ArrowLeft className="size-4" />
            Back to Students
          </Button>
        </Link>
      </div>

      {/* Profile header card */}
      <div className="flex flex-col md:flex-row flex-wrap   items-center gap-4 rounded-xl border border-border bg-card p-5">
        <div className="relative size-22 shrink-0">
          <div className="relative size-full overflow-hidden rounded-full border border-border/70 bg-muted">
            {showProfileImage ? (
              <Image
                src={displayedImageUrl}
                alt={`${student.name} profile`}
                fill
                sizes="64px"
                unoptimized
                className="object-cover"
                onError={() => setErroredImageUrl(displayedImageUrl)}
              />
            ) : (
              <span className="flex size-full items-center justify-center bg-primary text-2xl font-semibold text-primary-foreground">
                {getInitials(student.name)}
              </span>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={() => setIsImageModalOpen(true)}
            className="absolute -bottom-1 -right-1 z-20 size-8 rounded-full aspect-square border border-border shadow-sm"
            aria-label="Upload profile image"
          >
            <ImagePlus className="size-3.5" />
          </Button>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-foreground">
            {student.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {(student.class ?? student.Class)
              ? `Class ${student.class ?? student.Class}`
              : "—"}
            {student.sec ? ` · Section ${student.sec}` : ""}
            {student.admission_number
              ? ` · Adm. No. ${student.admission_number}`
              : ""}
          </p>
        </div>

        {student.status && (
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ${statusToneClass(
              student.status,
            )}`}
          >
            {student.status}
          </span>
        )}
        {/* <Button className="inline-flex bg-primary px-4 py-2 rounded-full">
          <p className="text-sm font-medium text-primary-foreground">
            View Health Card
          </p>
        </Button> */}
        <HealthCheckModal student={student} />
      </div>

      {isImageModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-9/10 md:max-w-1/3 lg:max-w-1/4 rounded-xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Upload Profile Image
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsImageModalOpen(false)}
                aria-label="Close upload popup"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <Input
                id="profile-image-upload"
                name="profileImage"
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
              />

              <p className="text-xs text-muted-foreground">
                Upload JPG, PNG, or WEBP up to 100MB.
              </p>

              {uploadError ? (
                <p className="text-xs text-destructive">{uploadError}</p>
              ) : null}

              {uploadedImageFile ? (
                <p className="text-xs text-muted-foreground">
                  Selected: {uploadedImageFile.name}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              {uploadedImageFile ? (
                <Button type="button" variant="outline" onClick={clearUploadedImage}>
                  Remove Image
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImageModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Form */}
      <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
        <SectionCard icon={User} title="Student Information">
          <Field
            id="student-name"
            label="Student Name"
            name="studentName"
            defaultValue={student.student_name ?? student.name}
            disabled
          />
          <Field
            id="student-id"
            label="Student ID"
            name="studentId"
            defaultValue={student.studentId}
            disabled
          />
          <Field
            id="registration-number"
            label="School Registration Number"
            name="schoolRegistrationNumber"
            defaultValue={student.school_registration_number}
            disabled
          />
          <Field
            id="admission-number"
            label="Admission Number"
            name="admissionNumber"
            defaultValue={student.admission_number}
            disabled
          />
          <Field
            id="class"
            label="Class"
            name="class"
            defaultValue={student.class ?? student.Class}
            disabled
          />
          <Field
            id="section"
            label="Section"
            name="section"
            defaultValue={student.sec}
            disabled
          />
          
          <div className="space-y-1.5">
            <label htmlFor="dob" className="text-sm font-medium text-foreground">
              Date of Birth
            </label>
            <DatePicker
              id="dob"
              name="dob"
              value={dobValue}
              onValueChange={setDobOverride}
              maxDate={new Date()}
              className="w-full justify-start py-5!"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="age" className="text-sm font-medium text-foreground">
              Age
            </label>
            <Input id="age" name="age" value={ageValue} readOnly />
          </div>
          <Field
            id="status"
            label="Status"
            name="status"
            defaultValue={student.status}
          />
          <Field
            id="student-aadhaar"
            label="Student Aadhaar Number"
            name="studentAadhaarNumber"
            defaultValue={student.student_aadhaar_number}
            disabled
          />
        </SectionCard>

        <SectionCard icon={Users} title="Father Information">
          <Field
            id="father-name"
            label="Father Name"
            name="fatherName"
            defaultValue={student.father_name ?? student.fatherName}
            disabled
          />
          <Field
            id="father-contact"
            label="Father Contact Number"
            name="fatherContactNumber"
            defaultValue={student.father_contact_number}
            disabled
          />
          <Field
            id="father-aadhaar"
            label="Father Aadhaar Number"
            name="fatherAadhaarNumber"
            defaultValue={student.father_aadhaar_number}
            disabled
          />
        </SectionCard>

        <SectionCard icon={Users} title="Mother Information">
          <Field
            id="mother-name"
            label="Mother Name"
            name="motherName"
            defaultValue={student.mother_name ?? student.motherName}
            disabled
          />
          <Field
            id="mother-contact"
            label="Mother Contact Number"
            name="motherContactNumber"
            defaultValue={student.mother_contact_number}
            disabled
          />
          <Field
            id="mother-aadhaar"
            label="Mother Aadhaar Number"
            name="motherAadhaarNumber"
            defaultValue={student.mother_aadhaar_number}
            disabled
          />
        </SectionCard>

        {/* <SectionCard icon={ShieldCheck} title="Guardian Information">
          <Field
            id="guardian-phone"
            label="Guardian Phone"
            name="guardianPhone"
            defaultValue={student.guardianPhone}
          />
        </SectionCard> */}

        {/* Sticky update bar — stays pinned to the bottom of the viewport while the form scrolls */}
        <div className="sticky bottom-2 z-10 flex items-center justify-end gap-2 rounded-lg border border-border bg-background/95 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4">
          {updateStudentMutation.error ? (
            <p className="mr-auto text-xs text-destructive">
              {String(updateStudentMutation.error?.message || "Unable to update student")}
            </p>
          ) : null}
          {updateStudentMutation.isSuccess ? (
            <p className="mr-auto text-xs text-success">Student updated successfully.</p>
          ) : null}
          <Link href="/students">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={updateStudentMutation.isPending}>
            <GraduationCap className="size-4" />
            {updateStudentMutation.isPending ? "Updating..." : "Update Student"}
          </Button>
        </div>
      </form>
    </section>
  );
}
