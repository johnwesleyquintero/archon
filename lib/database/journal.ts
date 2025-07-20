import { getSupabaseServerClient } from "../supabase/server"; // Import the async function
import type { Database } from "../supabase/types";

type JournalRow = Database["public"]["Tables"]["journal_entries"]["Row"];
type JournalInsert = Database["public"]["Tables"]["journal_entries"]["Insert"];
type JournalUpdate = Database["public"]["Tables"]["journal_entries"]["Update"];
type TemplateRow = Database["public"]["Tables"]["journal_templates"]["Row"];

/* ─────────────────────────
   CRUD – Journal entries
   ───────────────────────── */
export async function getJournalEntries(userId: string) {
  const supabase = await getSupabaseServerClient(); // Call the async function
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as JournalRow[];
}

export async function addJournalEntry(entry: JournalInsert) {
  const supabase = await getSupabaseServerClient(); // Call the async function
  const { data, error } = await supabase
    .from("journal_entries")
    .insert(entry)
    .single<JournalRow>();

  if (error) throw error;
  return data;
}

export async function updateJournalEntry(id: string, patch: JournalUpdate) {
  const supabase = await getSupabaseServerClient(); // Call the async function
  const { data, error } = await supabase
    .from("journal_entries")
    .update(patch)
    .eq("id", id)
    .single<JournalRow>();

  if (error) throw error;
  return data;
}

export async function deleteJournalEntry(id: string) {
  const supabase = await getSupabaseServerClient(); // Call the async function
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/* ─────────────────────────
   Templates
   ───────────────────────── */
export async function getJournalTemplates() {
  const supabase = await getSupabaseServerClient(); // Call the async function
  const { data, error } = await supabase
    .from("journal_templates")
    .select("*")
    .order("title", { ascending: true });

  if (error) throw error;
  return data as TemplateRow[];
}
