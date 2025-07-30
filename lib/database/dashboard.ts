"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (e) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have a Supabase auth listener in a Client Component that sets cookies.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (e) {
            // The `delete` method was called from a Server Component.
          }
        },
      },
    },
  );
}

export async function getTaskStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      tasksCompletedThisMonth: 0,
    };
  }

  const { count: totalTasks, error: totalTasksError } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id as any);

  const { count: completedTasks, error: completedTasksError } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id as any)
    .eq("is_completed", true as any);

  const { count: pendingTasks, error: pendingTasksError } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id as any)
    .eq("is_completed", false as any);

  // Tasks completed this month
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).toISOString();

  const {
    count: tasksCompletedThisMonth,
    error: tasksCompletedThisMonthError,
  } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id as any)
    .eq("is_completed", true as any)
    .gte("completed_at", startOfMonth)
    .lte("completed_at", endOfMonth);

  if (
    totalTasksError ||
    completedTasksError ||
    pendingTasksError ||
    tasksCompletedThisMonthError
  ) {
    console.error(
      "Error fetching task stats:",
      totalTasksError ||
        completedTasksError ||
        pendingTasksError ||
        tasksCompletedThisMonthError,
    );
    return {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      tasksCompletedThisMonth: 0,
    };
  }

  return {
    totalTasks: totalTasks || 0,
    completedTasks: completedTasks || 0,
    pendingTasks: pendingTasks || 0,
    tasksCompletedThisMonth: tasksCompletedThisMonth || 0,
  };
}
