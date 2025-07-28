import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { clientEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      clientEnv.NEXT_PUBLIC_SUPABASE_URL,
      clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set(name, "", options);
          },
        },
      },
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const errorMessage =
        error.message || "Could not log in with provided credentials.";
      return NextResponse.redirect(
        requestUrl.origin +
          `/auth/auth-code-error?message=${encodeURIComponent(errorMessage)}`,
      );
    }
    return NextResponse.redirect(requestUrl.origin + "/dashboard");
  }

  // If code is not present, return the user to an error page with some instructions
  return NextResponse.redirect(
    requestUrl.origin +
      "/auth/auth-code-error?message=Could not log in with provided credentials.",
  );
}
