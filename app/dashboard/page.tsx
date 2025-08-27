import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { CustomizableDashboardLayout } from "@/components/customizable-dashboard-layout";
import { DashboardCriticalError } from "@/components/dashboard/dashboard-critical-error";
import { DashboardLoadingSkeleton } from "@/components/dashboard/dashboard-loading-skeleton";
import { getAvailableWidgets } from "@/lib/constants";
import { mergeLayouts } from "@/lib/dashboard-utils";
import { getDashboardSettings } from "@/lib/database/dashboard-settings";
import { getGoals } from "@/lib/database/goals";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { AllWidgetConfigs, Widget } from "@/lib/types/widget-types";

type Goal = Database["public"]["Tables"]["goals"]["Row"] & {
  tags: string[] | null;
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const userName =
    (user.user_metadata?.full_name as string) || user.email || "User";

  let initialGoals: Goal[] = [];
  let initialLayout = DEFAULT_LAYOUT;
  let initialWidgetConfigs: AllWidgetConfigs = {};

  // The rest of the data fetching logic remains the same,
  // but now it's guaranteed that `user` is not null.
  const [goalsResult, settingsResult] = await Promise.allSettled([
    getGoals(user.id),
    getDashboardSettings(user.id),
  ]);

  if (goalsResult.status === "fulfilled") {
    initialGoals = goalsResult.value;
  } else {
    Sentry.captureException(goalsResult.reason, {
      extra: { context: "Goals Loading" },
    });
  }

  if (settingsResult.status === "fulfilled") {
    const storedSettings = settingsResult.value;
    if (storedSettings) {
      /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      initialLayout = mergeLayouts(
        storedSettings.layout as any,
        DEFAULT_LAYOUT,
      );
      initialWidgetConfigs = (storedSettings as any).widget_configs || {};
      /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  } else {
    Sentry.captureException(settingsResult.reason, {
      extra: { context: "Dashboard Settings Loading" },
    });
  }

  const availableWidgets: Widget[] = getAvailableWidgets(initialGoals);

  // If there are critical errors, display a critical error message
  // The individual errors are now handled by toasts in useDashboardSettings
  if (
    goalsResult.status === "rejected" &&
    settingsResult.status === "rejected"
  ) {
    Sentry.captureException(goalsResult.reason);
    Sentry.captureException(settingsResult.reason);
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
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */}
        <CustomizableDashboardLayout
          widgets={availableWidgets}
          initialLayout={initialLayout}
          initialWidgetConfigs={initialWidgetConfigs}
          className="min-h-screen"
          userName={userName}
        />
      </Suspense>
    </div>
  );
}
