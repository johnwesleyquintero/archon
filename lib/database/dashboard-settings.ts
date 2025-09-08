"use server";

import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";

import { WidgetLayout } from "@/app/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Json, Tables } from "@/lib/supabase/types";
import { AllWidgetConfigs } from "@/lib/types/widget-types";
import { widgetLayoutsSchema } from "@/lib/zod-schemas";

type DashboardSettingsRow = Tables<"dashboard_settings">;

export type DashboardSettings = {
  layout: WidgetLayout[];
  widget_configs: AllWidgetConfigs;
};

export async function getDashboardSettings(
  userId: string,
): Promise<DashboardSettings | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("dashboard_settings")
    .select("layout")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch dashboard settings for user ${userId}`);
  }

  if (!data?.layout) {
    Sentry.logger.info(
      Sentry.logger
        .fmt`No existing dashboard settings found for user ${userId}.`,
    );
    return null;
  }

  try {
    const storedLayout = data.layout as unknown as {
      layout: WidgetLayout[];
      widget_configs: AllWidgetConfigs;
    };
    const parsedLayout = widgetLayoutsSchema.parse(
      storedLayout.layout,
    ) as WidgetLayout[];
    const parsedWidgetConfigs = storedLayout.widget_configs || {};

    Sentry.logger.debug(
      Sentry.logger
        .fmt`Successfully parsed dashboard settings for user ${userId}.`,
    );
    return {
      layout: parsedLayout,
      widget_configs: parsedWidgetConfigs,
    };
  } catch (error) {
    console.error(
      `Error parsing stored dashboard settings for user ${userId}`,
      error,
    );
    throw new Error(
      `Error parsing stored dashboard settings for user ${userId}`,
    );
  }
}

export async function updateDashboardSettings(
  userId: string,
  settings: DashboardSettings,
): Promise<DashboardSettingsRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("dashboard_settings")
    .upsert(
      { user_id: userId, layout: settings as unknown as Json }, // Store the entire settings object in the layout column
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (!error) {
    revalidatePath("/dashboard"); // Revalidate the dashboard page to show updated settings
  }

  if (error) {
    throw new Error(`Failed to update dashboard settings for user ${userId}`);
  }

  return data;
}
