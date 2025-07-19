// This file was previously abbreviated. Here is its full content.
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Profile } from "@/lib/supabase/types"

export async function getProfileById(userId: string): Promise<{ data: Profile | null; error: Error | null }> {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error.message)
      return { data: null, error: error }
    }

    return { data, error: null }
  } catch (err: any) {
    console.error("Unexpected error in getProfileById:", err)
    return { data: null, error: new Error(err.message || "An unexpected error occurred.") }
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>,
): Promise<{ data: Profile | null; error: Error | null }> {
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
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error.message)
      return { data: null, error: error }
    }

    return { data, error: null }
  } catch (err: any) {
    console.error("Unexpected error in updateProfile:", err)
    return { data: null, error: new Error(err.message || "An unexpected error occurred.") }
  }
}
