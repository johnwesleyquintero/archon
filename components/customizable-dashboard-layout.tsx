"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Responsive, WidthProvider, type Layout } from "react-grid-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

const ResponsiveGridLayout = WidthProvider(Responsive)

export interface DashboardWidget {
  id: string
  title: string
  component: React.ReactNode
  defaultLayout: {
    w: number
    h: number
    x: number
    y: number
    minW?: number
    minH?: number
  }
  visible: boolean
}

interface CustomizableDashboardLayoutProps {
  widgets: DashboardWidget[]
  onLayoutChange?: (layout: Layout[]) => void
  onWidgetVisibilityChange?: (widgetId: string, visible: boolean) => void
  className?: string
}

export function CustomizableDashboardLayout({
  widgets,
  onLayoutChange,
  onWidgetVisibilityChange,
  className,
}: CustomizableDashboardLayoutProps) {
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({})

  const visibleWidgets = widgets.filter((widget) => widget.visible)

  const defaultLayouts = {
    lg: visibleWidgets.map((widget) => ({
      i: widget.id,
      ...widget.defaultLayout,
    })),
    md: visibleWidgets.map((widget) => ({
      i: widget.id,
      ...widget.defaultLayout,
      w: Math.min(widget.defaultLayout.w, 8),
    })),
    sm: visibleWidgets.map((widget) => ({
      i: widget.id,
      ...widget.defaultLayout,
      w: Math.min(widget.defaultLayout.w, 6),
    })),
    xs: visibleWidgets.map((widget) => ({
      i: widget.id,
      ...widget.defaultLayout,
      w: 4,
    })),
    xxs: visibleWidgets.map((widget) => ({
      i: widget.id,
      ...widget.defaultLayout,
      w: 2,
    })),
  }

  const handleLayoutChange = useCallback(
    (layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
      setLayouts(allLayouts)
      onLayoutChange?.(layout)
    },
    [onLayoutChange],
  )

  const toggleWidgetVisibility = (widgetId: string) => {
    const widget = widgets.find((w) => w.id === widgetId)
    if (widget) {
      onWidgetVisibilityChange?.(widgetId, !widget.visible)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={isCustomizing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isCustomizing ? "Done" : "Customize"}
          </Button>
        </div>
      </div>

      {/* Widget Visibility Controls */}
      {isCustomizing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Widget Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {widgets.map((widget) => (
                <Button
                  key={widget.id}
                  variant={widget.visible ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className="justify-start"
                >
                  {widget.visible ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                  {widget.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid Layout */}
      <div
        className={cn(
          "transition-all duration-200",
          isCustomizing && "ring-2 ring-blue-200 dark:ring-blue-800 rounded-lg p-2",
        )}
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={Object.keys(layouts).length > 0 ? layouts : defaultLayouts}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          isDraggable={isCustomizing}
          isResizable={isCustomizing}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
          compactType="vertical"
          preventCollision={false}
        >
          {visibleWidgets.map((widget) => (
            <div key={widget.id} className="widget-container">
              <div
                className={cn(
                  "h-full w-full rounded-lg transition-all duration-200",
                  isCustomizing && "ring-1 ring-slate-200 dark:ring-slate-700",
                )}
                style={{
                  cursor: isCustomizing ? "move" : "default",
                }}
              >
                {widget.component}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {isCustomizing && (
        <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
          Drag widgets to rearrange them, resize by dragging the corners, or toggle visibility above.
        </div>
      )}

      <style jsx global>{`
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top;
        }
        .react-grid-item.cssTransforms {
          transition-property: transform;
        }
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: 0;
          right: 0;
          background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjOTk5IiBkPSJtMTUgMTJjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0tNS00YzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTAgNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wLThjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXoiLz4KPHN2Zz4K')
            no-repeat;
          background-size: contain;
          cursor: se-resize;
        }
        .react-grid-item.react-grid-placeholder {
          background: rgb(59 130 246 / 0.15);
          border-radius: 8px;
          opacity: 0.2;
          transition-duration: 100ms;
          z-index: 2;
          user-select: none;
        }
        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 3;
        }
        .react-grid-item.react-resizable-resizing {
          transition: none;
          z-index: 1;
        }
      `}</style>
    </div>
  )
}
