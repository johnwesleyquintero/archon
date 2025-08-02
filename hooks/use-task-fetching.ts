"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasks } from "@/lib/database/tasks";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import type { Task } from "@/lib/types/task";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

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

export function useTaskFetching(initialTasks: Task[] = []) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(true); // Always start as loading
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
      const rawTasks = await getTasks();
      // Convert raw tasks to proper Task type with correct tags format
      const processedTasks = rawTasks.map(convertRawTaskToTask);
      setTasks(processedTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Setup realtime subscription and initial fetch
  useEffect(() => {
    if (!user) {
      setLoading(false); // If no user, stop loading
      return;
    }

    // If initialTasks are provided, we assume they are already loaded
    // and we don't need to fetch immediately.
    // Otherwise, fetch tasks on mount.
    if (initialTasks.length > 0) {
      setLoading(false); // If initial tasks are present, we are not loading
      setTasks(initialTasks); // Ensure tasks are set
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
          fetchTasks(); // Refetch tasks on any change
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [fetchTasks, initialTasks, user?.id]); // Added initialTasks to dependency array

  return {
    tasks,
    loading,
    error,
    refetchTasks: fetchTasks,
    setTasks, // Expose for mutations to update
  };
}
