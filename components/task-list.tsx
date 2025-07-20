"use client";

import { useState, useMemo } from "react";
import { TaskItem } from "./task-item";
import { TaskFilterBar } from "./task-filter-bar";
import { EmptyState } from "./empty-state";
import { useTasks } from "@/hooks/use-tasks";
import { Skeleton } from "@/components/ui/skeleton";
interface TaskListProps {
  onAddTaskClick: () => void; // Callback for "Add New Task" button
}

export function TaskList({ onAddTaskClick }: TaskListProps) {
  const { tasks, loading, toggleTask, deleteTask, isMutating } = useTasks();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredTasks = useMemo(() => {
    if (filter === "active") {
      return tasks.filter((task) => !task.completed);
    } else if (filter === "completed") {
      return tasks.filter((task) => task.completed);
    }
    return tasks;
  }, [tasks, filter]);

  if (loading) {
    return (
      <div className="flex flex-col h-full py-2 space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TaskFilterBar currentFilter={filter} onFilterChange={setFilter} />
      <div className="flex-1 overflow-auto py-2">
        {filteredTasks.length === 0 ? (
          <EmptyState
            message={
              filter === "all"
                ? "No tasks yet!"
                : filter === "active"
                  ? "No active tasks."
                  : "No completed tasks."
            }
            description={
              filter === "all"
                ? "Start by adding a new task below."
                : "Try changing your filter or adding new tasks."
            }
            buttonText={filter === "all" ? "Add New Task" : undefined}
            onButtonClick={filter === "all" ? onAddTaskClick : undefined}
            buttonDisabled={isMutating}
          />
        ) : (
          <ul className="space-y-1">
            {filteredTasks.map((task) => (
              <li key={task.id}>
                <TaskItem
                  id={task.id}
                  title={task.title}
                  completed={task.completed}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  disabled={isMutating}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
