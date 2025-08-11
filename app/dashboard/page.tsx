import { Suspense } from "react";
import * as Sentry from "@sentry/nextjs";
import { CustomizableDashboardLayout } from "@/components/customizable-dashboard-layout";
import { DashboardCriticalError } from "@/components/dashboard/dashboard-critical-error";
import { getDashboardSettings } from "@/lib/database/dashboard-settings";
import { getGoals } from "@/lib/database/goals";
import { getAvailableWidgets } from "@/lib/constants";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import type { Database } from "@/lib/supabase/types";
import { DashboardLoadingSkeleton } from "@/components/dashboard/dashboard-loading-skeleton";
import { redirect } from "next/navigation";

type Goal = Database["public"]["Tables"]["goals"]["Row"] & {
  tags: string[] | null;
};
import { mergeLayouts } from "@/lib/dashboard-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const userName =
    (user?.user_metadata?.full_name as string) || user?.email || "User";

  let initialGoals: Goal[] = [];
  let initialLayout = DEFAULT_LAYOUT;
  let initialWidgetConfigs: Record<string, { title: string }> = {};

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
      initialLayout = mergeLayouts(storedSettings.layout, DEFAULT_LAYOUT);
      initialWidgetConfigs =
        (storedSettings.widget_configs as Record<string, { title: string }>) ||
        {};
    }
  } else {
    Sentry.captureException(settingsResult.reason, {
      extra: { context: "Dashboard Settings Loading" },
    });
  }

  const availableWidgets = getAvailableWidgets(initialGoals);

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
