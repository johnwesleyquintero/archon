import { createClient } from "@/lib/supabase/server"
import type { Task, TablesInsert, TablesUpdate } from "@/lib/supabase/types"

export async function getTasks(userId: string): Promise<Task[]> {
  const supabase = await createClient()

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return tasks || []
}

export async function createTask(task: TablesInsert<"tasks">): Promise<Task | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("tasks").insert(task).select().single()

  if (error) {
    console.error("Error creating task:", error)
    return null
  }

  return data
}

export async function updateTask(id: string, updates: TablesUpdate<"tasks">): Promise<Task | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating task:", error)
    return null
  }

  return data
}

export async function deleteTask(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting task:", error)
    return false
  }

  return true
}
