"use client";

import React, { ComponentType } from "react";
import { Responsive, type Layout, WidthProvider } from "react-grid-layout";
import { Card, CardContent } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import { DashboardWidget } from "../dashboard-widget";
import { Widget } from "../customizable-dashboard-layout"; // Import Widget type

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define a type that extends Layout with isVisible
type DashboardLayoutItem = Layout & {
  isVisible: boolean;
  title: string;
};

interface DashboardGridProps<P extends Record<string, unknown>> {
  visibleWidgets: DashboardLayoutItem[];
  isCustomizing: boolean;
  onLayoutChange: (layout: Layout[]) => void;
  widgetComponentsMap: Record<string, ComponentType<P>>;
  availableWidgets: Widget<P>[];
  widgetConfigs: Record<string, { title: string }>;
  onToggleWidgetVisibility: (id: string) => void;
  onSaveWidgetConfig: (widgetId: string, config: { title: string }) => void;
}

export function DashboardGrid<P extends Record<string, unknown>>({
  visibleWidgets,
  isCustomizing,
  onLayoutChange,
  widgetComponentsMap,
  availableWidgets,
  widgetConfigs,
  onToggleWidgetVisibility,
  onSaveWidgetConfig,
}: DashboardGridProps<P>) {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: visibleWidgets }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      isDraggable={isCustomizing}
      isResizable={isCustomizing}
      onLayoutChange={onLayoutChange}
      measureBeforeMount={true}
      useCSSTransforms={true}
      compactType="vertical"
    >
      {visibleWidgets.map((item) => {
        const widget = availableWidgets.find((w) => w.id === item.i);
        if (!widget) {
          return (
            <div key={item.i} className="relative">
              <Card className="h-full w-full flex flex-col justify-center items-center">
                <CardContent className="text-center">
                  <TriangleAlert className="h-8 w-8 text-destructive mb-2" />
                  <h3 className="text-lg font-semibold">Widget Not Found</h3>
                  <p className="text-sm text-muted-foreground">
                    The widget "{item.i}" could not be loaded.
                  </p>
                </CardContent>
              </Card>
            </div>
          );
        }

        const WidgetComponent = widgetComponentsMap[widget.componentId];

        return (
          <div key={item.i} className="relative">
            {WidgetComponent && (
              <DashboardWidget
                key={widget.id}
                title={widgetConfigs[widget.id]?.title || widget.title}
                isCustomizing={isCustomizing}
                onRemove={() => onToggleWidgetVisibility(widget.id)}
                onSaveConfig={(config) => onSaveWidgetConfig(widget.id, config)}
              >
                <WidgetComponent
                  {...(widget.defaultProps || ({} as P))}
                  // Pass any additional props needed by the widget component
                />
              </DashboardWidget>
            )}
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}
