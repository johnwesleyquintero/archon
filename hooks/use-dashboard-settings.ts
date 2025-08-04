"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "react-grid-layout";
import { useAuth } from "@/contexts/auth-context";
import {
  getDashboardSettings,
  updateDashboardSettings,
  DashboardSettings,
} from "@/lib/database/dashboard-settings";
import { mergeLayouts } from "@/lib/dashboard-utils";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import * as Sentry from "@sentry/nextjs";

// Define a type that extends Layout with isVisible
interface DashboardLayoutItem extends Layout {
  isVisible: boolean;
  title: string;
}

interface UseDashboardSettingsResult {
  layout: DashboardLayoutItem[];
  widgetConfigs: Record<string, any>;
  isLoading: boolean;
  saveLayout: (
    newLayout: DashboardLayoutItem[],
    newWidgetConfigs: Record<string, any>,
  ) => Promise<void>;
  handleLayoutChange: (newLayout: Layout[]) => void;
  toggleWidgetVisibility: (id: string, isVisible: boolean) => void;
  resetLayout: () => Promise<void>;
}

export function useDashboardSettings(
  initialLayout: DashboardLayoutItem[],
  initialWidgetConfigs: Record<string, any>,
): UseDashboardSettingsResult {
  const { user } = useAuth();
  const [layout, setLayout] = useState<DashboardLayoutItem[]>(initialLayout);
  const [widgetConfigs, setWidgetConfigs] =
    useState<Record<string, any>>(initialWidgetConfigs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setLayout(DEFAULT_LAYOUT);
        setWidgetConfigs({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const storedSettings: DashboardSettings | null =
          await getDashboardSettings(user.id);
        if (storedSettings) {
          // Merge stored settings with default layout to handle new widgets or removed ones
          setLayout(mergeLayouts(storedSettings.layout, DEFAULT_LAYOUT));
          setWidgetConfigs(storedSettings.widget_configs || {});
        } else {
          setLayout(DEFAULT_LAYOUT);
          setWidgetConfigs({});
        }
      } catch (error: unknown) {
        console.error("Failed to load dashboard settings:", error);
        Sentry.captureException(error);
        setLayout(DEFAULT_LAYOUT); // Fallback to default on error
        setWidgetConfigs({});
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, [user]); // Reload when user changes

  const saveLayout = useCallback(
    async (
      newLayout: DashboardLayoutItem[],
      newWidgetConfigs: Record<string, any>,
    ) => {
      if (!user) {
        console.warn("Cannot save layout: User not authenticated.");
        return;
      }
      setIsLoading(true);
      try {
        await updateDashboardSettings(user.id, {
          layout: newLayout,
          widget_configs: newWidgetConfigs,
        });
        setLayout(newLayout); // Update local state after successful save
        setWidgetConfigs(newWidgetConfigs);
      } catch (error: unknown) {
        console.error("Failed to save dashboard settings:", error);
        Sentry.captureException(error);
        throw error; // Re-throw to allow component to handle
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      // Merge with current visibility states
      const updatedLayoutWithVisibility = newLayout.map((item) => {
        const existingItem = layout.find((l) => l.i === item.i);
        return {
          ...item,
          isVisible: existingItem?.isVisible ?? true, // Preserve visibility
          title: existingItem?.title ?? "", // Preserve title
        };
      });
      setLayout(updatedLayoutWithVisibility);
    },
    [layout],
  );

  const toggleWidgetVisibility = useCallback(
    (id: string, isVisible: boolean) => {
      setLayout((prevLayout) =>
        prevLayout.map((item) =>
          item.i === id ? { ...item, isVisible } : item,
        ),
      );
    },
    [],
  );

  const resetLayout = useCallback(async () => {
    if (!user) {
      console.warn("Cannot reset layout: User not authenticated.");
      setLayout(DEFAULT_LAYOUT);
      setWidgetConfigs({});
      return;
    }
    setIsLoading(true);
    try {
      // To reset, we can either delete the user's settings or update with default
      // For simplicity, let's update with the default layout and empty widget configs
      await updateDashboardSettings(user.id, {
        layout: DEFAULT_LAYOUT,
        widget_configs: {},
      });
      setLayout(DEFAULT_LAYOUT);
      setWidgetConfigs({});
    } catch (error: unknown) {
      console.error("Failed to reset dashboard settings:", error);
      Sentry.captureException(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    layout,
    widgetConfigs,
    isLoading,
    saveLayout,
    handleLayoutChange,
    toggleWidgetVisibility,
    resetLayout,
  };
}
