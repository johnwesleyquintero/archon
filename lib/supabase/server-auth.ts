"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/types";

export async function createSupabaseServerClient() {
  const cookieStore = cookies();
  const client = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
  // Test connection to ensure client is initialized
  await client.auth.getSession();
  return client;
}
