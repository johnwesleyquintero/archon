import type { Database } from "@/lib/supabase/types";

// Define the base task type from the database
type BaseTask = Database["public"]["Tables"]["tasks"]["Row"];

// Define RawTask type to align with database and include all possible statuses
export type RawTask = BaseTask & {
  parent_id?: string | null;
  notes?: string | null;
  due_date?: string | null;
  recurrence_pattern?:
    | "none"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | null;
  recurrence_end_date?: string | null;
  original_task_id?: string | null;
  shared_with_user_ids?: string[] | null;
  priority?: TaskPriority | null;
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
export type Task = RawTask & {
  subtasks?: Task[];
};
