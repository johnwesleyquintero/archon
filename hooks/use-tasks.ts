"use client";

import type { Database } from "@/lib/supabase/types";
import type { Task } from "@/lib/types/task";
import { useTaskFetching } from "./use-task-fetching";
import { useTaskMutations } from "./use-task-mutations";

// Define the raw task type from the database
type RawTask = Database["public"]["Tables"]["tasks"]["Row"];

// Helper function to convert RawTask to Task with proper tags type
const convertRawTaskToTask = (rawTask: RawTask): Task => {
  let processedTags: string[] | null = null;

  if (rawTask.tags !== null) {
    if (Array.isArray(rawTask.tags)) {
      // Filter out any non-string values
      processedTags = rawTask.tags.filter((tag) => typeof tag === "string");
    } else if (typeof rawTask.tags === "string") {
      // If it's a single string, convert to array
      processedTags = [rawTask.tags];
    }
  }

  return {
    ...rawTask,
    tags: processedTags,
  };
};

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
