
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Ear,
  Info,
  ShieldAlert,

} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ReusableSelect from "@/components/ui/reusable-select";
import EarIllustration from "../assets/EarSvg";

// export const studentOptions = [
//   { id: 1, name: "Devvrat Guneta" },
//   { id: 2, name: "Aarav Mehta" },
//   { id: 3, name: "Ishita Sharma" },
//   { id: 4, name: "Kabir Nair" },
//   { id: 5, name: "Ananya Reddy" },
// ];

// export const locationOptions = ["Sunshine Public School", "Riverside Elementary", "Maple Grove Academy"];
// export const examinerOptions = ["Dr. Priya Sharma", "Dr. Arjun Mehta", "Dr. Kavya Reddy"];
// export const assistantOptions = ["Riya Nair", "Sanjay Kumar", "Meera Iyer"];

// // Distance acuity: standard Snellen fractions, plus the notations used when
// // acuity is too poor to measure on the chart at all.
// export const distanceAcuityOptions = [
//   "6/6", "6/9", "6/12", "6/18", "6/24", "6/36", "6/60",
//   "CF (Counting Fingers)", "HM (Hand Movement)", "PL (Perception of Light)", "NPL (No Perception of Light)",
// ];

// // Near acuity: Jaeger / N-notation.
// export const nearAcuityOptions = ["N5", "N6", "N8", "N10", "N12", "N18", "N24", "N36"];

// export const colorVisionStatusOptions = ["Normal", "Deficient — Protanopia", "Deficient — Deuteranopia", "Deficient — Tritanopia", "Not Tested"];
// export const colorVisionTestTypeOptions = ["Ishihara", "Farnsworth D-15", "City University Test"];

// export const coverTestOptions = ["Orthophoria (Normal)", "Esophoria", "Exophoria", "Esotropia", "Exotropia", "Hypertropia", "Hypotropia"];

// export const lidsOptions = ["Normal", "Ptosis", "Blepharitis", "Stye", "Edema"];
// export const conjunctivaOptions = ["Normal", "Conjunctivitis", "Pallor", "Hyperemia", "Pterygium"];
// export const corneaOptions = ["Clear", "Opacity", "Scar", "Ulcer", "Arcus"];
// export const pupilOptions = ["Normal (PERRLA)", "Anisocoria", "Miosis", "Mydriasis", "Sluggish Reaction"];

// export const refractiveErrorOptions = ["None", "Myopia", "Hyperopia", "Astigmatism", "Presbyopia", "Myopic Astigmatism", "Hyperopic Astigmatism"];
// export const lensTypeOptions = ["None", "Single Vision", "Bifocal", "Progressive", "Contact Lens"];
// export const followUpOptions = ["No follow-up needed", "1 month", "3 months", "6 months", "1 year"];

// export const yesNoOptions = (goodValue) => {
//   if (goodValue === "neutral") {
//     return [
//       { value: "yes", label: "Yes", tone: "neutral" },
//       { value: "no", label: "No", tone: "neutral" },
//     ];
//   }
//   return [
//     { value: "yes", label: "Yes", tone: goodValue === "yes" ? "good" : "bad" },
//     { value: "no", label: "No", tone: goodValue === "no" ? "good" : "bad" },
//   ];
// };

// // ---------------------------------------------------------------------------
// // Snellen-fraction severity classification, used to color the eye icons in
// // the Visual Acuity Snapshot.
// // ---------------------------------------------------------------------------

// const SEVERE_NOTATIONS = ["CF", "HM", "PL", "NPL"];

// export function classifyAcuity(value) {
//   if (!value) return { label: "Not tested", tone: "muted" };

//   const trimmed = value.trim();
//   if (SEVERE_NOTATIONS.some((n) => trimmed.startsWith(n))) {
//     return { label: "Severe", tone: "destructive" };
//   }

//   const match = /^6\/(\d+)/.exec(trimmed);
//   if (!match) return { label: trimmed, tone: "muted" };

//   const ratio = Number(match[1]) / 6;
//   if (ratio <= 1.2) return { label: "Normal", tone: "success" };
//   if (ratio <= 2) return { label: "Mild", tone: "info" };
//   if (ratio <= 4) return { label: "Moderate", tone: "warning" };
//   return { label: "Severe", tone: "destructive" };
// }


/* ============================================================
   EAR PANEL
============================================================ */

