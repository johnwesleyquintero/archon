"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];

export interface JournalListProps extends Record<string, unknown> {
  entries?: JournalEntry[];
  selectedEntryId?: string | null;
  onSelectEntry?: (id: string) => void;
  onCreateEntry?: () => void;
  onDeleteEntry?: (id: string) => void;
  isMutating?: boolean;
  limit?: number;
}

export function JournalList({
  entries = [],
  selectedEntryId = null,
  onSelectEntry = () => {},
  onCreateEntry = () => {},
  onDeleteEntry = () => {},
  isMutating = false,
  limit,
}: JournalListProps) {
  const displayedEntries = limit ? entries.slice(0, limit) : entries;
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
        {displayedEntries.length === 0 ? (
          <EmptyState
            title="No Journal Entries Yet"
            description="Click 'New Entry' to record your thoughts."
            actionLabel="Create New Entry"
            onAction={onCreateEntry}
          />
        ) : (
          <nav className="grid gap-1 p-2">
            {displayedEntries.map((entry) => (
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-100 ml-2"
                      disabled={isMutating}
                    >
                      {isMutating ? (
                        <Spinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your journal entry.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteEntry(entry.id)}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </nav>
        )}
      </ScrollArea>
    </div>
  );
}
