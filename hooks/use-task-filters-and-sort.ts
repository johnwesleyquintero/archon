"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/lib/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

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
      if (
        filters.priority !== "all" &&
        (task as any).priority !== filters.priority
      )
        return false;

      // Due date filter
      if (filters.dueDate !== "all" && (task as any).due_date) {
        const dueDate = new Date((task as any).due_date);
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
      if (filters.category && (task as any).category !== filters.category)
        return false;

      // Tags filter
      if (
        filters.tags.length > 0 &&
        !filters.tags.every((tag) => ((task as any).tags || []).includes(tag))
      )
        return false;

      return true;
    });

    // Then, apply sorting
    result.sort((a, b) => {
      const aTyped = a as any;
      const bTyped = b as any;

      switch (sort.field) {
        case "due_date":
          if (!aTyped.due_date && !bTyped.due_date) return 0;
          if (!aTyped.due_date) return sort.direction === "asc" ? 1 : -1;
          if (!bTyped.due_date) return sort.direction === "asc" ? -1 : 1;
          return sort.direction === "asc"
            ? new Date(aTyped.due_date).getTime() -
                new Date(bTyped.due_date).getTime()
            : new Date(bTyped.due_date).getTime() -
                new Date(aTyped.due_date).getTime();

        case "priority":
          return sort.direction === "asc"
            ? (priorityOrder[aTyped.priority] || 0) -
                (priorityOrder[bTyped.priority] || 0)
            : (priorityOrder[bTyped.priority] || 0) -
                (priorityOrder[aTyped.priority] || 0);

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
