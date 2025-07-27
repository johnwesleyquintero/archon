"use client";

import type React from "react";
import { useState, useCallback, useMemo } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, X, GripVertical, Plus, Save, RotateCcw } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import {
  useDashboardSettings,
  type WidgetLayout,
} from "@/hooks/use-dashboard-settings";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define a type that extends Layout with isVisible
type DashboardLayoutItem = Layout & {
  isVisible: boolean;
};

// Widget type definitions
export interface Widget {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<Record<string, unknown>>;
  defaultProps?: Record<string, unknown>;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

interface CustomizableDashboardLayoutProps {
  widgets: Widget[];
  initialLayout?: DashboardLayoutItem[];
  onLayoutChange?: (layout: Layout[]) => void;
  className?: string;
}

export function CustomizableDashboardLayout({
  widgets,
  initialLayout = [],
  onLayoutChange,
  className = "",
}: CustomizableDashboardLayoutProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [layouts, setLayouts] = useState<{
    [key: string]: DashboardLayoutItem[];
  }>({
    lg: initialLayout.map((item) => ({
      ...item,
      isVisible: item.isVisible ?? true,
    })),
  });

  const { saveLayout, isLoading, toggleWidgetVisibility } =
    useDashboardSettings();

  // Generate default layout if none provided
  const defaultLayout = useMemo(() => {
    if (initialLayout.length > 0) return initialLayout;

    return widgets.map((widget, index) => ({
      i: widget.id,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * 4,
      w: widget.minW || 4,
      h: widget.minH || 4,
      minW: widget.minW || 2,
      minH: widget.minH || 2,
      maxW: widget.maxW || 12,
      maxH: widget.maxH || 8,
      isVisible: true,
    }));
  }, [widgets, initialLayout]);

  const currentLayout = (
    layouts.lg?.length > 0 ? layouts.lg : defaultLayout
  ) as WidgetLayout[];

  const handleLayoutChange = useCallback(
    (layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
      // Ensure that the layout items always have the isVisible property
      const updatedLayouts = Object.fromEntries(
        Object.entries(allLayouts).map(([breakpoint, layoutArr]) => [
          breakpoint,
          layoutArr.map((item) => ({
            ...item,
            isVisible: (item as DashboardLayoutItem).isVisible ?? true,
          })),
        ]),
      );
      setLayouts(updatedLayouts);
      onLayoutChange?.(layout);
    },
    [onLayoutChange],
  );

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

  const handleResetLayout = () => {
    const resetLayouts = {
      lg: defaultLayout.map((item) => ({
        ...item,
        isVisible: item.isVisible ?? true,
      })),
    };
    setLayouts(resetLayouts);
    onLayoutChange?.(defaultLayout);
  };

  const toggleCustomization = () => {
    setIsCustomizing(!isCustomizing);
  };

  const handleToggleWidgetVisibility = useCallback(
    (id: string) => {
      const widgetToToggle = currentLayout.find((item) => item.i === id);
      if (widgetToToggle) {
        const newVisibility = !widgetToToggle.isVisible;
        const updatedLayout = currentLayout.map((item) =>
          item.i === id ? { ...item, isVisible: newVisibility } : item,
        );
        setLayouts({ lg: updatedLayout });
        toggleWidgetVisibility(id, newVisibility); // Call the hook's function
      }
    },
    [currentLayout, toggleWidgetVisibility],
  );

  const visibleWidgets = useMemo(() => {
    return currentLayout.filter((item) => item.isVisible || isCustomizing);
  }, [currentLayout, isCustomizing]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Control Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          {isCustomizing && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Customizing
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isCustomizing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetLayout}
                className="flex items-center space-x-1 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCustomizing(false)}
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                size="sm"
                onClick={() => void handleSaveLayout()}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? "Saving..." : "Save"}</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCustomization}
              className="flex items-center space-x-1 bg-transparent"
            >
              <Settings className="h-4 w-4" />
              <span>Customize</span>
            </Button>
          )}
        </div>
      </div>

      {/* Help Text */}
      {isCustomizing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-2">
              <GripVertical className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Customization Mode Active
                </p>
                <p className="text-sm text-blue-600">
                  Drag widgets to rearrange them, resize by dragging corners, or
                  use the controls in each widget header.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
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
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600"
            >
              <Plus className="h-5 w-5" />
              <span>Add Widget</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
