"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { cn } from "@/lib/utils";
import { goalSchema } from "@/lib/validators";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Modal } from "./ui/modal";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Spinner } from "./ui/spinner";
import { Textarea } from "./ui/textarea";

import type { Database } from "@/lib/supabase/types";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOrUpdate: (
    goalData: z.infer<typeof goalSchema>,
    goalId?: string,
  ) => Promise<void>;
  isSaving: boolean;
  initialData?: Database["public"]["Tables"]["goals"]["Row"] | null;
}

type GoalFormValues = z.infer<typeof goalSchema>;

export function CreateGoalModal({
  isOpen,
  onClose,
  onSaveOrUpdate,
  isSaving,
  initialData,
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
    mode: "onBlur", // Enable real-time validation on blur
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          title: initialData.title,
          description: initialData.description || "",
          target_date: initialData.target_date
            ? new Date(initialData.target_date).toISOString()
            : undefined,
          status: (initialData.status || "pending") as
            | "pending"
            | "in_progress"
            | "completed",
          attachments: Array.isArray(initialData.attachments)
            ? initialData.attachments.filter(
                (att): att is string => typeof att === "string",
              )
            : [],
        });
      } else {
        form.reset(); // Reset form for new goal
      }
    }
  }, [isOpen, form, initialData]);

  const handleSave = form.handleSubmit(async (data) => {
    await onSaveOrUpdate(data, initialData?.id);
  });

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={initialData ? "Edit Goal" : "Create New Goal"}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={!form.formState.isValid || isSaving}
            className="bg-slate-900 hover:bg-slate-800"
          >
            {isSaving ? (
              <span className="flex items-center">
                <Spinner className="mr-2 h-4 w-4" /> Saving...
              </span>
            ) : initialData ? (
              "Update Goal"
            ) : (
              "Save Goal"
            )}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={void handleSave} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Goal Title <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your goal title"
                    className="h-10"
                    disabled={isSaving}
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your goal in detail..."
                    className="min-h-[100px] resize-none"
                    disabled={isSaving}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-slate-500">
                  Optional: Add more details about your goal and how you plan to
                  achieve it.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Target Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={isSaving}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date?.toISOString(), {
                          shouldValidate: true,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
