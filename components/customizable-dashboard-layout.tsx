"use client";

import type React from "react";
import { ComponentType } from "react";
import { useCallback, useMemo, useState } from "react";
import { Responsive, type Layout, WidthProvider } from "react-grid-layout";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";

import { AddWidgetDialog } from "./add-widget-dialog";

import { DashboardWidget } from "./dashboard-widget";
import { DashboardControlBar } from "./dashboard/controls/dashboard-control-bar";
import { CustomizationHelpText } from "./dashboard/customization-help-text";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define a type that extends Layout with isVisible
type DashboardLayoutItem = Layout & {
  isVisible: boolean;
  title: string;
};

// Widget type definitions
export interface Widget<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  id: string;
  type: string;
  title: string;
  description: string;
  componentId: string; // Changed from 'component' to 'componentId'
  defaultProps?: P;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

// Widget type definitions

import { TriangleAlert } from "lucide-react";
import { WelcomeWidget } from "./dashboard/welcome-widget"; // Import WelcomeWidget

interface CustomizableDashboardLayoutProps<P extends Record<string, unknown>> {
  widgets: Widget<P>[]; // Revert to original Widget<P>[] type as Widget interface now has componentId
  initialLayout?: DashboardLayoutItem[];
  initialWidgetConfigs?: Record<string, { title: string }>;
  className?: string;
  userName?: string;
}

export function CustomizableDashboardLayout<P extends Record<string, unknown>>({
  widgets,
  initialLayout = [],
  initialWidgetConfigs = {},
  className = "",
  userName,
}: CustomizableDashboardLayoutProps<P>) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgetConfigs, setWidgetConfigs] =
    useState<Record<string, { title: string }>>(initialWidgetConfigs);

  const {
    layout: currentLayout,
    saveLayout,
    handleLayoutChange,
    toggleWidgetVisibility,
    resetLayout,
  } = useDashboardSettings(initialLayout, initialWidgetConfigs);

  const handleSaveLayout = () => {
    void saveLayout(currentLayout, widgetConfigs)
      .then(() => setIsCustomizing(false))
      .catch((error: unknown) => {
        console.error(
          "Failed to save layout:",
          error instanceof Error ? error.message : String(error),
        );
      });
  };

  const handleResetLayout = () => {
    void resetLayout()
      .then(() => {
        setWidgetConfigs({}); // Reset widget configs as well
        setIsCustomizing(false); // Exit customization mode after reset
      })
      .catch((error: unknown) => {
        console.error(
          "Failed to reset layout:",
          error instanceof Error ? error.message : String(error),
        );
      });
  };

  const toggleCustomization = () => {
    setIsCustomizing(!isCustomizing);
  };

  const handleToggleWidgetVisibility = useCallback(
    (id: string) => {
      const widgetToToggle = currentLayout.find((item) => item.i === id);
      if (widgetToToggle) {
        toggleWidgetVisibility(id, !widgetToToggle.isVisible);
      }
    },
    [currentLayout, toggleWidgetVisibility],
  );

  const handleSaveWidgetConfig = useCallback(
    (widgetId: string, config: { title: string }) => {
      setWidgetConfigs((prevConfigs) => ({
        ...prevConfigs,
        [widgetId]: { ...prevConfigs[widgetId], ...config },
      }));
    },
    [],
  );

  const visibleWidgets = useMemo(() => {
    return currentLayout.filter((item) => item.isVisible || isCustomizing);
  }, [currentLayout, isCustomizing]);

  const widgetComponentsMap: Record<string, ComponentType<any>> = useMemo(() => {
    return {
      "welcome-widget": WelcomeWidget,
      // Add other widgets here as they are defined
    };
  }, []);

  const availableWidgets = useMemo(() => {
    return widgets.map((w) => ({
      id: w.id,
      type: w.type,
      title: w.title,
      description: w.description,
      componentId: w.componentId,
      defaultProps: w.defaultProps,
      minW: w.minW,
      minH: w.minH,
      maxW: w.maxW,
      maxH: w.maxH,
    }));
  }, [widgets]);

  const handleAddWidget = useCallback(
    (widgetId: string) => {
      const widgetToAdd = widgets.find((w) => w.id === widgetId);
      if (widgetToAdd) {
        // Check if the widget is already in the layout
        const isAlreadyAdded = currentLayout.some(
          (item) => item.i === widgetId,
        );

        if (!isAlreadyAdded) {
          // Find a suitable position for the new widget
          // For simplicity, let's place it at a default position or find an empty spot
          const newLayoutItem: DashboardLayoutItem = {
            i: widgetToAdd.id,
            x: 0, // You might want to implement more sophisticated placement logic
            y: Infinity, // Puts it at the bottom
            w: widgetToAdd.minW || 4,
            h: widgetToAdd.minH || 2,
            isVisible: true,
            title: widgetToAdd.title,
          };
          const updatedLayout = [...currentLayout, newLayoutItem];
          // Assuming handleLayoutChange might be async and return a Promise
          handleLayoutChange(updatedLayout);

          // Initialize widget config with default title and any other default props
          setWidgetConfigs((prevConfigs) => ({
            ...prevConfigs,
            [widgetId]: {
              ...widgetToAdd.defaultProps,
              title: widgetToAdd.title,
            },
          }));
        } else {
          // If already added, make it visible if it's hidden
          const existingWidget = currentLayout.find(
            (item) => item.i === widgetId,
          );
          if (existingWidget && !existingWidget.isVisible) {
            toggleWidgetVisibility(widgetId, true);
          }
        }
      }
    },
    [currentLayout, widgets, handleLayoutChange, toggleWidgetVisibility],
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <DashboardControlBar
        isCustomizing={isCustomizing}
        onToggleCustomization={toggleCustomization}
        onSaveLayout={handleSaveLayout}
        onCancelCustomization={() => setIsCustomizing(false)}
        onResetLayout={handleResetLayout}
        userName={userName}
      />

      {isCustomizing && <CustomizationHelpText />}

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: visibleWidgets }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={isCustomizing}
        isResizable={isCustomizing}
        onLayoutChange={handleLayoutChange}
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

          const WidgetComponent = widgetComponentsMap[widget.componentId]; // Get the actual component

          return (
            <div key={item.i} className="relative">
              {WidgetComponent && (
                <DashboardWidget
                  key={widget.id}
                  title={widgetConfigs[widget.id]?.title || widget.title}
                  isCustomizing={isCustomizing}
                  onRemove={() => handleToggleWidgetVisibility(widget.id)}
                  onSaveConfig={(config) =>
                    handleSaveWidgetConfig(widget.id, config)
                  }
                >
                  <WidgetComponent
                    {...(widget.defaultProps ? widget.defaultProps : {})}
                    // Pass any additional props needed by the widget component
                  />
                </DashboardWidget>
              )}
            </div>
          );
        })}
      </ResponsiveGridLayout>

      {isCustomizing && (
        <AddWidgetDialog
          availableWidgets={availableWidgets}
          onAddWidget={handleAddWidget}
        />
      )}
    </div>
  );
}
