import { TodoList } from "@/components/todo-list";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTasks } from "@/lib/database/tasks";

export default async function TasksPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialTasks = user ? await getTasks() : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
      <TodoList initialTasks={initialTasks} />
    </div>
  );
}
