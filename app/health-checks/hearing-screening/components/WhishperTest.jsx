import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReusableSelect from "@/components/ui/reusable-select";
import { TextField } from "@/components/ui/text-field";
import { FramerCard } from "@/util/FramerCard";
import { Mic, Volume2 } from "lucide-react";
import React from "react";
function NumberField({ label, value, onChange, unit, error }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <div className="relative">
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`pr-12 ${error ? "border-destructive focus-visible:ring-destructive !text-sm" : ""}`}
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {unit}
        </span>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
const WhishperTest = ({form, updateField}) => {
  return (
    <FramerCard>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 ">
        {/* Whisper Test */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-info/10 text-info">
                <Volume2 className="size-4" />
              </div>

              <div>
                <CardTitle className="text-sm">Whisper Test</CardTitle>

                <p className="text-xs text-muted-foreground">
                  Basic speech perception screening
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReusableSelect
                label="Right Ear"
                value={form.whisper_test_re}
                onChange={(value) => updateField("whisper_test_re", value)}
                options={["Pass", "Fail", "Not Tested"]}
              />

              <ReusableSelect
                label="Left Ear"
                value={form.whisper_test_le}
                onChange={(value) => updateField("whisper_test_le", value)}
                options={["Pass", "Fail", "Not Tested"]}
              />

              <TextField
                label="Test Distance"
                value={form.whisper_test_distance}
                onChange={(e) =>
                  updateField("whisper_test_distance", e.target.value)
                }
                placeholder="e.g. 2 feet"
              />

              <TextField
                label="Remarks"
                value={form.whisper_test_remarks}
                onChange={(e) =>
                  updateField("whisper_test_remarks", e.target.value)
                }
                placeholder="Enter remarks"
              />
            </div>
          </CardContent>
        </Card>

        {/* Speech */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <Mic className="size-4" />
              </div>

              <CardTitle className="text-sm">Speech Assessment</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Speech Recognition - Right"
                value={form.speech_recognition_re}
                onChange={(value) =>
                  updateField("speech_recognition_re", value)
                }
                unit="%"
              />

              <NumberField
                label="Speech Recognition - Left"
                value={form.speech_recognition_le}
                onChange={(value) =>
                  updateField("speech_recognition_le", value)
                }
                unit="%"
              />

              <NumberField
                label="SRT - Right Ear"
                value={form.srt_re}
                onChange={(value) => updateField("srt_re", value)}
                unit="dB"
              />

              <NumberField
                label="SRT - Left Ear"
                value={form.srt_le}
                onChange={(value) => updateField("srt_le", value)}
                unit="dB"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </FramerCard>
  );
};

export default WhishperTest;
