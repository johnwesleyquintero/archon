"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/types";
import { getAuthenticatedUser } from "@/lib/supabase/auth-utils";
import { handleServerError, AppError } from "@/lib/error-utils";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];

export interface GoalFilterOptions {
  is_completed?: boolean;
  limit?: number;
  sortBy?: "created_at" | "updated_at" | "title";
  ascending?: boolean;
}

export async function getGoals(
  userId: string,
  options: GoalFilterOptions = {},
): Promise<Goal[]> {
  const supabase = await createServerSupabaseClient();
  try {
    let query = supabase
      .from("goals")
      .select(
        "id, created_at, title, description, progress, status, target_date, attachments, user_id, updated_at, tags",
      ) // Explicitly select columns
      .eq("user_id", userId);

    if (options.is_completed !== undefined) {
      query = query.eq(
        "status",
        options.is_completed ? "achieved" : "in_progress",
      );
    }

    if (options.sortBy) {
      query = query.order(options.sortBy, {
        ascending: options.ascending ?? false,
      });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching goals:", error);
    return [];
  }
}

export async function addGoal(goalData: {
  title: string;
  description?: string | null;
  status?: string | null;
  target_date?: string | null;
  attachments?: Json | null;
}): Promise<Goal | null> {
  const supabase = await createServerSupabaseClient();
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new AppError("User not authenticated.", 401);
  }

  try {
    const newGoal: GoalInsert = {
      title: goalData.title,
      description:
        goalData.description === null ? undefined : goalData.description,
      status: goalData.status === null ? undefined : goalData.status,
      target_date:
        goalData.target_date === null ? undefined : goalData.target_date,
      attachments:
        goalData.attachments === null ? undefined : goalData.attachments,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("goals")
      .insert(newGoal)
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to add goal: ${error.message}`, 500);
    }

    revalidatePath("/dashboard");
    revalidatePath("/goals");
    return data;
  } catch (error) {
    throw handleServerError(error, "addGoal");
  }
}

export async function updateGoal(
  id: string,
  goalData: GoalUpdate,
): Promise<Goal | null> {
  const supabase = await createServerSupabaseClient();
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new AppError("User not authenticated.", 401);
  }

  try {
    const { data, error } = await supabase
      .from("goals")
      .update(goalData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to update goal: ${error.message}`, 500);
    }

    revalidatePath("/dashboard");
    revalidatePath("/goals");
    return data;
  } catch (error) {
    throw handleServerError(error, "updateGoal");
  }
}

export async function deleteGoal(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new AppError("User not authenticated.", 401);
  }

  try {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new AppError(`Failed to delete goal: ${error.message}`, 500);
    }

    revalidatePath("/dashboard");
    revalidatePath("/goals");
  } catch (error) {
    throw handleServerError(error, "deleteGoal");
  }
}
