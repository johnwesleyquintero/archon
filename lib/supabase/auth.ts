import { createClient } from "./server"
import type { User } from "./types"

export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createClient()

    // Use getSession instead of getUser to avoid throwing on missing auth
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return null
    }

    return session?.user || null
  } catch (error) {
    // Only log unexpected errors, not auth session missing
    if (error instanceof Error && !error.message.includes("Auth session missing")) {
      console.error("Error getting user:", error)
    }
    return null
  }
}

export async function getUserWithProfile(userId?: string): Promise<{ user: User | null; profile: any | null }> {
  try {
    const user = userId ? ({ id: userId } as User) : await getUser()

    if (!user) {
      return { user: null, profile: null }
    }

    const supabase = await createClient()
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching profile:", error)
    }

    return { user, profile }
  } catch (error) {
    console.error("Error in getUserWithProfile:", error)
    return { user: null, profile: null }
  }
}
