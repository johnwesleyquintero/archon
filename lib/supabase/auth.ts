<<<<<<< HEAD
import { getSupabaseServerClient } from "./server";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    redirect("/login");
  }

  return session;
}

export async function getAuthUser() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error);
    return null;
  }

  return user;
=======
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { Database } from "./types"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
}

export async function getUser() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.log("Auth error (expected for unauthenticated users):", error.message)
      return { user: null, error }
    }

    return { user, error: null }
  } catch (error) {
    console.log("Error getting user (expected for unauthenticated users):", error)
    return { user: null, error }
  }
}

export async function getProfile(userId: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.log("Profile error:", error.message)
      return { profile: null, error }
    }

    return { profile, error: null }
  } catch (error) {
    console.log("Error getting profile:", error)
    return { profile: null, error }
  }
}

export async function requireAuth(): Promise<User> {
  const { user } = await getUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/login")
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
}
