export function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>

        <span className="text-sm">{label}</span>
      </div>

      <span className="max-w-[110px] truncate text-xs font-medium text-muted-foreground">
        {value || "—"}
      </span>
    </div>
  );
}

export function StatusItem({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>

      <div className="flex items-center gap-2">
        <span
          className={`size-1.5 rounded-full ${
            value ? "bg-success" : "bg-muted-foreground"
          }`}
        />

        <span className="text-xs font-medium">{value || "Pending"}</span>
      </div>
    </div>
  );
}