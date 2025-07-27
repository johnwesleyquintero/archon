"use client";

import { JournalList } from "@/components/journal-list";
import { JournalEditorWithAttachments } from "@/components/journal-editor-with-attachments";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/lib/supabase/types";
import { useJournal } from "@/hooks/use-journal";
import { updateJournalEntry } from "@/app/journal/actions";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];

interface JournalInterfaceProps {
  initialJournalEntries: JournalEntry[];
  userId: string;
  isLoading?: boolean;
  error?: Error | null;
}

export function JournalInterface({
  initialJournalEntries,
  userId,
  isLoading = false,
  error = null,
}: JournalInterfaceProps) {
  const {
    entries,
    selectedEntry,
    selectedEntryId,
    hasUnsavedChanges,
    isMutating,
    handleSelectEntry,
    handleCreateEntry,
    handleSaveEntry,
    handleDeleteEntry,
  } = useJournal(initialJournalEntries, userId);

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
            onCreateEntry={handleCreateEntry}
            onDeleteEntry={handleDeleteEntry}
            isMutating={isMutating}
          />
        </div>

        {/* Right Pane - Journal Editor */}
        <div className="flex-1">
          <JournalEditorWithAttachments
            entry={selectedEntry}
            onSaveEntry={handleSaveEntry}
            hasUnsavedChanges={hasUnsavedChanges}
            updateEntry={updateJournalEntry}
            isMutating={isMutating}
          />
        </div>
      </div>
    </>
  );
}
