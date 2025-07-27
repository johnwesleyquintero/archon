"use client";

import { useState, useEffect } from "react";
import { JournalList } from "@/components/journal-list";
import { JournalEditorWithAttachments } from "@/components/journal-editor-with-attachments";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/lib/supabase/types";
import {
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/app/journal/actions";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
type JournalInsert = Database["public"]["Tables"]["journal_entries"]["Insert"];
type JournalUpdate = Database["public"]["Tables"]["journal_entries"]["Update"];

interface JournalInterfaceProps {
  initialJournalEntries: JournalEntry[];
  userId: string;
  isLoading?: boolean;
  isMutating?: boolean;
  error?: Error | null;
}

export function JournalInterface({
  initialJournalEntries,
  userId,
  isLoading = false,
  isMutating = false,
  error = null,
}: JournalInterfaceProps) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setEntries(initialJournalEntries);
  }, [initialJournalEntries]);

  useEffect(() => {
    if (!selectedEntryId && entries.length > 0) {
      setSelectedEntryId(entries[0].id);
    }
  }, [entries, selectedEntryId]);

  const selectedEntry =
    entries.find((entry) => entry.id === selectedEntryId) || null;

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntryId(entryId);
    setHasUnsavedChanges(false);
  };

  const handleCreateEntry = async () => {
    const newEntryData: JournalInsert = {
      title: "New Entry",
      content: "",
      attachments: [],
      user_id: userId,
    };
    const newEntry = await addJournalEntry(newEntryData);
    if (newEntry) {
      setEntries((prev) => [newEntry, ...prev]);
      setSelectedEntryId(newEntry.id);
    }
    setHasUnsavedChanges(false);
  };

  const handleSaveEntry = async () => {
    if (selectedEntry && hasUnsavedChanges) {
      const { id, title, content, attachments } = selectedEntry;
      const updatedEntry = await updateJournalEntry(id, {
        title,
        content,
        attachments,
      });
      if (updatedEntry) {
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === updatedEntry.id ? updatedEntry : entry,
          ),
        );
      }
      setHasUnsavedChanges(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      await deleteJournalEntry(entryId);
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      if (selectedEntryId === entryId) {
        setSelectedEntryId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-[600px] flex border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Left Pane - Journal List Skeleton */}
        <div className="w-80 shrink-0 p-4 space-y-3 border-r border-slate-200">
          <Skeleton className="h-8 w-full" /> {/* New Entry Button */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2 p-2 border rounded-md">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>

        {/* Right Pane - Journal Editor Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-10 w-full" /> {/* Title */}
          <Skeleton className="h-6 w-1/4" /> {/* Date */}
          <Skeleton className="h-40 w-full" /> {/* Content Area */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" /> {/* Save Button */}
            <Skeleton className="h-9 w-24" /> {/* Delete Button */}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center border border-red-200 rounded-lg overflow-hidden bg-red-50 shadow-sm text-red-700">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-[600px] flex border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Left Pane - Journal List */}
        <div className="w-80 shrink-0">
          <JournalList
            entries={entries}
            selectedEntryId={selectedEntryId}
            onSelectEntry={handleSelectEntry}
            onCreateEntry={() => {
              void handleCreateEntry();
            }}
            onDeleteEntry={(id) => {
              void handleDeleteEntry(id);
            }}
            isMutating={isMutating}
          />
        </div>

        {/* Right Pane - Journal Editor */}
        <div className="flex-1">
          <JournalEditorWithAttachments
            entry={selectedEntry}
            onSaveEntry={() => {
              void handleSaveEntry();
            }}
            hasUnsavedChanges={hasUnsavedChanges}
            updateEntry={updateJournalEntry}
            isMutating={isMutating}
          />
        </div>
      </div>
    </>
  );
}
