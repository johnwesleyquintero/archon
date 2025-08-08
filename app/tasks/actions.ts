"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { Task } from "@/lib/types/task";

import { withErrorHandling } from "@/lib/error-utils";
import { taskInsertSchema, taskUpdateSchema } from "@/lib/zod-schemas";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

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

export const addTask = withErrorHandling(
  async (taskData: Omit<TaskInsert, "user_id">): Promise<Task | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated.");
    }

    const validatedTaskData = taskInsertSchema.parse({
      ...taskData,
      user_id: user.id,
    });

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: validatedTaskData.title,
        user_id: validatedTaskData.user_id,
        due_date: validatedTaskData.due_date,
        priority: validatedTaskData.priority || "medium",
        category: validatedTaskData.category,
        tags: validatedTaskData.tags || [],
        status: validatedTaskData.status || "todo", // Corrected to "todo" as default
        parent_id: validatedTaskData.parent_id, // Added parent_id
        recurrence_pattern: validatedTaskData.recurrence_pattern,
        recurrence_end_date: validatedTaskData.recurrence_end_date,
        original_task_id: validatedTaskData.original_task_id,
        shared_with_user_ids: validatedTaskData.shared_with_user_ids || [],
        goal_id: validatedTaskData.goal_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add task: ${error.message}`);
    }

    revalidatePath("/tasks");
    revalidatePath("/goals");
    return data as Task;
  },
);

export const updateTaskSortOrder = withErrorHandling(
  async (updates: { id: string; sort_order: number }[]): Promise<void> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated.");
    }

    // Use Promise.all to update multiple tasks concurrently
    const updatePromises = updates.map(
      (update) =>
        supabase
          .from("tasks")
          .update({ sort_order: update.sort_order } as TaskUpdate) // Cast to TaskUpdate for partial update
          .eq("id", update.id)
          .eq("user_id", user.id), // Ensure user owns the task
    );

    const results = await Promise.all(updatePromises);

    for (const { error } of results) {
      if (error) {
        throw new Error(`Failed to update task sort order: ${error.message}`);
      }
    }

    revalidatePath("/tasks");
  },
);

export const deleteMultipleTasks = withErrorHandling(
  async (ids: string[]): Promise<{ success: boolean }> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated.");
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .in("id", ids)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(`Failed to delete tasks: ${error.message}`);
    }

    revalidatePath("/tasks");
    return { success: true };
  },
);

export const toggleTask = withErrorHandling(
  async (id: string, completed: boolean): Promise<Task | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated.");
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({ is_completed: completed } as TaskUpdate)
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the task
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle task: ${error.message}`);
    }

    revalidatePath("/tasks");
    return data as Task;
  },
);

export const deleteTask = withErrorHandling(
  async (id: string): Promise<{ success: boolean }> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated.");
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure user owns the task

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }

    revalidatePath("/tasks");
    return { success: true };
  },
);

export const updateTask = withErrorHandling(
  async (
    id: string,
    updatedTask: Partial<TaskUpdate>,
  ): Promise<Task | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated.");
    }

    const validatedTask = taskUpdateSchema.parse(updatedTask);

    const { data, error } = await supabase
      .from("tasks")
      .update(validatedTask)
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the task
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    revalidatePath("/tasks");
    revalidatePath("/goals");
    return data as Task;
  },
);
