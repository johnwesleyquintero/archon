"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, isPast, isToday } from "date-fns";
import {
  Calendar as CalendarIcon,
  Trash2,
  Edit,
  Plus,
  Target,
  Archive,
  ChevronDown,
  ChevronRight,
} from "lucide-react"; // Import Archive icon
import React, { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { taskSchema } from "@/lib/validators";
import { TaskInput } from "./task-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, TaskStatus, TaskPriority } from "@/lib/types/task";
import { TaskDependency } from "@/lib/types/task-dependency";
import { Textarea } from "@/components/ui/textarea";

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  goals: Goal[];
}

export const TaskEditModal = ({
  isOpen,
  onClose,
  task,
}: TaskEditModalProps) => {
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      due_date: task?.due_date || null,
      category: task?.category || null,
      tags: task?.tags || [],
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      notes: task?.notes || "",
      goal_id: task?.goal_id || null,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        due_date: task.due_date || null,
        category: task.category || null,
        tags: task.tags || [],
        status: task.status || "todo",
        priority: task.priority || "medium",
        notes: task.notes || "",
        goal_id: task.goal_id || null,
      });
    }
  }, [task, form]);

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    if (!task) return;
    // Logic to update task
    console.log("Updating task:", values);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                      {...field}
                      value={field.value ?? ""}
                      className="min-h-[100px]"
                      placeholder="Add notes..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Due Date */}
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
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? date.toISOString() : null)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TaskStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() +
                            status.slice(1).replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save changes</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
import type { Database } from "@/lib/supabase/types";
import type { Goal } from "@/lib/types/goal";
import type { TaskFormValues } from "@/lib/validators";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, is_completed: boolean) => void | Promise<void>;
  onArchive: (id: string) => void | Promise<void>; // New prop for archiving
  onDeletePermanently: (id: string) => void | Promise<void>; // New prop for permanent delete
  onUpdate: (
    id: string,
    updatedTask: Partial<Database["public"]["Tables"]["tasks"]["Update"]>,
  ) => Promise<void>;
  onAddTask: (
    taskData: TaskFormValues & { parent_id?: string },
  ) => Promise<void>;
  onOpenModal: (task: Task) => void;
  onEdit: (task: Task) => void; // New prop for editing tasks
  disabled?: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  goal?: Goal | null;
  taskDependencies: TaskDependency[];
  allTasks: Task[];
  isDragging?: boolean; // New prop for drag state
  isOverlay?: boolean; // New prop to indicate if it's a drag overlay
}

/**
 * @component
 * @example
 * ```tsx
 * <TaskItem
 *   id="task-123"
 *   title="Complete project documentation"
 *   is_completed={false}
 *   due_date="2023-12-31"
 *   category="Work"
 *   tags={["documentation", "urgent"]}
 *   onToggle={handleToggle}
 *   onArchive={handleArchive}
 *   onDeletePermanently={handleDeletePermanently}
 *   onUpdate={handleUpdate}
 * />
 * ```
 */
