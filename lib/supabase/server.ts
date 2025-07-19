import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  // Try multiple environment variable names for flexibility
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL

  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug logging (remove in production)
  console.log("Environment check:", {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    nodeEnv: process.env.NODE_ENV,
    // Don't log actual values for security
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "undefined",
    keyPreview: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : "undefined",
  })

  if (!supabaseUrl || !supabaseKey) {
    const errorMessage = `
Missing Supabase configuration:
- SUPABASE_URL: ${supabaseUrl ? "✓ Found" : "✗ Missing"}
- SUPABASE_ANON_KEY: ${supabaseKey ? "✓ Found" : "✗ Missing"}

Please check:
1. Your .env.local file exists in the project root
2. Environment variables are properly set
3. If using Vercel, check your project settings

Available env vars: ${Object.keys(process.env)
      .filter((key) => key.includes("SUPABASE"))
      .join(", ")}
    `

    console.error(errorMessage)
    throw new Error("Supabase configuration missing. Check your environment variables.")
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Service role client for admin operations
export function createServiceRoleClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for service role operations")
  }

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is required for service role operations")
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No-op for service role client
      },
    },
  })
}
