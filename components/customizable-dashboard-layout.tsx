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
  component: React.ComponentType<any>;
  defaultProps?: any;
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

  const { saveLayout, isLoading } = useDashboardSettings();

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
                onClick={handleSaveLayout}
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
        {widgets.map((widget) => {
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

// CSS for react-grid-layout (add to your global CSS)
export const gridLayoutStyles = `
.react-grid-layout {
  position: relative;
}

.react-grid-item {
  transition: all 200ms ease;
  transition-property: left, top;
}

.react-grid-item img {
  pointer-events: none;
  user-select: none;
}

.react-grid-item.cssTransforms {
  transition-property: transform;
}

.react-grid-item.resizing {
  transition: none;
  z-index: 1;
  will-change: width, height;
}

.react-grid-item.react-draggable-dragging {
  transition: none;
  z-index: 3;
  will-change: transform;
}

.react-grid-item.dropping {
  visibility: hidden;
}

.react-grid-item.react-grid-placeholder {
  background: rgb(59 130 246 / 0.15);
  opacity: 0.2;
  transition-duration: 100ms;
  z-index: 2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  border: 2px dashed rgb(59 130 246 / 0.4);
  border-radius: 8px;
}

.react-grid-item.react-grid-placeholder.placeholder-active {
  opacity: 0.3;
}

.react-resizable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  bottom: 0;
  right: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjOTk5IiBkPSJtMTUgMTJjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xeiIvPgo8L3N2Zz4K');
  background-position: bottom right;
  padding: 0 3px 3px 0;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  cursor: se-resize;
}

.react-resizable-handle::after {
  content: '';
  position: absolute;
  right: 3px;
  bottom: 3px;
  width: 5px;
  height: 5px;
  border-right: 2px solid rgba(0, 0, 0, 0.4);
  border-bottom: 2px solid rgba(0, 0, 0, 0.4);
}

.widget-container {
  height: 100%;
}
`;
