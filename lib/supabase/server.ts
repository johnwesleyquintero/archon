"use server";

import { createServerClient as createServerClientSSR } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
  priority?: "low" | "medium" | "high";
  encode?: (value: string) => string;
  partitioned?: boolean;
};

export async function getSupabaseServerClient() {
  const cookieStore = await cookies(); // Await the cookies() call
  return createServerClientSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use anon key for server-side operations that are user-facing
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(name: string, _options: CookieOptions) {
          cookieStore.delete(name);
        },
      },
    },
  );
}
