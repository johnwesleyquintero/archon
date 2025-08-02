import * as Sentry from "@sentry/nextjs";
import { CustomizableDashboardLayout } from "@/components/customizable-dashboard-layout";
import { getDashboardSettings } from "@/lib/database/dashboard-settings";
import { getGoals } from "@/lib/database/goals";
import { getAvailableWidgets } from "@/lib/constants";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import type { Database } from "@/lib/supabase/types";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
import { mergeLayouts } from "@/lib/dashboard-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils";

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
  } catch (error: unknown) {
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
  let dashboardSettingsError: string | null = null;
  try {
    if (user) {
      const storedLayout = await getDashboardSettings(user.id);
      if (storedLayout) {
        initialLayout = mergeLayouts(storedLayout, DEFAULT_LAYOUT);
      }
    }
  } catch (error: unknown) {
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
      <CustomizableDashboardLayout
        widgets={availableWidgets}
        initialLayout={initialLayout}
        dashboardSettingsError={dashboardSettingsError}
        goalsError={goalsError}
        className="min-h-screen"
      />
    </div>
  );
}
