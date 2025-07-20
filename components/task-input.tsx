"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { taskSchema } from "@/lib/validators"; // Import the schema

interface TaskInputProps {
  onAddTask: (title: string) => void;
  disabled?: boolean;
}

export const TaskInput = React.forwardRef<HTMLInputElement, TaskInputProps>(
  ({ onAddTask, disabled = false }, ref) => {
    const [newTask, setNewTask] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddTask = async () => {
      setError(null); // Clear previous errors
      const validationResult = taskSchema.safeParse({ title: newTask });

      if (!validationResult.success) {
        setError(validationResult.error.errors[0].message);
        return;
      }

      setIsAdding(true);
      try {
        await onAddTask(validationResult.data.title);
        setNewTask("");
      } catch (err) {
        console.error("Error adding task:", err);
        setError("Failed to add task. Please try again.");
      } finally {
        setIsAdding(false);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !disabled && !isAdding) {
        e.preventDefault();
        handleAddTask();
      }
    };

    return (
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2">
          <Input
            ref={ref}
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => {
              setNewTask(e.target.value);
              setError(null); // Clear error on input change
            }}
            onKeyPress={handleKeyPress}
            className="flex-1 h-9 text-sm border-slate-200 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-600 dark:focus:ring-slate-600"
            disabled={disabled || isAdding}
            aria-label="New task title"
            aria-invalid={!!error}
            aria-describedby={error ? "task-input-error" : undefined}
          />
          <Button
            onClick={handleAddTask}
            size="sm"
            className="h-9 w-9 p-0 bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
            disabled={!newTask.trim() || disabled || isAdding}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="sr-only">Add Task</span>
          </Button>
        </div>
        {error && (
          <p id="task-input-error" className="text-destructive text-xs">
            {error}
          </p>
        )}
      </div>
    );
  },
);

TaskInput.displayName = "TaskInput";
