"use client";

import { useState, useEffect, useCallback } from "react";

import { useAuth } from "@/contexts/auth-context";
import {
  getTasks,
  TaskFilterOptions,
  TaskSortOptions,
} from "@/lib/database/tasks";
import { Task } from "@/lib/types/task";
import { TodoWidgetConfig } from "@/lib/types/widget-types";
import { buildTaskHierarchy } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client"; // Keep createClient for the subscription

export function useTaskFetching(
  initialTasks: Task[] = [],
  config?: TodoWidgetConfig,
) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed useToast and createClient as they are not directly used in fetchTasks logic
  // and createClient is used within useEffect for subscription.

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const filterOptions: TaskFilterOptions = {};
      if (config?.filters?.status === "completed") {
        filterOptions.isCompleted = true;
      } else if (config?.filters?.status === "incomplete") {
        filterOptions.isCompleted = false;
      }

      const sortOptions: TaskSortOptions = {};
      if (config?.sort?.by) {
        sortOptions.sortBy =
          config.sort.by === "dueDate" ? "due_date" : config.sort.by;
        sortOptions.sortOrder = config.sort.order;
      }

      const tasks: Task[] = await getTasks(filterOptions, sortOptions);
      const hierarchicalTasks = buildTaskHierarchy(tasks); // Build hierarchy
      setTasks(hierarchicalTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    user,
    config,
    getTasks,
    buildTaskHierarchy,
    setTasks,
    setLoading,
    setError,
  ]);

  // Setup realtime subscription and initial fetch
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (initialTasks.length > 0) {
      setLoading(false);
      setTasks(buildTaskHierarchy(initialTasks)); // Build hierarchy for initial tasks too
    } else {
      void fetchTasks();
    }

    const client = createClient();
    const channel = client
      .channel("realtime-tasks-fetching")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user?.id}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_payload) => {
          void fetchTasks();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [
    initialTasks,
    user,
    fetchTasks,
    setTasks,
    setLoading,
    buildTaskHierarchy,
  ]);

  return {
    tasks,
    loading,
    error,
    refetchTasks: fetchTasks,
    setTasks,
  };
}
