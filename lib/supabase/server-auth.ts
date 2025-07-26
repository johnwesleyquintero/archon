"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export async function createSupabaseServerClient() {
  const cookieStore = cookies();
  const client = createServerClient<Database>({
    cookies: () => cookieStore,
  });
  // Test connection to ensure client is initialized
  await client.auth.getSession();
  return client;
}
