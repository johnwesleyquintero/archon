"use client";
import { Filter, Calendar, Flag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskFilters } from "@/hooks/use-task-filters-and-sort"; // Import TaskFilters

interface TaskFilterBarProps {
  currentFilter: TaskFilters["status"]; // Use TaskFilters for status
  onFilterChange: (filter: TaskFilters["status"]) => void; // Use TaskFilters for status
  priorityFilter: TaskFilters["priority"];
  onPriorityFilterChange: (priority: TaskFilters["priority"]) => void;
  dueDateFilter: TaskFilters["dueDate"];
  onDueDateFilterChange: (dueDate: TaskFilters["dueDate"]) => void;
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
          <Select
            value={currentFilter}
            onValueChange={(value: TaskFilters["status"]) => {
              if (value) {
                onFilterChange(value);
              }
            }}
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
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
