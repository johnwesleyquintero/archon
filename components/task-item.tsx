"use client";

import React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean; // Added disabled prop
}

export function TaskItem({
  id,
  title,
  completed,
  onToggle,
  onDelete,
  disabled = false,
}: TaskItemProps) {
  const [isToggling, setIsToggling] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(id, !completed);
    } catch (error) {
      console.error("Error toggling task:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        {isToggling ? (
          <Spinner size="sm" />
        ) : (
          <Checkbox
            id={`task-${id}`}
            checked={completed}
            onCheckedChange={() => {
              void handleToggle();
            }}
            disabled={disabled || isToggling || isDeleting}
            aria-label={`Mark task "${title}" as ${completed ? "incomplete" : "complete"}`}
          />
        )}
        <label
          htmlFor={`task-${id}`}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            completed && "line-through text-slate-500 dark:text-slate-400",
          )}
        >
          {title}
        </label>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          void handleDelete();
        }}
        disabled={disabled || isToggling || isDeleting}
        className="text-slate-500 hover:text-destructive dark:text-slate-400 dark:hover:text-destructive"
        aria-label={`Delete task "${title}"`}
      >
        {isDeleting ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
