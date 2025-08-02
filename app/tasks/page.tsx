import { TodoList } from "@/components/todo-list";
import { Task } from "@/lib/types/task";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getTasks } from "@/lib/database/tasks";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function TasksPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialTasks: Task[] = [];
  let errorMessage: string | null = null;
  if (user) {
    try {
      initialTasks = await getTasks();
    } catch (error: unknown) {
      console.error("Error fetching tasks in TasksPage:", error);
      errorMessage =
        error instanceof Error ? error.message : "Failed to fetch tasks.";
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
        <TodoList initialTasks={initialTasks} errorMessage={errorMessage} />
      </div>
    </DashboardLayout>
  );
}
