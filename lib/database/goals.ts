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
  const authResponse = await client.auth.getUser();
  return authResponse.data.user;
}

export async function getGoals(): Promise<Goal[]> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser();

  if (!user) {
    return [];
  }

  // Reverted select to '*' to potentially resolve TS2345 on user.id
  const result = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data, error } = result;

  if (error) {
    console.error("Error fetching goals:", error);
    return [];
  }

  // Explicitly cast to Goal[] to satisfy the return type,
  // as the generated types might not perfectly align with the select statement.
  // This cast might need adjustment if the underlying types are very different.
  return data as Goal[];
}

export async function addGoal(
  goalData: Omit<GoalInsert, "user_id">,
): Promise<Goal | null> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  // Explicitly construct the object to insert, ensuring it matches GoalInsert.
  // This addresses potential TS2769 errors related to missing properties or incorrect structure.
  const newGoal: GoalInsert = {
    title: goalData.title, // Assuming title is a required field in goalData
    description: goalData.description ?? null,
    progress: goalData.progress ?? null,
    status: goalData.status ?? null,
    target_date: goalData.target_date ?? null,
    attachments: goalData.attachments ?? null, // Assuming attachments is Json type
    user_id: user.id, // Explicitly add user_id
  };

  const { data, error } = await supabase
    .from("goals")
    .insert(newGoal) // Use the explicitly typed object
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

  // Ensure goalData conforms to GoalUpdate.
  // The TS2345 error on goalData suggests a mismatch.
  // Explicitly casting to GoalUpdate might help if the input `goalData` is not strictly typed.
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
