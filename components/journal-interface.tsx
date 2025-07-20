"use client";
import { useState, useEffect } from "react";
import { JournalList } from "@/components/journal-list";
import { JournalEditorWithAttachments } from "@/components/journal-editor-with-attachments"; // Use the one with attachments
import { useJournal } from "@/hooks/use-journal";
import type { Database } from "@/lib/supabase/types";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];

export function JournalInterface() {
  const {
    entries,
    isLoading,
    error,
    isMutating,
    addEntry,
    updateEntry,
    deleteEntry,
  } = useJournal();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!selectedEntryId && entries.length > 0) {
      setSelectedEntryId(entries[0].id); // Select the first entry by default if none selected
    }
  }, [entries, selectedEntryId]);

  const selectedEntry =
    entries.find((entry) => entry.id === selectedEntryId) || null;

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntryId(entryId);
    setHasUnsavedChanges(false);
  };

  const handleCreateEntry = async () => {
    const newEntryData = {
      title: "New Entry",
      content: "",
      attachments: [],
    };
    await addEntry(newEntryData);
    // The useJournal hook will update the state and revalidate,
    // so we just need to ensure the new entry is selected.
    // This might require a slight delay or a more sophisticated way to get the new ID.
    // For now, the optimistic update in useJournal will handle it.
    setHasUnsavedChanges(false);
  };

  const handleUpdateEntry = async (
    entryId: string,
    updates: Partial<JournalEntry>,
  ) => {
    // This function is called frequently as user types.
    // We'll update local state immediately for responsiveness,
    // and then trigger a debounced save or save on blur/button click.
    entries.map((entry) =>
      entry.id === entryId
        ? {
            ...entry,
            ...updates,
            updated_at: new Date().toISOString(),
          }
        : entry,
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveEntry = async () => {
    if (selectedEntry && hasUnsavedChanges) {
      const { id, title, content, attachments } = selectedEntry;
      await updateEntry(id, { title, content, attachments });
      setHasUnsavedChanges(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      await deleteEntry(entryId);
      if (selectedEntryId === entryId) {
        setSelectedEntryId(null); // Deselect if the current entry is deleted
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <p className="text-slate-500">Loading journal entries...</p>
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
            onCreateEntry={handleCreateEntry}
            onDeleteEntry={handleDeleteEntry}
            isMutating={isMutating}
          />
        </div>

        {/* Right Pane - Journal Editor */}
        <div className="flex-1">
          <JournalEditorWithAttachments
            entry={selectedEntry}
            onUpdateEntry={handleUpdateEntry}
            onSaveEntry={handleSaveEntry}
            hasUnsavedChanges={hasUnsavedChanges}
            isMutating={isMutating}
          />
        </div>
      </div>
    </>
  );
}
