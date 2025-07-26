"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type {
  User,
  Session,
  AuthError as SupabaseAuthError,
  AuthChangeEvent,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: SupabaseAuthError | null; // Use SupabaseAuthError type
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: SupabaseAuthError | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: SupabaseAuthError | null }>;
  resetPassword: (
    email: string,
  ) => Promise<{ error: SupabaseAuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (
    profileData: Partial<Omit<Profile, "id" | "updated_at">>,
  ) => Promise<{ error: SupabaseAuthError | null }>;
  isSigningOut: boolean;
  setIsSigningOut: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<SupabaseAuthError | null>(null); // Initialize error state with SupabaseAuthError
  const [isSigningOut, setIsSigningOut] = useState(false); // Add isSigningOut state
  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    try {
      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is expected for new users
        console.error("Error fetching profile:", fetchError);
        return null;
      }

      if (existingProfile) {
        return existingProfile;
      }

      // If no profile exists, create one
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error("No user data available for profile creation");
        return null;
      }

      // Create profile with only the columns that exist in the database
      const newProfile = {
        id: userId,
        full_name: userData.user.user_metadata?.full_name || null,
        avatar_url: userData.user.user_metadata?.avatar_url || null,
        username: null, // Will be set later if user wants to customize
      };

      const { data: createdProfile, error: createError } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
        return null;
      }

      return createdProfile;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: SupabaseAuthError | null }> => {
    setError(null); // Clear previous errors
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error);
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
  ): Promise<{ error: SupabaseAuthError | null }> => {
    setError(null); // Clear previous errors
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setError(error);
    return { error };
  };

  const resetPassword = async (
    email: string,
  ): Promise<{ error: SupabaseAuthError | null }> => {
    setError(null); // Clear previous errors
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) setError(error);
    return { error };
  };

  const signOut = async () => {
    setError(null); // Clear previous errors
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error as SupabaseAuthError); // Cast to SupabaseAuthError
    }
  };

  const updateProfile = async (
    profileData: Partial<Omit<Profile, "id" | "updated_at">>,
  ): Promise<{ error: SupabaseAuthError | null }> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user?.id!)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return { error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error as SupabaseAuthError); // Set global error state, cast to SupabaseAuthError
      return { error: error as SupabaseAuthError };
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state changed:", event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const value = {
    user,
    profile,
    session,
    loading,
    error, // Include error in the context value
    signIn,
    signUp,
    resetPassword,
    signOut,
    refreshProfile,
    updateProfile,
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
