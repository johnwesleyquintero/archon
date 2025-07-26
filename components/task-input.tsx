"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CalendarIcon, Plus, Loader2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { taskSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskInputProps {
  onAddTask: (input: TaskFormValues) => Promise<void>;
  disabled?: boolean;
}

export const TaskInput = React.forwardRef<HTMLInputElement, TaskInputProps>(
  ({ onAddTask, disabled = false }, _ref) => {
    const [isAdding, setIsAdding] = useState(false);

    const form = useForm<TaskFormValues>({
      resolver: zodResolver(taskSchema),
      defaultValues: {
        title: "",
        priority: "medium",
        tags: [],
        category: null,
        dueDate: null,
      },
      mode: "onBlur", // Enable real-time validation on blur
    });

    const handleAddTaskSubmit = async (data: TaskFormValues) => {
      setIsAdding(true);
      try {
        await onAddTask({
          title: data.title,
          priority: data.priority,
          tags: data.tags,
          category: data.category,
          dueDate: data.dueDate,
        });
        form.reset(); // Reset form after successful submission
      } catch (err) {
        console.error("Error adding task:", err);
        // Set form error if needed, though onAddTask might handle it
        form.setError("title", {
          type: "manual",
          message: "Failed to add task. Please try again.",
        });
      } finally {
        setIsAdding(false);
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
                      disabled={disabled || isAdding}
                      aria-label="New task title"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !disabled && !isAdding) {
                          e.preventDefault();
                          void form.handleSubmit(handleAddTaskSubmit)();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
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
                        disabled={disabled || isAdding}
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
              name="priority"
              render={({ field }) => (
                <FormItem className="flex-none">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={disabled || isAdding}
                  >
                    <SelectTrigger className="h-9 w-[100px]">
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
              name="category"
              render={({ field }) => (
                <FormItem className="flex-none">
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "__none__" ? null : value)
                    }
                    value={field.value || "__none__"}
                    disabled={disabled || isAdding}
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
              name="tags"
              render={({ field }) => (
                <FormItem className="flex-none">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 w-9 p-0"
                        disabled={disabled || isAdding}
                      >
                        <Tag className="h-4 w-4" />
                        <span className="sr-only">Add tags</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3" align="end">
                      <div className="space-y-4">
                        <h4 className="font-medium leading-none">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((tag, index) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="gap-1"
                            >
                              {tag}
                              <button
                                onClick={() => {
                                  const newTags = [...field.value];
                                  newTags.splice(index, 1);
                                  field.onChange(newTags);
                                }}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add tag"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.currentTarget;
                                const value = input.value.trim();
                                if (value && !field.value.includes(value)) {
                                  field.onChange([...field.value, value]);
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
            <Button
              type="submit"
              size="sm"
              className="h-9 w-9 p-0 bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              disabled={!form.formState.isValid || disabled || isAdding}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sr-only">Add Task</span>
            </Button>
          </div>
        </form>
      </Form>
    );
  },
);

// Add displayName for React DevTools
TaskInput.displayName = "TaskInput";
