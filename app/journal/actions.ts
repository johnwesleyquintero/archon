"use server";

import {
  addJournalEntry as dbAddJournalEntry,
  updateJournalEntry as dbUpdateJournalEntry,
  deleteJournalEntry as dbDeleteJournalEntry,
} from "@/lib/database/journal";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

import {
  journalEntryInsertSchema,
  journalEntryUpdateSchema,
} from "@/lib/zod-schemas";

import { withErrorHandling } from "@/lib/error-utils";

type JournalInsert = Database["public"]["Tables"]["journal_entries"]["Insert"];
type JournalUpdate = Database["public"]["Tables"]["journal_entries"]["Update"];

export const addJournalEntry = withErrorHandling(
  async (entry: JournalInsert) => {
    const validatedEntry = journalEntryInsertSchema.parse(entry);
    const newEntry = await dbAddJournalEntry(validatedEntry);
    revalidatePath("/journal");
    return newEntry;
  },
);

export const updateJournalEntry = withErrorHandling(
  async (id: string, patch: JournalUpdate) => {
    const validatedPatch = journalEntryUpdateSchema.parse(patch);
    const updatedEntry = await dbUpdateJournalEntry(id, validatedPatch);
    revalidatePath("/journal");
    return updatedEntry;
  },
);

export const deleteJournalEntry = withErrorHandling(async (id: string) => {
  await dbDeleteJournalEntry(id);
  revalidatePath("/journal");
  return { success: true }; // Return success indicator
});
