import { NextResponse } from "next/server";

import { getGoals } from "@/lib/database/goals";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs"; // 'nodejs' (default) | 'edge'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const goals = await getGoals(user.id);
    return NextResponse.json(goals);
  } catch (error: unknown) {
    console.error("API Error in /api/goals:", error); // Server-side logging
    // Return a generic error message to the client in production
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred."
        : error instanceof Error
          ? error.message
          : String(error);
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
