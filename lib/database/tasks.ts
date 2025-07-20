"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/supabase/auth"
import type { Database } from "@/lib/supabase/types"

export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"]
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"]
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"]

/**
 * Fetches all tasks for the current user.
 */
export async function getTasks(): Promise<TaskRow[]> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.warn("[Supabase] Attempted to fetch tasks without an authenticated user.")
    return []
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[Supabase] Error fetching tasks:", error)
    throw new Error(`Failed to fetch tasks: ${error.message}`)
  }
  return data
}

/**
 * Adds a new task for the current user.
 */
export async function addTask(task: Omit<TaskInsert, "user_id">): Promise<TaskRow | null> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.error("[Supabase] Attempted to add task without an authenticated user.")
    throw new Error("Authentication required to add task.")
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...task, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error("[Supabase] Error adding task:", error)
    throw new Error(`Failed to add task: ${error.message}`)
  }
  return data
}

/**
 * Updates an existing task.
 */
export async function updateTask(id: string, updates: TaskUpdate): Promise<TaskRow | null> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.error("[Supabase] Attempted to update task without an authenticated user.")
    throw new Error("Authentication required to update task.")
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user can only update their own tasks
    .select()
    .single()

  if (error) {
    console.error(`[Supabase] Error updating task ${id}:`, error)
    throw new Error(`Failed to update task: ${error.message}`)
  }
  return data
}

/**
 * Toggles the completion status of a task.
 */
export async function toggleTask(id: string, is_complete: boolean): Promise<TaskRow | null> {
  return updateTask(id, { is_complete })
}

/**
 * Deletes a task.
 */
export async function deleteTask(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.error("[Supabase] Attempted to delete task without an authenticated user.")
    throw new Error("Authentication required to delete task.")
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id) // Ensure user can only delete their own tasks

  if (error) {
    console.error(`[Supabase] Error deleting task ${id}:`, error)
    throw new Error(`Failed to delete task: ${error.message}`)
  }
  return true
}
