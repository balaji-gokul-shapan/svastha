import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import ReusableSelect from "@/components/ui/reusable-select";
import { ClipboardList, FileText } from "lucide-react";

import HealthWorkerFormOutlineIcon from "@iconify-react/healthicons/health-worker-form-outline";
import useAssignedEvents, { findSelectedCamp } from "@/lib/useAssignedEvents";
import { TextField } from "@/components/ui/text-field";
import { getNormaliseName } from "../students/utilities/students-cards";

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
  authUser,
  schoolName = "all",
}) => {
  const [assessmentDate, setAssessmentDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const getDoctername = authUser?.emp_name || authUser?.name;
  console.log(form, authUser, "sssss");

  const studentName =
    studentOptions.find((item) => String(item.value) === String(studentValue))
      ?.label ??
    data?.name ??
    data?.student_name ??
    data?.studentName ??
    data?.student ??
    "Student not selected";

  const calculatedBmi = React.useMemo(() => {
    const heightCm = Number(form?.height);
    const weightKg = Number(form?.weight);

    if (
      !Number.isFinite(heightCm) ||
      !Number.isFinite(weightKg) ||
      heightCm <= 0 ||
      weightKg <= 0
    ) {
      return "--";
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Number.isFinite(bmi) ? bmi.toFixed(1) : "--";
  }, [form?.height, form?.weight]);

  const enteredBmi = String(form?.bmi ?? "").trim();
  const computedBmi = String(calculatedBmi ?? "").trim();
  const bmiDisplayValue =
    computedBmi && computedBmi !== "--" ? computedBmi : enteredBmi || "--";

  const { assignedEvents, assignEventLoading, assignEventError } =
    useAssignedEvents();

  // The camp (event) selected via the page's school filter — shown in
  // the Camp/Location fields of this card.
  const selectedCamp = React.useMemo(
    () => findSelectedCamp(assignedEvents, schoolName),
    [assignedEvents, schoolName],
  );

  return (
    <div className="grid gap-4 grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Assessment Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                Assessment Date
              </label>
              <DatePicker
                name="assessmentDate"
                value={assessmentDate}
                onValueChange={setAssessmentDate}
                placeholder="Select assessment date"
              />
            </div>

            <ReusableSelect
              label="Student"
              options={studentOptions}
              value={studentValue}
              onChange={onStudentChange}
              placeholder="Select student"
              searchPlaceholder="Search student by name or ID..."
            />

            {/* <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Location</label>
              <Input defaultValue="Sunshine Public School" />
            </div> */}
            <TextField
              label="Camp"
              defaultValue={
                selectedCamp.name === "all" ? "" : selectedCamp.name
              }
              readOnly
              placeholder="Select a camp in the filters"
            />
            <TextField
              label="Location"
              defaultValue={
                selectedCamp.schoolName === "all" ? "" : selectedCamp.schoolName
              }
              readOnly
              placeholder="Location"
            />

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground pointer-none:">
                Examiner
              </label>
              <Input defaultValue={getNormaliseName(getDoctername)} readOnly />
            </div>

            {/* <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Assistant</label>
              <Input defaultValue="Riya Nair" />
            </div> */}
          </CardContent>
        </Card>

        {isScreening && (
          <Card>
            <CardHeader className="border-b border-border/70 bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="flex size-8 items-center justify-center rounded-lg bg-success/10">
                  <ClipboardList className="size-4 text-success" />
                </span>
                Health Screening Summary
              </CardTitle>
            </CardHeader>

            {/* Compact readout list rather than a tile grid: in this 300px rail a
                2-column grid of tiles was cramped AND very tall. Grouped so the
                eye reads "growth", then "vitals", and the left rail shows at a
                glance which readings are actually filled. */}
            <CardContent className="space-y-0.5 p-2">
              <p className="gs-readout__group">Growth</p>

              <SummaryItem
                label="Height"
                value={
                  form.height
                    ? `${form.height} cm / ${(parseFloat(form.height) / 2.54).toFixed(1)} in`
                    : "0 cm / 0 in"
                }
              />
              <SummaryItem
                label="Weight"
                value={
                  form.weight
                    ? `${form.weight} kg / ${(parseFloat(form.weight) * 2.20462).toFixed(1)} lbs`
                    : "0 kg / 0 lbs"
                }
              />
              <SummaryItem
                label="BMI"
                value={bmiDisplayValue}
                status="Normal"
              />

              <p className="gs-readout__group">Vitals</p>

              <SummaryItem
                label="Blood Pressure"
                value={form.bloodPressure || "O/0"}
              />
              <SummaryItem label="Pulse" value={form.pulse || "0 bpm"} />
              <SummaryItem label="SPO2" value={form.spo2 || "0%"} />
              <SummaryItem
                label="Temperature"
                value={
                  form.temperature
                    ? `${form.temperature}°C / ${((parseFloat(form.temperature) * 9) / 5 + 32).toFixed(1)}°F`
                    : "0°C / 32°F"
                }
              />

              <p className="gs-readout__group">Other</p>

              <SummaryItem
                label="Blood Group"
                value={form.bloodGroup || "O+"}
              />
            </CardContent>
          </Card>
        )}
      </section>

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
};
  // const assessmentForm = useCallback(
  //   () => ({
  //     height,
  //     weight,
  //     bmi: displayBmi ? displayBmi.toFixed(1) : "",
  //     bloodPressure,
  //     pulse,
  //     temperature,
  //     spo2,
  //     bloodGroup,
  //   }),
  //   [
  //     bmi,
  //     displayBmi,
  //     temperature,
  //     height,
  //     pulse,
  //     bloodPressure,
  //     spo2,
  //     weight,
  //     bloodGroup,
  //   ],
  // );

export default AssessmentCard;

function SummaryItem({ label, value, unit, status }) {
  /* Placeholder defaults ("0 cm / 0 in", "0 bpm", "O/0") mean nothing was
     entered. The rail goes neutral AND the value dims, so a blank reading is
     never mistaken for a result. */
  const isEmpty =
    value === "—" ||
    value === "" ||
    value === null ||
    value === undefined ||
    /^\s*0(\s+0)?\s*(\/.*)?$/.test(String(value ?? ""));

  const text = unit ? `${value} ${unit}` : String(value ?? "—");

  return (
    <div
      className={`gs-readout ${isEmpty ? "gs-readout--blank" : "gs-readout--filled"}`}
      title={`${label}: ${text}`}
    >
      <span className="gs-readout__label">{label}</span>

      <span className="gs-readout__value">
        {status && !isEmpty ? (
          <span className="mr-1 text-emerald-500">{status}</span>
        ) : null}

        <span className={isEmpty ? "gs-empty" : ""}>{text}</span>
      </span>
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
