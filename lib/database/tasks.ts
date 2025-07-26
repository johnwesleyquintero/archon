"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/supabase/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export async function getTasks(): Promise<Task[]> {
  const supabase = await getSupabaseServerClient();
  const user = await getAuthUser();

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

export async function addTask(input: TaskInsert): Promise<Task | null> {
  const supabase = await getSupabaseServerClient();
  const user = await getAuthUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      user_id: user.id,
      due_date: input.due_date,
      priority: input.priority || "medium",
      category: input.category,
      tags: input.tags || [],
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
  const supabase = await getSupabaseServerClient();
  const user = await getAuthUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({ completed } as TaskUpdate)
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
  const supabase = await getSupabaseServerClient();
  const user = await getAuthUser();

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
