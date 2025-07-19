"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/supabase/auth"
import type { Database } from "@/lib/supabase/types"

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"]
type JournalEntryInsert = Database["public"]["Tables"]["journal_entries"]["Insert"]
type JournalEntryUpdate = Database["public"]["Tables"]["journal_entries"]["Update"]

/**
 * NEW: JournalTemplate row type.
 * Adjust the table name if your schema differs.
 */
type JournalTemplate = Database["public"]["Tables"]["journal_templates"]["Row"]

const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

/* -------------------------------------------------------------------------- */
/*                                  Queries                                   */
/* -------------------------------------------------------------------------- */

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const supabase = createSupabaseServerClient()
  const user = await getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching journal entries:", error)
    return []
  }

  return data
}

/**
 * NEW: Fetch all available journal templates.
 * If templates are user-specific, add `.eq("user_id", user.id)` like in
 * `getJournalEntries()`.
 */
export async function getJournalTemplates(): Promise<JournalTemplate[]> {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase.from("journal_templates").select("*").order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching journal templates:", error)
    return []
  }

  return data
}

/* -------------------------------------------------------------------------- */
/*                                 Mutations                                  */
/* -------------------------------------------------------------------------- */

export async function addJournalEntry(entryData: Omit<JournalEntryInsert, "user_id">): Promise<JournalEntry | null> {
  const supabase = createSupabaseServerClient()
  const user = await getUser()
  if (!user) throw new Error("User not authenticated.")

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ ...entryData, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error("Error adding journal entry:", error)
    throw new Error(`Failed to add journal entry: ${error.message}`)
  }

  revalidatePath("/journal")
  return data
}

export async function updateJournalEntry(id: string, entryData: JournalEntryUpdate): Promise<JournalEntry | null> {
  const supabase = createSupabaseServerClient()
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
    console.error("Error updating journal entry:", error)
    throw new Error(`Failed to update journal entry: ${error.message}`)
  }

  revalidatePath("/journal")
  return data
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const supabase = createSupabaseServerClient()
  const user = await getUser()
  if (!user) throw new Error("User not authenticated.")

  const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting journal entry:", error)
    throw new Error(`Failed to delete journal entry: ${error.message}`)
  }

  revalidatePath("/journal")
}
