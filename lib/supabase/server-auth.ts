import { createServerClient as _createServerClient } from "@supabase/ssr";
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { type NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

export function createServerClient(
  cookies: ReadonlyRequestCookies,
  response: NextResponse,
) {
  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );
}
