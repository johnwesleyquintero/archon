"use server"

import { getSupabaseServerClient, createServerClientSSR } from "./server"
import type { User } from "@supabase/supabase-js"
import type { Database } from "./types"

/**
 * Retrieves the current user from Supabase on the server side.
 * This function is safe to use in Server Components and Server Actions.
 * @returns The Supabase User object if authenticated, otherwise null.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    // AuthSessionMissingError is common for unauthenticated users, log as info
    if (error.name === "AuthSessionMissingError") {
      console.info("[Supabase] getUser (AuthSessionMissingError):", error.message)
    } else {
      console.error("[Supabase] getUser error:", error)
    }
    return null
  }
  return user
}

/**
 * Retrieves the current session from Supabase on the server side.
 * @returns The Supabase Session object if authenticated, otherwise null.
 */
export async function getSession() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("[Supabase] getSession error:", error)
    return null
  }
  return session
}

/**
 * Creates a service role Supabase client for privileged operations.
 * This client bypasses Row Level Security (RLS) and should only be used
 * in secure server environments (e.g., Server Actions, Route Handlers)
 * where you control access.
 *
 * Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined for service role client.")
  }

  return createServerClientSSR<Database>(supabaseUrl, serviceRoleKey, {
    cookies: {
      get: () => undefined, // Service role client doesn't use user cookies
      set: () => {},
      remove: () => {},
    },
  })
}
