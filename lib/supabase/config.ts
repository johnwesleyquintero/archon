import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Client-side Supabase client (for browser)
let supabaseBrowserClient: ReturnType<
  typeof createBrowserClient<Database, "public">
> | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createBrowserClient<Database, "public">(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            if (typeof document !== "undefined") {
              return document.cookie
                .split(";")
                .find((c) => c.trim().startsWith(name + "="))
                ?.split("=")[1];
            }
            return null;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            if (typeof document !== "undefined") {
              document.cookie = `${name}=${value}; ${Object.entries(options)
                .map(([key, val]) => `${key}=${String(val)}`)
                .join(";")}`;
            }
          },
          remove(name: string, options: Record<string, unknown>) {
            if (typeof document !== "undefined") {
              document.cookie = `${name}=; Max-Age=-99999999; ${Object.entries(
                options,
              )
                .map(([key, val]) => `${key}=${String(val)}`)
                .join(";")}`;
            }
          },
        },
      },
    );
  }
  return supabaseBrowserClient;
}
