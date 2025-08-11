"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuickAddTask } from "@/lib/state/use-quick-add-task";
import { TaskInput } from "@/components/task-input";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";
import { TaskFormValues } from "@/lib/validators";
import { toast } from "sonner";

export function QuickAddTaskModal() {
  const { isOpen, close } = useQuickAddTask();
  const { addTask, isMutating } = useTasks();
  const { user } = useAuth();

  const handleAddTask = async (input: TaskFormValues) => {
    if (!user) {
      toast.error("You must be logged in to add a task.");
      return;
    }
    await addTask({ ...input, user_id: user.id });
    toast.success("Task added successfully!");
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new task</DialogTitle>
          <DialogDescription>
            Quickly capture what's on your mind. You can add more details later.
          </DialogDescription>
        </DialogHeader>
        <TaskInput
          onAddTask={handleAddTask}
          disabled={isMutating || !user}
          autoFocus
        />
      </DialogContent>
    </Dialog>
  );
}
