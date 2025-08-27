"use client";

import { toast } from "sonner";

import { TaskInput } from "@/components/task-input";
import { useAuth } from "@/contexts/auth-context";
import { useTasks } from "@/hooks/use-tasks";
import { TaskFormValues } from "@/lib/validators";

interface QuickAddTaskFormProps {
  onSave: () => void;
}

export function QuickAddTaskForm({ onSave }: QuickAddTaskFormProps) {
  const { addTask, isMutating } = useTasks();
  const { user } = useAuth();

  const handleAddTask = async (input: TaskFormValues) => {
    if (!user) {
      toast.error("You must be logged in to add a task.");
      return;
    }
    await addTask({ ...input, user_id: user.id });
    toast.success("Task added successfully!");
    onSave();
  };

  return (
    <TaskInput
      onAddTask={handleAddTask}
      disabled={isMutating || !user}
      autoFocus
    />
  );
}
