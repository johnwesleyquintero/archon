"use client"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Filter } from "lucide-react"

interface TaskFilterBarProps {
  currentFilter: "all" | "active" | "completed"
  onFilterChange: (filter: "all" | "active" | "completed") => void
}

export function TaskFilterBar({ currentFilter, onFilterChange }: TaskFilterBarProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        <Filter className="h-4 w-4" />
        <span>Filter Tasks:</span>
      </div>
      <ToggleGroup
        type="single"
        value={currentFilter}
        onValueChange={(value: "all" | "active" | "completed") => {
          if (value) {
            onFilterChange(value)
          }
        }}
        className="gap-1"
      >
        <ToggleGroupItem value="all" aria-label="Show all tasks" className="h-8 px-3 text-sm">
          All
        </ToggleGroupItem>
        <ToggleGroupItem value="active" aria-label="Show active tasks" className="h-8 px-3 text-sm">
          Active
        </ToggleGroupItem>
        <ToggleGroupItem value="completed" aria-label="Show completed tasks" className="h-8 px-3 text-sm">
          Completed
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
