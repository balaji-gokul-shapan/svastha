import { z } from "zod";

// Validation for the Vision Screening form's key fields.
// Field names correspond to the page's state variables.
export const visionScreeningSchema = z.object({
  // Follow-up is required.
  followUp: z
    .string()
    .min(1, "Please select a follow-up option"),

  referral: z.string().optional(),
  referralReason: z.string().optional(),

  // Acuity/remarks fields are required for the three eye groups.
  od_distance_without: z.string().min(1, "Right eye (distance) required"),
  od_near_without: z.string().min(1, "Right eye (near) required"),
  os_distance_without: z.string().min(1, "Left eye (distance) required"),
  os_near_without: z.string().min(1, "Left eye (near) required"),
  ou_distance_without: z.string().min(1, "Both eyes (distance) required"),
  ou_near_without: z.string().min(1, "Both eyes (near) required"),
}).superRefine((data, ctx) => {
  // A referred student must have a referral reason selected.
  if (data.referral === "yes" && !String(data.referralReason ?? "").trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["referralReason"],
      message: "Referral reason is required when referring to a specialist",
    });
  }
});
