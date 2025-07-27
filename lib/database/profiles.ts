import { createServerSupabaseClient } from "../supabase/server";
import type { Database } from "../supabase/types";

export type ProfilesRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfilesUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/* ──────────────────────────────────────────────────────────
   Read
   ────────────────────────────────────────────────────────── */
export async function getProfile(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single<ProfilesRow>();

  if (error) {
    // If the error is "PGRST116" (no rows found for .single()), return null
    // Otherwise, re-throw the error
    if (error.code === "PGRST116") {
      return null;
    }
    console.error(
      "Error fetching profile:",
      error.message,
      error.code,
      error.details,
      error.hint,
    ); // Log the actual error details
    throw error;
  }
  // Ensure the returned data is a plain object for serialization by stringifying and parsing
  return JSON.parse(JSON.stringify(data)) as ProfilesRow;
}

/* ──────────────────────────────────────────────────────────
   Update / Upsert
   ────────────────────────────────────────────────────────── */
export async function updateProfile(id: string, patch: ProfilesUpdate) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .single<ProfilesRow>();

  if (error) throw error;
  return data;
}

/* Back-compat alias (some older code calls upsertProfile) */
export const upsertProfile = updateProfile;
