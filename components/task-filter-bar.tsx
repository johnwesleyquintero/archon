"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Filter, Calendar, Flag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskFilterBarProps {
  currentFilter: "all" | "active" | "completed";
  onFilterChange: (filter: "all" | "active" | "completed") => void;
  priorityFilter: "all" | "low" | "medium" | "high";
  onPriorityFilterChange: (priority: "all" | "low" | "medium" | "high") => void;
  dueDateFilter: "all" | "today" | "week" | "overdue";
  onDueDateFilterChange: (
    dueDate: "all" | "today" | "week" | "overdue",
  ) => void;
}

export function TaskFilterBar({
  currentFilter,
  onFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dueDateFilter,
  onDueDateFilterChange,
}: TaskFilterBarProps) {
  return (
    <div className="flex flex-col gap-2 p-2 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4" />
          <span>Filter Tasks</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Status:</span>
          <ToggleGroup
            type="single"
            value={currentFilter}
            onValueChange={(value: "all" | "active" | "completed") => {
              if (value) {
                onFilterChange(value);
              }
            }}
            className="gap-1"
          >
            <ToggleGroupItem
              value="all"
              aria-label="Show all tasks"
              className="px-2.5 py-1 text-xs rounded-md data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 dark:data-[state=on]:bg-slate-800 dark:data-[state=on]:text-slate-50"
            >
              All
            </ToggleGroupItem>
            <ToggleGroupItem
              value="active"
              aria-label="Show active tasks"
              className="px-2.5 py-1 text-xs rounded-md data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 dark:data-[state=on]:bg-slate-800 dark:data-[state=on]:text-slate-50"
            >
              Active
            </ToggleGroupItem>
            <ToggleGroupItem
              value="completed"
              aria-label="Show completed tasks"
              className="px-2.5 py-1 text-xs rounded-md data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 dark:data-[state=on]:bg-slate-800 dark:data-[state=on]:text-slate-50"
            >
              Completed
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            <Flag className="h-4 w-4 inline-block mr-1" />
            Priority:
          </span>
          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due date filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            <Calendar className="h-4 w-4 inline-block mr-1" />
            Due:
          </span>
          <Select value={dueDateFilter} onValueChange={onDueDateFilterChange}>
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
      </div>
    </div>
  );
}
