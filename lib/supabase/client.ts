"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

let cachedSupabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Return existing client if already created
  if (cachedSupabaseClient) {
    return cachedSupabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  // Create and cache the client
  cachedSupabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  return cachedSupabaseClient
}

// Export the client instance
export const supabaseClient = createClient()

// Also export as default for convenience
export default createClient
