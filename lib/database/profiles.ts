"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/supabase/auth"
import type { Database } from "@/lib/supabase/types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function createProfile(profileData: ProfileInsert): Promise<Profile | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from("profiles").insert(profileData).select().single()

  if (error) {
    console.error("Error creating profile:", error)
    return null
  }

  revalidatePath("/settings")
  return data
}

export async function updateProfile(profileData: ProfileUpdate): Promise<Profile | null> {
  const supabase = createSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    throw new Error("User not authenticated.")
  }

  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", user.id).select().single()

  if (error) {
    console.error("Error updating profile:", error)
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  revalidatePath("/settings")
  return data
}
