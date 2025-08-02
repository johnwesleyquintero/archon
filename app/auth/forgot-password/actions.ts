"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "@supabase/supabase-js";
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
    return redirect(
      `/auth/forgot-password?message=${encodeURIComponent(error.message)}`,
    );
  }

  return redirect(
    "/auth/forgot-password?message=Password reset email sent. Please check your inbox.",
  ); // More explicit success message
}
