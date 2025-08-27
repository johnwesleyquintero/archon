"use client";

import { Task } from "@/lib/types/task"; // Import Task
import { TodoWidgetConfig } from "@/lib/types/widget-types";

import { useTaskFetching } from "./use-task-fetching";
import { useTaskMutations } from "./use-task-mutations";

// Compose fetching and mutation hooks
export function useTasks(initialTasks: Task[] = [], config?: TodoWidgetConfig) {
  const {
    tasks,
    loading,
    error: fetchError,
    refetchTasks,
    setTasks,
  } = useTaskFetching(initialTasks, config);

  const {
    isMutating,
    error: mutationError,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
  } = useTaskMutations({ setTasks });

  return {
    tasks,
    loading,
    error: fetchError || mutationError,
    isMutating,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    refetchTasks,
    setTasks, // Return setTasks
  };
}
