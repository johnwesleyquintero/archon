import { Suspense } from "react";
import * as Sentry from "@sentry/nextjs";
import { CustomizableDashboardLayout } from "@/components/customizable-dashboard-layout";
import { getDashboardSettings } from "@/lib/database/dashboard-settings";
import { getGoals } from "@/lib/database/goals";
import { getAvailableWidgets } from "@/lib/constants";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import type { Database } from "@/lib/supabase/types";
import { DashboardLoadingSkeleton } from "@/components/dashboard/dashboard-loading-skeleton";


type Goal = Database["public"]["Tables"]["goals"]["Row"];
import { mergeLayouts } from "@/lib/dashboard-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-utils";
import { DashboardSettings } from "@/lib/database/dashboard-settings";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialGoals: Goal[] = [];
  let goalsError: string | null = null;
  try {
    if (user) {
      initialGoals = await getGoals();
    }
  }
  catch (error: unknown) {
    goalsError = getErrorMessage(error);
    Sentry.captureException(error, {
      extra: {
        context: "Goals Loading",
        errorMessage: goalsError,
      },
    });
  }
  const availableWidgets = getAvailableWidgets(initialGoals);

  let initialLayout = DEFAULT_LAYOUT;
  let initialWidgetConfigs: Record<string, any> = {};
  let dashboardSettingsError: string | null = null;
  try {
    if (user) {
      const storedSettings: DashboardSettings | null = await getDashboardSettings(user.id);
      if (storedSettings) {
        initialLayout = mergeLayouts(storedSettings.layout, DEFAULT_LAYOUT);
        initialWidgetConfigs = storedSettings.widget_configs || {};
      }
    }
  }
  catch (error: unknown) {
    dashboardSettingsError = getErrorMessage(error);
    Sentry.captureException(error, {
      extra: {
        context: "Dashboard Settings Loading",
        errorMessage: dashboardSettingsError,
      },
    });
  }

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <CustomizableDashboardLayout
          widgets={availableWidgets}
          initialLayout={initialLayout}
          initialWidgetConfigs={initialWidgetConfigs}
          dashboardSettingsError={dashboardSettingsError}
          goalsError={goalsError}
          className="min-h-screen"
        />
      </Suspense>
    </div>
  );
}
