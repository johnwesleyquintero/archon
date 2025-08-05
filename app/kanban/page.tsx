import React from "react";

export const dynamic = "force-dynamic";

import { getTasks } from "@/lib/database/tasks";
import { Task } from "@/lib/types/task";
import { KanbanView } from "@/components/kanban/kanban-view";

export default async function KanbanPage() {
  const initialTasks: Task[] = await getTasks();

  return (
    <div className="p-4">
      <h1 className="mb-6 text-3xl font-bold">Kanban Board</h1>
      <KanbanView initialTasks={initialTasks} />
    </div>
  );
}
