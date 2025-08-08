import type { Database } from "@/lib/supabase/types";

// Define the base task type from the database
type BaseTask = Database["public"]["Tables"]["tasks"]["Row"];

// Create a modified Task type with tags as string[] | null
export type Task = Omit<
  BaseTask,
  | "tags"
  | "status"
  | "recurrence_pattern"
  | "recurrence_end_date"
  | "original_task_id"
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
