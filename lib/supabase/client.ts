import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // In production we still fail hard (so you never deploy without the vars)
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.")
    }

    // ── Development / preview fallback ────────────────────────────────
    console.warn(
      "[Supabase] Missing env vars in dev/preview; falling back to stub client.\n" +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "in your .env.local or Vercel project settings.",
    )
    // A dummy project URL/key that won’t be used for real requests.
    supabaseClient = createBrowserClient("https://stub.supabase.co", "public-anon-key")
    return supabaseClient
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
  return supabaseClient
}
