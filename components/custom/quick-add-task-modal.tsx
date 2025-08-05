"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskInput } from "@/components/task-input";
import { addTask } from "@/app/tasks/actions";
import { useToast } from "@/components/ui/use-toast";
import { handleError } from "@/lib/utils";
import * as Zod from "zod";
import { taskSchema } from "@/lib/validators";

type TaskFormValues = Zod.infer<typeof taskSchema>;

interface QuickAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddTaskModal({ isOpen, onClose }: QuickAddTaskModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTask = async (input: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      await addTask(input);
      toast({
        title: "Task Added!",
        description: "Your task has been successfully added.",
      });
      onClose(); // Close modal on success
    } catch (error) {
      handleError(error, "QuickAddTaskModal:handleAddTask");
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <TaskInput onAddTask={handleAddTask} disabled={isSubmitting} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
