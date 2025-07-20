"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { taskSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskInputProps {
  onAddTask: (title: string) => Promise<void>;
  disabled?: boolean;
}

export const TaskInput = React.forwardRef<HTMLInputElement, TaskInputProps>(
  ({ onAddTask, disabled = false }, _ref) => {
    const [isAdding, setIsAdding] = useState(false);

    const form = useForm<TaskFormValues>({
      resolver: zodResolver(taskSchema),
      defaultValues: {
        title: "",
      },
      mode: "onBlur", // Enable real-time validation on blur
    });

    const handleAddTaskSubmit = async (data: TaskFormValues) => {
      setIsAdding(true);
      try {
        await onAddTask(data.title);
        form.reset(); // Reset form after successful submission
      } catch (err) {
        console.error("Error adding task:", err);
        // Set form error if needed, though onAddTask might handle it
        form.setError("title", {
          type: "manual",
          message: "Failed to add task. Please try again.",
        });
      } finally {
        setIsAdding(false);
      }
    };

    return (
      <form
        onSubmit={(e) => {
          void form.handleSubmit(handleAddTaskSubmit)(e);
        }}
        className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
      >
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Add a new task..."
                    className="h-9 text-sm border-slate-200 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-600 dark:focus:ring-slate-600"
                    disabled={disabled || isAdding}
                    aria-label="New task title"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !disabled && !isAdding) {
                        e.preventDefault();
                        void form.handleSubmit(handleAddTaskSubmit)();
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="sm"
            className="h-9 w-9 p-0 bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
            disabled={!form.formState.isValid || disabled || isAdding}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="sr-only">Add Task</span>
          </Button>
        </div>
      </form>
    );
  },
);

TaskInput.displayName = "TaskInput";
