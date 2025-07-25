"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import { getProfile, updateProfile as updateProfileDb } from "@/lib/database/profiles"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export interface SerializableUser {
  id: string
  email?: string
  created_at?: string
}

interface AuthContextType {
  user: SerializableUser | null
  profile: Profile | null
  isLoading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refetchProfile: () => Promise<void>
  isSigningOut: boolean
  setIsSigningOut: React.Dispatch<React.SetStateAction<boolean>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode
  initialUser: SerializableUser | null
  initialProfile: Profile | null
}) {
  const [user, setUser] = useState<SerializableUser | null>(initialUser)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    setError(null)
    try {
      const fetchedProfile = await getProfile(userId)
      setProfile(fetchedProfile || null)
    } catch (err: any) {
      console.error("Error fetching profile:", err)
      setError(err)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          if (isMounted) {
            setError(sessionError)
          }
          return
        }

        let currentUser: SerializableUser | null = null

        if (session?.user) {
          currentUser = {
            id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at,
          }
        } else if (initialUser) {
          currentUser = initialUser
        }

        if (isMounted) {
          setUser(currentUser)

          // Fetch profile if we have a user but no initial profile
          if (currentUser && !initialProfile) {
            await fetchProfile(currentUser.id)
          } else if (!currentUser) {
            setProfile(null)
          }
        }
      } catch (err: any) {
        console.error("Auth initialization error:", err)
        if (isMounted) {
          setError(err)
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (isMounted) {
        if (event === "SIGNED_IN" && session?.user) {
          const serializableUser: SerializableUser = {
            id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at,
          }
          setUser(serializableUser)
          await fetchProfile(session.user.id)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setProfile(null)
        } else if (event === "USER_UPDATED" && session?.user) {
          const serializableUser: SerializableUser = {
            id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at,
          }
          setUser(serializableUser)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, initialUser, initialProfile, fetchProfile])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
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
          emailRedirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL || location.origin}/auth/callback`,
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
    setIsSigningOut(true)
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        throw signOutError
      }
      // Redirect to home page
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    } finally {
      setIsSigningOut(false)
    }
  }, [supabase])

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) {
        throw new Error("User not authenticated.")
      }
      setError(null)
      try {
        const updated = await updateProfileDb(user.id, updates)
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
    isSigningOut,
    setIsSigningOut,
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
