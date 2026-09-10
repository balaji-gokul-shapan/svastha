import { z } from "zod";

// Reusable validators
const phoneRegex = /^[+]?[\d\s()-]{7,15}$/;

// Step 1 — Branch Details
export const branchStepOneSchema = z.object({
  branch_name: z.string().trim().min(1, "Branch name is required"),
  registration_number: z.string().trim().min(1, "Registration number is required"),
  ceeb_code: z.string().trim().optional(),
  year_of_establishment: z
    .string()
    .trim()
    .min(1, "Year of establishment is optional")
    .optional(),
});

// Step 2 — Academic
export const branchStepTwoSchema = z.object({
  class: z.string().trim().optional(),
  section: z.string().trim().optional(),
});

// Step 3 — Statistics
export const branchStepThreeSchema = z.object({
  total_teaching_staff: z.coerce.number().min(0, "Cannot be negative"),
  total_non_teaching_staff: z.coerce.number().min(0, "Cannot be negative"),
  total_students: z.coerce.number().min(0, "Cannot be negative"),
});

// Step 4 — Facilities
export const branchStepFourSchema = z.object({
  female_staff_washrooms: z.coerce.number().min(0, "Cannot be negative"),
  male_staff_washrooms: z.coerce.number().min(0, "Cannot be negative"),
  differently_abled_washrooms: z.coerce.number().min(0, "Cannot be negative"),
  boys_toilets: z.coerce.number().min(0, "Cannot be negative"),
  girls_toilets: z.coerce.number().min(0, "Cannot be negative"),
  boys_toilets_with_washroom: z.coerce.number().min(0, "Cannot be negative"),
  girls_toilets_with_washroom: z.coerce.number().min(0, "Cannot be negative"),
  total_land_area_sqft: z.coerce.number().min(0, "Cannot be negative"),
  total_building_area_sqft: z.coerce.number().min(0, "Cannot be negative"),
});

// Step 5 — Address & Contact
export const branchStepFiveSchema = z.object({
  address_line_1: z.string().trim().min(1, "Address line 1 is required"),
  address_line_2: z.string().trim().optional(),
  area: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  country: z.string().trim().min(1, "Country is required"),
  pincode: z.string().trim().min(1, "Pincode is required"),
  contact_person_name: z.string().trim().min(1, "Contact person name is required"),
  contact_person_designation: z.string().trim().optional(),
  contact_person_phone: z
    .string()
    .trim()
    .min(1, "Contact phone is required")
    .regex(phoneRegex, "Please enter a valid phone number"),
  contact_person_email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

// Complete schema (all steps merged)
export const schoolBranchSchema = branchStepOneSchema
  .merge(branchStepTwoSchema)
  .merge(branchStepThreeSchema)
  .merge(branchStepFourSchema)
  .merge(branchStepFiveSchema);

// Step validator map — used by validateStep(step)
export const branchStepSchemas = {
  1: branchStepOneSchema,
  2: branchStepTwoSchema,
  3: branchStepThreeSchema,
  4: branchStepFourSchema,
  5: branchStepFiveSchema,
};
