"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardSettingsRow, Json } from "@/lib/supabase/types";
import * as Sentry from "@sentry/nextjs";
const { logger } = Sentry;

import { WidgetLayout } from "@/app/types";
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
    logger.error("Error fetching dashboard settings:", {
      error: error.message,
    });
    Sentry.captureException(error);
    return null;
  }

  // Cast the layout from Json to WidgetLayout[]
  return (data?.layout as WidgetLayout[] | null) || null;
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
    logger.error("Error updating dashboard settings:", {
      error: error.message,
    });
    Sentry.captureException(error);
    return null;
  }

  return data;
}