export default function EarPanel({
  ear,
  short,
  form,
  updateField,
}) {
  const side = short.toLowerCase();

  const fields = [
    [
      "Ear Wax",
      `ear_wax_${side}`,
    ],
    [
      "Infection",
      `infection_${side}`,
    ],
    [
      "Discharge",
      `discharge_${side}`,
    ],
    [
      "Perforation",
      `perforation_${side}`,
    ],
    [
      "Foreign Body",
      `foreign_body_${side}`,
    ],
    [
      "Tympanic Membrane",
      `tympanic_membrane_${side}`,
    ],
    [
      "Whisper Hearing",
      `hearing_whisper_${side}`,
    ],
  ];

  return (
    <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
      {/* Ear heading */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Ear className="size-5" />
          </div>

          <div>
            <p className="text-sm font-semibold">
              {ear}
            </p>

            <p className="text-xs text-muted-foreground">
              {short}
            </p>
          </div>
        </div>

        <Badge variant="outline">
          {short}
        </Badge>
      </div>

      {/* SVG ear illustration */}
      <div className="mb-5 flex justify-center rounded-xl bg-background p-5">
        <EarIllustration />
      </div>

      <div className="space-y-3">
        {fields.map(([label, field]) => (
          <ClinicalSelect
            key={field}
            label={label}
            value={form[field]}
            onChange={(value) =>
              updateField(field, value)
            }
          />
        ))}
      </div>

      <div className="mt-4">
        <FieldLabel>
          System Examination
        </FieldLabel>

        <Textarea
          value={form[`system_examination_${side}`]}
          onChange={(e) =>
            updateField(
              `system_examination_${side}`,
              e.target.value
            )
          }
          placeholder={`${ear} examination findings...`}
          rows={3}
        />
      </div>
    </div>
  );
}




export function QuickStatus({
  icon: Icon,
  label,
  value,
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <p className="mt-0.5 truncate text-sm font-semibold">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


/* ============================================================
   CLINICAL SELECT
============================================================ */

// Default clinical finding options used across every ClinicalSelect.
// Callers can override via the `options` prop.
export const clinicalFindingOptions = [
  "Normal",
  "Present",
  "Absent",
  "Mild",
  "Moderate",
  "Severe",
  "Not Assessed",
];

export function ClinicalSelect({
  label,
  value,
  onChange,
  options = clinicalFindingOptions,
  placeholder = "Select finding",
  disabled = false,
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>
        {label}
      </FieldLabel>

      <ReusableSelect
        options={options}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Search finding"
        disabled={disabled}
      />
    </div>
  );
}


/* ============================================================
   RISK TOGGLE
============================================================ */

export  function RiskToggle({
  label,
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
        checked
          ? "border-warning/40 bg-warning/5"
          : "border-border/70 bg-background hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex size-9 items-center justify-center rounded-lg aspect-square ${
            checked
              ? "bg-warning/10 text-warning"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <ShieldAlert className="size-4" />
        </div>

        <span className="text-sm font-medium">
          {label}
        </span>
      </div>

      <div
        className={`size-5 rounded-full border-2 aspect-square ${
          checked
            ? "border-warning bg-warning"
            : "border-muted-foreground/30"
        }`}
      >
        {checked && (
          <CheckCircle2 className="size-full text-white" />
        )}
      </div>
    </button>
  );
}


/* ============================================================
   BOOLEAN CARD
============================================================ */

export function BooleanCard({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-xl border p-4 text-left transition ${
        checked
          ? "border-destructive/30 bg-destructive/5"
          : "border-border/70 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {label}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        {checked ? (
          <CheckCircle2 className="size-5 text-destructive" />
        ) : (
          <Info className="size-5 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}


/* ============================================================
   FIELD
============================================================ */

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>
        {label}
      </FieldLabel>

      <Input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}


/* ============================================================
   FIELD LABEL
============================================================ */
function FieldLabel({ children }) {
  return (
    <label className="text-xs font-medium text-muted-foreground">
      {children}
    </label>
  );
}


export function SectionCard({
  icon: Icon,
  title,
  description,
  tone = "blue",
  children,
}) {
  const tones = {
    blue: "bg-primary/10 text-primary",
    purple: "bg-purple-500/10 text-purple-600",
    orange: "bg-orange-500/10 text-orange-600",
    cyan: "bg-cyan-500/10 text-cyan-600",
    green: "bg-green-500/10 text-green-600",
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-muted/10">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}
          >
            <Icon className="size-5" />
          </div>

          <div>
            <CardTitle className="text-base">{title}</CardTitle>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}