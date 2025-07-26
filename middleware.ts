import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./lib/supabase/types";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({
            name,
            value,
            ...options,
            path: options?.path || "/",
          });
        },
        remove: (name: string, options: any) => {
          res.cookies.delete({
            name,
            path: options?.path || "/",
          });
        },
      },
    },
  );

  await supabase.auth.getSession();
  return res;
}
