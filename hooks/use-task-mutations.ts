"use client";

import { useState, useCallback, useTransition } from "react";

import {
  addTask as addTaskToDb,
  toggleTask as toggleTaskInDb,
  deletePermanentlyTask as deleteTaskFromDb, // Changed to deletePermanentlyTask
  updateTask as updateTaskInDb,
} from "@/app/tasks/actions";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import type { Database, TablesUpdate } from "@/lib/supabase/types";
import type { Task } from "@/lib/types/task";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = TablesUpdate<"tasks">;
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
    (input: TaskInsert): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!user) {
          const msg = "You must be logged in to add tasks.";
          setError(msg);
          toast({ title: "Error", description: msg, variant: "destructive" });
          reject(new Error(msg));
          return;
        }
        setError(null);
        startTransition(async () => {
          const result = await addTaskToDb(input);

          if (result && "error" in result) {
            setError(result.error);
            toast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            });
            reject(new Error(result.error));
          } else if (result) {
            toast({
              title: "Success!",
              description: "Task added successfully.",
            });
            resolve();
          } else {
            const msg = "Failed to add task.";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            reject(new Error(msg));
          }
        });
      });
    },
    [user, toast],
  );

  const handleToggleTask = useCallback(
    (id: string, completed: boolean): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!user) {
          const msg = "You must be logged in to toggle tasks.";
          setError(msg);
          toast({ title: "Error", description: msg, variant: "destructive" });
          reject(new Error(msg));
          return;
        }
        setError(null);
        startTransition(async () => {
          setTasks((prev) =>
            prev.map((task) =>
              task.id === id ? { ...task, is_completed: completed } : task,
            ),
          );
          const result = await toggleTaskInDb(id, completed);

          if (result && "error" in result) {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === id ? { ...task, is_completed: !completed } : task,
              ),
            );
            setError(result.error);
            toast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            });
            reject(new Error(result.error));
          } else {
            toast({ title: "Success!", description: "Task status updated." });
            resolve();
          }
        });
      });
    },
    [user, toast, setTasks],
  );

  const handleDeleteTask = useCallback(
    (id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!user) {
          const msg = "You must be logged in to delete tasks.";
          setError(msg);
          toast({ title: "Error", description: msg, variant: "destructive" });
          reject(new Error(msg));
          return;
        }
        setError(null);
        let originalTasks: Task[] = [];
        setTasks((prev) => {
          originalTasks = prev;
          return prev.filter((task) => task.id !== id);
        });
        startTransition(async () => {
          const result = await deleteTaskFromDb(id);

          if (result && "error" in result) {
            setTasks(originalTasks);
            setError(result.error);
            toast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            });
            reject(new Error(result.error));
          } else {
            toast({ title: "Success!", description: "Task deleted." });
            resolve();
          }
        });
      });
    },
    [user, toast, setTasks],
  );

  const handleUpdateTask = useCallback(
    (id: string, updatedTask: Partial<TaskUpdate>): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!user) {
          const msg = "You must be logged in to update tasks.";
          setError(msg);
          toast({ title: "Error", description: msg, variant: "destructive" });
          reject(new Error(msg));
          return;
        }
        setError(null);
        let originalTasks: Task[] = [];
        setTasks((prev) => {
          originalTasks = prev;
          return prev.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task,
          );
        });
        startTransition(async () => {
          const result = await updateTaskInDb(id, updatedTask);

          if (result && "error" in result) {
            setTasks(originalTasks);
            setError(result.error);
            toast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            });
            reject(new Error(result.error));
          } else if (result) {
            setTasks((prev) => prev.map((t) => (t.id === id ? result : t)));
            toast({ title: "Success!", description: "Task updated." });
            resolve();
          } else {
            setTasks(originalTasks);
            const msg = "Failed to update task.";
            setError(msg);
            toast({
              title: "Error",
              description: msg,
              variant: "destructive",
            });
            reject(new Error(msg));
          }
        });
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
