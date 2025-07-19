import { supabase } from "@/lib/supabase/server"
import type { Tables } from "@/lib/supabase/types"

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
  if (error) throw error
  return data as Tables<"profiles">
}

export async function updateProfile(userId: string, payload: Partial<Omit<Tables<"profiles">, "id">>) {
  const { data, error } = await supabase.from("profiles").update(payload).eq("id", userId).select().single()
  if (error) throw error
  return data as Tables<"profiles">
}

/* alias kept for backward-compat */
export const upsertProfile = updateProfile
