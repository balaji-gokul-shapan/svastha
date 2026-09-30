
export const TONE_CHIP_CLASSES = {
  blue: "bg-tone-blue/10 text-tone-blue",
  green: "bg-tone-green/10 text-tone-green",
  orange: "bg-tone-orange/10 text-tone-orange",
  purple: "bg-tone-purple/10 text-tone-purple",
  red: "bg-tone-red/10 text-tone-red",
  cyan: "bg-tone-cyan/10 text-tone-cyan",
  yellow: "bg-tone-yellow/10 text-tone-yellow",
};

/** Bordered tiles (grade/risk cards) — softer fill than TONE_CHIP_CLASSES. */
export const TONE_TILE_CLASSES = {
  blue: "border-tone-blue/20 bg-tone-blue/5 text-tone-blue",
  green: "border-tone-green/20 bg-tone-green/5 text-tone-green",
  orange: "border-tone-orange/20 bg-tone-orange/5 text-tone-orange",
  purple: "border-tone-purple/20 bg-tone-purple/5 text-tone-purple",
  red: "border-tone-red/20 bg-tone-red/5 text-tone-red",
  cyan: "border-tone-cyan/20 bg-tone-cyan/5 text-tone-cyan",
  yellow: "border-tone-yellow/20 bg-tone-yellow/5 text-tone-yellow",
};

/** Alert severity. danger/warning/info reuse the semantic tone names. */
export const ALERT_TONE_CLASSES = {
  danger: TONE_CHIP_CLASSES.red,
  warning: TONE_CHIP_CLASSES.orange,
  info: TONE_CHIP_CLASSES.blue,
};

/** Follow-up status pills. */
export const FOLLOW_UP_STATUS_CLASSES = {
  "Due Soon": TONE_CHIP_CLASSES.orange,
  Overdue: TONE_CHIP_CLASSES.red,
  Scheduled: TONE_CHIP_CLASSES.blue,
};

/**
 * Chart series as CSS variable references — safe to hand to Recharts
 * (`fill`, `stroke`, `stopColor`) and to inline `backgroundColor` styles.
 */
export const CHART_SERIES = {
  green: "var(--tone-green)",
  blue: "var(--tone-blue)",
  orange: "var(--tone-orange)",
  red: "var(--tone-red)",
  purple: "var(--tone-purple)",
  cyan: "var(--tone-cyan)",
};

/** Ordered palettes for the pie charts, so legend and slices never drift. */
export const SCREENING_SERIES = [
  CHART_SERIES.green,
  CHART_SERIES.blue,
  CHART_SERIES.orange,
  CHART_SERIES.red,
  CHART_SERIES.purple,
  CHART_SERIES.cyan,
];

export const REFERRAL_SERIES = [
  CHART_SERIES.blue,
  CHART_SERIES.orange,
  CHART_SERIES.green,
  CHART_SERIES.purple,
  CHART_SERIES.red,
  CHART_SERIES.cyan,
];

/** Gradient stroke for the referral trend area chart. */
export const TREND_STROKE = CHART_SERIES.blue;

/** Safe lookups — an unknown tone falls back instead of rendering unstyled. */
export const toneChipClass = (tone) =>
  TONE_CHIP_CLASSES[tone] ?? TONE_CHIP_CLASSES.blue;

export const toneTileClass = (tone) =>
  TONE_TILE_CLASSES[tone] ?? TONE_TILE_CLASSES.blue;

/** Picks a series colour by index, wrapping if a dataset is ever longer. */
export const seriesColorAt = (series, index) =>
  series[index % series.length];

export const SCREENING_ORDER = ["General", "Vision", "Dental", "Hearing", "ENT"];
export const SCREENING_COLORS = {
  General: CHART_SERIES.blue,
  Vision: CHART_SERIES.green,
  Dental: CHART_SERIES.orange,
  Hearing: CHART_SERIES.purple,
  ENT: CHART_SERIES.cyan,
};