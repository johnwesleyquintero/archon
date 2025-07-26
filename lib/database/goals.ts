"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth";
import { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];

async function getUser(): Promise<User | null> {
  const client = await createSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}

export async function getGoals(): Promise<Goal[]> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching goals:", error);
    return [];
  }

  return data;
}

export async function addGoal(
  goalData: Omit<GoalInsert, "user_id">,
): Promise<Goal | null> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({ ...goalData, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error adding goal:", error);
    throw new Error(`Failed to add goal: ${error.message}`);
  }

  revalidatePath("/dashboard"); // Or a specific goals page
  return data;
}

export async function updateGoal(
  id: string,
  goalData: GoalUpdate,
): Promise<Goal | null> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data, error } = await supabase
    .from("goals")
    .update(goalData)
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user owns the goal
    .select()
    .single();

  if (error) {
    console.error("Error updating goal:", error);
    throw new Error(`Failed to update goal: ${error.message}`);
  }

  revalidatePath("/dashboard"); // Or a specific goals page
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user owns the goal

  if (error) {
    console.error("Error deleting goal:", error);
    throw new Error(`Failed to delete goal: ${error.message}`);
  }

  revalidatePath("/dashboard"); // Or a specific goals page
}
