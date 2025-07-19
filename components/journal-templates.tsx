"use client"

import { useState } from "react"

import type React from "react"

import { Modal } from "@/components/ui/modal"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sun,
  BookOpen,
  CalendarDays,
  Lightbulb,
  Heart,
  Sparkles,
  Briefcase,
  Target,
  Brain,
  Feather,
  Leaf,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Database } from "@/lib/supabase/types"

type JournalTemplate = Database["public"]["Tables"]["journal_templates"]["Row"]

interface JournalTemplatesProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: JournalTemplate) => void
  templates: JournalTemplate[]
  isLoading: boolean
}

const templateIcons: { [key: string]: React.ElementType } = {
  Sun: Sun,
  BookOpen: BookOpen,
  CalendarDays: CalendarDays,
  Lightbulb: Lightbulb,
  Heart: Heart,
  Sparkles: Sparkles,
  Briefcase: Briefcase,
  Target: Target,
  Brain: Brain,
  Feather: Feather,
  Leaf: Leaf,
}

const templateCategories = [
  { name: "Daily", value: "daily" },
  { name: "Reflection", value: "reflection" },
  { name: "Planning", value: "planning" },
  { name: "Creative", value: "creative" },
  { name: "Wellness", value: "wellness" },
  { name: "Work", value: "work" },
  { name: "Goals", value: "goals" },
  { name: "Learning", value: "learning" },
  { name: "Mindfulness", value: "mindfulness" },
  { name: "Nature", value: "nature" },
]

export function JournalTemplates({ isOpen, onClose, onSelectTemplate, templates, isLoading }: JournalTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredTemplates = selectedCategory ? templates.filter((t) => t.category === selectedCategory) : templates

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose a Journal Template"
      description="Select a template to quickly start a new journal entry."
      className="max-w-3xl"
    >
      <div className="flex h-[500px]">
        {/* Category Sidebar */}
        <div className="w-48 border-r border-slate-200 pr-4 py-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 px-2">Categories</h3>
          <ScrollArea className="h-full">
            <nav className="grid gap-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-slate-100",
                  selectedCategory === null ? "bg-slate-100 text-slate-900" : "text-slate-700",
                )}
              >
                All Templates
              </button>
              {templateCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-slate-100",
                    selectedCategory === category.value ? "bg-slate-100 text-slate-900" : "text-slate-700",
                  )}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 pl-6 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              No templates found for this category.
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                {filteredTemplates.map((template) => {
                  const IconComponent = templateIcons[template.icon_name || "BookOpen"]
                  return (
                    <Card
                      key={template.id}
                      className={cn(
                        "cursor-pointer hover:border-slate-400 transition-colors",
                        template.color && `border-${template.color}-200 hover:border-${template.color}-400`,
                      )}
                      onClick={() => onSelectTemplate(template)}
                    >
                      <CardContent className="p-4 flex items-start gap-4">
                        <div
                          className={cn(
                            "p-3 rounded-lg",
                            template.color && `bg-${template.color}-100 text-${template.color}-600`,
                          )}
                        >
                          {IconComponent && <IconComponent className="h-6 w-6" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 text-base mb-1">{template.name}</h4>
                          <p className="text-sm text-slate-600 line-clamp-2">{template.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </Modal>
  )
}
