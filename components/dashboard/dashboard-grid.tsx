"use client";

import { TriangleAlert } from "lucide-react";
import React, { ComponentType } from "react";
import { Responsive, type Layout, WidthProvider } from "react-grid-layout";

import { Card, CardContent } from "@/components/ui/card";
import { AllWidgetConfigs, Widget } from "@/lib/types/widget-types";

import { DashboardWidget } from "../dashboard-widget";

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
  widgetConfigs: AllWidgetConfigs;
  onToggleWidgetVisibility: (id: string) => void;
  onConfigureWidget: (widgetId: string) => void;
}

export function DashboardGrid<P extends Record<string, unknown>>({
  visibleWidgets,
  isCustomizing,
  onLayoutChange,
  widgetComponentsMap,
  availableWidgets,
  widgetConfigs,
  onToggleWidgetVisibility,
  onConfigureWidget,
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
        const config = widgetConfigs[widget.id] || { title: widget.title };

        return (
          <div key={item.i} className="relative">
            {WidgetComponent && (
              <DashboardWidget
                key={widget.id}
                title={config.title}
                isCustomizing={isCustomizing}
                onRemove={() => onToggleWidgetVisibility(widget.id)}
                onConfigure={() => onConfigureWidget(widget.id)}
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
