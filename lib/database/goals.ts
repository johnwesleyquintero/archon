import { createClient } from "@/lib/supabase/server"
import type { Goal, TablesInsert, TablesUpdate } from "@/lib/supabase/types"

export async function getGoals(userId: string): Promise<Goal[]> {
  const supabase = await createClient()

  const { data: goals, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching goals:", error)
    return []
  }

  return goals || []
}

export async function createGoal(goal: TablesInsert<"goals">): Promise<Goal | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("goals").insert(goal).select().single()

  if (error) {
    console.error("Error creating goal:", error)
    return null
  }

  return data
}

export async function updateGoal(id: string, updates: TablesUpdate<"goals">): Promise<Goal | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("goals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating goal:", error)
    return null
  }

  return data
}

export async function deleteGoal(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("goals").delete().eq("id", id)

  if (error) {
    console.error("Error deleting goal:", error)
    return false
  }

  return true
}
