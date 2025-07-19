"use server"

import { supabase } from "./server"
import type { User } from "@supabase/supabase-js"

/* -------------------------------------------------------------------------- */
/*                                 Utilities                                  */
/* -------------------------------------------------------------------------- */

/**
 * Returns the currently authenticated Supabase user **or** `null`
 * if no valid session exists.
 */
export async function getUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error("[getUser] failed:", error.message)
    return null
  }

  return data.user
}

/* Convenience re-exports (helps with tree-shaking) */
export { supabase } from "./server"
