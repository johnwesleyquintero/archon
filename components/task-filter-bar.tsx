"use client";
import { Filter, Calendar, Tag, ListTodo } from "lucide-react";

import { Button } from "@/components/ui/button"; // Import Button
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskFilterState } from "@/hooks/use-task-filters-and-sort"; // Import TaskFilterState

interface TaskFilterBarProps {
  currentFilter: TaskFilterState["status"];
  onFilterChange: (filter: TaskFilterState["status"]) => void;

  dueDateFilter: TaskFilterState["dueDate"];
  onDueDateFilterChange: (dueDate: TaskFilterState["dueDate"]) => void;
  categoryFilter: TaskFilterState["category"]; // New prop for category filter
  onCategoryFilterChange: (category: TaskFilterState["category"]) => void; // New prop for category filter change
  tagFilter: string | null; // New prop for single tag filter (for now)
  onTagFilterChange: (tag: string | null) => void; // New prop for tag filter change
  allAvailableTags: string[]; // New prop to pass all unique tags
  onClearFilters: () => void; // New prop for clearing all filters
}

export function TaskFilterBar({
  currentFilter,
  onFilterChange,

  dueDateFilter,
  onDueDateFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  tagFilter,
  onTagFilterChange,
  allAvailableTags,
  onClearFilters,
}: TaskFilterBarProps) {
  return (
    <div className="flex flex-col gap-2 p-2 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4" />
          <span>Filter Tasks</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
        >
          Clear Filters
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Status:</span>
          <Select
            value={currentFilter}
            onValueChange={(value) => {
              // Removed explicit type for value
              onFilterChange(value as TaskFilterState["status"]); // Cast value here
            }}
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due date filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            <Calendar className="h-4 w-4 inline-block mr-1" />
            Due:
          </span>
          <Select
            value={dueDateFilter}
            onValueChange={(value) => {
              // Removed explicit type for value
              onDueDateFilterChange(value as TaskFilterState["dueDate"]); // Cast value here
            }}
          >
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue placeholder="Due date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            <ListTodo className="h-4 w-4 inline-block mr-1" />
            Category:
          </span>
          <Select
            value={categoryFilter || "all"} // Default to "all" if null
            onValueChange={(value) =>
              onCategoryFilterChange(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="health">Health</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            <Tag className="h-4 w-4 inline-block mr-1" />
            Tag:
          </span>
          <Select
            value={tagFilter || "all"} // Default to "all" if null
            onValueChange={(value) =>
              onTagFilterChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {allAvailableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
