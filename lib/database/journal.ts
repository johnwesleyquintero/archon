import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { Database } from "../supabase/types.js";

type JournalRow = Database["public"]["Tables"]["journal_entries"]["Row"];
type JournalInsert = Database["public"]["Tables"]["journal_entries"]["Insert"];
type JournalUpdate = Database["public"]["Tables"]["journal_entries"]["Update"];

/* ─────────────────────────
   CRUD – Journal entries
   ───────────────────────── */
export async function getJournalEntries(
  userId: string,
  filters: { search?: string; tags?: string[] } = {},
) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`,
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains("tags", filters.tags);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as JournalRow[];
}

export async function addJournalEntry(entry: JournalInsert) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .insert(entry)
    .single<JournalRow>();

  if (error) throw error;
  return data;
}

export async function updateJournalEntry(id: string, patch: JournalUpdate) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .update(patch)
    .eq("id", id)
    .single<JournalRow>();

  if (error) throw error;
  return data;
}

export async function deleteJournalEntry(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
