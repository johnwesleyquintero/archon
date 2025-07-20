"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/types"
import { getUser } from "@/lib/supabase/auth"

export type JournalEntryRow = Database["public"]["Tables"]["journal_entries"]["Row"]
export type JournalEntryInsert = Database["public"]["Tables"]["journal_entries"]["Insert"]
export type JournalEntryUpdate = Database["public"]["Tables"]["journal_entries"]["Update"]
export type JournalTemplateRow = Database["public"]["Tables"]["journal_templates"]["Row"]

/**
 * Fetches all journal entries for the current user.
 */
export async function getJournalEntries(): Promise<JournalEntryRow[]> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.warn("[Supabase] Attempted to fetch journal entries without an authenticated user.")
    return []
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[Supabase] Error fetching journal entries:", error)
    throw new Error(`Failed to fetch journal entries: ${error.message}`)
  }
  return data
}

/**
 * Adds a new journal entry for the current user.
 */
export async function addJournalEntry(entry: Omit<JournalEntryInsert, "user_id">): Promise<JournalEntryRow | null> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.error("[Supabase] Attempted to add journal entry without an authenticated user.")
    throw new Error("Authentication required to add journal entry.")
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ ...entry, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error("[Supabase] Error adding journal entry:", error)
    throw new Error(`Failed to add journal entry: ${error.message}`)
  }
  return data
}

/**
 * Updates an existing journal entry.
 */
export async function updateJournalEntry(id: string, updates: JournalEntryUpdate): Promise<JournalEntryRow | null> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.error("[Supabase] Attempted to update journal entry without an authenticated user.")
    throw new Error("Authentication required to update journal entry.")
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user can only update their own entries
    .select()
    .single()

  if (error) {
    console.error(`[Supabase] Error updating journal entry ${id}:`, error)
    throw new Error(`Failed to update journal entry: ${error.message}`)
  }
  return data
}

/**
 * Deletes a journal entry.
 */
export async function deleteJournalEntry(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.error("[Supabase] Attempted to delete journal entry without an authenticated user.")
    throw new Error("Authentication required to delete journal entry.")
  }

  const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", user.id) // Ensure user can only delete their own entries

  if (error) {
    console.error(`[Supabase] Error deleting journal entry ${id}:`, error)
    throw new Error(`Failed to delete journal entry: ${error.message}`)
  }
  return true
}

/**
 * Fetches all journal templates.
 */
export async function getJournalTemplates(): Promise<JournalTemplateRow[]> {
  const supabase = await getSupabaseServerClient()
  // Templates are public, no user check needed
  const { data, error } = await supabase.from("journal_templates").select("*").order("name", { ascending: true })

  if (error) {
    console.error("[Supabase] Error fetching journal templates:", error)
    throw new Error(`Failed to fetch journal templates: ${error.message}`)
  }
  return data
}
