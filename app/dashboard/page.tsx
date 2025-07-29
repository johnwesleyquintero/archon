import * as Sentry from "@sentry/nextjs";
import { EmptyState } from "@/components/empty-state";
import { CustomizableDashboardLayout } from "@/components/customizable-dashboard-layout";
import { getDashboardSettings } from "@/lib/database/dashboard-settings";
import { getGoals } from "@/lib/database/goals";
import { getAvailableWidgets } from "@/lib/constants";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import { mergeLayouts } from "@/lib/dashboard-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialGoals = user ? await getGoals() : [];
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
    console.error("Failed to load dashboard settings:", error);
    Sentry.captureException(error);
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          title="Failed to Load Dashboard"
          description="There was an error loading your dashboard settings. Please try again later."
        />
      </div>
    );
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
