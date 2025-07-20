import { createClient } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/client";
import { Layout } from "react-grid-layout";

// Temporary type definitions since lib/supabase/types.ts is not generated
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

interface Database {
  public: {
    Tables: {
      user_dashboard_settings: {
        Row: {
          created_at: string;
          id: string;
          settings: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          settings: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          settings?: Json;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
  };
}

export async function getDashboardSettings(
  userId: string,
): Promise<Layout[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_dashboard_settings")
    .select("settings")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching dashboard settings:", error);
    return null;
  }

  // Cast the settings from Json to Layout[]
  return (data?.settings as Layout[]) || null;
}

export async function updateDashboardSettings(
  userId: string,
  settings: Layout[],
): Promise<
  Database["public"]["Tables"]["user_dashboard_settings"]["Row"] | null
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_dashboard_settings")
    .upsert(
      { user_id: userId, settings: settings as unknown as Json }, // Cast to Json for Supabase
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
