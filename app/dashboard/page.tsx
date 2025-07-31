"use client";
import * as Sentry from "@sentry/nextjs";
const { logger } = Sentry;
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { CustomizableDashboardLayout } from "@/components/customizable-dashboard-layout";
import { getDashboardSettings } from "@/lib/database/dashboard-settings";
import { getGoals } from "@/lib/database/goals";
import { getAvailableWidgets } from "@/lib/constants";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import type { Database } from "@/lib/supabase/types";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
import { mergeLayouts } from "@/lib/dashboard-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialGoals: Goal[] = [];
  if (user) {
    initialGoals = await getGoals();
  }
  const availableWidgets = getAvailableWidgets(initialGoals);

  let initialLayout = DEFAULT_LAYOUT;
  try {
    if (user) {
      const storedLayout = await getDashboardSettings(user.id);
      if (storedLayout) {
        initialLayout = mergeLayouts(storedLayout, DEFAULT_LAYOUT);
      }
    }
  } catch (error: unknown) {
    logger.error("Failed to load dashboard settings:", {
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error);
    toast.error("Failed to load dashboard settings. Using default layout.");
  }

  return (
    <div className="container mx-auto p-6">
      <CustomizableDashboardLayout
        widgets={availableWidgets}
        initialLayout={initialLayout}
        className="min-h-screen"
      />
    </div>
  );
}
