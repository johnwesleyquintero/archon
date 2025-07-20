"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema } from "@/lib/validators";
import type { z } from "zod";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: z.infer<typeof goalSchema>) => void;
  isSaving: boolean;
}

type GoalFormValues = z.infer<typeof goalSchema>;

export function CreateGoalModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: CreateGoalModalProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      target_date: undefined,
      status: "pending",
      attachments: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(); // Reset form when modal opens
    }
  }, [isOpen, form]);

  const handleSave = form.handleSubmit((data) => {
    onSave(data);
  });

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create New Goal"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.formState.isValid || isSaving}
            className="bg-slate-900 hover:bg-slate-800"
          >
            {isSaving ? "Saving..." : "Save Goal"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="goal-title"
            className="text-sm font-medium text-slate-700"
          >
            Goal Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="goal-title"
            {...form.register("title")}
            placeholder="Enter your goal title"
            className="h-10"
            disabled={isSaving}
            autoFocus
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="goal-description"
            className="text-sm font-medium text-slate-700"
          >
            Description
          </Label>
          <Textarea
            id="goal-description"
            {...form.register("description")}
            placeholder="Describe your goal in detail..."
            className="min-h-[100px] resize-none"
            disabled={isSaving}
          />
          <p className="text-xs text-slate-500">
            Optional: Add more details about your goal and how you plan to
            achieve it.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="goal-target-date"
            className="text-sm font-medium text-slate-700"
          >
            Target Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.watch("target_date") && "text-muted-foreground",
                )}
                disabled={isSaving}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch("target_date") ? (
                  format(new Date(form.watch("target_date")!), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  form.watch("target_date")
                    ? new Date(form.watch("target_date")!)
                    : undefined
                }
                onSelect={(date) =>
                  form.setValue("target_date", date?.toISOString(), {
                    shouldValidate: true,
                  })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </form>
    </Modal>
  );
}
