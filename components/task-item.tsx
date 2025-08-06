"use client";

import React from "react";
import { format, isPast, isToday } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Trash2, Edit, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TaskInput } from "./task-input";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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

import type { Task } from "@/lib/types/task";
import type { TaskFormValues } from "@/lib/validators"; // Import TaskFormValues

interface TaskItemProps extends Task {
  onToggle: (id: string, is_completed: boolean) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onUpdate: (id: string, updatedTask: Partial<Task>) => Promise<void>;
  onAddTask: (
    taskData: TaskFormValues & { parent_id?: string },
  ) => Promise<void>;
  onOpenModal: (task: Task) => void; // New prop to open the modal
  disabled?: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
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
export const TaskItem = React.memo(function TaskItem(props: TaskItemProps) {
  const {
    id,
    title,
    is_completed,
    due_date,
    priority,
    category,
    tags,
    status,
    subtasks,
    onToggle,
    onDelete,
    onUpdate,
    onAddTask,
    onOpenModal,
    disabled = false,
    isSelected,
    onSelect,
  } = props;
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  // Simplified handlers, as modal will manage complex state
  const handleToggle = async (checked: boolean) => {
    await onToggle(id, checked);
  };

  const handleDelete = async () => {
    await onDelete(id);
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const statusColors: Record<Task["status"], string> = {
    todo: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    in_progress:
      "bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200",
    done: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200",
    canceled: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200",
  };

  return (
    <div className="group flex flex-col gap-1 py-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`select-${id}`}
          checked={isSelected}
          onCheckedChange={() => onSelect(id)}
          className="h-4 w-4 rounded border-slate-300"
          aria-label="Select task"
        />
        <Checkbox
          id={`task-${id}`}
          checked={is_completed}
          disabled={disabled}
          onCheckedChange={(checked) => {
            void handleToggle(!!checked);
          }}
          className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 dark:border-slate-600 dark:data-[state=checked]:bg-slate-50 dark:data-[state=checked]:border-slate-50"
        />
        <label
          htmlFor={`task-${id}`}
          className={cn(
            "flex-1 text-sm cursor-pointer",
            is_completed && "text-slate-400 line-through dark:text-slate-600",
          )}
          onClick={() => onOpenModal(props)}
        >
          {title}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-6 text-xs px-2 py-0",
                (!due_date ||
                  (due_date &&
                    !isPast(new Date(due_date)) &&
                    !isToday(new Date(due_date)))) &&
                  "text-muted-foreground",
                due_date &&
                  isToday(new Date(due_date)) &&
                  "text-orange-600 dark:text-orange-500",
                due_date &&
                  isPast(new Date(due_date)) &&
                  !isToday(new Date(due_date)) &&
                  "text-red-600 dark:text-red-500",
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

        {/* Status Select */}
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium cursor-pointer",
                status ? statusColors[status] : "",
              )}
            >
              {status || "Set Status"}
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-[160px] p-0" align="start">
            <Select
              value={status || "todo"}
              onValueChange={(newStatusValue) => {
                void onUpdate(id, {
                  status: newStatusValue as Task["status"],
                });
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onOpenModal(props)}
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
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
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
              <AlertDialogAction onClick={() => void handleDelete()}>
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
                onValueChange={(newCategory) =>
                  void onUpdate(id, {
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
                        onClick={() => {
                          const newTags = [...tags];
                          newTags.splice(index, 1);
                          void onUpdate(id, { tags: newTags });
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const value = input.value.trim();
                        if (value && !tags?.includes(value)) {
                          void onUpdate(id, {
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

      {/* Subtasks Section */}
      {subtasks && subtasks.length > 0 && (
        <div className="ml-6 mt-2 border-l pl-4 border-slate-200 dark:border-slate-700">
          <ul className="space-y-1">
            {subtasks.map((subtask: Task) => (
              <li key={subtask.id}>
                <TaskItem
                  {...subtask}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onAddTask={onAddTask}
                  onOpenModal={onOpenModal} // Pass onOpenModal to subtasks
                  disabled={disabled}
                  isSelected={isSelected}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="ml-6 mt-2">
        {showSubtaskInput ? (
          <TaskInput
            onAddTask={async (input) => {
              await onAddTask({ ...input, parent_id: id });
              setShowSubtaskInput(false);
            }}
            onCancel={() => setShowSubtaskInput(false)}
            autoFocus
            isSubtaskInput
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            onClick={() => setShowSubtaskInput(true)}
          >
            <Plus className="mr-1 h-3 w-3" /> Add Subtask
          </Button>
        )}
      </div>
    </div>
  );
});
