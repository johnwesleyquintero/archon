import type { Database } from "@/lib/supabase/types";

// Define the base task type from the database
type BaseTask = Database["public"]["Tables"]["tasks"]["Row"];

// Define TaskPriority enum for client-side use
export enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

// Create a modified Task type with tags as string[] | null
export type Task = Omit<
  BaseTask,
  | "tags"
  | "status"
  | "recurrence_pattern"
  | "recurrence_end_date"
  | "original_task_id"
  | "due_date" // Omit to redefine with correct type
  | "priority" // Omit to redefine with correct type
  | "notes" // Omit to redefine with correct type
> & {
  description: string | null; // New field for rich text description
  tags: string[] | null;
  status: Database["public"]["Enums"]["task_status"];
  parent_id: string | null; // New field for subtasks
  subtasks?: Task[]; // Optional array for nested subtasks
  recurrence_pattern: string | null; // e.g., "daily", "weekly", "monthly", "custom_json"
  recurrence_end_date: string | null; // Date when recurrence ends
  original_task_id: string | null; // Links recurring instances to the original task
  shared_with_user_ids: string[] | null; // Array of user IDs this task is shared with
  due_date: string | null; // ISO date string for due date
  priority: Database["public"]["Enums"]["task_priority"] | null; // Priority of the task
  notes: string | null; // Additional notes for the task
  sort_order: number | null; // New field for drag-and-drop reordering
  goal_id: string | null;
};

export interface TaskItemProps extends Task {
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    updatedTask: Partial<Database["public"]["Tables"]["tasks"]["Update"]>,
  ) => Promise<void>;
  disabled: boolean;
}
