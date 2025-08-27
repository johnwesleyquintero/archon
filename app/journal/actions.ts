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
  async (content: string): Promise<string | { error: string }> => {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "Analyze the following journal entry and provide a concise summary, key themes, and any actionable insights. Focus on productivity, personal growth, and emotional well-being.",
            },
            {
              role: "user",
              content: content,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorData: unknown = await response.json();
      let errorMessage = `Groq API error: ${response.status} ${response.statusText}`;
      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "message" in errorData &&
        typeof errorData.message === "string"
      ) {
        errorMessage += ` - ${errorData.message}`;
      } else {
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      }
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as GroqResponse;
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No analysis result from Groq API.");
    }

    return data.choices[0].message.content;
  },
);
