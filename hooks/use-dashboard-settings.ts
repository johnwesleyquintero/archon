"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "react-grid-layout";
import {
  getDashboardSettings,
  updateDashboardSettings,
} from "@/lib/database/dashboard-settings";
import { useAuth } from "@/contexts/auth-context";
import { useDebounce } from "@/hooks/use-debounce";

export interface WidgetLayout extends Layout {
  isVisible: boolean;
}

export const DEFAULT_LAYOUT: WidgetLayout[] = [
  { i: "stats-overview", x: 0, y: 0, w: 4, h: 2, isVisible: true },
  { i: "goal-tracker", x: 4, y: 0, w: 4, h: 3, isVisible: true },
  { i: "todo-list", x: 8, y: 0, w: 4, h: 3, isVisible: true },
];

export function useDashboardSettings() {
  const { user } = useAuth();
  const [layout, setLayout] = useState<WidgetLayout[]>(DEFAULT_LAYOUT);
  const [isLoading, setIsLoading] = useState(true);

  const saveLayoutToDb = useCallback(
    async (currentLayout: WidgetLayout[]) => {
      if (user?.id) {
        try {
          await updateDashboardSettings(user.id, currentLayout);
        } catch (error) {
          console.error("Failed to save dashboard settings:", error);
        }
      }
    },
    [user?.id],
  );

  const debouncedSaveLayout = useDebounce(saveLayoutToDb, 1000);

  useEffect(() => {
    if (user?.id) {
      const fetchSettings = async () => {
        setIsLoading(true);
        try {
          const storedLayout = await getDashboardSettings(user.id);
          if (storedLayout) {
            // Merge stored layout with default to ensure all widgets are present
            const mergedLayout = DEFAULT_LAYOUT.map((defaultWidget) => {
              const storedWidget = storedLayout.find(
                (sl) => sl.i === defaultWidget.i,
              );
              return { ...defaultWidget, ...storedWidget };
            });
            setLayout(mergedLayout);
          } else {
            setLayout(DEFAULT_LAYOUT);
          }
        } catch (error) {
          console.error("Failed to fetch dashboard settings:", error);
          setLayout(DEFAULT_LAYOUT); // Fallback to default on error
        } finally {
          setIsLoading(false);
        }
      };
      void fetchSettings();
    }
  }, [user?.id]);

  useEffect(() => {
    // Only save if layout is different from default and not during initial load
    if (
      !isLoading &&
      JSON.stringify(layout) !== JSON.stringify(DEFAULT_LAYOUT)
    ) {
      debouncedSaveLayout(layout);
    }
  }, [layout, isLoading, debouncedSaveLayout]);

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      // Preserve isVisible property when layout changes
      const updatedLayout = newLayout.map((newItem) => {
        const existingItem = layout.find((item) => item.i === newItem.i);
        return {
          ...newItem,
          isVisible: existingItem ? existingItem.isVisible : true,
        };
      });
      setLayout(updatedLayout as WidgetLayout[]);
    },
    [layout],
  );

  const toggleWidgetVisibility = useCallback(
    (id: string, isVisible: boolean) => {
      setLayout((prevLayout) =>
        prevLayout.map((widget) =>
          widget.i === id ? { ...widget, isVisible } : widget,
        ),
      );
    },
    [],
  );

  return {
    layout,
    isLoading,
    saveLayout: debouncedSaveLayout,
    handleLayoutChange,
    toggleWidgetVisibility,
  };
}
