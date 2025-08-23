import { createClient } from "@/lib/supabase/client";
import { TaskDependency } from "@/lib/types/task-dependency";

export async function getTaskDependencies(
  userId: string,
): Promise<TaskDependency[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("task_dependencies")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching task dependencies:", error);
    throw new Error(error.message);
  }

  return data as TaskDependency[];
}
