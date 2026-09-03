import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReusableSelect from "@/components/ui/reusable-select";
import { FramerCard } from "@/util/FramerCard";
import { Stethoscope } from "lucide-react";
import React from "react";

const EarExaminationCard = ({ form, updateField, formErrors, examinationOptions }) => {
  return (
    <FramerCard>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope className="size-4" />
            </div>

            <CardTitle className="text-sm">Ear Examination</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ReusableSelect
            label="Left Ear"
            value={form.ear_exam_le}
            onChange={(value) => updateField("ear_exam_le", value)}
            options={examinationOptions}
            error={formErrors?.ear_exam_le}
          />

          <ReusableSelect
            label="Right Ear"
            value={form.ear_exam_re}
            onChange={(value) => updateField("ear_exam_re", value)}
            options={examinationOptions}
            error={formErrors?.ear_exam_re}
          />
        </CardContent>
      </Card>
    </FramerCard>
  );
};

export default EarExaminationCard;
