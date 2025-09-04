"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Goal } from "@/lib/types/goal";
import { Task, TaskStatus, TaskPriority } from "@/lib/types/task";
import { cn } from "@/lib/utils";
import { taskSchema } from "@/lib/validators";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Spinner } from "./ui/spinner";
import { Textarea } from "./ui/textarea";

import type { z } from "zod";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOrUpdate: (
    _taskData: z.infer<typeof taskSchema>,
    _taskId?: string,
  ) => Promise<void>;
  isSaving: boolean;
  initialData?: Task | null;
  allTasks?: Task[]; // For parent task selection
  goals?: Goal[]; // For goal linking
}

type TaskFormValues = z.infer<typeof taskSchema>;

export function CreateTaskModal({
  isOpen,
  onClose,
  onSaveOrUpdate,
  isSaving,
  initialData,
  allTasks = [],
  goals = [],
}: CreateTaskModalProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: undefined,
      status: TaskStatus.Todo,
      priority: TaskPriority.Medium,
      parent_id: null,
      goal_id: null,
      tags: [],
      recurrence_pattern: "none",
      recurrence_end_date: undefined,
    },
    mode: "onBlur", // Enable real-time validation on blur
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          title: initialData.title,
          description: initialData.description || "",
          due_date: initialData.due_date
            ? new Date(initialData.due_date).toISOString()
            : undefined,
          status: initialData.status || TaskStatus.Todo,
          priority: initialData.priority || TaskPriority.Medium,
          parent_id: initialData.parent_id || null,
          goal_id: initialData.goal_id || null,
          tags: initialData.tags || [],
          recurrence_pattern: initialData.recurrence_pattern || "none",
          recurrence_end_date: initialData.recurrence_end_date
            ? new Date(initialData.recurrence_end_date).toISOString()
            : undefined,
        });
      } else {
        form.reset({
          title: "",
          description: "",
          due_date: undefined,
          status: TaskStatus.Todo,
          priority: TaskPriority.Medium,
          parent_id: null,
          goal_id: null,
          tags: [],
          recurrence_pattern: "none",
          recurrence_end_date: undefined,
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
      title={initialData ? "Edit Task" : "Create New Task"}
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
              "Update Task"
            ) : (
              "Save Task"
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
                  Task Title <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your task title"
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
                    placeholder="Describe your task in detail..."
                    className="min-h-[100px] resize-none"
                    disabled={isSaving}
                    {...field}
                    value={field.value || ""} // Ensure value is string or undefined, not null
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-slate-500">
                  Optional: Add more details about your task.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSaving}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TaskPriority).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
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
                      {Object.values(TaskStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Task (Subtask of)</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a parent task (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {allTasks
                        .filter((task) => task.id !== initialData?.id) // Prevent task from being its own parent
                        .map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Goal</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Link to a goal (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recurrence_pattern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurrence</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "none"}
                  disabled={isSaving}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a recurrence pattern" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recurrence_end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Recurrence End Date</FormLabel>
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
        </form>
      </Form>
    </Modal>
  );
}
