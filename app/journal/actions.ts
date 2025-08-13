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

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export const analyzeJournalEntry = withErrorHandling(
  async (content: string): Promise<string | null> => {
    // In a real application, you would get the API URL from environment variables
    const response = await fetch("http://localhost:3000/api/groq-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Analyze the following journal entry for key themes, overall sentiment, and potential action items. Provide a concise summary.",
          },
          {
            role: "user",
            content: content,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to analyze journal entry: ${response.statusText} - ${errorText}`,
      );
    }

    const result = (await response.json()) as GroqResponse;
    return result.choices[0]?.message?.content ?? null;
  },
);
