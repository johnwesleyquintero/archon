"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/empty-state";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];

interface JournalListProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  onCreateEntry: () => void;
  onDeleteEntry: (id: string) => void;
  isMutating: boolean;
}

export function JournalList({
  entries,
  selectedEntryId,
  onSelectEntry,
  onCreateEntry,
  onDeleteEntry,
  isMutating,
}: JournalListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="h-full flex flex-col border-r border-slate-200 bg-slate-50">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          My Journal
        </h2>
        <div className="flex flex-col gap-2">
          <Button
            onClick={onCreateEntry}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
            disabled={isMutating}
          >
            {isMutating ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            New Entry
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 py-2">
        {entries.length === 0 ? (
          <EmptyState
            title="No Journal Entries Yet"
            description="Click 'New Entry' to record your thoughts."
            actionLabel="Create New Entry"
            onAction={onCreateEntry}
          />
        ) : (
          <nav className="grid gap-1 p-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center justify-between rounded-md p-3 text-sm font-medium transition-colors hover:bg-slate-100",
                  selectedEntryId === entry.id
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700",
                )}
              >
                <button
                  onClick={() => onSelectEntry(entry.id)}
                  className="flex-1 text-left focus:outline-none"
                  disabled={isMutating}
                >
                  <h3 className="font-medium truncate">
                    {entry.title || "Untitled Entry"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(entry.updated_at)}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteEntry(entry.id)}
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-100 ml-2"
                  disabled={isMutating}
                >
                  {isMutating ? (
                    <Spinner size="sm" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </nav>
        )}
      </ScrollArea>
    </div>
  );
}
