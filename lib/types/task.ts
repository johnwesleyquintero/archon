import type { Database } from "@/lib/supabase/types";

// Define the base task type from the database
type BaseTask = Database["public"]["Tables"]["tasks"]["Row"];

// Create a modified Task type with tags as string[] | null
export type Task = Omit<BaseTask, "tags"> & {
  tags: string[] | null;
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
