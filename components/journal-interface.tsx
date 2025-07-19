"use client"

import type React from "react"

import { useState } from "react"
import { JournalList } from "@/components/journal-list"
import { JournalEditor } from "@/components/journal-editor"
import { JournalTemplates } from "@/components/journal-templates"

interface JournalEntry {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface JournalTemplate {
  id: string
  name: string
  description: string
  icon: React.ElementType
  category: "daily" | "reflection" | "planning" | "creative" | "wellness"
  title: string
  content: string
  color: string
}

export function JournalInterface() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      title: "Morning Reflections",
      content: `Today started with a beautiful sunrise. I've been thinking about **personal growth** and how important it is to:\n\n- Take time for reflection\n- Set meaningful goals\n- Practice gratitude daily\n\nThe *quiet moments* in the morning really help me center myself for the day ahead.`,
      createdAt: new Date(2024, 0, 15),
      updatedAt: new Date(2024, 0, 15),
    },
    {
      id: "2",
      title: "Weekly Review - Week of Monday, January 8, 2024",
      content: `## Weekly Review & Planning\n\n**Week of:** Monday, January 8, 2024\n\n### Looking Back\n**Biggest Wins This Week:**\n- Completed the project proposal ahead of schedule\n- Started a new morning routine with meditation\n- Had a great conversation with my mentor\n\n**Challenges I Faced:**\n- Struggled with time management on Tuesday\n- Felt overwhelmed with the new client requirements\n\n**Lessons Learned:**\n- Breaking large tasks into smaller chunks helps with overwhelm\n- Morning meditation really does set a better tone for the day\n\n### Looking Ahead\n**Top 3 Priorities for Next Week:**\n1. Finalize the client presentation\n2. Schedule team one-on-ones\n3. Plan the quarterly review meeting`,
      createdAt: new Date(2024, 0, 14),
      updatedAt: new Date(2024, 0, 14),
    },
  ])

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>("1")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) || null

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntryId(entryId)
    setHasUnsavedChanges(false)
  }

  const handleCreateEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: "",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setEntries([newEntry, ...entries])
    setSelectedEntryId(newEntry.id)
    setHasUnsavedChanges(false)
  }

  const handleCreateFromTemplate = (template: JournalTemplate) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: template.title,
      content: template.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setEntries([newEntry, ...entries])
    setSelectedEntryId(newEntry.id)
    setHasUnsavedChanges(false)
  }

  const handleUpdateEntry = (entryId: string, updates: Partial<JournalEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              ...updates,
              updatedAt: new Date(),
            }
          : entry,
      ),
    )
    setHasUnsavedChanges(true)
  }

  const handleSaveEntry = () => {
    setHasUnsavedChanges(false)
    // In a real app, you would save to a backend here
    console.log("Entry saved!")
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
            onShowTemplates={() => setShowTemplates(true)}
          />
        </div>

        {/* Right Pane - Journal Editor */}
        <div className="flex-1">
          <JournalEditor
            entry={selectedEntry}
            onUpdateEntry={handleUpdateEntry}
            onSaveEntry={handleSaveEntry}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
      </div>

      {/* Templates Modal */}
      <JournalTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleCreateFromTemplate}
      />
    </>
  )
}
