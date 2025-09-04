"use client";

import React, { useEffect, useState } from "react";
import {
  Archive,
  CalendarIcon,
  Link,
  Plus,
  Target,
  Trash2,
  Unlink,
} from "lucide-react"; // Import Archive and Trash2 icons
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TipTapEditor } from "./quill-editor";

import {
  addTaskDependency,
  removeTaskDependency,
} from "@/app/tasks/dependencies/actions";
import type { Database } from "@/lib/supabase/types";
import { Task, TaskPriority, TaskStatus } from "@/lib/types/task";
import { TaskDependency } from "@/lib/types/task-dependency";

const recurrencePatterns = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (
    id: string,
    updatedTask: Partial<Database["public"]["Tables"]["tasks"]["Update"]>,
  ) => Promise<void>;
  onArchive: (id: string) => void | Promise<void>;
  onDeletePermanently: (id: string) => void | Promise<void>;
  goals?: { id: string; title: string }[];
  allTasks?: Task[];
  taskDependencies?: TaskDependency[];
  onRefreshDependencies: () => void;
}

export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onArchive,
  onDeletePermanently,
  goals = [],
  allTasks = [],
  taskDependencies = [],
  onRefreshDependencies,
}: TaskDetailsModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState<string | null>(
    task?.description || "",
  );
  const [recurrencePattern, setRecurrencePattern] = useState(
    task?.recurrence_pattern || "none",
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(
    task?.recurrence_end_date ? new Date(task.recurrence_end_date) : null,
  );
  const [goalId, setGoalId] = useState<string | null>(task?.goal_id || null);
  const [parentId, setParentId] = useState<string | null>(
    task?.parent_id || null,
  );
  const [priority, setPriority] = useState<TaskPriority | null>(
    task?.priority || null,
  );
  const [status, setStatus] = useState<TaskStatus | null>(
    task?.status as TaskStatus | null,
  );

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setRecurrencePattern(task.recurrence_pattern || "none");
      setRecurrenceEndDate(
        task.recurrence_end_date ? new Date(task.recurrence_end_date) : null,
      );
      setGoalId(task.goal_id || null);
      setParentId(task.parent_id || null);
      setPriority(task.priority || null);
      setStatus(task.status as TaskStatus | null);
    }
  }, [task]);

  if (!task) {
    return null;
  }

  const availableParentTasks = allTasks.filter(
    (t) => t.id !== task.id && t.parent_id !== task.id,
  );

  const handleAddDependency = async (dependsOnTaskId: string) => {
    if (!task) return;
    const result = await addTaskDependency(task.id, dependsOnTaskId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Task dependency added.");
      onRefreshDependencies();
    }
  };

  const handleRemoveDependency = async (dependencyId: string) => {
    const result = await removeTaskDependency(dependencyId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Task dependency removed.");
      onRefreshDependencies();
    }
  };

  const handleSave = () => {
    if (!task) return;
    void onUpdate(task.id, {
      title,
      description,
      recurrence_pattern: recurrencePattern,
      recurrence_end_date: recurrenceEndDate?.toISOString() || null,
      goal_id: goalId,
      parent_id: parentId,
      priority,
      status,
    } as Partial<Database["public"]["Tables"]["tasks"]["Update"]>);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-4 text-lg font-semibold"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <TipTapEditor
              value={description || ""}
              onChange={(value) => setDescription(value)}
              placeholder="Add a more detailed description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Goal</label>
              <Select
                value={goalId || "__none__"}
                onValueChange={(value) =>
                  setGoalId(value === "__none__" ? null : value)
                }
              >
                <SelectTrigger>
                  <Target className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No Goal</SelectItem>
                  {goals?.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Parent Task</label>
              <Select
                value={parentId || "__none__"}
                onValueChange={(value) =>
                  setParentId(value === "__none__" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No Parent</SelectItem>
                  {availableParentTasks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={priority || "__none__"}
                onValueChange={(value) =>
                  setPriority(
                    value === "__none__" ? null : (value as TaskPriority),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No Priority</SelectItem>
                  {["low", "medium", "high"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={status || undefined}
                onValueChange={(value) => setStatus(value as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() +
                        s.slice(1).replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Recurrence</label>
              <Select
                value={recurrencePattern || "none"}
                onValueChange={setRecurrencePattern as (value: string) => void}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  {recurrencePatterns.map((pattern) => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {recurrencePattern !== "none" && (
              <div>
                <label className="text-sm font-medium">
                  Recurrence End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {recurrenceEndDate ? (
                        new Date(recurrenceEndDate).toLocaleDateString()
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={recurrenceEndDate || undefined}
                      onSelect={(date) => setRecurrenceEndDate(date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Task Dependencies Section */}
          <div className="col-span-2">
            <label className="text-sm font-medium">Dependencies</label>
            <div className="space-y-2">
              {taskDependencies
                .filter((dep) => dep.task_id === task.id)
                .map((dep) => {
                  const dependentTask = allTasks.find(
                    (t) => t.id === dep.depends_on_task_id,
                  );
                  return (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <span>
                        <Link className="h-4 w-4 mr-2 inline-block" />
                        {dependentTask?.title || "Unknown Task"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleRemoveDependency(dep.id)}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              <Select
                onValueChange={(value) => void handleAddDependency(value)}
                value=""
              >
                <SelectTrigger>
                  <Plus className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Add a dependency" />
                </SelectTrigger>
                <SelectContent>
                  {allTasks
                    .filter(
                      (t) =>
                        t.id !== task.id &&
                        !taskDependencies.some(
                          (dep) =>
                            dep.task_id === task.id &&
                            dep.depends_on_task_id === t.id,
                        ),
                    )
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                void onArchive(task.id);
                onClose();
              }}
            >
              <Archive className="mr-2 h-4 w-4" /> Archive
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your task.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void onDeletePermanently(task.id);
                      onClose();
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
