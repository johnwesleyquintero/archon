"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/supabase/auth"
import type { Database } from "@/lib/supabase/types"

type Task = Database["public"]["Tables"]["tasks"]["Row"]
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"]
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"]

const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

export async function getTasks(): Promise<Task[]> {
  const supabase = createSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data
}

export async function addTask(title: string): Promise<Task | null> {
  const supabase = createSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    throw new Error("User not authenticated.")
  }

  const { data, error } = await supabase.from("tasks").insert({ title, user_id: user.id }).select().single()

  if (error) {
    console.error("Error adding task:", error)
    throw new Error(`Failed to add task: ${error.message}`)
  }

  revalidatePath("/dashboard")
  return data
}

export async function toggleTask(id: string, completed: boolean): Promise<Task | null> {
  const supabase = createSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    throw new Error("User not authenticated.")
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({ completed })
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user owns the task
    .select()
    .single()

  if (error) {
    console.error("Error toggling task:", error)
    throw new Error(`Failed to toggle task: ${error.message}`)
  }

  revalidatePath("/dashboard")
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    throw new Error("User not authenticated.")
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id) // Ensure user owns the task

  if (error) {
    console.error("Error deleting task:", error)
    throw new Error(`Failed to delete task: ${error.message}`)
  }

  revalidatePath("/dashboard")
}
