import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReusableSelect from "@/components/ui/reusable-select";
import { TextareaField, TextField } from "@/components/ui/text-field";
import { FramerCard } from "@/util/FramerCard";
import { Radio, ShieldAlert } from "lucide-react";
import React from "react";
function RiskField({ label, value, onChange }) {
  return (
    <div className="rounded-xl border border-border/70 p-3">
      <p className="mb-2 text-xs font-medium">{label}</p>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Select</option>

        <option value="No">No</option>

        <option value="Yes">Yes</option>

        <option value="Unknown">Unknown</option>
      </select>
    </div>
  );
}
const RiskFactors = ({form, formErrors, referralReasonOptions, updateField}) => {
  return (
    <FramerCard>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* =====================================================
          RISK FACTORS
      ===================================================== */}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <ShieldAlert className="size-4" />
              </div>

              <div>
                <CardTitle className="text-base">
                  Hearing Risk Factors
                </CardTitle>

                <p className="text-xs text-muted-foreground">
                  Relevant history and risk indicators
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <RiskField
                label="Frequent Ear Infections"
                value={form.risk_frequent_ear_infections}
                onChange={(value) =>
                  updateField("risk_frequent_ear_infections", value)
                }
              />

              <RiskField
                label="Speech Delay"
                value={form.risk_speech_delay}
                onChange={(value) => updateField("risk_speech_delay", value)}
              />

              <RiskField
                label="Learning Difficulty"
                value={form.risk_learning_difficulty}
                onChange={(value) =>
                  updateField("risk_learning_difficulty", value)
                }
              />

              <RiskField
                label="Family History"
                value={form.risk_family_history_hearing_loss}
                onChange={(value) =>
                  updateField("risk_family_history_hearing_loss", value)
                }
              />

              <RiskField
                label="Noise Exposure"
                value={form.risk_noise_exposure}
                onChange={(value) => updateField("risk_noise_exposure", value)}
              />

              <RiskField
                label="Other Risks"
                value={form.risk_others}
                onChange={(value) => updateField("risk_others", value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* =====================================================
          REFERRAL
      ===================================================== */}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Radio className="size-4" />
              </div>

              <div>
                <CardTitle className="text-base">
                  Referral & Follow-up
                </CardTitle>

                <p className="text-xs text-muted-foreground">
                  Recommended action based on screening
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TextField
              label="Referral Grade"
              value={form.referral_grade}
              onChange={(e) => updateField("referral_grade", e.target.value)}
            />

            <TextField
              label="Recommendation Type"
              value={form.recommendation_type}
              onChange={(e) =>
                updateField("recommendation_type", e.target.value)
              }
            />

            <TextField
              label="Recommended To"
              value={form.recommended_to}
              onChange={(e) => updateField("recommended_to", e.target.value)}
            />

            <TextField
              label="Referral Priority"
              value={form.referral_priority}
              onChange={(e) => updateField("referral_priority", e.target.value)}
            />

            <div className="md:col-span-2">
              {/* <Textarea
                          value={form.referral_reason}
                          onChange={(e) =>
                            updateField("referral_reason", e.target.value)
                          }
                          placeholder="Referral reason..."
                          rows={3}
                          className={formErrors?.referral_reason ? "border-destructive focus-visible:ring-destructive" : ""}
                        /> */}
              <ReusableSelect
                label="Referral Reason"
                value={form.referral_reason}
                onChange={(value) => updateField("referral_reason", value)}
                options={referralReasonOptions}
                error={formErrors?.referral_reason}
              />
              {formErrors?.referral_reason && (
                <p className="mt-1.5 text-xs text-destructive">
                  {formErrors.referral_reason}
                </p>
              )}
            </div>

            <div className="lg:col-span-3">
              <TextareaField
                value={form.follow_up}
                onChange={(e) => updateField("follow_up", e.target.value)}
                placeholder="Follow-up instructions..."
                rows={3}
                className={
                  formErrors?.follow_up
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {formErrors?.follow_up && (
                <p className="mt-1.5 text-xs text-destructive">
                  {formErrors.follow_up}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FramerCard>
  );
};

export default RiskFactors;
