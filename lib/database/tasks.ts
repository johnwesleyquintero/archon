"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { Task, TaskStatus, TaskPriority } from "@/lib/types/task"; // Import TaskStatus and TaskPriority

import { withErrorHandling, convertRawTaskToTask } from "@/lib/utils";

async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // The `delete` method was called from a Server Component.
          }
        },
      },
    },
  );
}

export interface TaskFilterOptions {
  isCompleted?: boolean;
  status?: TaskStatus | "all"; // Allow "all" for status filter
  priority?: TaskPriority;
  dueDate?: "overdue" | "today" | "upcoming" | "none" | "all"; // Allow "all" for dueDate filter
  category?: string;
  tags?: string[];
  search?: string; // For full-text search
  includeArchived?: boolean; // To show archived tasks
}

export interface TaskSortOptions {
  sortBy?: "created_at" | "due_date" | "priority" | "title" | "is_completed";
  sortOrder?: "asc" | "desc";
}

export const getTasks = withErrorHandling(
  async (
    filters?: TaskFilterOptions,
    sorts?: TaskSortOptions,
  ): Promise<Task[]> => {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    let query = supabase.from("tasks").select("*").eq("user_id", user.id);

    // Apply filters
    if (filters) {
      if (filters.isCompleted !== undefined) {
        query = query.eq("is_completed", filters.isCompleted);
      }

      // Handle status filter
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      } else if (!filters.includeArchived) {
        // Default: If no status filter and not explicitly including archived, exclude archived
        query = query.in("status", ["todo", "in_progress", "done", "canceled"]);
      }

      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.contains("tags", filters.tags);
      }
      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      // Due date filtering
      const now = new Date();
      const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
      if (filters.dueDate && filters.dueDate !== "all") {
        if (filters.dueDate === "overdue") {
          query = query.lt("due_date", today).eq("is_completed", false);
        } else if (filters.dueDate === "today") {
          query = query.eq("due_date", today).eq("is_completed", false);
        } else if (filters.dueDate === "upcoming") {
          query = query.gt("due_date", today).eq("is_completed", false);
        } else if (filters.dueDate === "none") {
          query = query.is("due_date", null);
        }
      }
    } else {
      // Default: If no filters are provided, exclude archived tasks
      query = query.in("status", ["todo", "in_progress", "done", "canceled"]);
    }

    // Apply sorting
    if (sorts?.sortBy) {
      const ascending = sorts.sortOrder === "asc";
      if (sorts.sortBy === "priority") {
        query = query.order("priority", { ascending });
      } else {
        query = query.order(sorts.sortBy, { ascending });
      }
    } else {
      // Default sorting
      query = query
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error fetching tasks:", error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    // Ensure data is treated as Task[] after mapping
    const rawTasks: Task[] = data.map(convertRawTaskToTask);

    const parentTasks: Task[] = [];
    const subtasksMap: Map<string, Task[]> = new Map();

    rawTasks.forEach((task) => {
      if (task.parent_id) {
        if (!subtasksMap.has(task.parent_id)) {
          subtasksMap.set(task.parent_id, []);
        }
        subtasksMap.get(task.parent_id)?.push(task);
      } else {
        parentTasks.push(task);
      }
    });

    // Attach subtasks to their parent tasks
    parentTasks.forEach((parentTask) => {
      parentTask.subtasks = subtasksMap.get(parentTask.id) || [];
      // Sort subtasks if needed, e.g., by created_at or due_date
      parentTask.subtasks.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    });

    return parentTasks;
  },
  "fetch tasks",
);

export const getUniqueTags = withErrorHandling(async (): Promise<string[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("tags")
    .not("tags", "is", null);

  if (error) {
    console.error("Error fetching unique tags:", error);
    throw new Error(`Failed to fetch unique tags: ${error.message}`);
  }

  const uniqueTags = new Set<string>();
  data.forEach((row) => {
    if (Array.isArray(row.tags)) {
      row.tags.forEach((tag) => uniqueTags.add(tag));
    }
  });

  return Array.from(uniqueTags);
}, "fetch unique tags");
