"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

async function createClient() {
  const cookieStore = cookies();

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
          } catch (error) {
            // The `set` method was called from a Server Component.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
          }
        },
      },
    },
  );
}

export async function getTasks(): Promise<Task[]> {
  const supabase = createClient();
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
    return [];
  }

  return data;
}

export async function addTask(
  taskData: Omit<TaskInsert, "user_id">,
): Promise<Task | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: taskData.title,
      user_id: user.id,
      due_date: taskData.due_date,
      priority: taskData.priority || "medium",
      category: taskData.category,
      tags: taskData.tags || [],
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding task:", error);
    throw new Error(`Failed to add task: ${error.message}`);
  }

  revalidatePath("/dashboard");
  return data;
}

export async function toggleTask(
  id: string,
  completed: boolean,
): Promise<Task | null> {
  const supabase = createClient();
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
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();
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
}
