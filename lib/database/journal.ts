import { supabase } from "@/lib/supabase/server"
import type { Tables } from "@/lib/supabase/types"

/* ---------- Templates ---------- */

export async function getJournalTemplates() {
  const { data, error } = await supabase.from("journal_templates").select("*")
  if (error) throw error
  return data as Tables<"journal_templates">[]
}

/* ---------- Entries CRUD ---------- */

export async function getJournalEntries(userId: string) {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Tables<"journal_entries">[]
}

export async function addJournalEntry(
  userId: string,
  values: Omit<Tables<"journal_entries">, "id" | "user_id" | "created_at">,
) {
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ ...values, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data as Tables<"journal_entries">
}

export async function updateJournalEntry(
  entryId: string,
  values: Partial<Omit<Tables<"journal_entries">, "id" | "user_id">>,
) {
  const { data, error } = await supabase.from("journal_entries").update(values).eq("id", entryId).select().single()
  if (error) throw error
  return data as Tables<"journal_entries">
}

export async function deleteJournalEntry(entryId: string) {
  const { error } = await supabase.from("journal_entries").delete().eq("id", entryId)
  if (error) throw error
  return true
}
