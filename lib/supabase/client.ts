<<<<<<< HEAD
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
=======
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
<<<<<<< HEAD
  );
=======
  )
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
}
