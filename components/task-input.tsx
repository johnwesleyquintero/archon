"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Calendar } from "@/components/ui/calendar";
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
import {
  CalendarIcon,
  Plus,
  Loader2,
  Tag,
  Repeat,
  Target,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { taskSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Zod from "zod";
import { handleError } from "@/lib/utils";
import { format } from "date-fns"; // Import format
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type TaskFormValues = Zod.infer<typeof taskSchema>;

// Define recurrence patterns
const recurrencePatterns = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

interface TaskInputProps {
  onAddTask?: (input: TaskFormValues) => Promise<void>; // Made optional for editing
  onSave?: (input: TaskFormValues) => Promise<void>; // New prop for saving edits
  initialData?: Partial<TaskFormValues>; // New prop for pre-filling form
  onCancel?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  isSubtaskInput?: boolean;
  goals?: { id: string; title: string }[];
}

export const TaskInput = React.forwardRef<HTMLInputElement, TaskInputProps>(
  (
    {
      onAddTask,
      onSave,
      initialData,
      onCancel,
      disabled = false,
      autoFocus = false,
      isSubtaskInput = false,
      goals = [],
    },
    _ref,
  ) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TaskFormValues>({
      resolver: zodResolver(taskSchema),
      defaultValues: initialData || {
        title: "",
        priority: "medium",
        tags: [],
        category: null,
        due_date: null, // Changed from dueDate to due_date
        status: "todo",
        notes: "",
        recurrence_pattern: "none",
        recurrence_end_date: null,
        goal_id: null,
      },
      mode: "onBlur",
    });

    const handleAddTaskSubmit = async (data: TaskFormValues) => {
      setIsSubmitting(true);
      try {
        if (onAddTask) {
          await onAddTask(data);
          form.reset();
        } else if (onSave) {
          await onSave(data);
        }
      } catch (err: unknown) {
        handleError(err, "TaskInput");
        if (err instanceof Zod.ZodError) {
          err.issues.forEach((error: Zod.ZodIssue) => {
            if (error.path.length > 0) {
              form.setError(error.path[0] as keyof TaskFormValues, {
                type: "manual",
                message: error.message,
              });
            } else {
              form.setError("root", {
                type: "manual",
                message: error.message,
              });
            }
          });
        } else if (err instanceof Error) {
          form.setError("root", {
            type: "manual",
            message: err.message,
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: "An unexpected error occurred.",
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit(handleAddTaskSubmit)(e);
          }}
          className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
        >
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Add a new task..."
                      className="h-9 text-sm border-slate-200 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-600 dark:focus:ring-slate-600"
                      disabled={disabled || isSubmitting}
                      aria-label="New task title"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !disabled && !isSubmitting) {
                          e.preventDefault();
                          void form.handleSubmit(handleAddTaskSubmit)();
                        }
                      }}
                      autoFocus={autoFocus} // Apply autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9"
              onClick={() => {
                void (async () => {
                  const title = form.getValues("title");
                  if (!title) return;

                  setIsSubmitting(true);
                  try {
                    const response = await fetch("/api/groq-chat", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userInput: title }),
                    });

                    if (!response.ok) {
                      throw new Error("Failed to parse task.");
                    }

                    const data =
                      (await response.json()) as Partial<TaskFormValues>;
                    form.reset({ ...form.getValues(), ...data });
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setIsSubmitting(false);
                  }
                })();
              }}
              disabled={isSubmitting}
            >
              <Sparkles className="h-4 w-4" />
              <span className="sr-only">Parse with AI</span>
            </Button>
            {!isSubtaskInput && ( // Conditionally render these fields for main task input
              <>
                <FormField
                  control={form.control}
                  name="goal_id"
                  render={({ field }) => (
                    <FormItem className="flex-none">
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "__none__" ? null : value)
                        }
                        value={field.value || "__none__"}
                        disabled={disabled || isSubmitting}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <Target className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Goal" />
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
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="flex-none">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={disabled || isSubmitting}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex-none">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={disabled || isSubmitting}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">Todo</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_date" // Changed from dueDate to due_date
                  render={({ field }) => (
                    <FormItem className="flex-none">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`h-9 w-9 p-0 ${
                              field.value
                                ? "text-slate-900 dark:text-slate-50"
                                : "text-slate-400"
                            }`}
                            disabled={disabled || isSubmitting}
                          >
                            <CalendarIcon className="h-4 w-4" />
                            <span className="sr-only">Pick a due date</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(date ? date.toISOString() : null)
                            }
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex-none">
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "__none__" ? null : value)
                        }
                        value={field.value || "__none__"}
                        disabled={disabled || isSubmitting}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">No Category</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recurrence_pattern"
                  render={({ field }) => (
                    <FormItem className="flex-none">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "none"}
                        disabled={disabled || isSubmitting}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <Repeat className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Recurrence" />
                        </SelectTrigger>
                        <SelectContent>
                          {recurrencePatterns.map((pattern) => (
                            <SelectItem
                              key={pattern.value}
                              value={pattern.value}
                            >
                              {pattern.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                {form.watch("recurrence_pattern") !== "none" && (
                  <FormField
                    control={form.control}
                    name="recurrence_end_date"
                    render={({ field }) => (
                      <FormItem className="flex-none">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-9 w-[120px] justify-start text-left font-normal"
                              disabled={disabled || isSubmitting}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>End Date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) =>
                                field.onChange(date?.toISOString() || null)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem className="flex-none">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-9 w-9 p-0"
                            disabled={disabled || isSubmitting}
                          >
                            <Tag className="h-4 w-4" />
                            <span className="sr-only">Add tags</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3" align="end">
                          <div className="space-y-4">
                            <h4 className="font-medium leading-none">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {field.value?.map(
                                (tag: string, index: number) => (
                                  <Badge
                                    key={`${tag}-${index}`}
                                    variant="secondary"
                                    className="gap-1"
                                  >
                                    {tag}
                                    <button
                                      onClick={() => {
                                        const newTags = [
                                          ...(field.value || []),
                                        ];
                                        newTags.splice(index, 1);
                                        field.onChange(newTags);
                                      }}
                                      className="text-muted-foreground hover:text-foreground"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ),
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add tag"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const input = e.currentTarget;
                                    const value = input.value.trim();
                                    if (
                                      value &&
                                      !field.value?.includes(value)
                                    ) {
                                      field.onChange([
                                        ...(field.value || []),
                                        value,
                                      ]);
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
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder="Add notes..."
                          className="min-h-[60px] text-sm border-slate-200 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-600 dark:focus:ring-slate-600"
                          disabled={disabled || isSubmitting}
                          aria-label="Task notes"
                          {...field}
                          value={field.value ?? ""} // Ensure value is string or undefined
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-9 w-9 p-0 bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              disabled={!form.formState.isValid || disabled || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sr-only">Add Task</span>
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={onCancel}
                disabled={disabled || isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    );
  },
);

// Add displayName for React DevTools
TaskInput.displayName = "TaskInput";
