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

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser, // Accept initialUser prop
}: {
  children: React.ReactNode;
  initialUser: User | null; // Define type for initialUser
}) {
  const [user, setUser] = useState<User | null>(initialUser); // Initialize user with initialUser
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getSupabaseBrowserClient();

  const fetchProfile = useCallback(async (userId: string) => {
    setError(null);
    try {
      const fetchedProfile = await getProfile(userId);
      setProfile(fetchedProfile);
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
        let currentUser = initialUser;

        // If no initial user, try to get it from Supabase client
        if (!currentUser) {
          const {
            data: { user: sessionUser },
            error: sessionError,
          } = await supabase!.auth.getUser();

          if (sessionError) {
            throw sessionError;
          }
          currentUser = sessionUser;
        }

        if (isMounted) {
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser.id);
          } else {
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
        console.log("Auth state changed:", event, session);
        if (isMounted) {
          if (event === "SIGNED_IN" || event === "USER_UPDATED") {
            setUser(session?.user || null);
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
  }, [supabase, initialUser, fetchProfile]); // Add initialUser and fetchProfile to dependencies

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
