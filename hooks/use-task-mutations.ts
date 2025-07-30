"use client";

import { useState, useCallback, useTransition } from "react";
import {
  addTask as addTaskToDb,
  toggleTask as toggleTaskInDb,
  deleteTask as deleteTaskFromDb,
  updateTask as updateTaskInDb,
} from "@/lib/database/tasks";
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
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];

export function useTaskMutations({
  setTasks,
}: {
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
        // Process tags to ensure they're in the correct format
        let processedTags: string[] | null = null;
        if (input.tags !== null && input.tags !== undefined) {
          if (Array.isArray(input.tags)) {
            processedTags = input.tags.filter((tag) => typeof tag === "string");
          } else if (typeof input.tags === "string") {
            processedTags = [input.tags];
          }
        }

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
          tags: processedTags,
        };
        setTasks((prev) => [newTask, ...prev]);

        try {
          const rawAddedTask = await addTaskToDb(input);
          if (rawAddedTask) {
            // Convert the raw task to our Task type
            const processedTask = convertRawTaskToTask(rawAddedTask);
            setTasks((prev) =>
              prev.map((task) => (task.id === tempId ? processedTask : task)),
            );
            toast({
              title: "Success!",
              description: "Task added successfully.",
            });
          } else {
            throw new Error("Failed to add task.");
          }
        } catch (err: any) {
          console.error("Error adding task:", err);
          setError(err.message || "Failed to add task.");
          toast({
            title: "Error",
            description: err.message || "Failed to add task.",
            variant: "destructive",
          });
          setTasks((prev) => prev.filter((task) => task.id !== tempId));
        }
      });
    },
    [user, toast, setTasks],
  );

  const handleToggleTask = useCallback(
    async (id: string, completed: boolean) => {
      if (!user) return;
      startTransition(async () => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, is_completed: completed } : task,
          ),
        );
        try {
          await toggleTaskInDb(id, completed);
          toast({
            title: "Success!",
            description: "Task status updated.",
          });
        } catch (err) {
          setTasks((prev) =>
            prev.map((task) =>
              task.id === id ? { ...task, is_completed: !completed } : task,
            ),
          );
          toast({
            title: "Error",
            description: "Failed to update task.",
            variant: "destructive",
          });
        }
      });
    },
    [user, toast, setTasks],
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      if (!user) return;
      let originalTasks: Task[] = [];
      setTasks((prev) => {
        originalTasks = prev;
        return prev.filter((task) => task.id !== id);
      });
      startTransition(async () => {
        try {
          await deleteTaskFromDb(id);
          toast({
            title: "Success!",
            description: "Task deleted.",
          });
        } catch (err) {
          setTasks(originalTasks);
          toast({
            title: "Error",
            description: "Failed to delete task.",
            variant: "destructive",
          });
        }
      });
    },
    [user, toast, setTasks],
  );

  const handleUpdateTask = useCallback(
    async (id: string, newTitle: string) => {
      if (!user) return;
      let originalTasks: Task[] = [];
      setTasks((prev) => {
        originalTasks = prev;
        return prev.map((task) =>
          task.id === id ? { ...task, title: newTitle } : task,
        );
      });
      startTransition(async () => {
        try {
          await updateTaskInDb(id, newTitle);
          toast({
            title: "Success!",
            description: "Task updated.",
          });
        } catch (err) {
          setTasks(originalTasks);
          toast({
            title: "Error",
            description: "Failed to update task.",
            variant: "destructive",
          });
        }
      });
    },
    [user, toast, setTasks],
  );

  return {
    isMutating: isPending,
    error,
    addTask: handleAddTask,
    toggleTask: handleToggleTask,
    deleteTask: handleDeleteTask,
    updateTask: handleUpdateTask,
  };
}