export const TaskItem = React.memo(function TaskItem(props: TaskItemProps) {
  const { task, taskDependencies, allTasks } = props;
  const {
    id,
    title,
    is_completed,
    due_date,
    category,
    tags,
    status,
    notes,
    subtasks,
    priority, // Destructure priority
  } = task;
  const {
    onToggle,
    onArchive, // Use new archive prop
    onDeletePermanently, // Use new permanent delete prop
    onUpdate,
    onAddTask,
    onOpenModal,
    onEdit,
    disabled = false,
    isSelected,
    onSelect,
    goal,
  } = props;
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [showFullNotes, setShowFullNotes] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDependencies, setShowDependencies] = useState(false);

  const dependentTasks = taskDependencies.filter(
    (dep) => dep.depends_on_task_id === task.id,
  );

  const parentTasks = taskDependencies.filter((dep) => dep.task_id === task.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: props.isDragging ? 10 : 0, // Use props.isDragging
    opacity: props.isDragging ? 0.5 : 1, // Use props.isDragging
    // Add specific styling for overlay if needed
    ...(props.isOverlay && {
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      borderRadius: "0.375rem",
      backgroundColor: "white", // Or your theme's background color
      padding: "0.5rem",
    }),
  };

  const statusColors: Record<string, string> = {
    todo: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    in_progress:
      "bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200",
    done: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200",
    canceled: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200",
    archived: "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200", // Added archived status color
  };

  const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.Low]:
      "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200",
    [TaskPriority.Medium]:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200",
    [TaskPriority.High]:
      "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex flex-col gap-1 py-2",
        isDragging && "ring-2 ring-blue-500 rounded-md",
      )}
    >
      <div className="flex items-center gap-2">
        {subtasks && subtasks.length > 0 ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="h-8 w-8" />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 cursor-grab"
          {...listeners}
          {...attributes}
          aria-label="Drag task"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-slate-400"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </Button>
        <Checkbox
          id={`select-${id}`}
          checked={isSelected}
          onCheckedChange={() => onSelect(id)}
          className="h-4 w-4 rounded border-slate-300"
          aria-label="Select task"
        />
        <Checkbox
          id={`task-${id}`}
          checked={is_completed}
          onCheckedChange={(checked) => void onToggle(id, !!checked)}
          className="h-4 w-4 rounded border-slate-300"
          aria-label={
            is_completed ? "Mark task as incomplete" : "Mark task as complete"
          }
        />
        <label
          htmlFor={`task-${id}`}
          className={cn(
            "flex-1 text-sm cursor-pointer",
            is_completed && "text-slate-400 line-through dark:text-slate-600",
          )}
          onClick={() => onOpenModal(task)}
        >
          {title}
        </label>
        {priority && (
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-0.5 text-xs font-semibold",
              priorityColors[priority],
            )}
          >
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        )}

        {status && (
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", statusColors[status])}
          >
            {status}
          </Badge>
        )}
        {goal && (
          <Badge
            variant="secondary"
            className="text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
          >
            <Target className="h-3 w-3 mr-1" />
            {goal.title}
          </Badge>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-6 text-xs px-2 py-0",
                (!due_date ||
                  (due_date &&
                    !isPast(new Date(due_date)) &&
                    !isToday(new Date(due_date)))) &&
                  "text-muted-foreground",
                due_date &&
                  isToday(new Date(due_date)) &&
                  "text-orange-600 dark:text-orange-500",
                due_date &&
                  isPast(new Date(due_date)) &&
                  !isToday(new Date(due_date)) &&
                  "text-red-600 dark:text-red-500",
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {due_date ? format(new Date(due_date), "MMM d") : "Set Due Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={due_date ? new Date(due_date) : undefined}
              onSelect={(date) => {
                void onUpdate(id, {
                  due_date: date ? date.toISOString() : null,
                });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Status Select */}
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium cursor-pointer",
                status ? statusColors[status] : "",
              )}
            >
              {status ? status.replace(/_/g, " ") : "Set Status"}
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-[160px] p-0" align="start">
            <Select
              value={status ?? undefined}
              onValueChange={(newStatusValue) => {
                void onUpdate(id, {
                  status: newStatusValue as TaskStatus,
                });
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TaskStatus)
                  .filter((s) => s !== TaskStatus.Archived) // Filter out archived status
                  .map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() +
                        s.slice(1).replace(/_/g, " ")}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>

        {(dependentTasks.length > 0 || parentTasks.length > 0) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDependencies(!showDependencies)}
            className="h-8 w-8"
            title="Toggle Dependencies"
          >
            {showDependencies ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowSubtaskInput(!showSubtaskInput)}
          aria-label="Add subtask"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
              aria-label="More options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </Button>
          </PopoverTrigger>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
            onClick={() => setShowSubtaskInput(!showSubtaskInput)}
            aria-label="Add subtask"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <PopoverContent className="w-40 p-0" align="end">
            <div className="flex flex-col">
              <Button
                variant="ghost"
                className="justify-start text-sm"
                onClick={() => onEdit(task)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              {goal && (
                <Button
                  variant="ghost"
                  className="justify-start text-sm"
                  onClick={() => onOpenModal(task)}
                >
                  <Target className="mr-2 h-4 w-4" /> View Goal
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="justify-start text-sm text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your task and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => void onDeletePermanently(id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="ghost"
                className="justify-start text-sm"
                onClick={() => void onArchive(id)}
              >
                <Archive className="mr-2 h-4 w-4" /> Archive
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {notes && (
        <div className="ml-6 text-xs text-slate-600 dark:text-slate-300 mt-1">
          <p className="whitespace-pre-wrap">
            {showFullNotes
              ? notes
              : `${notes.substring(0, 150)}${notes.length > 150 ? "..." : ""}`}
          </p>
          {notes.length > 150 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowFullNotes(!showFullNotes)}
              className="p-0 h-auto text-xs text-blue-600 dark:text-blue-400"
            >
              {showFullNotes ? "Show less" : "Read more"}
            </Button>
          )}
        </div>
      )}
      {(category || (tags && tags.length > 0)) && (
        <div className="flex items-center gap-2 ml-6 text-xs text-slate-500 dark:text-slate-400">
          <Popover>
            <PopoverTrigger asChild>
              <Badge
                variant="secondary"
                className="text-xs font-medium cursor-pointer"
              >
                {category || "Set Category"}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-[160px] p-0" align="start">
              <Select
                value={category || ""}
                onValueChange={(newCategory) =>
                  void onUpdate(id, {
                    category: newCategory === "__none__" ? null : newCategory,
                  })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No Category</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                </SelectContent>
              </Select>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Badge
                variant="secondary"
                className="text-xs font-medium cursor-pointer"
              >
                {tags && tags.length > 0 ? tags.join(", ") : "Add Tags"}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag: string, index: number) => (
                    <Badge
                      key={`${tag}-${index}`}
                      variant="secondary"
                      className="gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => {
                          const newTags = [...tags];
                          newTags.splice(index, 1);
                          void onUpdate(id, { tags: newTags });
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
                        if (value && !tags?.includes(value)) {
                          void onUpdate(id, {
                            tags: [...(tags || []), value],
                          });
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
        </div>
      )}

      {/* Subtasks Section */}
      {isExpanded && subtasks && subtasks.length > 0 && (
        <div className="ml-12 mt-2 border-l pl-4 border-slate-200 dark:border-slate-700">
          <ul className="space-y-1">
            {subtasks.map((subtask: Task) => (
              <li key={subtask.id}>
                <TaskItem
                  task={subtask}
                  onToggle={onToggle}
                  onArchive={onArchive} // Pass onArchive to subtasks
                  onDeletePermanently={onDeletePermanently} // Pass onDeletePermanently to subtasks
                  onUpdate={onUpdate}
                  onAddTask={onAddTask}
                  onOpenModal={onOpenModal}
                  disabled={disabled}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  onEdit={onEdit} // Pass onEdit to subtasks
                  goal={null} // Subtasks don't have their own goal prop, they inherit from parent or are standalone
                  taskDependencies={taskDependencies} // Pass dependencies down
                  allTasks={allTasks} // Pass all tasks down
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="ml-6 mt-2">
        {showSubtaskInput ? (
          <TaskInput
            onAddTask={async (input) => {
              await onAddTask({ ...input, parent_id: id });
              setShowSubtaskInput(false);
            }}
            onCancel={() => setShowSubtaskInput(false)}
            autoFocus
            isSubtaskInput
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            onClick={() => setShowSubtaskInput(true)}
          >
            <Plus className="mr-1 h-3 w-3" /> Add Subtask
          </Button>
        )}
      </div>

      {showDependencies &&
        (dependentTasks.length > 0 || parentTasks.length > 0) && (
          <div className="ml-8 mt-2 border-l-2 border-gray-200 pl-4">
            {parentTasks.length > 0 && (
              <div className="mb-2">
                <h4 className="text-sm font-semibold">Depends On:</h4>
                <ul className="list-disc pl-5 text-sm">
                  {parentTasks.map((dep: TaskDependency) => (
                    <li key={dep.depends_on_task_id}>
                      {allTasks.find((t) => t.id === dep.depends_on_task_id)
                        ?.title || `Task ID: ${dep.depends_on_task_id}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {dependentTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Blocks:</h4>
                <ul className="list-disc pl-5 text-sm">
                  {dependentTasks.map((dep: TaskDependency) => (
                    <li key={dep.task_id}>
                      {allTasks.find((t) => t.id === dep.task_id)?.title ||
                        `Task ID: ${dep.task_id}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
    </div>
  );
});
