"use client";

import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { Responsive, type Layout, WidthProvider } from "react-grid-layout";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddWidgetDialog } from "./add-widget-dialog";

import { DashboardWidget } from "./dashboard-widget";
import { DashboardControlBar } from "./dashboard/dashboard-control-bar";
import { CustomizationHelpText } from "./dashboard/customization-help-text";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define a type that extends Layout with isVisible
type DashboardLayoutItem = Layout & {
  isVisible: boolean;
};

// Widget type definitions
export interface Widget<P = Record<string, unknown>> {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<P>;
  defaultProps?: P;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

interface CustomizableDashboardLayoutProps {
  widgets: Widget[];
  initialLayout?: DashboardLayoutItem[];
  className?: string;
}

export function CustomizableDashboardLayout({
  widgets,
  initialLayout = [],
  className = "",
}: CustomizableDashboardLayoutProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const {
    layout: currentLayout,
    isLoading,
    saveLayout,
    handleLayoutChange,
    toggleWidgetVisibility,
    resetLayout,
  } = useDashboardSettings(initialLayout);

  const handleSaveLayout = async () => {
    try {
      await saveLayout(currentLayout);
      setIsCustomizing(false);
    } catch (error: unknown) {
      console.error(
        "Failed to save layout:",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const handleResetLayout = async () => {
    await resetLayout();
    setIsCustomizing(false); // Exit customization mode after reset
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

  const visibleWidgets = useMemo(() => {
    return currentLayout.filter((item) => item.isVisible || isCustomizing);
  }, [currentLayout, isCustomizing]);

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
          };
          const updatedLayout = [...currentLayout, newLayoutItem];
          handleLayoutChange(updatedLayout);
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
      {/* Control Bar */}
      <DashboardControlBar
        isCustomizing={isCustomizing}
        isLoading={isLoading}
        onToggleCustomization={toggleCustomization}
        onSaveLayout={() => void handleSaveLayout()}
        onCancelCustomization={() => setIsCustomizing(false)}
        onResetLayout={() => void handleResetLayout()}
      />

      {/* Help Text */}
      {isCustomizing && <CustomizationHelpText />}

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: currentLayout }}
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
        {visibleWidgets.map((layoutItem) => {
          const widget = widgets.find((w) => w.id === layoutItem.i);
          if (!widget) return null;

          const WidgetComponent = widget.component;
          return (
            <div key={widget.id} className="widget-container">
              <DashboardWidget
                title={widget.title}
                isCustomizing={isCustomizing}
                onRemove={() => {
                  // Handle widget removal if needed
                  console.log(`Remove widget: ${widget.id}`);
                }}
                onToggleVisibility={() =>
                  handleToggleWidgetVisibility(widget.id)
                }
                isVisible={layoutItem.isVisible}
              >
                <WidgetComponent {...(widget.defaultProps || {})} />
              </DashboardWidget>
            </div>
          );
        })}
      </ResponsiveGridLayout>

      {/* Add Widget Button (when customizing) */}
      {isCustomizing && (
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="flex items-center justify-center py-8">
            <AddWidgetDialog
              availableWidgets={widgets}
              onAddWidget={handleAddWidget}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
