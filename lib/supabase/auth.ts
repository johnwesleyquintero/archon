/**
 * Lightweight helpers that wrap the server-side Supabase client.
 */
import { supabase } from "./server"

/**
 * Returns the signed-in user (or null) inside a Server Action /
 * Route Handler / RSC.
 */
export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) console.error("[Supabase] getUser error:", error)
  return user ?? null
}

export { supabase } from "./server"
