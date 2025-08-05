import React from "react";
import { getTasks } from "@/lib/database/tasks";
import { Task } from "@/lib/types/task";
import KanbanPage from "./page"; // Import the KanbanPage component

export default async function KanbanLayout() {
  const initialTasks: Task[] = await getTasks();

  return <KanbanPage initialTasks={initialTasks} />;
}
