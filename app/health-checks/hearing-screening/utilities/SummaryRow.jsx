const NA_VALUES = new Set([
  "—",
  "",
  "Not assessed",
  "Pending",
  "None",
  "No",
]);

const isBlank = (value) => {
  const text = String(value ?? "").trim();

  return !text || NA_VALUES.has(text);
};

const TONE_CLASS = {
  success: "text-success bg-success/10",
  info: "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
  muted: "text-muted-foreground bg-muted",
};

export function SummaryRow({ icon: Icon, label, value, tone = "muted" }) {
  const blank = isBlank(value);

  return (
    /* One line per reading: icon · micro-caps label · right-aligned value.
       The left rail doubles as a filled/blank indicator. */
    <div
      className={`gs-readout ${blank ? "gs-readout--blank" : "gs-readout--filled"}`}
      title={`${label}: ${value || "—"}`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-md ${
          TONE_CLASS[tone] ?? TONE_CLASS.muted
        }`}
      >
        <Icon className="size-3" />
      </span>

      <span className="gs-readout__label">{label}</span>

      <span className="gs-readout__value">
        <span className={blank ? "gs-empty" : ""}>{value || "—"}</span>
      </span>
    </div>
  );
}

export function StatusItem({ label, value }) {
  const blank = isBlank(value);

  return (
    <div
      className={`gs-readout ${blank ? "gs-readout--blank" : "gs-readout--filled"}`}
      title={`${label}: ${value || "Pending"}`}
    >
      {/* The dot keeps its original semantic: green when recorded, muted when
          pending — just tightened and aligned to the new single-line row. */}
      <span
        className={`size-1.5 shrink-0 rounded-full ${
          blank ? "bg-muted-foreground" : "bg-success"
        }`}
        aria-hidden="true"
      />

      <span className="gs-readout__label">{label}</span>

      <span className="gs-readout__value">
        <span className={blank ? "gs-empty" : ""}>{value || "Pending"}</span>
      </span>
    </div>
  );
}