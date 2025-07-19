"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * A single Server-Side Supabase client that automatically
 * reads/writes the user session from `next/headers` cookies.
 */
export const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    cookies: {
      get(name: string) {
        // Grab the latest request cookies on every invocation
        return cookies().get(name)?.value
      },
    },
  },
)
