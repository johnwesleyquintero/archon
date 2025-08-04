"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createServerSupabaseClient();
  const cookieStore = await cookies();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`,
  });

  if (error) {
    cookieStore.set("auth_error_message", error.message, {
      path: "/auth/forgot-password",
      maxAge: 60 * 5,
    }); // 5 minutes
    return redirect("/auth/forgot-password");
  }

  cookieStore.set(
    "auth_success_message",
    "Password reset email sent successfully.",
    { path: "/auth/forgot-password", maxAge: 60 * 5 },
  ); // 5 minutes
  return redirect("/auth/forgot-password");
}
