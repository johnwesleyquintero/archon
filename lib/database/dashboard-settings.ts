import { createClient } from "@/lib/supabase/client";
import { DashboardSettingsRow, Json } from "@/lib/supabase/types";
import { WidgetLayout } from "@/hooks/use-dashboard-settings";

export async function getDashboardSettings(
  userId: string,
): Promise<WidgetLayout[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dashboard_settings")
    .select("layout")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching dashboard settings:", error);
    return null;
  }

  // Cast the layout from Json to WidgetLayout[]
  return (data?.layout as WidgetLayout[] | null) || null;
}

export async function updateDashboardSettings(
  userId: string,
  settings: WidgetLayout[],
): Promise<DashboardSettingsRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dashboard_settings")
    .upsert(
      { user_id: userId, layout: settings as unknown as Json }, // Cast to Json for Supabase
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) {
    console.error("Error updating dashboard settings:", error);
    return null;
  }

  return data;
}
