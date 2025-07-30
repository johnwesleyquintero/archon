"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/lib/supabase/types";

// Ensure Task type includes all filterable/sortable properties with correct types
type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  tags: string[] | null; // Assuming tags can be null
  // priority, due_date, category should be inferred from the base type
};

export type TaskSort = {
  field: "due_date" | "priority" | "created_at" | "updated_at" | "title";
  direction: "asc" | "desc";
};

export type TaskFilters = {
  status: "all" | "active" | "completed";
  priority: "all" | "high" | "medium" | "low";
  dueDate: "all" | "overdue" | "today" | "week";
  category: string | null;
  tags: string[];
};

const priorityOrder: { [key: string]: number } = {
  high: 3,
  medium: 2,
  low: 1,
};

export function useTaskFiltersAndSort(tasks: Task[]) {
  const [sort, setSort] = useState<TaskSort>({
    field: "created_at",
    direction: "desc",
  });
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    dueDate: "all",
    category: null,
    tags: [],
  });

  const filteredAndSortedTasks = useMemo(() => {
    // First, apply filters
    let result = tasks.filter((task) => {
      // Status filter
      if (filters.status === "active" && task.is_completed) return false;
      if (filters.status === "completed" && !task.is_completed) return false;

      // Priority filter
      if (filters.priority !== "all" && task.priority !== filters.priority)
        return false;

      // Due date filter
      if (filters.dueDate !== "all" && task.due_date) {
        const dueDate = new Date(task.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        switch (filters.dueDate) {
          case "overdue":
            if (dueDate >= today) return false;
            break;
          case "today":
            if (dueDate < today || dueDate >= tomorrow) return false;
            break;
          case "week":
            if (dueDate < today || dueDate >= weekEnd) return false;
            break;
        }
      }

      // Category filter
      if (filters.category && task.category !== filters.category) return false;

      // Tags filter
      if (
        filters.tags.length > 0 &&
        !filters.tags.every((tag) => (task.tags || []).includes(tag))
      )
        return false;

      return true;
    });

    // Then, apply sorting
    result.sort((a, b) => {
      switch (sort.field) {
        case "due_date":
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return sort.direction === "asc" ? 1 : -1;
          if (!b.due_date) return sort.direction === "asc" ? -1 : 1;
          return sort.direction === "asc"
            ? new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
            : new Date(b.due_date).getTime() - new Date(a.due_date).getTime();

        case "priority":
          const aPriority = a.priority ? priorityOrder[a.priority] || 0 : 0;
          const bPriority = b.priority ? priorityOrder[b.priority] || 0 : 0;
          return sort.direction === "asc"
            ? aPriority - bPriority
            : bPriority - aPriority;

        case "title":
          return sort.direction === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);

        case "created_at":
        case "updated_at":
          return sort.direction === "asc"
            ? new Date(a[sort.field]).getTime() -
                new Date(b[sort.field]).getTime()
            : new Date(b[sort.field]).getTime() -
                new Date(a[sort.field]).getTime();

        default:
          return 0;
      }
    });

    return result;
  }, [tasks, sort, filters]);

  return {
    filteredAndSortedTasks,
    sort,
    setSort,
    filters,
    setFilters,
  };
}
