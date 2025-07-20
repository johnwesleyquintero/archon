"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/supabase/auth"
import type { Database } from "@/lib/supabase/types"

export type GoalRow = Database["public"]["Tables"]["goals"]["Row"]
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"]
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"]

/**
 * Fetches all goals for the current user.
 */
export async function getGoals(): Promise<GoalRow[]> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.warn("[Supabase] Attempted to fetch goals without an authenticated user.")
    return []
  }

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[Supabase] Error fetching goals:", error)
    throw new Error(`Failed to fetch goals: ${error.message}`)
  }
  return data
}

/**
 * Adds a new goal for the current user.
 */
export async function addGoal(goal: Omit<GoalInsert, "user_id">): Promise<GoalRow | null> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.error("[Supabase] Attempted to add goal without an authenticated user.")
    throw new Error("Authentication required to add goal.")
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({ ...goal, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error("[Supabase] Error adding goal:", error)
    throw new Error(`Failed to add goal: ${error.message}`)
  }
  return data
}

/**
 * Updates an existing goal.
 */
export async function updateGoal(id: string, updates: GoalUpdate): Promise<GoalRow | null> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.error("[Supabase] Attempted to update goal without an authenticated user.")
    throw new Error("Authentication required to update goal.")
  }

  const { data, error } = await supabase
    .from("goals")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user can only update their own goals
    .select()
    .single()

  if (error) {
    console.error(`[Supabase] Error updating goal ${id}:`, error)
    throw new Error(`Failed to update goal: ${error.message}`)
  }
  return data
}

/**
 * Deletes a goal.
 */
export async function deleteGoal(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    console.error("[Supabase] Attempted to delete goal without an authenticated user.")
    throw new Error("Authentication required to delete goal.")
  }

  const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", user.id) // Ensure user can only delete their own goals

  if (error) {
    console.error(`[Supabase] Error deleting goal ${id}:`, error)
    throw new Error(`Failed to delete goal: ${error.message}`)
  }
  return true
}
