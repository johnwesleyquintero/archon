import { createClient } from "./server"
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createClient()

    // Get the current session first.  This call is silent when no cookies are present
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      // Only log real errors (network / server errors).
      // The “Auth session missing!” case isn’t an error for a logged-out user.
      if (sessionError.message !== "Auth session missing!") {
        console.error("Error getting session:", sessionError)
      }
      return null
    }

    return session?.user ?? null
  } catch (err) {
    console.error("Unexpected error in getUser:", err)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return user
}

export async function getProfile(userId: string) {
  try {
    const supabase = await createClient()

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    return profile
  } catch (error) {
    console.error("Error in getProfile:", error)
    return null
  }
}

export async function getUserWithProfile() {
  try {
    const user = await getUser()

    if (!user) {
      return { user: null, profile: null }
    }

    const profile = await getProfile(user.id)

    return { user, profile }
  } catch (error) {
    console.error("Error in getUserWithProfile:", error)
    return { user: null, profile: null }
  }
}
