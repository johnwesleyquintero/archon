"use client" // Ensure this is a client component

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

/**
 * Internal singleton so we never create more than one browser client.
 */
let _supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Return the existing instance if we've already created one
  if (_supabaseClient) return _supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  /**
   * In production we fail fast to avoid deploying without credentials.
   * In development / preview we fallback to a stub client so the UI still renders.
   */
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.")
    }

    // ── Dev / Preview fallback ───────────────────────────────────────────
    console.warn(
      "[Supabase] Missing env vars in dev/preview; falling back to stub client.\n" +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "in your .env.local or Vercel project settings.",
    )

    _supabaseClient = createBrowserClient("https://stub.supabase.co", "public-anon-key")
    return _supabaseClient
  }

  // Create and cache the genuine client
  _supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseKey)
  return _supabaseClient
}

/**
 * Client-side singleton Supabase client.
 * This client is safe to use in the browser.
 *
 * Exported as `supabaseClient` to match common import patterns.
 */
export const supabaseClient = createClient()

// Also export as default for convenience, if needed
export default supabaseClient
