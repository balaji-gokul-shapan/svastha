import { z } from "zod";

// Reusable validators
const phoneRegex = /^[+]?[\d\s()-]{7,15}$/;

export const subAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),

  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .regex(phoneRegex, "Please enter a valid phone number"),

  userName: z.string().trim().min(1, "Username is required."),

  // Create-mode: password is required (>= 6 chars).
  password: z.string().superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password is required." });
    } else if (value.length < 6) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Use at least 6 characters." });
    }
  }),

  user_type_id: z
    .union([z.string(), z.number()])
    .refine((value) => value !== "" && value != null, "User type is required."),

  branchId: z
    .union([z.string(), z.number()])
    .refine((value) => value !== "" && value != null, "Branch is required."),

  previleges: z
    .union([z.string(), z.number(), z.array(z.unknown())])
    .optional(),
});


export const buildSubAccountSchema = ({
  isEditing = false,
  accounts = [],
  editingAccountId = null,
} = {}) =>
  z.object({
    name: subAccountSchema.shape.name,
    phoneNumber: subAccountSchema.shape.phoneNumber,

    userName: z
      .string()
      .trim()
      .min(1, "Username is required.")
      .refine(
        (value) =>
          !accounts.some(
            (account) =>
              account.id !== editingAccountId &&
              (account.userName || account.username || "").toLowerCase() ===
                value.toLowerCase()
          ),
        "This username is already taken."
      ),

    password: z.string().superRefine((value, ctx) => {
      if (isEditing && !value) return; // blank is allowed while editing
      if (!value) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password is required." });
      } else if (value.length < 6) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Use at least 6 characters." });
      }
    }),

    user_type_id: subAccountSchema.shape.user_type_id,
    branchId: subAccountSchema.shape.branchId,
    // Privileges are optional — never blocks saving. The payload only
    // includes `privileges` when the user actually picked one.
    previleges: subAccountSchema.shape.previleges,
  });
