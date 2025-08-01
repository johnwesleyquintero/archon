"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/app/journal/actions";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { useToast } from "@/components/ui/use-toast";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
type JournalInsert = Database["public"]["Tables"]["journal_entries"]["Insert"];

export function useJournal(
  initialEntries: JournalEntry[] = [],
  userId: string,
) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedEntryId && entries.length > 0) {
      setSelectedEntryId(entries[0].id);
    }
  }, [entries, selectedEntryId]);

  useEffect(() => {
    const client = createClient();
    const channel = client
      .channel("realtime-journal")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "journal_entries",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newEntry = payload.new as JournalEntry;
            setEntries((prev) => [newEntry, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            const updatedEntry = payload.new as JournalEntry;
            setEntries((prev) =>
              prev.map((entry) =>
                entry.id === updatedEntry.id ? updatedEntry : entry,
              ),
            );
          }
          if (payload.eventType === "DELETE") {
            const deletedEntry = payload.old as { id: string };
            setEntries((prev) =>
              prev.filter((entry) => entry.id !== deletedEntry.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [userId]);

  const selectedEntry =
    entries.find((entry) => entry.id === selectedEntryId) || null;

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntryId(entryId);
    setHasUnsavedChanges(false);
  };

  const handleCreateEntry = useCallback(() => {
    startTransition(async () => {
      try {
        const newEntryData: JournalInsert = {
          title: "New Entry",
          content: "",
          attachments: [],
          user_id: userId,
        };
        const newEntry = await addJournalEntry(newEntryData);
        if (newEntry !== null) {
          setEntries((prev) => [newEntry, ...prev]);
          setSelectedEntryId(newEntry.id);
          toast({
            title: "Success!",
            description: "New journal entry created.",
          });
        } else {
          throw new Error("Failed to create new journal entry.");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create new journal entry.",
          variant: "destructive",
        });
      } finally {
        setHasUnsavedChanges(false);
      }
    });
  }, [userId, toast]);

  const handleSaveEntry = useCallback(() => {
    if (selectedEntry && hasUnsavedChanges) {
      startTransition(async () => {
        try {
          const { id, title, content, attachments } = selectedEntry;
          const updatedEntry = await updateJournalEntry(id, {
            title,
            content,
            attachments,
          });
          if (updatedEntry !== null) {
            setEntries((prev) =>
              prev.map((entry) =>
                entry.id === updatedEntry.id ? updatedEntry : entry,
              ),
            );
            toast({
              title: "Success!",
              description: "Journal entry saved.",
            });
          } else {
            throw new Error("Failed to save journal entry.");
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to save journal entry.",
            variant: "destructive",
          });
        } finally {
          setHasUnsavedChanges(false);
        }
      });
    }
  }, [selectedEntry, hasUnsavedChanges, toast]);

  const handleDeleteEntry = useCallback(
    async (entryId: string) => {
      if (
        window.confirm("Are you sure you want to delete this journal entry?")
      ) {
        try {
          await deleteJournalEntry(entryId);
          setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
          if (selectedEntryId === entryId) {
            setSelectedEntryId(null);
          }
          toast({
            title: "Success!",
            description: "Journal entry deleted.",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete journal entry.",
            variant: "destructive",
          });
        }
      }
    },
    [selectedEntryId, toast],
  );

  return {
    entries,
    selectedEntry,
    selectedEntryId,
    hasUnsavedChanges,
    isMutating: isPending,
    handleSelectEntry,
    handleCreateEntry,
    handleSaveEntry,
    handleDeleteEntry,
    setEntries,
    setHasUnsavedChanges,
  };
}
