import { createClient } from "@/lib/supabase/server"
import type { Profile, TablesInsert, TablesUpdate } from "@/lib/supabase/types"

export async function createProfile(profile: TablesInsert<"profiles">): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("profiles").insert(profile).select().single()

  if (error) {
    console.error("Error creating profile:", error)
    return null
  }

  return data
}

export async function updateProfile(id: string, updates: TablesUpdate<"profiles">): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }

  return data
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (error) {
    console.error("Error fetching profile by username:", error)
    return null
  }

  return profile
}
