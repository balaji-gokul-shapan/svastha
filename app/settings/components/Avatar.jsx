const AVATAR_STYLES = [
  "bg-primary/15 text-primary",
  "bg-info/15 text-info",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
];

export function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "NA";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

/** Reusable circular initials avatar with a rotating tone per index/id. */
export function Avatar({ name = "", id = 0, size = "size-9" }) {
  const style = AVATAR_STYLES[Number(id) % AVATAR_STYLES.length];
  return (
    <span
      aria-hidden="true"
      className={`flex ${size} shrink-0 items-center justify-center rounded-full text-xs font-semibold ${style}`}
    >
      {getInitials(name)}
    </span>
  );
}

export default Avatar;
