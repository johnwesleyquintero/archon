"use server"

import { supabase } from "../supabase/server"
import { getUser } from "../supabase/auth"
import type { Database } from "../supabase/types"

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"]
type JournalEntryInsert = Database["public"]["Tables"]["journal_entries"]["Insert"]
type JournalEntryUpdate = Database["public"]["Tables"]["journal_entries"]["Update"]

type JournalTemplate = Database["public"]["Tables"]["journal_templates"]["Row"]

/* -------------------------------------------------------------------------- */
/*                                  Queries                                   */
/* -------------------------------------------------------------------------- */

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const user = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getJournalEntries]", error.message)
    return []
  }
  return data
}

export async function getJournalTemplates(): Promise<JournalTemplate[]> {
  const user = await getUser() // may be null for signed-out visitors

  const { data, error } = await supabase
    .from("journal_templates")
    .select("*")
    .or(
      `user_id.is.null${user ? `,user_id.eq.${user.id}` : ""}`, // public templates + user’s own
    )
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[getJournalTemplates]", error.message)
    return []
  }
  return data
}

/* -------------------------------------------------------------------------- */
/*                                 Mutations                                  */
/* -------------------------------------------------------------------------- */

export async function addJournalEntry(entryData: Omit<JournalEntryInsert, "user_id">): Promise<JournalEntry | null> {
  const user = await getUser()
  if (!user) throw new Error("User not authenticated.")

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ ...entryData, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error("[addJournalEntry]", error.message)
    throw new Error(`Failed to add journal entry: ${error.message}`)
  }
  return data
}

export async function updateJournalEntry(id: string, entryData: JournalEntryUpdate): Promise<JournalEntry | null> {
  const user = await getUser()
  if (!user) throw new Error("User not authenticated.")

  const { data, error } = await supabase
    .from("journal_entries")
    .update(entryData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("[updateJournalEntry]", error.message)
    throw new Error(`Failed to update journal entry: ${error.message}`)
  }
  return data
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const user = await getUser()
  if (!user) throw new Error("User not authenticated.")

  const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("[deleteJournalEntry]", error.message)
    throw new Error(`Failed to delete journal entry: ${error.message}`)
  }
}
