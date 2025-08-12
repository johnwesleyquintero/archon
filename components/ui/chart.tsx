"use client";

"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { ChartConfig } from "./chart-style";

const DynamicChartStyle = dynamic(
  () =>
    import("./chart-style").then((mod) => ({
      default: mod.ChartStyle,
    })),
  { ssr: false },
);

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

type ChartContainerProps = React.ComponentProps<
  typeof RechartsPrimitive.ResponsiveContainer
> & {
  id?: string;
  className?: string;
  config: ChartConfig;
};

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          className={cn(
            "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
            className,
          )}
          {...props}
        >
          <DynamicChartStyle id={chartId} config={config} />
          <RechartsPrimitive.ResponsiveContainer>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  },
);
ChartContainer.displayName = "Chart";

// Define ChartTooltip and ChartLegend (simplified placeholders)
export const ChartTooltip = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
    {children}
  </div>
);
export const ChartLegend = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center gap-4 p-2 text-sm">
    {children}
  </div>
);

// Define ChartTooltipContent and ChartLegendContent (simplified placeholders)
interface ChartTooltipContentProps {
  payload?: Array<{
    value: number | string;
    name: string;
    color: string;
  }>;
  label?: string;
  formatter?: (value: number | string) => string;
  className?: string;
}

export const ChartTooltipContent = ({
  payload,
  label,
  formatter,
  className,
}: ChartTooltipContentProps) => {
  if (!payload || payload.length === 0) return null;
  return (
    <div
      className={cn(
        "rounded-md border bg-popover p-2 text-popover-foreground shadow-md",
        className,
      )}
    >
      <p className="text-sm font-medium">{label}</p>
      {payload.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-2 text-xs"
        >
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </span>
          <span>{formatter ? formatter(item.value) : item.value}</span>
        </div>
      ))}
    </div>
  );
};

interface ChartLegendContentProps {
  payload?: Array<{
    value: string;
    color: string;
  }>;
  className?: string;
}

export const ChartLegendContent = ({
  payload,
  className,
}: ChartLegendContentProps) => {
  if (!payload || payload.length === 0) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 p-2 text-sm",
        className,
      )}
    >
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.value}
        </div>
      ))}
    </div>
  );
};

const ChartPrimitive = RechartsPrimitive;

export { ChartContainer, ChartPrimitive };
