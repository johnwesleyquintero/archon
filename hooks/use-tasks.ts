"use client";

import type { Database } from "@/lib/supabase/types";
import { useTaskFetching } from "./use-task-fetching";
import { useTaskMutations } from "./use-task-mutations";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

// Compose fetching and mutation hooks
export function useTasks(initialTasks: Task[] = []) {
  const {
    tasks,
    loading,
    error: fetchError,
    refetchTasks,
    setTasks,
  } = useTaskFetching(initialTasks);

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
  };
}
