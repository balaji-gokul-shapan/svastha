import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReusableSelect from "@/components/ui/reusable-select";
import { FramerCard } from "@/util/FramerCard";
import React from "react";

const Tympanomentry = ({form, updateField,}) => {
  return (
    <FramerCard>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tympanometry</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-3">
          <ReusableSelect
            label="Right Ear"
            value={form.tympanometry_re}
            onChange={(value) => updateField("tympanometry_re", value)}
            options={["Normal", "Abnormal", "Type A", "Type B", "Type C"]}
          />

          <ReusableSelect
            label="Left Ear"
            value={form.tympanometry_le}
            onChange={(value) => updateField("tympanometry_le", value)}
            options={["Normal", "Abnormal", "Type A", "Type B", "Type C"]}
          />
        </CardContent>
      </Card>
    </FramerCard>
  );
};

export default Tympanomentry;
