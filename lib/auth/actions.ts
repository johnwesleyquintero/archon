"use server";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validators";

type FormInputs = z.infer<typeof loginSchema> | z.infer<typeof signupSchema>;

export async function handleAuthAction(
  data: FormInputs,
  mode: "signIn" | "signUp",
) {
  const supabase = await createServerSupabaseClient();

  try {
    if (mode === "signIn") {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      return { success: true };
    } else {
      const { email, password } = data as z.infer<typeof signupSchema>;
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return { success: true };
    }
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error);
    } else {
      console.error("Authentication error:", error);
    }
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: errorMessage };
  }
}
