"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardSettingsRow, Json } from "@/lib/supabase/types";
import * as Sentry from "@sentry/nextjs";
const { logger } = Sentry;

import { WidgetLayout } from "@/app/types";
import { widgetLayoutsSchema } from "@/lib/zod-schemas";
import { revalidatePath } from "next/cache";

export async function getDashboardSettings(
  userId: string,
): Promise<WidgetLayout[] | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("dashboard_settings")
    .select("layout")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logger.error(logger.fmt`Failed to fetch dashboard settings for user ${userId}: ${error.message}`, {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    Sentry.captureException(error);
    return null;
  }

  if (!data?.layout) {
    logger.info(logger.fmt`No existing dashboard settings found for user ${userId}.`);
    return null;
  }

  try {
    const parsedLayout = widgetLayoutsSchema.parse(data.layout as unknown);
    logger.debug(logger.fmt`Successfully parsed dashboard settings for user ${userId}.`);
    return parsedLayout;
  } catch (e) {
    logger.error(logger.fmt`Error parsing stored dashboard settings for user ${userId}: ${e instanceof Error ? e.message : String(e)}`, {
      rawLayout: data.layout,
      validationError: e,
    });
    Sentry.captureException(e);
    return null;
  }
}

export async function updateDashboardSettings(
  userId: string,
  settings: WidgetLayout[],
): Promise<DashboardSettingsRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("dashboard_settings")
    .upsert(
      { user_id: userId, layout: settings as unknown as Json }, // Cast to Json for Supabase
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (!error) {
    revalidatePath("/dashboard"); // Revalidate the dashboard page to show updated settings
  }

  if (error) {
    logger.error(logger.fmt`Failed to update dashboard settings for user ${userId}: ${error.message}`, {
      code: error.code,
      details: error.details,
      hint: error.hint,
      settings: settings,
    });
    Sentry.captureException(error);
    return null;
  }

  return data;
}
