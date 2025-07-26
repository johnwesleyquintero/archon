"use server";

import {
  addJournalEntry as dbAddJournalEntry,
  updateJournalEntry as dbUpdateJournalEntry,
  deleteJournalEntry as dbDeleteJournalEntry,
} from "@/lib/database/journal";
import type { Database } from "@/lib/supabase/types";

type JournalInsert = Database["public"]["Tables"]["journal_entries"]["Insert"];
type JournalUpdate = Database["public"]["Tables"]["journal_entries"]["Update"];

export async function addJournalEntry(entry: JournalInsert) {
  try {
    const newEntry = await dbAddJournalEntry(entry);
    return newEntry;
  } catch (error) {
    console.error("Error adding journal entry:", error);
    return null;
  }
}

export async function updateJournalEntry(id: string, patch: JournalUpdate) {
  try {
    const updatedEntry = await dbUpdateJournalEntry(id, patch);
    return updatedEntry;
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return null;
  }
}

export async function deleteJournalEntry(id: string) {
  try {
    await dbDeleteJournalEntry(id);
  } catch (error) {
    console.error("Error deleting journal entry:", error);
  }
}
