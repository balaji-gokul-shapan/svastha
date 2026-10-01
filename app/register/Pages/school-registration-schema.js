import { z } from "zod";

/* =========================================================
   STEP 1
========================================================= */

export const schoolStepOneSchema = z.object({
  school_name: z.string().trim().min(1, "School name is required"),

  ownership_type: z.string().min(1, "Please select ownership type"),

  board: z.string().min(1, "Please select a board"),

  registration_number: z
    .string()
    .trim()
    .min(1, "Registration number is required"),

  total_students: z
    .union([z.string(), z.number()])
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .refine(
      (value) => String(value).trim() !== "",
      "Total number of students is required",
    )
    .refine(
      (value) => /^\d+$/.test(String(value).trim()),
      "Total number of students must contain only digits",
    )
    .transform((value) => Number(String(value).trim()))
    .refine(
      (value) => Number.isInteger(value),
      "Total number of students must be a whole number",
    )
    .refine(
      (value) => value >= 0,
      "Total number of students cannot be negative",
    ),

  // year_of_establishment: z
  //   .union([z.string(), z.number()])
  //   .transform((value) => (typeof value === "string" ? value.trim() : value))
  //   .refine(
  //     (value) => String(value).trim() !== "",
  //     "Year of establishment is required",
  //   )
  //   .refine(
  //     (value) => /^\d+$/.test(String(value).trim()),
  //     "Year of establishment must contain only digits",
  //   )
  //   .transform((value) => Number(String(value).trim()))
  //   .refine(
  //     (value) => Number.isInteger(value),
  //     "Year of establishment must be a whole number",
  //   )
  //   .refine(
  //     (value) => value >= 1800,
  //     "Year of establishment cannot be before 1800",
  //   )
  //   .refine(
  //     (value) => value <= new Date().getFullYear(),
  //     "Year of establishment cannot be in the future",
  //   ),

  ceeb_code: z.string().trim().optional(),

  total_teaching_staff: z.number().min(1, "Teaching staff cannot be negative"),

  total_non_teaching_staff: z
    .number()
    .min(1, "Non-teaching staff cannot be negative"),
});

/* =========================================================
   STEP 2
========================================================= */

export const schoolStepTwoSchema = z.object({
  address_line_1: z.string().trim().min(1, "Address is required"),

  address_line_2: z.string().trim().optional(),

  area: z.string().trim().optional(),

  district: z.string().trim().optional(),

  city: z.string().trim().min(1, "City is required"),

  state: z.string().trim().min(1, "State is required"),

  country: z.string().trim().min(1, "Country is required"),

  pincode: z
    .string()
    .trim()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),

  principal_name: z.string().trim().min(1, "Principal name is required"),

  principal_designation: z.string().trim().optional(),

  principal_phone: z
    .string()
    .trim()
    .min(1, "Principal phone is required")
    .regex(/^[+]?[\d\s()-]{7,15}$/, "Enter a valid phone number"),

  // email: z
  //   .string()
  //   .trim()
  //   .min(1, "Email is required")
  //   .email("Please enter a valid email address"),
  correspondent_name: z
    .string()
    .trim()
    .min(1, "Correspondent name is required"),

  correspondent_designation: z.string().trim().optional(),

  correspondent_phone: z
    .string()
    .trim()
    .min(1, "Correspondent phone is required")
    .regex(/^[+]?[\d\s()-]{7,15}$/, "Enter a valid phone number"),

  correspondent_email: z
    .string()
    .trim()
    .min(1, "Correspondent email is required")
    .email("Please enter a valid email address"),
  principal_email: z
    .string()
    .trim()
    .min(1, "Principal email is required")
    .email("Please enter a valid email address"),
});

/* =========================================================
   STEP 3
========================================================= */

const branchSchema = z.object({
  branch_name: z.string().trim().min(1, "Branch name is required"),

  registration_number: z
    .string()
    .trim()
    .min(1, "Branch registration number is required"),

  address_line_1: z.string().trim().min(1, "Branch address is required"),

  address_line_2: z.string().trim().optional(),

  area: z.string().trim().optional(),

  district: z.string().trim().optional(),

  city: z.string().trim().min(1, "Branch city is required"),

  state: z.string().trim().min(1, "Branch state is required"),

  country: z.string().trim().min(1, "Branch country is required"),

  pincode: z
    .string()
    .trim()
    .min(1, "Branch pincode is required")
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),

  contact_person_name: z
    .string()
    .trim()
    .min(1, "Branch contact person is required"),

  contact_person_designation: z.string().trim().optional(),

  contact_person_phone: z
    .string()
    .trim()
    .min(1, "Branch phone is required")
    .regex(/^[+]?[\d\s()-]{7,15}$/, "Enter a valid phone number"),

  contact_person_email: z
    .string()
    .trim()
    .min(1, "Branch email is required")
    .email("Please enter a valid branch email"),
});

export const schoolStepThreeSchema = z.object({
  branches: z.array(branchSchema),
});

/* =========================================================
   STEP 4
========================================================= */

export const schoolStepFourSchema = z.object({
  school_name_with_location: z
    .string()
    .trim()
    .min(1, "School name with location is required"),

  school_profile: z.string().trim().min(1, "School profile is required"),

  school_website_url: z
    .string()
    .trim()
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal("")),

  is_active: z.boolean(),
});

/* =========================================================
   COMPLETE FORM
========================================================= */

export const schoolRegistrationSchema = schoolStepOneSchema
  .merge(schoolStepTwoSchema)
  .merge(schoolStepThreeSchema)
  .merge(schoolStepFourSchema);
