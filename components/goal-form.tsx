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

import type { Database } from "@/lib/supabase/types";

type Milestone = {
  id: string;
  description: string;
  completed: boolean;
};

type Goal = Database["public"]["Tables"]["goals"]["Row"] & {
  milestones: Milestone[] | null;
};

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: {
    id?: string;
    title: string;
    description: string;
    target_date?: string;
    progress?: number;
    milestones: Milestone[] | null;
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
  const [milestonesJson, setMilestonesJson] = useState<string>("");
  const [milestonesError, setMilestonesError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || "");
      setTargetDate(
        initialGoal.target_date ? new Date(initialGoal.target_date) : undefined,
      );
      setProgress(initialGoal.progress || 0);
      setMilestonesJson(
        initialGoal.milestones
          ? JSON.stringify(initialGoal.milestones, null, 2)
          : "",
      );
    } else {
      setTitle("");
      setDescription("");
      setTargetDate(undefined);
      setProgress(0);
      setMilestonesJson("");
    }
    setMilestonesError(null); // Clear error on form open/initialization
  }, [initialGoal, isOpen]);

  const handleSubmit = () => {
    if (!title) return;

    let parsedMilestones: Milestone[] | null = null;
    if (milestonesJson) {
      try {
        const parsed = JSON.parse(milestonesJson) as Milestone[];
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (m) =>
              typeof m === "object" &&
              m !== null &&
              "id" in m &&
              "description" in m &&
              "completed" in m,
          )
        ) {
          parsedMilestones = parsed;
          setMilestonesError(null);
        } else {
          setMilestonesError(
            "Invalid JSON format for milestones. Expected an array of objects with id, description, and completed properties.",
          );
          return;
        }
      } catch {
        setMilestonesError("Invalid JSON format for milestones.");
        return;
      }
    }

    onSave({
      ...(initialGoal && { id: initialGoal.id }),
      title,
      description,
      ...(targetDate && { target_date: format(targetDate, "yyyy-MM-dd") }),
      progress,
      milestones: parsedMilestones,
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
            />
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
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="milestones" className="text-right pt-2">
              Milestones (JSON)
            </Label>
            <div className="col-span-3">
              <Textarea
                id="milestones"
                value={milestonesJson}
                onChange={(e) => setMilestonesJson(e.target.value)}
                placeholder='[{"id": "1", "description": "Milestone 1", "completed": false}]'
                className="min-h-[100px]"
              />
              {milestonesError && (
                <p className="text-red-500 text-sm mt-1">{milestonesError}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter milestones as a JSON array of objects with `id`,
                `description`, and `completed` properties.
              </p>
            </div>
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
