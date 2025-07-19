"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile as UserProfile } from "@/lib/supabase/types"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  signInWithOAuth: (provider: "google" | "github") => Promise<void>
  signOut: () => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Get current session (does NOT use cookies() API on the client)
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // Fetch the profile for this user
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()

        if (profileError) throw profileError

        setProfile(profileData as UserProfile)
      } else {
        setProfile(null)
      }
    } catch (err: any) {
      console.error("AuthContext: Error fetching user/profile:", err)
      setError(err.message || "Failed to fetch user information.")
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only refetch if the session actually changes or is nullified
      if (session?.user?.id !== user?.id || (!session && user)) {
        fetchUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUser, supabase.auth])

  const signInWithOAuth = useCallback(
    async (provider: "google" | "github") => {
      setIsLoading(true)
      setError(null)
      try {
        const { error: signInError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (signInError) {
          throw signInError
        }
        // No need to fetch user here, onAuthStateChange will handle it
      } catch (err: any) {
        console.error("AuthContext: Error signing in with OAuth:", err)
        setError(err.message || "Failed to sign in.")
        setIsLoading(false) // Ensure loading state is reset on error
      }
    },
    [supabase.auth],
  )

  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        throw signOutError
      }
      setUser(null)
      setProfile(null)
    } catch (err: any) {
      console.error("AuthContext: Error signing out:", err)
      setError(err.message || "Failed to sign out.")
    } finally {
      setIsLoading(false)
    }
  }, [supabase.auth])

  const refetchUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  const value = {
    user,
    profile,
    isLoading,
    error,
    signInWithOAuth,
    signOut,
    refetchUser,
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
