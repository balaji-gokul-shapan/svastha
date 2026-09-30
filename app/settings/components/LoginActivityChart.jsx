"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LogIn, MonitorSmartphone } from "lucide-react";

/**
 * Visual "pulse" of the recorded sign-ins.
 *
 * Purely presentational: it receives the ALREADY-computed `entries` array
 * from LoginActivity and only draws it, so that panel's data flow
 * (localStorage history + current session) stays exactly as it was.
 */
export function LoginActivityChart({
  entries = [],
  browserLabel = "",
  height = 168,
}) {
  const data = useMemo(
    () =>
      entries.map((entry, index) => {
        const parsed = new Date(entry.timestamp);
        const isValid = !Number.isNaN(parsed.getTime());

        return {
          session: `#${entries.length - index}`,
          // Minutes since midnight, so the Y axis is a 24h clock.
          minutes: isValid ? parsed.getHours() * 60 + parsed.getMinutes() : 0,
          time: isValid
            ? parsed.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "Unknown",
          date: isValid
            ? parsed.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Unknown",
          current: Boolean(entry.current),
        };
      }),
    [entries],
  );

  if (!data.length) {
    return null;
  }

  return (
    <div className="my-details-login-chart bg-white px-3 py-3 rounded-2xl ">
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="login-activity-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />

            <XAxis
              dataKey="session"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />

            {/* 0 = midnight, 720 = noon, 1439 = end of day. */}
            <YAxis
              domain={[0, 1439]}
              ticks={[0, 720, 1439]}
              tickFormatter={(value) => (value === 720 ? "12 pm" : "12 am")}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />

            <Tooltip
              cursor={{ stroke: "hsl(var(--border))" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                const row = payload[0]?.payload;

                if (!row) return null;

                return (
                  <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-sm">
                    <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                      {row.current ? (
                        <LogIn className="size-3 text-primary" aria-hidden="true" />
                      ) : null}
                      {row.current ? "Active session" : `Sign-in ${row.session}`}
                    </p>
                    <p className="text-muted-foreground">{row.time}</p>
                    <p className="text-muted-foreground">{row.date}</p>
                    {browserLabel ? (
                      <p className="mt-1 flex items-center gap-1.5 border-t border-border pt-1 text-foreground">
                        <MonitorSmartphone className="size-3 shrink-0" aria-hidden="true" />
                        {browserLabel}
                      </p>
                    ) : null}
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="minutes"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#login-activity-fill)"
              dot={{ r: 3, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-1 text-center text-[11px] text-muted-foreground">
        Time of day across your last {entries.length} sign-in
        {entries.length === 1 ? "" : "s"}
      </p>

      {browserLabel ? (
        <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <MonitorSmartphone className="size-3 shrink-0" aria-hidden="true" />
          {browserLabel}
        </p>
      ) : null}
    </div>
  );
}

export default LoginActivityChart;