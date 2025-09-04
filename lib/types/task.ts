import type { Database } from "@/lib/supabase/types";

// Define the base task type from the database
type BaseTask = Database["public"]["Tables"]["tasks"]["Row"];

// Define RawTask type to align with database and include all possible statuses
export type RawTask = BaseTask & {
  user_id: string;
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
  progress?: number | null; // Add progress to RawTask
};

// Define TaskPriority enum for client-side use
export enum TaskPriority {
  Low = "low", // eslint-disable-line @typescript-eslint/no-unused-vars
  Medium = "medium", // eslint-disable-line @typescript-eslint/no-unused-vars
  High = "high", // eslint-disable-line @typescript-eslint/no-unused-vars
}

// Define TaskStatus enum for client-side use, aligning with database enum
export enum TaskStatus {
  Todo = "todo", // eslint-disable-line @typescript-eslint/no-unused-vars
  InProgress = "in_progress", // eslint-disable-line @typescript-eslint/no-unused-vars
  Done = "done", // eslint-disable-line @typescript-eslint/no-unused-vars
  Canceled = "canceled", // eslint-disable-line @typescript-eslint/no-unused-vars
  Archived = "archived", // eslint-disable-line @typescript-eslint/no-unused-vars
}

// Create a modified Task type with id as string and tags as string[] | null
export type Task = RawTask & {
  subtasks?: Task[];
};
