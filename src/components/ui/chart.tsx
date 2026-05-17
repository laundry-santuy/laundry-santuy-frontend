"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
    icon?: React.ComponentType;
  }
>;

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
};

type ChartStyle = React.CSSProperties & Record<`--color-${string}`, string>;

function getChartVars(config: ChartConfig) {
  return Object.entries(config).reduce<Partial<ChartStyle>>(
    (vars, [key, value]) => {
      if (value.color) {
        vars[`--color-${key}`] = value.color;
      }

      return vars;
    },
    {},
  );
}

function ChartContainer({
  config,
  className,
  style,
  ...props
}: ChartContainerProps) {
  return (
    <div
      data-slot="chart"
      className={cn("min-h-[240px] w-full", className)}
      style={{
        ...getChartVars(config),
        ...style,
      }}
      {...props}
    />
  );
}

function ChartTooltip({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        "rounded-xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--odong-text)] shadow-[0_12px_28px_rgba(25,28,29,0.12)]",
        className,
      )}
      {...props}
    />
  );
}

function ChartTooltipContent({
  className,
  indicator = "dot",
  label,
  value,
}: React.ComponentProps<"div"> & {
  indicator?: "dot" | "line";
  label?: React.ReactNode;
  value?: React.ReactNode;
}) {
  return (
    <div
      data-slot="chart-tooltip-content"
      className={cn("grid gap-1.5", className)}
    >
      {label ? (
        <p className="font-extrabold text-[var(--odong-text)]">{label}</p>
      ) : null}
      {value ? (
        <p className="flex items-center gap-2 text-[var(--odong-muted)]">
          <span
            className={cn(
              "bg-primary-500",
              indicator === "line" ? "h-0.5 w-4 rounded-full" : "h-2 w-2 rounded-full",
            )}
          />
          {value}
        </p>
      ) : null}
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
