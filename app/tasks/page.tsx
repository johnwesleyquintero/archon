import { TodoList } from "@/components/todo-list";
import { Task } from "@/lib/types/task";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getTasks } from "@/lib/database/tasks";
import { ErrorState } from "@/components/error-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Suspense } from "react";
import { getAuthenticatedUser } from "@/lib/supabase/auth-utils";

export default async function TasksPage() {
  const user = await getAuthenticatedUser();

  let initialTasks: Task[] = [];
  let error: string | null = null;

  if (user) {
    try {
      initialTasks = await getTasks();
    } catch (e: unknown) {
      console.error("Error fetching tasks in TasksPage:", e);
      error = e instanceof Error ? e.message : "Failed to fetch tasks.";
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
        {error ? (
          <ErrorState message={error} />
        ) : (
          <Suspense fallback={<LoadingSkeleton />}>
            <TodoList initialTasks={initialTasks} />
          </Suspense>
        )}
      </div>
    </DashboardLayout>
  );
}
