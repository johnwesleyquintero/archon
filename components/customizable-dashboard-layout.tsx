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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  defaultProps?: P;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

// Widget type definitions

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

interface CustomizableDashboardLayoutProps<P extends Record<string, unknown>> {
  widgets: Widget<P>[];
  initialLayout?: DashboardLayoutItem[];
  initialWidgetConfigs?: Record<string, { title: string }>;
  className?: string;
  dashboardSettingsError?: string | null;
  goalsError?: string | null;
  userName?: string;
}

export function CustomizableDashboardLayout<P extends Record<string, unknown>>({
  widgets,
  initialLayout = [],
  initialWidgetConfigs = {},
  className = "",
  dashboardSettingsError = null,
  goalsError = null,
  userName,
}: CustomizableDashboardLayoutProps<P>) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgetConfigs, setWidgetConfigs] =
    useState<Record<string, { title: string }>>(initialWidgetConfigs);

  const {
    layout: currentLayout,
    isLoading,
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

  const availableWidgets = useMemo(() => {
    return widgets.map((w: Widget<P>) => ({
      id: w.id,
      type: w.type,
      title: w.title,
      description: w.description,
      component: w.component,
      defaultProps: w.defaultProps,
    }));
  }, [widgets]);

  const handleAddWidget = useCallback(
    (widgetId: string) => {
      const widgetToAdd = widgets.find((w: Widget<P>) => w.id === widgetId);
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
      {dashboardSettingsError && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard Settings</AlertTitle>
          <AlertDescription>
            {dashboardSettingsError}. Please try refreshing the page. If the
            issue persists, contact support.
          </AlertDescription>
        </Alert>
      )}

      {goalsError && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error Loading Goals</AlertTitle>
          <AlertDescription>
            {goalsError}. Goals might not be displayed correctly. Please try
            refreshing the page. If the issue persists, contact support.
          </AlertDescription>
        </Alert>
      )}

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
        rowHeight={30}
        isDraggable={isCustomizing}
        isResizable={isCustomizing}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        compactType="vertical"
        preventCollision={false}
        autoSize={true}
      >
        {visibleWidgets.map((layoutItem) => {
          const widget = widgets.find((w) => w.id === layoutItem.i);
          if (!widget) return null;

          const WidgetComponent = widget.component;
          // Use the title from layoutItem if available, otherwise fallback to widget.title
          const displayTitle = widgetConfigs[widget.id]?.title ?? widget.title;
          return (
            <div key={widget.id} className="widget-container">
              <DashboardWidget
                title={displayTitle} // Use the title from the layout item
                isCustomizing={isCustomizing}
                onRemove={() => {
                  // Handle widget removal if needed
                }}
                onToggleVisibility={() =>
                  handleToggleWidgetVisibility(widget.id)
                }
                isVisible={layoutItem.isVisible}
                _widgetId={widget.id}
                onSaveConfig={(config) =>
                  handleSaveWidgetConfig(widget.id, config)
                }
              >
                <WidgetComponent
                  {...(widget.defaultProps || ({} as P))}
                  userName={userName}
                />
              </DashboardWidget>
            </div>
          );
        })}
      </ResponsiveGridLayout>

      {/* Add Widget Button (when customizing) */}
      {isCustomizing && (
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="flex items-center justify-center py-8">
            <AddWidgetDialog<P>
              availableWidgets={availableWidgets}
              onAddWidget={(widgetId: string) => void handleAddWidget(widgetId)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
