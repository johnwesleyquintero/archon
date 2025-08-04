"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
// import { cookies } from "next/headers"; // No longer needed if using client-side toasts

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Password reset email sent successfully." };
}
