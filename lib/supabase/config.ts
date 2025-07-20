import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

/**
 * Client-side singleton Supabase client.
 * This client is safe to use in the browser.
 *
 * This file is kept for backward compatibility if other modules
 * are still importing from `@/lib/supabase/config`.
 * New code should prefer importing `supabaseClient` from `lib/supabase/client.ts`.
 */
let _supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  if (_supabaseClient) return _supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.")
    }
    console.warn(
      "[Supabase] Missing env vars in dev/preview; falling back to stub client.\n" +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "in your .env.local or Vercel project settings.",
    )
    _supabaseClient = createBrowserClient("https://stub.supabase.co", "public-anon-key")
    return _supabaseClient
  }

  _supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseKey)
  return _supabaseClient
}
