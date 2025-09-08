"use client";

import {
  User,
  Session,
  AuthError as SupabaseAuthError,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

import type React from "react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: SupabaseAuthError | null;
  signOut: () => Promise<{ error: SupabaseAuthError | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (
    profileData: Partial<Omit<Profile, "id" | "updated_at">>,
  ) => Promise<{ error: SupabaseAuthError | null }>;
  isSigningOut: boolean;
  setIsSigningOut: React.Dispatch<React.SetStateAction<boolean>>;
  signInWithPassword: (
    credentials: SignInWithPasswordCredentials,
  ) => Promise<{ error: SupabaseAuthError | null }>;
  signUpWithPassword: (
    credentials: SignUpWithPasswordCredentials,
  ) => Promise<{ error: SupabaseAuthError | null }>;
  sendPasswordResetEmail: (
    email: string,
  ) => Promise<{ error: SupabaseAuthError | null }>;
  reauthenticate: () => Promise<{ error: SupabaseAuthError | null }>;
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

  const fetchProfile = useCallback(
    async (userId: string) => {
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
          full_name: (userData.user.user_metadata?.full_name as string) || "", // Safely access and cast
          avatar_url:
            (userData.user.user_metadata?.avatar_url as string) ||
            "/placeholder-user.svg", // Safely access and cast
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
    },
    [supabase],
  );

  const refreshProfile = async (): Promise<void> => {
    // Re-added async and explicit return type
    if (user) {
      await fetchProfile(user.id).then(setProfile); // Await the promise
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
      const noUserError = {
        name: "AuthError",
        message: "No user logged in.",
      } as SupabaseAuthError;
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
      const status =
        err instanceof SupabaseAuthError && err.status ? err.status : 500;
      const code =
        err instanceof SupabaseAuthError && err.code
          ? err.code
          : "CLIENT_ERROR";
      // Correctly instantiate SupabaseAuthError
      const supabaseError = new SupabaseAuthError(
        typedError.message,
        status,
        code,
      );
      console.error("Error updating profile:", supabaseError);
      setError(supabaseError);
      return { error: supabaseError };
    }
  };

  const signInWithPassword = async (
    credentials: SignInWithPasswordCredentials,
  ) => {
    setError(null);
    const { error: signInError } =
      await supabase.auth.signInWithPassword(credentials);
    if (signInError) {
      setError(signInError);
      return { error: signInError };
    }
    return { error: null };
  };

  const signUpWithPassword = async (
    credentials: SignUpWithPasswordCredentials,
  ) => {
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp(credentials);
    if (signUpError) {
      setError(signUpError);
      return { error: signUpError };
    }
    return { error: null };
  };

  const sendPasswordResetEmail = async (email: string) => {
    setError(null);
    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email);
    if (resetError) {
      setError(resetError);
      return { error: resetError };
    }
    return { error: null };
  };

  const reauthenticate = async () => {
    setError(null);
    const { error: reauthError } = await supabase.auth.reauthenticate();
    if (reauthError) {
      setError(reauthError);
      return { error: reauthError };
    }
    return { error: null };
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        void fetchProfile(currentUser.id).then(setProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, fetchProfile]);

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signOut,
    refreshProfile,
    updateProfile,
    isSigningOut,
    setIsSigningOut,
    signInWithPassword,
    signUpWithPassword,
    sendPasswordResetEmail,
    reauthenticate,
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
