"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createSupabaseClient() {
  return createClientComponentClient<Database>();
}

export async function getUser() {
  try {
    const supabase = createSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.log(
        "Auth error (expected for unauthenticated users):",
        error.message,
      );
      return { user: null, error };
    }

    return { user, error: null };
  } catch (error) {
    console.log(
      "Error getting user (expected for unauthenticated users):",
      error,
    );
    return { user: null, error };
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
      console.log("Profile error:", error.message);
      return { profile: null, error };
    }

    return { profile, error: null };
  } catch (error) {
    console.log("Error getting profile:", error);
    return { profile: null, error };
  }
}

export function useRequireAuth() {
  const router = useRouter();

  const checkAuth = async () => {
    const { user } = await getUser();
    if (!user) {
      router.push("/login");
      return null;
    }
    return user;
  };

  return checkAuth;
}

export function useSignOut() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  return async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
}
