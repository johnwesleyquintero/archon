import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

/**
 * Server-side singleton Supabase client.
 * Uses the service-role key so we can perform RLS-bypassing operations
 * (e.g. cron jobs, admin panels). Never expose this key to the browser!
 */
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)
