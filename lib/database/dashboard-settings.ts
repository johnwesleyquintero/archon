"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardSettingsRow, Json } from "@/lib/supabase/types";
import * as Sentry from "@sentry/nextjs";
// Removed unused import: const { logger } = Sentry;

import { WidgetLayout } from "@/app/types";
import { widgetLayoutsSchema } from "@/lib/zod-schemas";
import { revalidatePath } from "next/cache";
// Removed unused import: import { getErrorMessage } from "@/lib/error-utils";

export type DashboardSettings = {
  layout: WidgetLayout[];
  widget_configs: Record<string, { title: string }>;
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
    Sentry.logger.error(
      Sentry.logger
        .fmt`Failed to fetch dashboard settings for user ${userId}: ${error.message}`,
      {
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
    );
    Sentry.captureException(error);
    return null;
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
      widget_configs: Record<string, { title: string }>;
    };
    const parsedLayout = widgetLayoutsSchema.parse(storedLayout.layout);
    const parsedWidgetConfigs = (storedLayout.widget_configs || {}) as Record<
      string,
      { title: string }
    >;

    Sentry.logger.debug(
      Sentry.logger
        .fmt`Successfully parsed dashboard settings for user ${userId}.`,
    );
    return {
      layout: parsedLayout,
      widget_configs: parsedWidgetConfigs,
    };
  } catch (e) {
    Sentry.logger.error(
      Sentry.logger
        .fmt`Error parsing stored dashboard settings for user ${userId}: ${e instanceof Error ? e.message : String(e)}`,
      {
        rawSettings: data.layout,
        validationError: e,
      },
    );
    Sentry.captureException(e);
    return null;
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
    Sentry.logger.error(
      Sentry.logger
        .fmt`Failed to update dashboard settings for user ${userId}: ${error.message}`,
      {
        code: error.code,
        details: error.details,
        hint: error.hint,
        settings: settings,
      },
    );
    Sentry.captureException(error);
    return null;
  }

  return data;
}
