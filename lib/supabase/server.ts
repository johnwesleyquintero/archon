"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./types"

/**
 * Returns a server-side Supabase client instance for the current request.
 * This client automatically reads and writes user session cookies.
 *
 * Use this function in Server Components, Server Actions, and Route Handlers.
 */
export async function getSupabaseServerClient() {
  const cookieStore = cookies() // Access cookies for the current request

  // Ensure environment variables are present
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // In development or Vercel preview, these might be missing.
    // For production, ensure they are set.
    console.warn(
      "Supabase environment variables are missing. Using stub client. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )
    // Return a stub client to prevent build failures in environments
    // where env vars might not be fully loaded (e.g., Vercel build step)
    return createServerClient<Database>("https://stub.supabase.co", "public-anon-key", {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    })
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: object) {
        try {
          cookieStore.set(name, value, options)
        } catch (error) {
          // This can happen if `set` is called from a Server Component
          // after headers have been sent. It's often ignorable if
          // you have middleware refreshing sessions.
          console.warn("Failed to set cookie:", error)
        }
      },
      remove(name: string, options: object) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: -1 })
        } catch (error) {
          console.warn("Failed to remove cookie:", error)
        }
      },
    },
  })
}
