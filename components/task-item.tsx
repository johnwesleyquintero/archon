"use client";

import React from "react";
import { format } from "date-fns";
import { useTaskItem } from "@/hooks/use-task-item";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Trash2, Edit } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Database } from "@/lib/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskItemProps
  extends Pick<
    Task,
    "id" | "title" | "is_completed" | "due_date" | "priority" | "category"
  > {
  tags: string[] | null;
  onToggle: (id: string, is_completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updatedTask: Partial<Task>) => Promise<void>;
  disabled?: boolean;
}

/**
 * @component
 * @example
 * ```tsx
 * <TaskItem
 *   id="task-123"
 *   title="Complete project documentation"
 *   is_completed={false}
 *   due_date="2023-12-31"
 *   priority="high"
 *   category="Work"
 *   tags={["documentation", "urgent"]}
 *   onToggle={handleToggle}
 *   onDelete={handleDelete}
 *   onUpdate={handleUpdate}
 * />
 * ```
 */
export const TaskItem = React.memo(function TaskItem({
  id,
  title,
  is_completed,
  due_date,
  priority,
  category,
  tags,
  onToggle,
  onDelete,
  onUpdate,
  disabled = false,
}: TaskItemProps) {
  const {
    isToggling,
    isDeleting,
    isEditing,
    newTitle,
    setNewTitle,
    setIsEditing,
    handleToggle,
    handleDelete,
    handleUpdate,
    handleKeyDown,
  } = useTaskItem({
    id,
    title,
    due_date,
    priority,
    category,
    tags,
    onToggle,
    onDelete,
    onUpdate,
    disabled,
  });

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
          checked={is_completed}
          disabled={disabled || isToggling}
          onCheckedChange={(checked) => {
            void handleToggle(!!checked);
          }}
          className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 dark:border-slate-600 dark:data-[state=checked]:bg-slate-50 dark:data-[state=checked]:border-slate-50"
        />
        {isEditing ? (
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => {
              void handleUpdate();
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm h-8"
            autoFocus
          />
        ) : (
          <label
            htmlFor={`task-${id}`}
            className={cn(
              "flex-1 text-sm cursor-pointer",
              is_completed && "text-slate-400 line-through dark:text-slate-600",
            )}
            onDoubleClick={() => setIsEditing(true)}
          >
            {title}
          </label>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-6 text-xs px-2 py-0",
                !due_date && "text-muted-foreground",
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {due_date ? format(new Date(due_date), "MMM d") : "Set Due Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={due_date ? new Date(due_date) : undefined}
              onSelect={(date) => {
                void onUpdate(id, {
                  due_date: date ? date.toISOString() : null,
                });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium cursor-pointer",
                priority ? priorityColors[priority] : "",
              )}
            >
              {priority || "Set Priority"}
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-[160px] p-0" align="start">
            <Select
              value={priority || ""}
              onValueChange={(newPriority) => {
                void onUpdate(id, {
                  priority: newPriority as Task["priority"],
                });
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>

        {isToggling && (
          <Spinner className="w-4 h-4 text-slate-400 dark:text-slate-600" />
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
          disabled={disabled}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit task</span>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={disabled || isDeleting}
            >
              {isDeleting ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="sr-only">Delete task</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                task.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {(category || (tags && tags.length > 0)) && (
        <div className="flex items-center gap-2 ml-6 text-xs text-slate-500 dark:text-slate-400">
          <Popover>
            <PopoverTrigger asChild>
              <Badge
                variant="secondary"
                className="text-xs font-medium cursor-pointer"
              >
                {category || "Set Category"}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-[160px] p-0" align="start">
              <Select
                value={category || ""}
                onValueChange={async (newCategory) =>
                  await onUpdate(id, {
                    category: newCategory === "__none__" ? null : newCategory,
                  })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No Category</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                </SelectContent>
              </Select>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Badge
                variant="secondary"
                className="text-xs font-medium cursor-pointer"
              >
                {tags && tags.length > 0 ? tags.join(", ") : "Add Tags"}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag: string, index: number) => (
                    <Badge
                      key={`${tag}-${index}`}
                      variant="secondary"
                      className="gap-1"
                    >
                      {tag}
                      <button
                        onClick={async () => {
                          const newTags = [...tags];
                          newTags.splice(index, 1);
                          await onUpdate(id, { tags: newTags });
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag"
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const value = input.value.trim();
                        if (value && !tags?.includes(value)) {
                          await onUpdate(id, {
                            tags: [...(tags || []), value],
                          });
                          input.value = "";
                        }
                      }
                    }}
                    className="h-8"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
});
