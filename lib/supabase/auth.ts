import { cookies } from "next/headers"
import { createServerClient, type SupabaseClient, type CookieOptions } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"

/* -------------------------------------------------------------------------- */
/*                               Helper: client                               */
/* -------------------------------------------------------------------------- */

function createSupabaseServerClient(): SupabaseClient {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // The service-role key is **server-only**. Never expose it to the browser.
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )
}

/* -------------------------------------------------------------------------- */
/*                               Shared types                                 */
/* -------------------------------------------------------------------------- */

export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  theme: "light" | "dark" | "system" | null
  created_at: string | null
  updated_at: string | null
}

export interface UserWithProfile {
  user: User | null
  profile: Profile | null
}

/* -------------------------------------------------------------------------- */
/*                              Public helpers                                */
/* -------------------------------------------------------------------------- */

/**
 * Safely get the current auth user on the **server**.
 * Returns `null` for anonymous visitors instead of throwing.
 */
export async function getServerAuthUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error && error.message !== "Auth session missing!") {
    // Log unexpected errors but don’t break the page
    console.error("Supabase session error:", error.message)
  }

  return session?.user ?? null
}

/**
 * Fetches the auth user and their profile row.
 * Missing session is a normal state (returns `{ user: null, profile: null }`).
 */
export async function getUserWithProfile(): Promise<UserWithProfile> {
  const supabase = createSupabaseServerClient()

  const user = await getServerAuthUser()
  if (!user) {
    return { user: null, profile: null }
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("Error fetching profile:", error.message)
  }

  return { user, profile: profile ?? null }
}
