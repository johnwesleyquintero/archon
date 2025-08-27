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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { Goal } from "@/lib/types/goal";
import { Task } from "@/lib/types/task"; // Import Task type
import { MultiSelect } from "./ui/multi-select"; // Import MultiSelect component

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOrUpdate: (
    goalData: z.infer<typeof goalSchema>,
    goalId?: string,
  ) => Promise<void>;
  isSaving: boolean;
  initialData?: Goal | null;
  allTasks?: Task[]; // New prop for all tasks
}

type GoalFormValues = z.infer<typeof goalSchema> & {
  associated_tasks?: string[] | null; // Allow null as per schema
};

export function CreateGoalModal({
  isOpen,
  onClose,
  onSaveOrUpdate,
  isSaving,
  initialData,
  allTasks, // Add allTasks here
}: CreateGoalModalProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      target_date: undefined,
      status: "pending",
      attachments: [],
      current_progress: 0,
      target_progress: 100,
      associated_tasks: [], // Ensure this is always an array
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
          current_progress: initialData.current_progress || 0,
          target_progress: initialData.target_progress || 100,
          associated_tasks: initialData.associated_tasks || [], // Ensure this is always an array
        });
      } else {
        form.reset({
          title: "",
          description: "",
          target_date: undefined,
          status: "pending",
          attachments: [],
          current_progress: 0,
          target_progress: 100,
          associated_tasks: [], // Ensure this is always an array
        });
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

          {/* New Field for Task Association */}
          <FormField
            control={form.control}
            name="associated_tasks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Associated Tasks</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={
                      (allTasks as Task[])?.map((task) => ({
                        label: task.title,
                        value: task.id,
                      })) || []
                    }
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select tasks to associate with this goal"
                    disabled={isSaving}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-slate-500">
                  Optional: Link tasks that contribute to this goal.
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
                        {field.value
                          ? format(new Date(field.value), "PPP")
                          : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date?.toISOString());
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Progress</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter current progress"
                    className="h-10"
                    disabled={isSaving}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === "" ? null : +event.target.value,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Progress</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter target progress"
                    className="h-10"
                    disabled={isSaving}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === "" ? null : +event.target.value,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
