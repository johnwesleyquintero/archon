import React, { useEffect } from "react";

import { TaskInput } from "@/components/task-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTaskMutations } from "@/hooks/use-task-mutations";
import { Task } from "@/lib/types/task";
import { TaskFormValues } from "@/lib/validators";

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  goals?: { id: string; title: string }[];
}

export function TaskEditModal({
  isOpen,
  onClose,
  task,
  goals = [],
}: TaskEditModalProps) {
  const { updateTask, isMutating } = useTaskMutations({
    setTasks: () => {},
  });

  const handleSave = async (values: TaskFormValues) => {
    if (task) {
      await updateTask(task.id, values);
      onClose();
    }
  };

  // Reset form when modal opens with a new task or closes
  useEffect(() => {
    if (!isOpen) {
      // Any form reset logic if needed, though TaskInput handles its own initialData
    }
  }, [isOpen, task]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
        </DialogHeader>
        {task && (
          <TaskInput
            initialData={{
              title: task.title,
              notes: task.notes || "",
              priority: task.priority || "medium",
              status: task.status || "todo",
              due_date: task.due_date || null,
              category: task.category || null,
              tags: task.tags || [],
              recurrence_pattern:
                (task.recurrence_pattern as
                  | "none"
                  | "daily"
                  | "weekly"
                  | "monthly"
                  | "yearly") || "none",
              recurrence_end_date: task.recurrence_end_date || null,
              goal_id: task.goal_id || null,
            }}
            onSave={handleSave}
            onCancel={onClose}
            goals={goals}
            disabled={isMutating}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
