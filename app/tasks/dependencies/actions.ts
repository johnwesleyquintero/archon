"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTaskDependency(
  taskId: string,
  dependsOnTaskId: string,
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to add a task dependency." };
  }

  const { data, error } = await supabase.from("task_dependencies").insert([
    {
      task_id: taskId,
      depends_on_task_id: dependsOnTaskId,
      user_id: user.id,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  return { data };
}

export async function removeTaskDependency(dependencyId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to remove a task dependency." };
  }

  const { data, error } = await supabase
    .from("task_dependencies")
    .delete()
    .eq("id", dependencyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  return { data };
}
