// This file was previously abbreviated. Here is its full content.
"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TaskFilterType, TaskSortType } from "@/lib/supabase/types" // Import types

interface TaskFilterBarProps {
  currentFilter: TaskFilterType
  onFilterChange: (filter: TaskFilterType) => void
  currentSort: TaskSortType
  onSortChange: (sort: TaskSortType) => void
  disabled?: boolean // Added disabled prop
}

export function TaskFilterBar({
  currentFilter,
  onFilterChange,
  currentSort,
  onSortChange,
  disabled = false,
}: TaskFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={currentFilter === "all" ? "default" : "outline"}
          onClick={() => onFilterChange("all")}
          disabled={disabled}
        >
          All
        </Button>
        <Button
          variant={currentFilter === "active" ? "default" : "outline"}
          onClick={() => onFilterChange("active")}
          disabled={disabled}
        >
          Active
        </Button>
        <Button
          variant={currentFilter === "completed" ? "default" : "outline"}
          onClick={() => onFilterChange("completed")}
          disabled={disabled}
        >
          Completed
        </Button>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Select value={currentSort} onValueChange={(value: TaskSortType) => onSortChange(value)} disabled={disabled}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
