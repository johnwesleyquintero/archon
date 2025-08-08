"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { Task } from "@/lib/types/task";

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

export const getTasks = withErrorHandling(async (): Promise<Task[]> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true, nullsFirst: false }) // Order by sort_order first
    .order("created_at", { ascending: false }); // Fallback to created_at

  if (error) {
    console.error("Error fetching tasks:", error);
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  const rawTasks = data.map(convertRawTaskToTask);

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
}, "fetch tasks");
