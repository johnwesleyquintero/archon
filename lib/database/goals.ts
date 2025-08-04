"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { handleServerError } from "@/lib/error-utils";
import { getAuthenticatedUser } from "@/lib/supabase/auth-utils";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];

export async function getGoals(userId: string): Promise<Goal[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("goals")
    .select(
      "id, created_at, title, description, progress, status, target_date, attachments, user_id, updated_at",
    ) // Explicitly select columns
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    handleServerError(error, { userId }, "Failed to fetch goals");
    return [];
  }

  // No explicit cast needed if select statement aligns with Goal type
  return data;
}

export async function addGoal(
  goalData: Omit<GoalInsert, "user_id">,
): Promise<Goal | null> {
  const supabase = await createServerSupabaseClient();
  const user = await getAuthenticatedUser();

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
    handleServerError(error, { goalData: newGoal }, "Failed to add goal");
    throw new Error(`Failed to add goal: ${error.message}`);
  }

  revalidatePath("/dashboard"); // Or a specific goals page
  return data;
}

export async function updateGoal(
  id: string,
  goalData: GoalUpdate,
): Promise<Goal | null> {
  const supabase = await createServerSupabaseClient();
  const user = await getAuthenticatedUser();

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
    handleServerError(error, { id, goalData }, "Failed to update goal");
    throw new Error(`Failed to update goal: ${error.message}`);
  }

  revalidatePath("/dashboard"); // Or a specific goals page
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user owns the goal

  if (error) {
    handleServerError(error, { id }, "Failed to delete goal");
    throw new Error(`Failed to delete goal: ${error.message}`);
  }

  revalidatePath("/dashboard"); // Or a specific goals page
}
