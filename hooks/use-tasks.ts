"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  getTasks,
  addTask,
  toggleTask,
  deleteTask,
  updateTask as updateTaskInDb, // Alias to avoid naming conflict
} from "@/lib/database/tasks";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];

export function useTasks(initialTasks: Task[] = []) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
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
      console.log("Fetched tasks data:", fetchedTasks); // Debug log
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

  useEffect(() => {
    // If initialTasks are not provided, fetch them.
    if (initialTasks.length === 0) {
      fetchTasks();
    }

    const client = createClient();
    const channel = client
      .channel("realtime-tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [...prev, payload.new as Task]);
          }
          if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === payload.new.id ? (payload.new as Task) : task,
              ),
            );
          }
          if (payload.eventType === "DELETE") {
            setTasks((prev) =>
              prev.filter((task) => task.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [fetchTasks, initialTasks, user?.id]);

  const handleAddTask = useCallback(
    async (input: TaskInsert) => {
      if (!user) {
        setError("You must be logged in to add tasks.");
        toast({
          title: "Error",
          description: "You must be logged in to add tasks.",
          variant: "destructive",
        });
        return;
      }
      setError(null);
      const tempId = `temp-${Date.now()}`;
      startTransition(async () => {
        try {
          // Optimistic update
          const newTask: Task = {
            id: tempId,
            title: input.title,
            is_completed: input.is_completed || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: user.id,
            due_date: input.due_date || null,
            priority: input.priority || null,
            category: input.category || null,
            tags: input.tags || null,
          };
          setTasks((prev) => [newTask, ...prev]);

          const addedTask = await addTask(input);
          if (addedTask) {
            setTasks((prev) =>
              prev.map((task) => (task.id === tempId ? addedTask : task)),
            );
            toast({
              title: "Success!",
              description: "Task added successfully.",
            });
          } else {
            // Revert optimistic update if actual add failed
            setTasks((prev) => prev.filter((task) => task.id !== tempId));
            setError("Failed to add task.");
            toast({
              title: "Error",
              description: "Failed to add task.",
              variant: "destructive",
            });
          }
        } catch (err: any) {
          console.error("Error adding task:", err);
          setError(err.message || "Failed to add task.");
          toast({
            title: "Error",
            description: err.message || "Failed to add task.",
            variant: "destructive",
          });
          // Revert optimistic update on error
          setTasks((prev) => prev.filter((task) => task.id !== tempId));
        }
      });
    },
    [user, toast],
  );

  const handleToggleTask = useCallback(
    async (id: string, completed: boolean) => {
      if (!user) {
        setError("You must be logged in to update tasks.");
        toast({
          title: "Error",
          description: "You must be logged in to update tasks.",
          variant: "destructive",
        });
        return;
      }
      setError(null);
      startTransition(async () => {
        try {
          // Optimistic update
          setTasks((prev) =>
            prev.map((task) =>
              task.id === id ? { ...task, is_completed: completed } : task,
            ),
          );
          const updatedTask = await toggleTask(id, completed);
          if (updatedTask) {
            toast({
              title: "Success!",
              description: "Task status updated successfully.",
            });
          } else {
            // Revert optimistic update if actual update failed
            setTasks((prev) =>
              prev.map((task) =>
                task.id === id ? { ...task, is_completed: !completed } : task,
              ),
            );
            setError("Failed to update task status.");
            toast({
              title: "Error",
              description: "Failed to update task status.",
              variant: "destructive",
            });
          }
        } catch (err: any) {
          console.error("Error toggling task:", err);
          setError(err.message || "Failed to update task status.");
          toast({
            title: "Error",
            description: err.message || "Failed to update task status.",
            variant: "destructive",
          });
          // Revert optimistic update on error
          setTasks((prev) =>
            prev.map((task) =>
              task.id === id ? { ...task, is_completed: !completed } : task,
            ),
          );
        }
      });
    },
    [user, toast],
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      if (!user) {
        setError("You must be logged in to delete tasks.");
        return;
      }
      setError(null);
      startTransition(async () => {
        const originalTasks = tasks;
        try {
          // Optimistic update
          setTasks((prev) => prev.filter((task) => task.id !== id));

          await deleteTask(id);
          toast({
            title: "Success!",
            description: "Task deleted successfully.",
          });
        } catch (err: any) {
          console.error("Error deleting task:", err);
          setError(err.message || "Failed to delete task.");
          toast({
            title: "Error",
            description: err.message || "Failed to delete task.",
            variant: "destructive",
          });
          // Revert optimistic update on error
          setTasks(originalTasks); // Restore original tasks
        }
      });
    },
    [user, tasks, toast],
  );

  const handleUpdateTask = useCallback(
    async (id: string, newTitle: string) => {
      if (!user) {
        setError("You must be logged in to update tasks.");
        toast({
          title: "Error",
          description: "You must be logged in to update tasks.",
          variant: "destructive",
        });
        return;
      }
      setError(null);
      startTransition(async () => {
        const originalTasks = tasks;
        try {
          // Optimistic update
          setTasks((prev) =>
            prev.map((task) =>
              task.id === id ? { ...task, title: newTitle } : task,
            ),
          );

          await updateTaskInDb(id, newTitle);
          toast({
            title: "Success!",
            description: "Task updated successfully.",
          });
        } catch (err: any) {
          console.error("Error updating task:", err);
          setError(err.message || "Failed to update task.");
          toast({
            title: "Error",
            description: err.message || "Failed to update task.",
            variant: "destructive",
          });
          // Revert optimistic update on error
          setTasks(originalTasks);
        }
      });
    },
    [user, tasks, toast],
  );

  return {
    tasks,
    loading,
    error,
    isMutating: isPending, // Use isPending from useTransition for mutation state
    addTask: handleAddTask,
    toggleTask: handleToggleTask,
    deleteTask: handleDeleteTask,
    updateTask: handleUpdateTask, // Add updateTask
    refetchTasks: fetchTasks,
  };
}
