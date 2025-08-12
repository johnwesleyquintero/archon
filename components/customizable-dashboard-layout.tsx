"use client";

import { useCallback, useMemo, useState, ComponentType } from "react";
import { Layout } from "react-grid-layout";

import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { WelcomeWidget } from "./dashboard/welcome-widget";
import { TodoList } from "./todo-list";
import { GoalManager } from "./goal-manager";
import { JournalList } from "./journal-list";
import { StatsGrid } from "./stats-grid";
import { AdvancedStatsGrid } from "./advanced-stats-grid";
import { PlaceholderInfographics } from "./placeholder-infographics";
import { DashboardCustomizationControls } from "./dashboard/controls/dashboard-customization-controls";
import {
  AllWidgetConfigs,
  WidgetConfig,
  Widget,
  TodoWidgetConfig,
} from "@/lib/types/widget-types";
import { DashboardGrid } from "./dashboard/dashboard-grid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WidgetConfigForm } from "./widget-config-form";
import { WeatherWidget } from "./weather-widget";

// Define a type that extends Layout with isVisible
export type DashboardLayoutItem = Layout & {
  isVisible: boolean;
  title: string;
};

interface CustomizableDashboardLayoutProps<P extends Record<string, unknown>> {
  widgets: Widget<P>[];
  initialLayout?: DashboardLayoutItem[];
  initialWidgetConfigs?: AllWidgetConfigs;
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
    useState<AllWidgetConfigs>(initialWidgetConfigs);

  const {
    layout: currentLayout,
    saveLayout,
    handleLayoutChange,
    toggleWidgetVisibility,
    resetLayout,
  } = useDashboardSettings(initialLayout, initialWidgetConfigs);

  const handleSaveLayout = useCallback(() => {
    void saveLayout(currentLayout, widgetConfigs)
      .then(() => setIsCustomizing(false))
      .catch((error: unknown) => {
        console.error(
          "Failed to save layout:",
          error instanceof Error ? error.message : String(error),
        );
      });
  }, [currentLayout, widgetConfigs, saveLayout]);

  const handleResetLayout = useCallback(() => {
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
  }, [resetLayout]);

  const toggleCustomization = useCallback(() => {
    setIsCustomizing((prev) => !prev);
  }, []);

  const handleToggleWidgetVisibility = useCallback(
    (id: string) => {
      const widgetToToggle = currentLayout.find((item) => item.i === id);
      if (widgetToToggle) {
        toggleWidgetVisibility(id, !widgetToToggle.isVisible);
      }
    },
    [currentLayout, toggleWidgetVisibility],
  );

  const [configuringWidgetId, setConfiguringWidgetId] = useState<string | null>(
    null,
  );

  const handleSaveWidgetConfig = useCallback(
    (widgetId: string, config: WidgetConfig) => {
      setWidgetConfigs((prevConfigs) => ({
        ...prevConfigs,
        [widgetId]: { ...prevConfigs[widgetId], ...config },
      }));
      setConfiguringWidgetId(null); // Close dialog after saving
    },
    [],
  );

  const handleOpenConfig = useCallback((widgetId: string) => {
    setConfiguringWidgetId(widgetId);
  }, []);

  const handleCloseConfig = useCallback(() => {
    setConfiguringWidgetId(null);
  }, []);

  const currentConfiguringWidget = useMemo(() => {
    if (!configuringWidgetId) return null;
    const widget = widgets.find((w) => w.id === configuringWidgetId);
    if (!widget) return null;
    return {
      id: widget.id,
      title: widget.title,
      config: widgetConfigs[configuringWidgetId] || widget.defaultProps || {},
    };
  }, [configuringWidgetId, widgets, widgetConfigs]);
  const visibleWidgets = useMemo(() => {
    return currentLayout.filter((item) => item.isVisible || isCustomizing);
  }, [currentLayout, isCustomizing]);

  const widgetComponentsMap: Record<string, ComponentType<P>> = useMemo(() => {
    return {
      "welcome-widget": WelcomeWidget,
      "todo-list": (props) => (
        <TodoList
          {...props}
          config={widgetConfigs["todo-list"] as TodoWidgetConfig}
        />
      ),
      "goal-manager": GoalManager,
      "journal-list": JournalList,
      "stats-grid": StatsGrid,
      "advanced-stats-grid": AdvancedStatsGrid,
      "placeholder-infographics": PlaceholderInfographics,
      "weather-widget": WeatherWidget,
    } as Record<string, ComponentType<P>>;
  }, [widgetConfigs]);

  const availableWidgets = useMemo(() => {
    return [
      ...widgets.map((w) => ({
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
      })),
      {
        id: "weather-widget",
        type: "weather",
        title: "Weather",
        description: "Displays current weather conditions.",
        componentId: "weather-widget",
        minW: 2,
        minH: 2,
        defaultProps: {
          location: "London",
          temperatureUnit: "C",
        } as unknown as P,
      },
    ];
  }, [widgets]);

  const handleAddWidget = useCallback(
    (widgetId: string) => {
      const widgetToAdd = widgets.find((w) => w.id === widgetId);
      if (widgetToAdd) {
        const isAlreadyAdded = currentLayout.some(
          (item) => item.i === widgetId,
        );

        if (!isAlreadyAdded) {
          const newLayoutItem: DashboardLayoutItem = {
            i: widgetToAdd.id,
            x: 0,
            y: Infinity,
            w: widgetToAdd.minW || 4,
            h: widgetToAdd.minH || 2,
            isVisible: true,
            title: widgetToAdd.title,
          };
          const updatedLayout = [...currentLayout, newLayoutItem];
          handleLayoutChange(updatedLayout);

          setWidgetConfigs((prevConfigs) => ({
            ...prevConfigs,
            [widgetId]: {
              ...(widgetToAdd.defaultProps as unknown as WidgetConfig),
              title: widgetToAdd.title,
            },
          }));
        } else {
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
      <DashboardCustomizationControls
        isCustomizing={isCustomizing}
        onToggleCustomization={toggleCustomization}
        onSaveLayout={handleSaveLayout}
        onCancelCustomization={() => setIsCustomizing(false)}
        onResetLayout={handleResetLayout}
        userName={userName}
        availableWidgets={availableWidgets}
        onAddWidget={handleAddWidget}
      />

      <DashboardGrid
        visibleWidgets={visibleWidgets}
        isCustomizing={isCustomizing}
        onLayoutChange={handleLayoutChange}
        widgetComponentsMap={widgetComponentsMap}
        availableWidgets={availableWidgets}
        widgetConfigs={widgetConfigs}
        onToggleWidgetVisibility={handleToggleWidgetVisibility}
        onConfigureWidget={handleOpenConfig}
      />

      {configuringWidgetId && currentConfiguringWidget && (
        <Dialog open={!!configuringWidgetId} onOpenChange={handleCloseConfig}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                Configure {currentConfiguringWidget.title}
              </DialogTitle>
            </DialogHeader>
            <WidgetConfigForm
              config={currentConfiguringWidget.config}
              onSave={(newConfig) =>
                handleSaveWidgetConfig(configuringWidgetId, newConfig)
              }
              onCancel={handleCloseConfig}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
