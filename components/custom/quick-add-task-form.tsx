"use client";

import { TaskInput } from "@/components/task-input";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";
import { TaskFormValues } from "@/lib/validators";
import { toast } from "sonner";

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
