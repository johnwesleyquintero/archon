import { getSupabaseServerClient } from "../supabase/server";
import type { Database } from "../supabase/types";

type ProfilesRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfilesUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/* ──────────────────────────────────────────────────────────
   Read
   ────────────────────────────────────────────────────────── */
export async function getProfile(id: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single<ProfilesRow>();

  if (error) throw error;
  return data;
}

/* ──────────────────────────────────────────────────────────
   Update / Upsert
   ────────────────────────────────────────────────────────── */
export async function updateProfile(id: string, patch: ProfilesUpdate) {
  const supabase = await getSupabaseServerClient();
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
