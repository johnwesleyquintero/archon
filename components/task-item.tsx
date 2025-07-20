"use client";

import React from "react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

import type { Database } from "@/lib/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskItemProps
  extends Pick<
    Task,
    "id" | "title" | "completed" | "due_date" | "priority" | "category" | "tags"
  > {
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
}

export function TaskItem({
  id,
  title,
  completed,
  due_date,
  priority,
  category,
  tags = [],
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

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="group flex flex-col gap-1 py-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`task-${id}`}
          checked={completed}
          disabled={disabled || isToggling}
          onCheckedChange={() => void handleToggle()}
          className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 dark:border-slate-600 dark:data-[state=checked]:bg-slate-50 dark:data-[state=checked]:border-slate-50"
        />
        <label
          htmlFor={`task-${id}`}
          className={cn(
            "flex-1 text-sm cursor-pointer",
            completed && "text-slate-400 line-through dark:text-slate-600",
          )}
        >
          {title}
        </label>
        {due_date && (
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(due_date), "MMM d")}</span>
          </div>
        )}
        {priority && (
          <Badge
            variant="secondary"
            className={cn("text-xs font-medium", priorityColors[priority])}
          >
            {priority}
          </Badge>
        )}
        {isToggling && (
          <Spinner className="w-4 h-4 text-slate-400 dark:text-slate-600" />
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={disabled || isDeleting}
          onClick={() => void handleDelete()}
        >
          {isDeleting ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="sr-only">Delete task</span>
        </Button>
      </div>
      {(category || tags?.length > 0) && (
        <div className="flex items-center gap-2 ml-6 text-xs text-slate-500 dark:text-slate-400">
          {category && (
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {category}
            </span>
          )}
          {tags?.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="px-1.5 py-0 text-xs border-slate-200 dark:border-slate-700"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
