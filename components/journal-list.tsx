"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface JournalEntry {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface JournalListProps {
  entries: JournalEntry[]
  selectedEntryId: string | null
  onSelectEntry: (entryId: string) => void
  onCreateEntry: () => void
  onShowTemplates: () => void
}

export function JournalList({
  entries,
  selectedEntryId,
  onSelectEntry,
  onCreateEntry,
  onShowTemplates,
}: JournalListProps) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  const getPreviewText = (content: string) => {
    // Remove markdown formatting for preview
    const plainText = content.replace(/[#*_`]/g, "").trim()
    return plainText.length > 60 ? plainText.substring(0, 60) + "..." : plainText
  }

  return (
    <div className="h-full flex flex-col border-r border-slate-200 bg-slate-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Journal Entries</h2>
          <div className="flex gap-2">
            <Button onClick={onShowTemplates} size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-1" />
              Templates
            </Button>
            <Button onClick={onCreateEntry} size="sm" className="bg-slate-900 hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-1" />
              New Entry
            </Button>
          </div>
        </div>
        <p className="text-sm text-slate-600">{entries.length} entries</p>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-sm font-medium">No journal entries yet</p>
            <p className="text-xs mt-1">Create your first entry or use a template to get started</p>
            <div className="mt-4 space-y-2">
              <Button onClick={onCreateEntry} size="sm" variant="outline" className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-1" />
                Blank Entry
              </Button>
              <Button onClick={onShowTemplates} size="sm" variant="outline" className="w-full bg-transparent">
                <FileText className="h-4 w-4 mr-1" />
                Use Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {entries.map((entry) => (
              <Card
                key={entry.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-sm border-0",
                  selectedEntryId === entry.id
                    ? "bg-white shadow-sm ring-2 ring-slate-200"
                    : "bg-transparent hover:bg-white/50",
                )}
                onClick={() => onSelectEntry(entry.id)}
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={cn(
                          "font-medium text-sm leading-tight line-clamp-2",
                          selectedEntryId === entry.id ? "text-slate-900" : "text-slate-700",
                        )}
                      >
                        {entry.title || "Untitled Entry"}
                      </h3>
                      <span className="text-xs text-slate-500 shrink-0">{formatDate(entry.createdAt)}</span>
                    </div>
                    {entry.content && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {getPreviewText(entry.content)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
