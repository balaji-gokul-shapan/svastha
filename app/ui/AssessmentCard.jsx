import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from 'lucide-react';

// Memoized so the (potentially large) student options list is only re-rendered
// when the options or the selected value actually change — not on every
// keystroke in the screening form.
const StudentSelectField = React.memo(function StudentSelectField({
  options,
  value,
  onChange,
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select student" />
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => (
          <SelectItem key={item.value} value={String(item.value)}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

const AssessmentCard = ({
  form,
  onChange: handleChange,
  onSave,
  onCancel,
  data,
  studentOptions = [],
  studentValue = "",
  onStudentChange,
  isScreeningLoading = false,
  isScreeningError = false,
  isScreening = false,
}) => {
  const [assessmentDate, setAssessmentDate] = React.useState("2026-08-17");

  const studentName =
    studentOptions.find((item) => String(item.value) === String(studentValue))?.label ??
    data?.name ??
    data?.student_name ??
    data?.studentName ??
    data?.student ??
    "Student not selected";

  const calculatedBmi = React.useMemo(() => {
    const heightCm = Number(form?.height);
    const weightKg = Number(form?.weight);

    if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg) || heightCm <= 0 || weightKg <= 0) {
      return "--";
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Number.isFinite(bmi) ? bmi.toFixed(1) : "--";
  }, [form?.height, form?.weight]);

  const enteredBmi = String(form?.bmi ?? "").trim();
  const computedBmi = String(calculatedBmi ?? "").trim();
  const bmiDisplayValue =
    computedBmi && computedBmi !== "--"
      ? computedBmi
      : enteredBmi || "--";
  

  return (
    <div className="grid gap-4 grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={18} className="text-primary" />Assessment Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Assessment Date</label>
              <DatePicker
                name="assessmentDate"
                value={assessmentDate}
                onValueChange={setAssessmentDate}
                placeholder="Select assessment date"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Student</label>
              <StudentSelectField
                options={studentOptions}
                value={studentValue}
                onChange={onStudentChange}
              />
              {/* {!studentValue ? (
                <p className="text-[11px] text-muted-foreground">{studentName}</p>
              ) : null} */}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Location</label>
              <Input defaultValue="Sunshine Public School" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Examiner</label>
              <Input defaultValue="Dr. Priya Sharma" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Assistant</label>
              <Input defaultValue="Riya Nair" />
            </div>
          </CardContent>
        </Card>


        {isScreening && (
          <Card>
          <CardHeader>
            <CardTitle className="text-base">Screening Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <SummaryItem label="Height" value={form.height || "--"} unit="cm" status="Normal" />
            <SummaryItem label="Weight" value={form.weight || "--"} unit="kg" status="Normal" />
            <SummaryItem label="BMI" value={bmiDisplayValue} status="Normal" />
            <SummaryItem label="Blood Group" value={form.bloodGroup || "O+"} status="Normal" />
          </CardContent>
        </Card>
        )}
      </div>

      {/* <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Standards</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3">
            <StandardCard
              title="Height Standard"
              value={form.height ? `${form.height} cm` : "--"}
              description="Within expected range"
            />
            <StandardCard
              title="Weight Standard"
              value={form.weight ? `${form.weight} kg` : "--"}
              description="Within expected range"
            />
            <StandardCard
              title="BMI"
              value={form.bmi || "--"}
              description="Calculated from height and weight"
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Health Profile</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <HealthOption title="Blood Group" value="O+" />
            <HealthOption title="Immunization" value="Up to date" />
            <HealthOption title="Allergy" value="No known allergy" />
          </CardContent>
        </Card>
      </div> */}

      
    </div>
  );
}

export default React.memo(AssessmentCard);

function SummaryItem({ label, value, unit, status }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">

      <div>
        <p className="text-sm font-medium">
          {label} {unit ? `(${unit})` : ""}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {unit ? `${value} ` : value}
        </p>
      </div>

      {status && (
        <span className="text-xs font-medium text-emerald-500">
          {status}
        </span>
      )}

    </div>
  );
}

// function HealthOption({ title, value }) {
//   return (
//     <div className="space-y-2">

//       <p className="text-sm font-medium">
//         {title}
//       </p>

//       <Button
//         type="button"
//         variant="outline"
//         className="w-full justify-between"
//       >
//         <span>{value}</span>

//         <span className="text-muted-foreground">
//           ›
//         </span>
//       </Button>

//     </div>
//   );
// }

// function StandardCard({
//   title,
//   value,
//   description,
// }) {
//   return (
//     <div className="rounded-xl border border-border p-4">

//       <p className="text-xs text-muted-foreground">
//         {title}
//       </p>

//       <p className="mt-2 font-semibold">
//         {value}
//       </p>

//       <p className="mt-1 text-xs text-muted-foreground">
//         {description}
//       </p>

//     </div>
//   );
// }

function CheckboxItem({ label }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
      <Checkbox />
      <span>{label}</span>
    </label>
  );
}
