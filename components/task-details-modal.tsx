"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TipTapEditor } from "./quill-editor";
import { Task } from "@/lib/types/task";
import { Database } from "@/lib/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Target } from "lucide-react";

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
  goals?: { id: string; title: string }[];
  allTasks?: Task[]; // New prop for all tasks to select parent
}

export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  goals = [],
  allTasks = [],
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
    }
  }, [task]);

  if (!task) {
    return null;
  }

  const availableParentTasks = allTasks.filter(
    (t) => t.id !== task.id && t.parent_id !== task.id, // Prevent self-selection and direct circular dependency
  );

  const handleSave = () => {
    void onUpdate(task.id, {
      title,
      description,
      recurrence_pattern: recurrencePattern,
      recurrence_end_date: recurrenceEndDate?.toISOString() || null,
      goal_id: goalId,
      parent_id: parentId,
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
              <label className="text-sm font-medium">Recurrence</label>
              <Select
                value={recurrencePattern || "none"}
                onValueChange={setRecurrencePattern}
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
