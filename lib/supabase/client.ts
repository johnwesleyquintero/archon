import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types.js";
import { clientEnv } from "@/lib/env";

export function createClient() {

  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
