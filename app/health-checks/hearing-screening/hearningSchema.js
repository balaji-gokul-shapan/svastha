import { z } from "zod";

const PTA_MIN_DB = 0;
const PTA_MAX_DB = 120;

const ptaThreshold = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (value === undefined || String(value).trim() === "") return true;
      const parsed = Number(value);
      return (
        Number.isFinite(parsed) && parsed >= PTA_MIN_DB && parsed <= PTA_MAX_DB
      );
    },
    { message: `Must be a number between ${PTA_MIN_DB} and ${PTA_MAX_DB} dB` },
  );

export const hearingScreeningSchema = z.object({
  // PTA
  pta_250hz_re: ptaThreshold,
  pta_250hz_le: ptaThreshold,

  pta_500hz_re: ptaThreshold,
  pta_500hz_le: ptaThreshold,

  pta_1000hz_re: ptaThreshold,
  pta_1000hz_le: ptaThreshold,

  pta_2000hz_re: ptaThreshold,
  pta_2000hz_le: ptaThreshold,

  pta_4000hz_re: ptaThreshold,
  pta_4000hz_le: ptaThreshold,

  pta_8000hz_re: ptaThreshold,
  pta_8000hz_le: ptaThreshold,

  // Whisper
  whisper_test_re: z.string().optional(),
  whisper_test_le: z.string().optional(),
  whisper_test_distance: z.string().optional(),
  whisper_test_remarks: z.string().optional(),

  // Tympanometry
  tympanometry_re: z.string().optional(),
  tympanometry_le: z.string().optional(),

  // Ear examination
  ear_exam_re: z.string().optional(),
  ear_exam_le: z.string().optional(),

  // Speech
  speech_recognition_re: z.string().optional(),
  speech_recognition_le: z.string().optional(),

  srt_re: z.string().optional(),
  srt_le: z.string().optional(),

  // Risk
  risk_frequent_ear_infections: z.string().optional(),
  risk_speech_delay: z.string().optional(),
  risk_learning_difficulty: z.string().optional(),
  risk_family_history_hearing_loss: z.string().optional(),
  risk_noise_exposure: z.string().optional(),
  risk_others: z.string().optional(),

  // Status
  // overall_status_re:  z.string().min(1, "Overall status is required"),

  // overall_status_le:  z.string().min(1, "Overall status is required"),

  overall_status: z.string().min(1, "Overall status is required"),

  // Referral
  referral_grade: z.string().optional(),
  recommendation_type: z.string().optional(),
  recommended_to: z.string().optional(),
  referral_priority: z.string().optional(),
 referral_reason: z
  .string()
  .min(1, "Referral reason is required"),

follow_up: z
  .string()
  .min(1, "Follow-up instructions are required"),
});