import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

/**
 * A singleton Supabase client for all **server-side** code.
 * ─────────────────────────────────────────────────────────
 * • Uses SERVICE_ROLE key if available (admin abilities),
 *   otherwise falls back to the public anon key.
 * • In CI/preview environments where env-vars are absent
 *   we create a harmless stub so builds don’t crash.
 */
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function createStub() {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return createClient<Database>("https://stub.supabase.co", "public-anon-key" as any, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export const supabase =
  supabaseUrl && (supabaseServiceKey || supabaseAnonKey)
    ? createClient<Database>(supabaseUrl, supabaseServiceKey ?? supabaseAnonKey!)
    : createStub()

export default supabase
