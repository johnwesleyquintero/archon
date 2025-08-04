import { Suspense } from "react";
import * as Sentry from "@sentry/nextjs";
import { CustomizableDashboardLayout } from "@/components/customizable-dashboard-layout";
import { DashboardErrorToaster } from "@/components/dashboard/dashboard-error-toaster";
import { DashboardCriticalError } from "@/components/dashboard/dashboard-critical-error";
import { getDashboardSettings } from "@/lib/database/dashboard-settings";
import { getGoals } from "@/lib/database/goals";
import { getAvailableWidgets } from "@/lib/constants";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import type { Database } from "@/lib/supabase/types";
import { DashboardLoadingSkeleton } from "@/components/dashboard/dashboard-loading-skeleton";
import { redirect } from "next/navigation";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
import { mergeLayouts } from "@/lib/dashboard-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-utils";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialGoals: Goal[] = [];
  let goalsError: string | null = null;
  let initialLayout = DEFAULT_LAYOUT;
  let initialWidgetConfigs: Record<string, { title: string }> = {};
  let dashboardSettingsError: string | null = null;

  if (user) {
    const [goalsResult, settingsResult] = await Promise.allSettled([
      getGoals(user.id),
      getDashboardSettings(user.id),
    ]);

    if (goalsResult.status === "fulfilled") {
      initialGoals = goalsResult.value;
    } else {
      goalsError = getErrorMessage(goalsResult.reason);
      Sentry.captureException(goalsResult.reason, {
        extra: { context: "Goals Loading" },
      });
    }

    if (settingsResult.status === "fulfilled") {
      const storedSettings = settingsResult.value;
      if (storedSettings) {
        initialLayout = mergeLayouts(storedSettings.layout, DEFAULT_LAYOUT);
        initialWidgetConfigs = storedSettings.widget_configs || {};
      }
    } else {
      dashboardSettingsError = getErrorMessage(settingsResult.reason);
      Sentry.captureException(settingsResult.reason, {
        extra: { context: "Dashboard Settings Loading" },
      });
    }
  }
  const availableWidgets = getAvailableWidgets(initialGoals);

  if (goalsError && dashboardSettingsError) {
    Sentry.captureException(goalsError);
    Sentry.captureException(dashboardSettingsError);
    return (
      <DashboardCriticalError
        title="Failed to load dashboard"
        description="We encountered a critical error while loading your dashboard data. Please try again."
        onRetry={() => redirect("/dashboard")}
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <CustomizableDashboardLayout
          widgets={availableWidgets}
          initialLayout={initialLayout}
          initialWidgetConfigs={initialWidgetConfigs}
          className="min-h-screen"
        />
        <DashboardErrorToaster
          goalsError={goalsError}
          dashboardSettingsError={dashboardSettingsError}
        />
      </Suspense>
    </div>
  );
}
