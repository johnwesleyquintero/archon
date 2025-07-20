"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/types"
import { getUser } from "@/lib/supabase/auth" // Import getUser from auth.ts

export type ProfilesRow = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfilesInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfilesUpdate = Database["public"]["Tables"]["profiles"]["Update"]

/**
 * Fetches a user's profile from the database.
 * @param userId The ID of the user whose profile to fetch.
 * @returns The user's profile data, or null if not found or an error occurs.
 */
export async function getProfile(userId: string): Promise<ProfilesRow | null> {
  const supabase = await getSupabaseServerClient()
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      // If no rows found (PGRST116), it means the profile doesn't exist yet, which is not an error for new users.
      if (error.code === "PGRST116") {
        console.log(`[Supabase] Profile not found for user ${userId}.`)
        return null
      }
      console.error(`[Supabase] Error fetching profile for user ${userId}:`, error)
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return data
  } catch (err: any) {
    console.error(`[Supabase] Unexpected error in getProfile for user ${userId}:`, err)
    return null // Return null on any unexpected error
  }
}

/**
 * Inserts a new profile into the database.
 * @param profileData The data for the new profile.
 * @returns The newly created profile data, or null if an error occurs.
 */
export async function insertProfile(profileData: ProfilesInsert): Promise<ProfilesRow | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("profiles").insert(profileData).select().single()

  if (error) {
    console.error("[Supabase] Error inserting profile:", error)
    throw new Error(`Failed to insert profile: ${error.message}`)
  }
  return data
}

/**
 * Updates an existing profile in the database.
 * @param userId The ID of the user whose profile to update.
 * @param updates The partial data to update the profile with.
 * @returns The updated profile data, or null if an error occurs.
 */
export async function updateProfile(userId: string, updates: ProfilesUpdate): Promise<ProfilesRow | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) {
    console.error("[Supabase] Error updating profile:", error)
    throw new Error(`Failed to update profile: ${error.message}`)
  }
  return data
}

/**
 * Upserts a profile (inserts if not exists, updates if exists).
 * @param profileData The profile data to upsert.
 * @returns The upserted profile data, or null if an error occurs.
 */
export async function upsertProfile(profileData: ProfilesInsert): Promise<ProfilesRow | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("profiles").upsert(profileData).select().single()

  if (error) {
    console.error("[Supabase] Error upserting profile:", error)
    throw new Error(`Failed to upsert profile: ${error.message}`)
  }
  return data
}

/**
 * Deletes a user's profile from the database.
 * @param userId The ID of the user whose profile to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export async function deleteProfile(userId: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("profiles").delete().eq("id", userId)

  if (error) {
    console.error("[Supabase] Error deleting profile:", error)
    throw new Error(`Failed to delete profile: ${error.message}`)
  }
  return true
}

/**
 * Server Action to get the current user's profile.
 * This can be called directly from Client Components.
 */
export async function getCurrentUserProfile(): Promise<ProfilesRow | null> {
  const user = await getUser()
  if (!user) {
    return null
  }
  return getProfile(user.id)
}
