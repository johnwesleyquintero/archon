import { createClient as createBrowserClient } from "@supabase/supabase-js"
import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./types"

// Client-side Supabase client (for browser)
let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseBrowserClient
}

// Server-side Supabase client (for Server Components/Actions)
export function getSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClientSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server-side operations
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", options)
        },
      },
    },
  )
}
