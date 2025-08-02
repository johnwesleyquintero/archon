"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { Task } from "@/lib/types/task";

import { withErrorHandling, convertRawTaskToTask } from "@/lib/utils";
import { taskInsertSchema, taskUpdateSchema } from "@/lib/zod-schemas";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  const typedData: Task[] = data.map(convertRawTaskToTask);
  return typedData;
}, "fetch tasks");

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
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding task:", error);
      throw new Error(`Failed to add task: ${error.message}`);
    }

    revalidatePath("/dashboard");
    return convertRawTaskToTask(data);
  },
  "add task",
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
      console.error("Error toggling task:", error);
      throw new Error(`Failed to toggle task: ${error.message}`);
    }

    revalidatePath("/dashboard");
    return convertRawTaskToTask(data);
  },
  "toggle task",
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
      console.error("Error deleting task:", error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }

    revalidatePath("/dashboard");
    return { success: true };
  },
  "delete task",
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
      console.error("Error updating task:", error);
      throw new Error(`Failed to update task: ${error.message}`);
    }

    revalidatePath("/dashboard");
    return convertRawTaskToTask(data);
  },
  "update task",
);
