"use client";

import type React from "react";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/config";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  getProfile,
  updateProfile as updateProfileDb,
} from "@/lib/database/profiles"; // Server Action for profile updates

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Define a serializable subset of the User object
export interface SerializableUser {
  id: string;
  email?: string; // Make email optional to match Supabase User type
  created_at?: string; // Add created_at property
  // Add other serializable properties if needed by client components
}

interface AuthContextType {
  user: SerializableUser | null; // Use SerializableUser type
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refetchProfile: () => Promise<void>;
  isSigningOut: boolean;
  setIsSigningOut: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser, // Accept initialUser prop
  initialProfile, // Accept initialProfile prop
}: {
  children: React.ReactNode;
  initialUser: SerializableUser | null; // Define type for initialUser
  initialProfile: Profile | null; // Define type for initialProfile
}) {
  const [user, setUser] = useState<SerializableUser | null>(initialUser); // Initialize user with initialUser
  const [profile, setProfile] = useState<Profile | null>(initialProfile); // Initialize profile with initialProfile
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false); // Add isSigningOut state
  const supabase = getSupabaseBrowserClient();

  const fetchProfile = useCallback(async (userId: string) => {
    setError(null);
    try {
      const fetchedProfile = await getProfile(userId);
      if (fetchedProfile) {
        setProfile(fetchedProfile);
      } else {
        // Profile not found, which is now a valid scenario for new users
        setProfile(null);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let currentUser: SerializableUser | null = initialUser;

        // If no initial user, try to get it from Supabase client
        if (!currentUser) {
          const {
            data: { user: sessionUser },
            error: sessionError,
          } = await supabase!.auth.getUser();

          if (sessionError) {
            throw sessionError;
          }
          // Convert Supabase User object to SerializableUser
          currentUser = sessionUser
            ? {
                id: sessionUser.id,
                email: sessionUser.email,
                created_at: sessionUser.created_at,
              }
            : null;
        }

        if (isMounted) {
          setUser(currentUser);
          // Only fetch profile if not already provided initially
          if (currentUser && !initialProfile) {
            await fetchProfile(currentUser.id);
          } else if (!currentUser) {
            setProfile(null);
          }
        }
      } catch (err: any) {
        // AuthSessionMissingError is often expected for unauthenticated users,
        // so we log it at a lower level. Other errors are logged as errors.
        if (err.name === "AuthSessionMissingError") {
          console.log(
            "Auth context initialization (AuthSessionMissingError):",
            err.message,
          );
        } else {
          console.error("Auth context initialization error:", err);
        }
        if (isMounted) {
          setError(err);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (isMounted) {
          if (event === "SIGNED_IN" || event === "USER_UPDATED") {
            // Ensure the user object is a plain object before setting state
            console.log("Original Supabase User object:", session?.user);
            const serializableUser = session?.user
              ? {
                  id: session.user.id,
                  email: session.user.email,
                  created_at: session.user.created_at,
                }
              : null;
            setUser(serializableUser);
            if (session?.user) {
              fetchProfile(session.user.id);
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setProfile(null);
          }
        }
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, initialUser, initialProfile, fetchProfile]); // Add initialUser, initialProfile and fetchProfile to dependencies

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const { error: signInError } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        throw signInError;
      }
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const { error: signUpError } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL || location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        throw signUpError;
      }
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    setError(null);
    const { error: signOutError } = await supabase!.auth.signOut();
    if (signOutError) {
      throw signOutError;
    }
  }, [supabase]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) {
        throw new Error("User not authenticated.");
      }
      setError(null);
      try {
        const updated = await updateProfileDb(user.id, updates); // Call server action
        if (updated) {
          setProfile(updated);
        } else {
          throw new Error("Failed to update profile in database.");
        }
      } catch (err: any) {
        console.error("Error updating profile:", err);
        setError(err);
        throw err;
      }
    },
    [user],
  );

  const refetchProfile = useCallback(async () => {
    if (user) {
      const fetchedProfile = await getProfile(user.id);
      setProfile(fetchedProfile);
    }
  }, [user]);

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
