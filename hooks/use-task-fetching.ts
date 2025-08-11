"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasks } from "@/lib/database/tasks";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import type { Task } from "@/lib/types/task";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { convertRawTaskToTask, buildTaskHierarchy } from "@/lib/utils"; // Import buildTaskHierarchy

// Define the raw task type from the database
type RawTask = Database["public"]["Tables"]["tasks"]["Row"];

export function useTaskFetching(initialTasks: Task[] = []) {
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
      const tasks = await getTasks();
      const processedTasks = (tasks as any[]).map(convertRawTaskToTask);
      const hierarchicalTasks = buildTaskHierarchy(processedTasks); // Build hierarchy
      setTasks(hierarchicalTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

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
