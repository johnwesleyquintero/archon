"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createGoal(formData: {
  title: string;
  description: string;
  target_date?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      target_date: formData.target_date || null,
      status: "pending", // Default status
    })
    .select();

  if (error) {
    console.error("Error creating goal:", error);
    throw new Error(`Failed to create goal: ${error.message}`);
  }

  revalidatePath("/goals");
  return data;
}
