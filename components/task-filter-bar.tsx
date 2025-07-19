"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { TaskFilterType, TaskSortType } from "@/lib/supabase/types"

interface TaskFilterBarProps {
  currentFilter: TaskFilterType
  onFilterChange: (filter: TaskFilterType) => void
  currentSort: TaskSortType
  onSortChange: (sort: TaskSortType) => void
  disabled?: boolean
}

export function TaskFilterBar({
  currentFilter,
  onFilterChange,
  currentSort,
  onSortChange,
  disabled = false,
}: TaskFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
      {/* Filter Buttons */}
      <div className="flex space-x-1">
        <Button
          variant={currentFilter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterChange("all")}
          disabled={disabled}
          className={cn(
            "text-xs",
            currentFilter === "all"
              ? "bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
          )}
        >
          All
        </Button>
        <Button
          variant={currentFilter === "active" ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterChange("active")}
          disabled={disabled}
          className={cn(
            "text-xs",
            currentFilter === "active"
              ? "bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
          )}
        >
          Active
        </Button>
        <Button
          variant={currentFilter === "completed" ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterChange("completed")}
          disabled={disabled}
          className={cn(
            "text-xs",
            currentFilter === "completed"
              ? "bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
          )}
        >
          Completed
        </Button>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-700 dark:text-slate-400">Sort by:</span>
        <Select value={currentSort} onValueChange={(value: TaskSortType) => onSortChange(value)} disabled={disabled}>
          <SelectTrigger className="h-9 w-[120px] text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:ring-slate-600">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-950 dark:border-slate-700">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
