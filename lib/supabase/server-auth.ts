"use server";

import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export function createSupabaseServerClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => "", // Cookie handling is managed by middleware
        set: () => {}, // Cookie setting handled by middleware
        remove: () => {}, // Cookie removal handled by middleware
      },
    },
  );
}
