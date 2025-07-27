"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
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
  signOut: () => Promise<{ error: SupabaseAuthError | null }>;
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
        full_name: userData.user.user_metadata?.full_name || "", // Provide empty string default
        avatar_url: userData.user.user_metadata?.avatar_url || "/placeholder-user.jpg", // Provide a default avatar
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


  const signOut = async (): Promise<{ error: SupabaseAuthError | null }> => {
    setError(null); // Clear previous errors
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Error signing out:", signOutError);
      setError(signOutError);
      return { error: signOutError };
    } else {
      setUser(null);
      setProfile(null);
      setSession(null);
      return { error: null };
    }
  };

  const updateProfile = async (
    profileData: Partial<Omit<Profile, "id" | "updated_at">>,
  ): Promise<{ error: SupabaseAuthError | null }> => {
    if (!user) {
      const noUserError = { name: "AuthError", message: "No user logged in." } as SupabaseAuthError;
      console.error("Cannot update profile:", noUserError.message);
      setError(noUserError);
      return { error: noUserError };
    }

    try {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data);
      setError(null); // Clear any previous errors on success
      return { error: null };
    } catch (err) {
      const typedError = err instanceof Error ? err : new Error(String(err));
      const status = (err as any).status || 500;
      const code = (err as any).code || "CLIENT_ERROR";
      // Correctly instantiate SupabaseAuthError
      const supabaseError = new SupabaseAuthError(typedError.message, status, code);
      console.error("Error updating profile:", supabaseError);
      setError(supabaseError);
      return { error: supabaseError };
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id).then(setProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

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
