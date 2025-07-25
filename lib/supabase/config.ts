"use client"

import { createClient } from "./client"
import type { Database } from "./types"

// Client-side Supabase client (for browser)
let supabaseBrowserClient: ReturnType<typeof createClient<Database, "public">> | null = null

export function getSupabaseBrowserClient() {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient()
  }
  return supabaseBrowserClient
}
