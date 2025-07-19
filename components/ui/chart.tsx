"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import {
  ChartContainer as RechartsChartContainer,
  ChartContainerProps as RechartsChartContainerProps,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

// Define ChartConfig type (simplified for example)
export type ChartConfig = {
  [key: string]: {
    label: string
    color?: string
    icon?: React.ElementType
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

// Re-export ChartContainer from shadcn/ui/chart
export { RechartsChartContainer as ChartContainer }

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  RechartsChartContainerProps & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

// Define ChartTooltip and ChartLegend (simplified placeholders)
export const ChartTooltip = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
    {children}
  </div>
)
export const ChartLegend = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center gap-4 p-2 text-sm">
    {children}
  </div>
)

// Define ChartTooltipContent and ChartLegendContent (simplified placeholders)
export const ChartTooltipContent = ({ payload, label, formatter, className }: any) => {
  if (!payload || payload.length === 0) return null;
  return (
    <div className={cn("rounded-md border bg-popover p-2 text-popover-foreground shadow-md", className)}>
      <p className="text-sm font-medium">{label}</p>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
          <span>{formatter ? formatter(item.value) : item.value}</span>
        </div>
      ))}
    </div>
  );
};

export const ChartLegendContent = ({ payload, className }: any) => {
  if (!payload || payload.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4 p-2 text-sm", className)}>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.value}
        </div>
      ))}
    </div>
  );
};

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartStyle
}
