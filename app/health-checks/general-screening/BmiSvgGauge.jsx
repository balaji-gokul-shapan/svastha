export function BmiSvgGauge({ bmi, category }) {
  const value = Number(bmi) || 0;

  /*
    BMI scale:

    < 18.5      Underweight
    18.5 - 24.9 Normal
    25 - 29.9    Overweight
    30+          Obese
  */

  const min = 10;
  const max = 40;

  const normalized = Math.min(
    Math.max((value - min) / (max - min), 0),
    1
  );

  /*
    SVG arc:
    start = 180 degrees
    end   = 0 degrees
  */

  const angle = 180 - normalized * 180;

  const radius = 105;
  const centerX = 140;
  const centerY = 125;

  const radians = (angle * Math.PI) / 180;

  const dotX = centerX + radius * Math.cos(radians);
  const dotY = centerY - radius * Math.sin(radians);

  return (
    <div className="relative mx-auto h-[180px] w-full max-w-[300px]">

      <svg
        viewBox="0 0 280 170"
        className="h-full w-full"
        role="img"
        aria-label={`BMI ${value || "not available"}`}
      >

        {/* Background arc */}
        <path
          d="M 35 125 A 105 105 0 0 1 245 125"
          fill="none"
          stroke="currentColor"
          strokeWidth="18"
          strokeLinecap="round"
          className="text-muted/60"
        />

        {/* Underweight */}
        <path
          d="M 35 125 A 105 105 0 0 1 72 52"
          fill="none"
          stroke="currentColor"
          strokeWidth="18"
          strokeLinecap="round"
          className="text-info/60"
        />

        {/* Normal */}
        <path
          d="M 72 52 A 105 105 0 0 1 176 39"
          fill="none"
          stroke="currentColor"
          strokeWidth="18"
          strokeLinecap="round"
          className="text-success/70"
        />

        {/* Overweight */}
        <path
          d="M 176 39 A 105 105 0 0 1 220 67"
          fill="none"
          stroke="currentColor"
          strokeWidth="18"
          strokeLinecap="round"
          className="text-warning/70"
        />

        {/* Obese */}
        <path
          d="M 220 67 A 105 105 0 0 1 245 125"
          fill="none"
          stroke="currentColor"
          strokeWidth="18"
          strokeLinecap="round"
          className="text-destructive/60"
        />

        {/* Indicator line */}
        {value > 0 && (
          <line
            x1="140"
            y1="125"
            x2={dotX}
            y2={dotY}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-foreground"
          />
        )}

        {/* Indicator dot */}
        {value > 0 && (
          <circle
            cx={dotX}
            cy={dotY}
            r="7"
            fill="currentColor"
            className="text-foreground"
          />
        )}

        {/* Center circle */}
        <circle
          cx="140"
          cy="125"
          r="5"
          fill="currentColor"
          className="text-muted-foreground"
        />

      </svg>


      {/* Center BMI value */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">

        <p className="text-[11px] text-muted-foreground">
          BMI
        </p>

        <p className="text-3xl font-bold tracking-tight">
          {value ? value.toFixed(1) : "—"}
        </p>

      </div>

    </div>
  );
}