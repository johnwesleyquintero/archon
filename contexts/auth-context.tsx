"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/config"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import { getProfile, updateProfile as updateProfileDb } from "@/lib/database/profiles" // Server Action for profile updates

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refetchProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchUserAndProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const {
        data: { user: sessionUser },
        error: sessionError,
      } = await supabase.auth.getUser()

      if (sessionError) {
        throw sessionError
      }

      setUser(sessionUser)

      if (sessionUser) {
        const fetchedProfile = await getProfile(sessionUser.id) // Call server action
        setProfile(fetchedProfile)
      } else {
        setProfile(null)
      }
    } catch (err: any) {
      console.error("Auth context initialization error:", err)
      setError(err)
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUserAndProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session)
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        fetchUserAndProfile()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, fetchUserAndProfile])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        throw signInError
      }
    },
    [supabase],
  )

  const signUp = useCallback(
    async (email: string, password: string) => {
      setError(null)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (signUpError) {
        throw signUpError
      }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    setError(null)
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      throw signOutError
    }
  }, [supabase])

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) {
        throw new Error("User not authenticated.")
      }
      setError(null)
      try {
        const updated = await updateProfileDb(user.id, updates) // Call server action
        if (updated) {
          setProfile(updated)
        } else {
          throw new Error("Failed to update profile in database.")
        }
      } catch (err: any) {
        console.error("Error updating profile:", err)
        setError(err)
        throw err
      }
    },
    [user],
  )

  const refetchProfile = useCallback(async () => {
    if (user) {
      const fetchedProfile = await getProfile(user.id)
      setProfile(fetchedProfile)
    }
  }, [user])

  const value = {
    user,
    profile,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refetchProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
