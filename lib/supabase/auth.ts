"use client";

import { useRouter } from "next/navigation";
import { createClient } from "./client.js";

export function createSupabaseClient() {
  return createClient();
}

export async function getUser() {
  try {
    const supabase = createSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {

      return { user: null, error: error as Error };
    }

    return { user, error: null };
  } catch (error: unknown) {

    return {
      user: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function getProfile(userId: string) {
  try {
    const supabase = createSupabaseClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
  
      return { profile: null, error: error as Error };
    }

    return { profile, error: null };
  } catch (error: unknown) {

    return {
      profile: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export function useSignOut() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  return async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
}
