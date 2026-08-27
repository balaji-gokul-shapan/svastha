import { z } from "zod";

// Validation for the Dental Screening form's key fields.
// Field names correspond to the page's state variables.
export const dentalScreeningSchema = z.object({
  // Clinical notes are required.
  notes: z
    .string()
    .trim()
    .min(1, "Notes are required before saving"),

  // Core oral-health selections must be non-empty.
  oralHygiene: z.string().min(1, "Please select an oral hygiene status"),
  gingivalHealth: z.string().min(1, "Please select a gingival health status"),
  plaque: z.string().min(1, "Please select a plaque level"),
});
