"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasks } from "@/lib/database/tasks";
import { createClient } from "@/lib/supabase/client";
import { TodoWidgetConfig } from "@/lib/types/widget-types";
import { Task } from "@/lib/types/task";
import { buildTaskHierarchy } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/lib/supabase/types";

// Define the raw task type from the database
type RawTask = Database["public"]["Tables"]["tasks"]["Row"];

export function useTaskFetching(
  initialTasks: Task[] = [],
  config?: TodoWidgetConfig,
) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tasks: Task[] = await getTasks();
      let processedTasks = tasks;

      if (config?.filters?.status === "completed") {
        processedTasks = processedTasks.filter((task) => task.is_completed);
      } else if (config?.filters?.status === "incomplete") {
        processedTasks = processedTasks.filter((task) => !task.is_completed);
      }

      const hierarchicalTasks = buildTaskHierarchy(processedTasks); // Build hierarchy
      setTasks(hierarchicalTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, toast, config]);

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
      fetchTasks();
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
        (payload) => {
          // Re-fetch all tasks to rebuild the hierarchy on any change
          // This is simpler than trying to incrementally update the nested structure
          void fetchTasks();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [initialTasks, user?.id, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetchTasks: fetchTasks,
    setTasks,
  };
}
