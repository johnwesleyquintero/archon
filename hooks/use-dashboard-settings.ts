"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "react-grid-layout";
import { useAuth } from "@/contexts/auth-context";
import {
  getDashboardSettings,
  updateDashboardSettings,
} from "@/lib/database/dashboard-settings";
import { mergeLayouts } from "@/lib/dashboard-utils";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import * as Sentry from "@sentry/nextjs";

// Define a type that extends Layout with isVisible
interface DashboardLayoutItem extends Layout {
  isVisible: boolean;
}

interface UseDashboardSettingsResult {
  layout: DashboardLayoutItem[];
  isLoading: boolean;
  saveLayout: (newLayout: DashboardLayoutItem[]) => Promise<void>;
  handleLayoutChange: (newLayout: Layout[]) => void;
  toggleWidgetVisibility: (id: string, isVisible: boolean) => void;
  resetLayout: () => Promise<void>;
}

export function useDashboardSettings(
  initialLayout: DashboardLayoutItem[],
): UseDashboardSettingsResult {
  const { user } = useAuth();
  const [layout, setLayout] = useState<DashboardLayoutItem[]>(initialLayout);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setLayout(DEFAULT_LAYOUT);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const storedSettings = await getDashboardSettings(user.id);
        if (storedSettings) {
          // Merge stored settings with default layout to handle new widgets or removed ones
          setLayout(mergeLayouts(storedSettings, DEFAULT_LAYOUT));
        } else {
          setLayout(DEFAULT_LAYOUT);
        }
      } catch (error: unknown) {
        console.error("Failed to load dashboard settings:", error);
        Sentry.captureException(error);
        setLayout(DEFAULT_LAYOUT); // Fallback to default on error
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, [user]); // Reload when user changes

  const saveLayout = useCallback(
    async (newLayout: DashboardLayoutItem[]) => {
      if (!user) {
        console.warn("Cannot save layout: User not authenticated.");
        return;
      }
      setIsLoading(true);
      try {
        await updateDashboardSettings(user.id, newLayout);
        setLayout(newLayout); // Update local state after successful save
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
      return;
    }
    setIsLoading(true);
    try {
      // To reset, we can either delete the user's settings or update with default
      // For simplicity, let's update with the default layout
      await updateDashboardSettings(user.id, DEFAULT_LAYOUT);
      setLayout(DEFAULT_LAYOUT);
    } catch (error: unknown) {
      console.error("Failed to reset dashboard settings:", error);
      Sentry.captureException(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    layout,
    isLoading,
    saveLayout,
    handleLayoutChange,
    toggleWidgetVisibility,
    resetLayout,
  };
}
