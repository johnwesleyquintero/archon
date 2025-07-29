"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "react-grid-layout";
import {
  getDashboardSettings,
  updateDashboardSettings,
} from "@/lib/database/dashboard-settings";
import { useAuth } from "@/contexts/auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import * as Sentry from "@sentry/nextjs";
import { WidgetLayout } from "@/app/types";
import { DEFAULT_LAYOUT } from "@/lib/layouts";

export function useDashboardSettings(
  initialLayout: WidgetLayout[] = DEFAULT_LAYOUT,
) {
  const { user } = useAuth();
  const [layout, setLayout] = useState<WidgetLayout[]>(initialLayout);
  const [isLoading, setIsLoading] = useState(false); // No longer loading initially, as we have initialLayout

  const saveLayoutToDb = useCallback(
    async (currentLayout: WidgetLayout[]) => {
      if (user?.id) {
        try {
          await updateDashboardSettings(user.id, currentLayout);
        } catch (error) {
          console.error("Failed to save dashboard settings:", error);
          Sentry.captureException(error);
        }
      }
    },
    [user?.id],
  );

  const debouncedSaveLayout = useDebounce(saveLayoutToDb, 1000);

  useEffect(() => {
    // Set the initial layout when the component mounts or initialLayout changes
    setLayout(initialLayout);
  }, [initialLayout]);

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

  const resetLayout = useCallback(async () => {
    setLayout(DEFAULT_LAYOUT);
    await saveLayoutToDb(DEFAULT_LAYOUT);
  }, [saveLayoutToDb]);

  return {
    layout,
    isLoading,
    saveLayout: debouncedSaveLayout,
    handleLayoutChange,
    toggleWidgetVisibility,
    resetLayout,
  };
}
