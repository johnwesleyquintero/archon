"use client";

import {
  useCallback,
  useMemo,
  useState,
  ComponentType,
  useEffect,
} from "react";
import { Layout } from "react-grid-layout"; // Remove Responsive and WidthProvider

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { getGoals } from "@/lib/database/goals";
import { getTasks } from "@/lib/database/tasks";
import { Goal } from "@/lib/types/goal";
import { Task } from "@/lib/types/task";
import {
  AllWidgetConfigs,
  WidgetConfig,
  Widget,
  TodoWidgetConfig,
} from "@/lib/types/widget-types";

import { AdvancedStatsGrid } from "./advanced-stats-grid";
import { AdvancedWidgetConfigForm } from "./advanced-widget-config-form";
import { DashboardCustomizationControls } from "./dashboard/controls/dashboard-customization-controls";
import { DailyFocusWidget } from "./dashboard/daily-focus-widget";
import { DashboardGrid } from "./dashboard/dashboard-grid";
import { HabitTrackerWidget } from "./dashboard/habit-tracker-widget";
import { WelcomeWidget } from "./dashboard/welcome-widget";
import { GoalManager } from "./goal-manager";
import { JournalList } from "./journal-list";
import { StatsGrid } from "./stats-grid";
import { TodoList } from "./todo-list";
import { WeatherWidget } from "./weather-widget";
import { GoalProgressWidget } from "./dashboard/goal-progress-widget"; // Import GoalProgressWidget

// Define a type that extends Layout with isVisible
export type DashboardLayoutItem = Layout & {
  isVisible: boolean;
  title: string;
  widgetType: string; // Add widgetType to DashboardLayoutItem
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
  const { user } = useAuth();
  const [dailyFocusData, setDailyFocusData] = useState<{
    goal: Goal | null;
    tasks: Task[];
    prompt: string | null;
    loading: boolean;
    error: string | null;
  }>({
    goal: null,
    tasks: [],
    prompt: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchDailyFocusData() {
      if (!user) {
        setDailyFocusData((prev) => ({ ...prev, loading: false }));
        return;
      }

      setDailyFocusData((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [goalResult, tasksResult, promptResult] =
          await Promise.allSettled([
            getGoals(user.id, {
              is_completed: false,
              sortBy: "updated_at",
              ascending: false,
              limit: 1,
            }),
            getTasks(
              {
                isCompleted: false,
                dueDate: "today",
              },
              { sortBy: "priority", sortOrder: "desc" },
            ),
            fetch("/api/groq-chat/prompt").then(
              (res) => res.json() as Promise<{ prompt: string }>,
            ),
          ]);

        const goal =
          goalResult.status === "fulfilled" && goalResult.value.length > 0
            ? goalResult.value[0]
            : null;
        const tasks =
          tasksResult.status === "fulfilled" ? tasksResult.value : [];
        const prompt =
          promptResult.status === "fulfilled" && promptResult.value.prompt
            ? promptResult.value.prompt
            : null;

        setDailyFocusData({ goal, tasks, prompt, loading: false, error: null });

        if (
          goalResult.status === "rejected" ||
          tasksResult.status === "rejected" ||
          promptResult.status === "rejected"
        ) {
          console.error("Error fetching daily focus data:", {
            goalResult,
            tasksResult,
            promptResult,
          });
          throw new Error("Partial or complete data fetch failed.");
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error("Failed to fetch daily focus data:", errorMessage);
        setDailyFocusData((prev) => ({
          ...prev,
          loading: false,
          error: "Could not load daily focus data.",
        }));
      }
    }

    void fetchDailyFocusData();
  }, [user]);

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
      "weather-widget": WeatherWidget,
      "habit-tracker-widget": HabitTrackerWidget,
      "daily-focus-widget": (props) => (
        <DailyFocusWidget {...props} {...dailyFocusData} />
      ),
      "goal-progress-widget": GoalProgressWidget, // Add GoalProgressWidget
    } as Record<string, ComponentType<P>>;
  }, [widgetConfigs, dailyFocusData]);

  const widgetFormFields: Record<
    string,
    {
      key: string;
      label: string;
      type: "switch" | "select" | "text";
      options?: { value: string; label: string }[];
    }[]
  > = {
    "todo-list": [
      { key: "showCompleted", label: "Show Completed Tasks", type: "switch" },
      {
        key: "sortBy",
        label: "Sort By",
        type: "select",
        options: [
          { value: "createdAt", label: "Date Created" },
          { value: "dueDate", label: "Due Date" },
          { value: "priority", label: "Priority" },
        ],
      },
    ],
    "weather-widget": [
      { key: "location", label: "Location", type: "text" },
      {
        key: "temperatureUnit",
        label: "Unit",
        type: "select",
        options: [
          { value: "C", label: "Celsius" },
          { value: "F", label: "Fahrenheit" },
        ],
      },
    ],
  };

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
        },
      },
      {
        id: "daily-focus-widget",
        type: "daily-focus",
        title: "Daily Focus",
        description: "Focus on tasks for your highest priority goal.",
        componentId: "daily-focus-widget",
        minW: 4,
        minH: 2,
        defaultProps: {},
      },
      {
        id: "habit-tracker-widget",
        type: "habit-tracker",
        title: "Habit Tracker",
        description: "Track your daily habits and streaks.",
        componentId: "habit-tracker-widget",
        minW: 2,
        minH: 3,
        defaultProps: {},
      },
      {
        id: "goal-progress-widget",
        type: "goal-progress",
        title: "Goal Progress",
        description: "Displays progress on your active goals.",
        componentId: "goal-progress-widget",
        minW: 2,
        minH: 3,
        defaultProps: {},
      },
    ] as Widget<P>[];
  }, [widgets]);

  const handleAddWidget = useCallback(
    (widgetId: string) => {
      const widgetToAdd = availableWidgets.find((w) => w.id === widgetId);
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
            widgetType: widgetToAdd.type, // Set widgetType
          };
          const updatedLayout = [...currentLayout, newLayoutItem];
          handleLayoutChange(updatedLayout);

          setWidgetConfigs((prevConfigs) => ({
            ...prevConfigs,
            [widgetToAdd.id]: {
              // Use widgetToAdd.id here
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
    [
      currentLayout,
      availableWidgets,
      handleLayoutChange,
      toggleWidgetVisibility,
      setWidgetConfigs, // Add setWidgetConfigs to dependencies
    ],
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

      <DashboardGrid<P>
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
            <AdvancedWidgetConfigForm
              config={currentConfiguringWidget.config}
              onSave={(newConfig) =>
                handleSaveWidgetConfig(configuringWidgetId, newConfig)
              }
              onCancel={handleCloseConfig}
              formFields={widgetFormFields[configuringWidgetId] || []}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
