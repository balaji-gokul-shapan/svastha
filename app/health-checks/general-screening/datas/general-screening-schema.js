import { z } from "zod";

// Validation for the General Screening form fields.
// Keep this aligned with the values actually sent to the API, otherwise
// the client can pass local checks while the backend rejects the payload.
export const generalScreeningSchema = z.object({
  // Physical measurements must be positive numbers.
  height: z
    .string()
    .refine((v) => Number(v) > 0, "Height must be greater than 0 cm"),

  weight: z
    .string()
    .refine((v) => Number(v) > 0, "Weight must be greater than 0 kg"),

  bloodGroup: z.string().min(1, "Please select a blood group"),
  allergy: z.string().min(1, "Please select an allergy"),
  chronicDisease: z.string().min(1, "Please select a chronic disease"),
  immunization: z.string().min(1, "Please select an immunization status"),

  // skin: z.string().min(1, "Please select a skin assessment"),
  // regular_medication: z.string().min(1, "Please enter the regular medication"),
  // current_complaints: z.string().min(1, "Please enter current complaints"),
  // general_appearance: z.string().min(1, "Please select a general appearance"),
  // posture_spine: z.string().min(1, "Please select a posture / spine assessment"),
  // nutritional_status: z.string().min(1, "Please select a nutritional status"),
  // consciousness: z.string().min(1, "Please select a consciousness status"),
  // cvs: z.string().min(1, "Please enter CVS findings"),
  // rs: z.string().min(1, "Please enter RS findings"),
  // abdomen: z.string().min(1, "Please enter abdomen findings"),
  // neurology: z.string().min(1, "Please enter neurology findings"),
  // referral: z.string().min(1, "Please enter a referral note"),

  notes: z.string().optional(),
});