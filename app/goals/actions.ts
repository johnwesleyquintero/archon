"use server";

import { revalidatePath } from "next/cache";

import { updateGoal as dbUpdateGoal } from "@/lib/database/goals";
import { withErrorHandling } from "@/lib/error-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

type GoalInsert = TablesInsert<"goals">;
type GoalUpdate = TablesUpdate<"goals">;

export const createGoal = withErrorHandling(
  async (formData: {
    title: string;
    description?: string | null;
    target_date?: string | null;
    progress?: number | null;
  }) => {
    const supabase = await createServerSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      throw new Error("User not authenticated.");
    }

    const newGoal: GoalInsert = {
      title: formData.title,
      description: formData.description || null,
      user_id: userData.user.id,
      target_date: formData.target_date || null,
      progress: formData.progress ?? 0,
    };

    const { data, error } = await supabase
      .from("goals")
      .insert(newGoal)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create goal: ${error.message}`);
    }

    revalidatePath("/goals");
    return data;
  },
);

export const updateGoal = withErrorHandling(
  async (
    id: string,
    formData: {
      title?: string;
      description?: string;
      target_date?: string;
      progress?: number;
    },
  ) => {
    const updatedData: GoalUpdate = {};
    if (formData.title !== undefined) updatedData.title = formData.title;
    if (formData.description !== undefined)
      updatedData.description = formData.description;
    if (formData.target_date !== undefined)
      updatedData.target_date = formData.target_date;
    if (formData.progress !== undefined)
      updatedData.progress = formData.progress;

    const data = await dbUpdateGoal(id, updatedData);
    revalidatePath("/goals");
    return data;
  },
);
