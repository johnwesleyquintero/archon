"use server";

import { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "./server";

/**
 * Fetches the authenticated user from Supabase on the server side.
 * This utility centralizes user fetching logic for server components and actions.
 *
 * @returns A Promise that resolves to the Supabase User object or null if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}
