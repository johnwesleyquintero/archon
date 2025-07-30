"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasks } from "@/lib/database/tasks";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export function useTaskFetching(initialTasks: Task[] = []) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
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

  // Setup realtime subscription
  useEffect(() => {
    if (initialTasks.length === 0) {
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
  }, [fetchTasks, initialTasks.length, user?.id]);

  return {
    tasks,
    loading,
    error,
    refetchTasks: fetchTasks,
    setTasks, // Expose for mutations to update
  };
}
