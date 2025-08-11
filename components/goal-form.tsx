"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Goal } from "@/lib/types/goal"; // Import the Goal type

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: {
    id?: string;
    title: string;
    description: string;
    target_date?: string;
    progress?: number;
    tags?: string[] | null;
  }) => void;
  initialGoal?: Goal | null;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || "");
      setTargetDate(
        initialGoal.target_date ? new Date(initialGoal.target_date) : undefined,
      );
      setProgress(initialGoal.progress || 0);
    } else {
      setTitle("");
      setDescription("");
      setTargetDate(undefined);
      setProgress(0);
      setTitleError(null);
      setProgressError(null);
    }
  }, [initialGoal, isOpen]);

  const handleSubmit = () => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError("Title is required.");
      isValid = false;
    } else {
      setTitleError(null);
    }

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      setProgressError("Progress must be between 0 and 100.");
      isValid = false;
    } else {
      setProgressError(null);
    }

    if (!isValid) {
      return;
    }

    onSave({
      ...(initialGoal && { id: initialGoal.id }),
      title,
      description,
      ...(targetDate && { target_date: format(targetDate, "yyyy-MM-dd") }),
      progress,
      tags: initialGoal?.tags || [],
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialGoal ? "Edit Goal" : "Add New Goal"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              aria-invalid={titleError ? "true" : "false"}
            />
            {titleError && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {titleError}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetDate" className="text-right">
              Target Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !targetDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? (
                    format(targetDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="progress" className="text-right">
              Progress (%)
            </Label>
            <Input
              id="progress"
              type="number"
              value={progress ?? ""}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="col-span-3"
              min="0"
              max="100"
              aria-invalid={progressError ? "true" : "false"}
            />
            {progressError && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {progressError}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
