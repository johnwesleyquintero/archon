// This file was previously abbreviated. Here is its full content.
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Task, TaskFilterType, TaskSortType } from "@/lib/supabase/types"

export async function getTasks(
  userId: string,
  filter: TaskFilterType,
  sort: TaskSortType,
): Promise<{ data: Task[] | null; error: Error | null }> {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

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
  } else if (sort === "due_date") {
    query = query.order("due_date", { ascending: true, nullsFirst: false }) // Sort by due date, nulls last
  }

  try {
    const { data, error } = await query
    if (error) {
      console.error("Error fetching tasks:", error.message)
      return { data: null, error: error }
    }
    return { data, error: null }
  } catch (err: any) {
    console.error("Unexpected error in getTasks:", err)
    return { data: null, error: new Error(err.message || "An unexpected error occurred.") }
  }
}

export async function addTask(userId: string, title: string): Promise<{ data: Task[] | null; error: Error | null }> {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    const { data, error } = await supabase.from("tasks").insert({ user_id: userId, title }).select()
    if (error) {
      console.error("Error adding task:", error.message)
      return { data: null, error: error }
    }
    return { data, error: null }
  } catch (err: any) {
    console.error("Unexpected error in addTask:", err)
    return { data: null, error: new Error(err.message || "An unexpected error occurred.") }
  }
}

export async function toggleTask(
  userId: string,
  taskId: string,
  completed: boolean,
): Promise<{ data: Task | null; error: Error | null }> {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    const { data, error } = await supabase
      .from("tasks")
      .update({ completed })
      .eq("id", taskId)
      .eq("user_id", userId) // Ensure user owns the task
      .select()
      .single()

    if (error) {
      console.error("Error toggling task:", error.message)
      return { data: null, error: error }
    }
    return { data, error: null }
  } catch (err: any) {
    console.error("Unexpected error in toggleTask:", err)
    return { data: null, error: new Error(err.message || "An unexpected error occurred.") }
  }
}

export async function deleteTask(userId: string, taskId: string): Promise<{ success: boolean; error: Error | null }> {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId) // Ensure user owns the task
    if (error) {
      console.error("Error deleting task:", error.message)
      return { success: false, error: error }
    }
    return { success: true, error: null }
  } catch (err: any) {
    console.error("Unexpected error in deleteTask:", err)
    return { success: false, error: new Error(err.message || "An unexpected error occurred.") }
  }
}
