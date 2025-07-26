"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/lib/database/journal";
import type { Database } from "@/lib/supabase/types";
import { useAuth } from "@/contexts/auth-context";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
type JournalEntryInsert =
  Database["public"]["Tables"]["journal_entries"]["Insert"];
type JournalEntryUpdate =
  Database["public"]["Tables"]["journal_entries"]["Update"];

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getJournalEntries(user.id);
      setEntries(data || []);
    } catch (err: any) {
      console.error("Failed to fetch journal entries:", err);
      setError(new Error(err.message || "Failed to load journal entries."));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntryMutation = useCallback(
    async (newEntryData: Omit<JournalEntryInsert, "user_id">) => {
      if (!user?.id) {
        throw new Error("User must be logged in to add journal entries");
      }

      startTransition(async () => {
        setError(null);
        try {
          // Optimistic update
          const tempId = `temp-${Date.now()}`;
          const optimisticEntry: JournalEntry = {
            id: tempId,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            title: newEntryData.title,
            content: newEntryData.content || null,
            attachments: newEntryData.attachments || [],
          };
          setEntries((prev) => [optimisticEntry, ...prev]);

          const data = await addJournalEntry({
            ...newEntryData,
            user_id: user.id,
          });

          if (!data) {
            throw new Error("Failed to add journal entry.");
          }

          setEntries((prev) =>
            prev.map((entry) => (entry.id === tempId ? data : entry)),
          );
        } catch (err: any) {
          console.error("Failed to add journal entry:", err);
          setError(new Error(err.message || "Failed to add journal entry."));
          setEntries((prev) =>
            prev.filter((entry) => !entry.id.startsWith("temp-")),
          ); // Rollback optimistic update
        }
      });
    },
    [],
  );

  const updateEntryMutation = useCallback(
    async (id: string, updates: JournalEntryUpdate) => {
      startTransition(async () => {
        setError(null);
        const originalEntries = entries; // Snapshot for rollback
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  ...updates,
                  updated_at: new Date().toISOString(), // Optimistic update for updated_at
                }
              : entry,
          ),
        );
        try {
          const data = await updateJournalEntry(id, updates);
          if (!data) {
            throw new Error("Failed to update journal entry.");
          }
          // If data is returned, update with actual server data
          setEntries((prev) =>
            prev.map((entry) => (entry.id === id ? data : entry)),
          );
        } catch (err: any) {
          console.error("Failed to update journal entry:", err);
          setError(new Error(err.message || "Failed to update journal entry."));
          setEntries(originalEntries); // Rollback
        }
      });
    },
    [entries],
  );

  const deleteEntryMutation = useCallback(
    async (id: string) => {
      startTransition(async () => {
        setError(null);
        const originalEntries = entries; // Snapshot for rollback
        setEntries((prev) => prev.filter((entry) => entry.id !== id)); // Optimistic delete
        try {
          await deleteJournalEntry(id);
        } catch (err: any) {
          console.error("Failed to delete journal entry:", err);
          setError(new Error(err.message || "Failed to delete journal entry."));
          setEntries(originalEntries); // Rollback
        }
      });
    },
    [entries],
  );

  return {
    entries,
    isLoading,
    error,
    isMutating: isPending,
    addEntry: addEntryMutation,
    updateEntry: updateEntryMutation,
    deleteEntry: deleteEntryMutation,
    refetchEntries: fetchEntries,
  };
}
