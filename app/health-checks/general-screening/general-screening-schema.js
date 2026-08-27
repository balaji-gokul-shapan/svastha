import { z } from "zod";

// Validation for the General Screening form fields.
// Field names match the component's state (height, weight, bloodGroup,
// allergy, chronicDisease, immunization, notes).
export const generalScreeningSchema = z.object({
  // Physical measurements must be positive numbers.
  height: z
    .string()
    .refine((v) => Number(v) > 0, "Height must be greater than 0 cm"),

  weight: z
    .string()
    .refine((v) => Number(v) > 0, "Weight must be greater than 0 kg"),

  // Blood group is chosen via the toggle; must be non-empty.
  bloodGroup: z.string().min(1, "Please select a blood group"),

  // Health history.
  allergy: z.string().min(1, "Please select an allergy"),

  chronicDisease: z.string().min(1, "Please select a chronic disease"),

  immunization: z.string().min(1, "Please select an immunization status"),

  // Notes are optional.
  notes: z.string().optional(),
});