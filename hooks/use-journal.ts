import { useState, useEffect, useCallback, useTransition } from "react";

import {
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/app/journal/actions";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/lib/types/journal"; // Removed Database, Json

type JournalInsert = Omit<
  JournalEntry,
  "id" | "created_at" | "updated_at" | "associated_tasks" | "associated_goals"
> & { user_id: string };
type JournalUpdate = Partial<
  Omit<JournalInsert, "associated_tasks" | "associated_goals">
> & { user_id?: string };

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
      const newEntryData: JournalInsert = {
        title: "New Entry",
        content: "",
        attachments: [],
        tags: [],
        user_id: userId,
      };
      try {
        const result = await addJournalEntry(newEntryData);
        if (result && "error" in result) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else {
          setEntries((prev) => [result, ...prev]);
          setSelectedEntryId(result.id);
          toast({
            title: "Success!",
            description: "New journal entry created.",
          });
          setHasUnsavedChanges(false);
        }
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to create journal entry.");
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [userId, toast]);

  const handleSaveEntry = useCallback(() => {
    startTransition(async () => {
      if (selectedEntry && hasUnsavedChanges) {
        const { id, title, content, attachments, tags, user_id } =
          selectedEntry;
        try {
          const result = await updateJournalEntry(id, {
            title,
            content,
            attachments,
            tags,
            user_id,
          } as JournalUpdate);
          if (result && "error" in result) {
            toast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            });
          } else {
            setEntries((prev) =>
              prev.map((entry) => (entry.id === result.id ? result : entry)),
            );
            toast({
              title: "Success!",
              description: "Journal entry saved.",
            });
            setHasUnsavedChanges(false);
          }
        } catch (err) {
          const error =
            err instanceof Error
              ? err
              : new Error("Failed to save journal entry.");
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // If no save operation is performed, return a resolved promise to satisfy require-await
        return Promise.resolve();
      }
    });
  }, [selectedEntry, hasUnsavedChanges, toast]);

  const handleDeleteEntry = useCallback(
    (entryId: string) => {
      if (
        window.confirm("Are you sure you want to delete this journal entry?")
      ) {
        startTransition(async () => {
          const result = await deleteJournalEntry(entryId);
          if (result && "error" in result) {
            toast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            });
          } else if (result?.success) {
            setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
            if (selectedEntryId === entryId) {
              setSelectedEntryId(null);
            }
            toast({
              title: "Success!",
              description: "Journal entry deleted.",
            });
          }
        });
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
