"use client";

import type { Database } from "@/lib/supabase/types";
import { useTaskFetching } from "./use-task-fetching";
import { useTaskMutations } from "./use-task-mutations";
import { convertRawTaskToTask } from "@/lib/utils";

// Define the raw task type from the database
type RawTask = Database["public"]["Tables"]["tasks"]["Row"];

// Compose fetching and mutation hooks
export function useTasks(initialRawTasks: RawTask[] = []) {
  // Convert initial raw tasks to proper Task type
  const initialTasks = initialRawTasks.map(convertRawTaskToTask);

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
