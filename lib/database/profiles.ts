"use server"

import { supabase } from "../supabase/server"
import { getUser } from "../supabase/auth"
import type { Database } from "../supabase/types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

/* -------------------------------------------------------------------------- */
/*                                  Queries                                   */
/* -------------------------------------------------------------------------- */

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser()
  if (!user) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("[getProfile]", error.message)
    return null
  }
  return data
}

/* -------------------------------------------------------------------------- */
/*                                 Mutations                                  */
/* -------------------------------------------------------------------------- */

export async function createProfile(profileData: ProfileInsert): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").insert(profileData).select().single()

  if (error) {
    console.error("[createProfile]", error.message)
    return null
  }
  return data
}

/**
 * updateProfile – kept for backward-compatibility with the UI.
 * Uses a simple upsert so callers don’t have to worry if the row exists.
 */
export async function updateProfile(profileData: ProfileUpdate): Promise<Profile | null> {
  const user = await getUser()
  if (!user) throw new Error("User not authenticated.")

  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", user.id).select().single()

  if (error) {
    console.error("[updateProfile]", error.message)
    throw new Error(`Failed to update profile: ${error.message}`)
  }
  return data
}

/* Alias kept for any newer code that already migrated */
export const upsertProfile = updateProfile
