import { z } from "zod";

export const accountSchema = z.object({
  name: z.coerce
    .number()
    .int("School ID must be a valid number")
    .positive("Please select a school"),

  branch_id: z.coerce
    .number()
    .int("Branch ID must be a valid number")
    .positive("Please select a branch"),

  total_classes: z.coerce
    .number()
    .int("Total classes must be a whole number")
    .min(1, "Please enter at least 1 class"),

  total_sections: z.coerce
    .number()
    .int("Total sections must be a whole number")
    .min(1, "Please enter at least 1 section"),

  screening_type_ids: z
    .array(
      z.coerce
        .number()
        .int("Invalid screening type")
        .positive("Invalid screening type")
    )
    .min(1, "Please select at least one screening type"),
});
