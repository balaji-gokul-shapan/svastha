import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FramerCard } from "@/util/FramerCard";
import { Ear, EarOff } from "lucide-react";
import React from "react";
function EarResult({ label, status, ear }) {
  const isNormal =
    String(status || "")
      .toLowerCase()
      .includes("normal") ||
    String(status || "")
      .toLowerCase()
      .includes("pass");

  return (
    <div className="rounded-xl border border-border/70 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${
              isNormal
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isNormal ? (
              <Ear className="size-5" />
            ) : (
              <EarOff className="size-5" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">{label}</p>

            <p className="text-[11px] text-muted-foreground">{ear}</p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
            isNormal
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {status || "Not assessed"}
        </span>
      </div>
    </div>
  );
}
const EarHealth = ({form, formErrors, updateField}) => {
  return (
    <FramerCard>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ear Health</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <EarResult
            label="Right Ear"
            status={form.ear_exam_re}
            // status={form.overall_status_re}
            ear="RE"
          />

          <EarResult label="Left Ear" status={form.ear_exam_le} ear="LE" />

          <div className="border-t border-border/70 pt-4">
            <p className="mb-2 text-xs text-muted-foreground">Overall Status</p>

            <Input
              value={form.overall_status}
              onChange={(e) => updateField("overall_status", e.target.value)}
              placeholder="Overall hearing status"
              aria-invalid={Boolean(formErrors?.overall_status)}
              className={
                formErrors?.overall_status
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {formErrors?.overall_status && (
              <p className="mt-1.5 text-xs text-destructive">
                {formErrors.overall_status}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </FramerCard>
  );
};

export default EarHealth;
