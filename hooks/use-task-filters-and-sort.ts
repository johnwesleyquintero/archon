"use client";

import { useState } from "react";

import { TaskFilterOptions, TaskSortOptions } from "@/lib/database/tasks";
import { TaskStatus, TaskPriority } from "@/lib/types/task";

export type TaskSort = TaskSortOptions; // Renamed for import compatibility

export type TaskFilters = {
  isCompleted?: boolean;
  status?: TaskStatus | "all";
  priority?: TaskPriority;
  dueDate?: "overdue" | "today" | "upcoming" | "none" | "all";
  category?: string;
  tags?: string[];
  search?: string;
  includeArchived?: boolean;
};

export type TaskFilterState = TaskFilters;
export type TaskSortState = TaskSort;

export function useTaskFiltersAndSort(
  initialFilters: TaskFilters = {}, // Changed type to TaskFilters
  initialSorts: TaskSortOptions = {},
) {
  const [sort, setSortState] = useState<TaskSortState>({
    sortBy: initialSorts.sortBy || "created_at",
    sortOrder: initialSorts.sortOrder || "desc",
  });
  const [filters, setFiltersState] = useState<TaskFilterState>({
    status: initialFilters.status || "all", // Default to "all"
    dueDate: initialFilters.dueDate || "all", // Default to "all"
    category: initialFilters.category || undefined,
    tags: initialFilters.tags || [],
    search: initialFilters.search || undefined,
    includeArchived: initialFilters.includeArchived || false,
    isCompleted: initialFilters.isCompleted || undefined,
    priority: initialFilters.priority || undefined,
  });

  const setFilter = <K extends keyof TaskFilterState>(
    key: K,
    value: TaskFilterState[K],
  ) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFiltersState({
      status: "all", // Clear to "all"
      dueDate: "all", // Clear to "all"
      category: undefined,
      tags: [],
      search: undefined,
      includeArchived: false,
      isCompleted: undefined,
      priority: undefined,
    });
  };

  const setSort = (newSort: TaskSortState) => {
    setSortState(newSort);
  };

  return {
    sort,
    setSort,
    filters,
    setFilter,
    clearFilters,
  };
}
