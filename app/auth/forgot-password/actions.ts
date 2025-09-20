"use server";

import { AuthError } from "@supabase/supabase-js";
import { headers } from "next/headers";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function forgotPassword(formData: FormData) {
  const origin = (await headers()).get("origin");
  const email = formData.get("email") as string;
  const supabase = await createServerSupabaseClient();

  const { error }: { error: AuthError | null } =
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/update-password`,
    });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset email sent. Please check your inbox." };
}
