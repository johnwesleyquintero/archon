"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/error-utils";
import { GoalInsert } from "@/lib/supabase/types";

export const createGoal = withErrorHandling(
  async (formData: { title: string; description?: string }) => {
    const supabase = await createServerSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      throw new Error("User not authenticated.");
    }

    const newGoal: GoalInsert = {
      title: formData.title,
      description: formData.description || null,
      user_id: userData.user.id,
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
