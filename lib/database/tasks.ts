import { createClient } from "@/lib/supabase/server"
import type { Task, TablesInsert, TablesUpdate, TaskFilterType, TaskSortType } from "@/lib/supabase/types"

export async function getTasks(
  userId: string,
  filter: TaskFilterType,
  sort: TaskSortType,
): Promise<{ data: Task[] | null; error: any }> {
  const supabase = await createClient()

  let query = supabase.from("tasks").select("*").eq("user_id", userId)

  // Apply filter
  if (filter === "active") {
    query = query.eq("completed", false)
  } else if (filter === "completed") {
    query = query.eq("completed", true)
  }

  // Apply sort
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false })
  } else if (sort === "oldest") {
    query = query.order("created_at", { ascending: true })
  } else if (sort === "dueDate") {
    // Assuming a 'due_date' column exists and is a timestamp/date type
    // Tasks without a due date might appear first or last depending on DB behavior
    query = query.order("due_date", { ascending: true, nullsFirst: false })
  }

  const { data: tasks, error } = await query

  if (error) {
    console.error("Error fetching tasks:", error)
    return { data: null, error }
  }

  return { data: tasks, error: null }
}

export async function createTask(task: TablesInsert<"tasks">): Promise<{ data: Task | null; error: any }> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("tasks").insert(task).select().single()

  if (error) {
    console.error("Error creating task:", error)
    return { data: null, error }
  }

  return data ? { data, error: null } : { data: null, error: new Error("Task not returned after creation.") }
}

export async function updateTask(
  id: string,
  updates: TablesUpdate<"tasks">,
): Promise<{ data: Task | null; error: any }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating task:", error)
    return { data: null, error }
  }

  return data ? { data, error: null } : { data: null, error: new Error("Task not returned after update.") }
}

export async function deleteTask(id: string): Promise<{ success: boolean; error: any }> {
  const supabase = await createClient()

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting task:", error)
    return { success: false, error }
  }

  return { success: true, error: null }
}
