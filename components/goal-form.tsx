"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Goal } from "@/lib/types/goal"; // Import the Goal type
import { cn } from "@/lib/utils";

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (_goal: {
    id?: string;
    title: string;
    description: string;
    target_date?: string;
    current_progress?: number | null;
    target_progress?: number | null;
    tags?: string[] | null;
  }) => void;
  initialGoal?: Goal | null;
  isDialog?: boolean; // <-- Add isDialog prop
}

export const GoalForm: React.FC<GoalFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
  isDialog = true, // <-- Default to true
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [currentProgress, setCurrentProgress] = useState<number | undefined>(
    undefined,
  );
  const [targetProgress, setTargetProgress] = useState<number | undefined>(
    undefined,
  );
  const [titleError, setTitleError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || "");
      setTargetDate(
        initialGoal.target_date ? new Date(initialGoal.target_date) : undefined,
      );
      setCurrentProgress(initialGoal.current_progress || 0);
      setTargetProgress(initialGoal.target_progress || 100);
    } else {
      setTitle("");
      setDescription("");
      setTargetDate(undefined);
      setCurrentProgress(0);
      setTargetProgress(100);
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

    if (
      currentProgress !== undefined &&
      targetProgress !== undefined &&
      currentProgress > targetProgress
    ) {
      setProgressError(
        "Current progress cannot be greater than target progress.",
      );
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
      current_progress: currentProgress,
      target_progress: targetProgress,
      tags: initialGoal?.tags || [],
    });
    onClose();
  };

  const FormContent = (
    <>
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
          <Label htmlFor="current_progress" className="text-right">
            Current Progress
          </Label>
          <Input
            id="current_progress"
            type="number"
            value={currentProgress ?? ""}
            onChange={(e) => setCurrentProgress(Number(e.target.value))}
            className="col-span-3"
            aria-invalid={progressError ? "true" : "false"}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="target_progress" className="text-right">
            Target Progress
          </Label>
          <Input
            id="target_progress"
            type="number"
            value={targetProgress ?? ""}
            onChange={(e) => setTargetProgress(Number(e.target.value))}
            className="col-span-3"
            aria-invalid={progressError ? "true" : "false"}
          />
          {progressError && (
            <p className="col-span-4 text-right text-sm text-red-500">
              {progressError}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Goal</Button>
      </div>
    </>
  );

  if (!isDialog) {
    return FormContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialGoal ? "Edit Goal" : "Add New Goal"}
          </DialogTitle>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  );
};
