"use client";

import { useCallback, useMemo, useState, ComponentType } from "react";
import { Layout } from "react-grid-layout";

import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { WelcomeWidget } from "./dashboard/welcome-widget";
import { TodoList } from "./todo-list";
import { GoalTracker } from "./goal-tracker";
import { GoalsDisplay } from "./goals-display";
import { JournalList } from "./journal-list";
import { StatsGrid } from "./stats-grid";
import { AdvancedStatsGrid } from "./advanced-stats-grid";
import { PlaceholderInfographics } from "./placeholder-infographics";
import { DashboardCustomizationControls } from "./dashboard/controls/dashboard-customization-controls";
import { DashboardGrid } from "./dashboard/dashboard-grid";

// Define a type that extends Layout with isVisible
export type DashboardLayoutItem = Layout & {
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
  componentId: string;
  defaultProps?: P;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

interface CustomizableDashboardLayoutProps<P extends Record<string, unknown>> {
  widgets: Widget<P>[];
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

  const widgetComponentsMap: Record<string, ComponentType<P>> = useMemo(() => {
    return {
      "welcome-widget": WelcomeWidget,
      "todo-list": TodoList,
      "goal-tracker": GoalTracker,
      "goals-display": GoalsDisplay,
      "journal-list": JournalList,
      "stats-grid": StatsGrid,
      "advanced-stats-grid": AdvancedStatsGrid,
      "placeholder-infographics": PlaceholderInfographics,
    } as Record<string, ComponentType<P>>;
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
              ...widgetToAdd.defaultProps,
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
        onSaveWidgetConfig={handleSaveWidgetConfig}
      />
    </div>
  );
}
