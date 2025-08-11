import type { Database } from "@/lib/supabase/types";

// Define the base task type from the database
type BaseTask = Database["public"]["Tables"]["tasks"]["Row"];

// Define RawTask type to align with database and include all possible statuses
export type RawTask = Database["public"]["Tables"]["tasks"]["Row"] & {
  status: TaskStatus | null;
  notes?: string | null;
  sort_order?: number | null;
};

// Define TaskPriority enum for client-side use
export enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

// Define TaskStatus enum for client-side use, aligning with database enum
export enum TaskStatus {
  Todo = "todo",
  InProgress = "in_progress",
  Done = "done",
  Canceled = "canceled",
  Archived = "archived",
}

// Create a modified Task type with id as string and tags as string[] | null
export type Task = Omit<
  BaseTask,
  | "id"
  | "tags"
  | "recurrence_pattern"
  | "recurrence_end_date"
  | "original_task_id"
  | "due_date"
  | "status"
  | "notes"
  | "priority" // Added priority to Omit list
> & {
  id: string;
  description: string | null;
  tags: string[] | null;
  parent_id: string | null;
  subtasks?: Task[];
  recurrence_pattern: string | null;
  recurrence_end_date: string | null;
  original_task_id: string | null;
  shared_with_user_ids: string[] | null;
  due_date: string | null;
  status: TaskStatus | null;
  notes: string | null;
  sort_order: number | null;
  position: number | null;
  goal_id: string | null;
  priority: TaskPriority | null; // Added priority field
};
