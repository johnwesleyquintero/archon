import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

/**
 * Try to fetch the currently authenticated user using the Auth helpers + cookies.
 * Returns `null` when the user is not signed in.
 */
export async function getUser(): Promise<User | null> {
  const accessToken = cookies().get("sb-access-token")?.value
  if (!accessToken) return null

  const { data, error } = await supabase.auth.getUser(accessToken)
  if (error) {
    console.error("[getUser] failed:", error)
    return null
  }
  return data.user
}

export { supabase } // convenient re-export for callers that only import from this module
