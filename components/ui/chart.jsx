"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, Tooltip } from "recharts";

export function ChartContainer({ id, className, children, config = {} }) {
  const style = Object.entries(config).reduce((acc, [key, value]) => {
    if (value?.color) {
      acc[`--color-${key}`] = value.color;
    }
    return acc;
  }, {});

  return (
    <div
      data-slot="chart"
      data-chart={id}
      className={cn("[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground", className)}
      style={style}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function ChartTooltip(props) {
  return <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.25 }} {...props} />;
}

export function ChartTooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-sm">
      {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={`${item.name}-${item.dataKey}`} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
